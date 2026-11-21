const campusPolicySource = require('typescript').transpileModule(require('fs').readFileSync('src/lib/campus-games.ts','utf8'),{compilerOptions:{module:require('typescript').ModuleKind.CommonJS}}).outputText;
const campusPolicy={};new Function('exports',campusPolicySource)(campusPolicy);
const {adminPassword:TEST_ADMIN}=require('./access-test-env.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function load(file,overrides={}){const m={exports:{}};new Function('require','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(name=>overrides[name]||(name==='./campus-admin-context'?load('src/lib/campus-admin-context.ts'):(['./campus-games','@/lib/campus-games'].includes(name)?campusPolicy:require(name))),m.exports);return m.exports;}
const publicConstants=load('src/lib/tournament-constants.ts');
const constants={...publicConstants,...load('src/lib/tournament-access.ts',{'server-only':{},'./tournament-constants':publicConstants})};
const games=['FREE_FIRE','BGMI','VALORANT','EFOOTBALL','MATIKS','COD'];
const fixtures=Object.fromEntries(Object.keys(constants.CAMPUSES_REGISTRY).map(c=>[c,{campusAdminKey:`TEST-${c}-ADMIN`,gameKeys:Object.fromEntries(games.map(g=>[g,`TEST-${c}-${g}`]))}]));
test('all 17 game keys map to their exact campus and game',()=>{for(const [campus,keys] of Object.entries(fixtures))for(const game of campusPolicy.getCampusGameIds(campus)){const access=constants.resolveAdminAccess(keys.gameKeys[game],fixtures);assert.equal(access.campusId,campus);assert.equal(access.gameId,game);}});
test('rotated campus keys invalidate old default game keys',()=>{for(const [campus,keys] of Object.entries(constants.DEFAULT_CAMPUS_PASSKEYS))for(const game of campusPolicy.getCampusGameIds(campus)){assert.equal(constants.resolveAdminAccess(keys.gameKeys[game],fixtures).isValid,false);}});
test('duplicate key across campuses must be rejected rather than first-match routed',()=>{const copy=structuredClone(fixtures);copy.bangalore.gameKeys.BGMI=copy.kanyakumari.gameKeys.FREE_FIRE;assert.equal(constants.resolveAdminAccess(copy.bangalore.gameKeys.BGMI,copy).isValid,false);});
test('POC verification applies returned game before initializing scores and restoring draft',async()=>{
 const source=ts.createSourceFile('page.tsx',fs.readFileSync('src/app/poc/page.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 let handler;function visit(n){if(ts.isVariableDeclaration(n)&&n.name.getText(source)==='handleVerify')handler=n.initializer.getText(source);ts.forEachChild(n,visit);}visit(source);
 const js=ts.transpileModule('const handler='+handler+'; exports.handler=handler;',{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
 let assigned,calculated,draftGame;
 const setters=Array.from(new Set(handler.match(/\bset[A-Z]\w+/g))).map(name=>[name, name==='setSelectedGame' ? value=>assigned=value : ()=>{}]);
 const names={GAMES_CONFIG:{FREE_FIRE:{},BGMI:{}},exports:{},fetch:async()=>({ok:true,json:async()=>({success:true,campusId:'bangalore',gameId:'BGMI',teams:[{id:'a'}]})}),selectedGame:'FREE_FIRE',pocCode:'test-only',calcMatchPoints:(p,k,g)=>{calculated=g;return {placementPoints:15,matchTotal:15};},localStorage:{getItem:()=>null},pocDraftKey:(c,g)=>{draftGame=g;return 'key';},parsePocDraft:()=>null,fetchAwards:()=>{},...Object.fromEntries(setters)};
 new Function(...Object.keys(names),js)(...Object.values(names));await names.exports.handler({preventDefault(){}});
 assert.equal(assigned,'BGMI');assert.equal(calculated,'BGMI');assert.equal(draftGame,'BGMI');
});

function storeFixture(){
 const team=(c,g)=>({id:`${c}-${g}-1`,teamName:'Fixture',gameId:g,matchesPlayed:0,placementPoints:0,killPoints:0,totalPoints:0,rank:1});
 const lists=c=>Object.fromEntries(games.map(g=>[g,[team(c,g)]]));
 let remote={teams:lists('mangalore'),campusTeams:Object.fromEntries(['bangalore','coimbatore','kanyakumari'].map(c=>[c,lists(c)])),campusLocks:Object.fromEntries(Object.keys(fixtures).map(c=>[c,false])),campusPasskeys:structuredClone(fixtures),matches:[]};
 let revision=0;
 const db={persistStoreToSupabase:async store=>{remote=structuredClone(store);revision++;return true;},isSupabaseConfigured:()=>true,fetchMatchWriteSnapshot:async()=>({store:structuredClone(remote),revision}),commitMatchWrite:async(store,expected)=>{if(expected!==revision)return false;remote=structuredClone(store);revision++;return true;},fetchStoreFromSupabase:async()=>structuredClone(remote)};
 const disk={existsSync:()=>true,statSync:()=>({mtimeMs:1}),readFileSync:()=>JSON.stringify(remote),writeFileSync:()=>{}};
 const api=load('src/lib/tournament-store.ts',{'fs':disk,'./supabase':db,'./tournament-access':constants,'./tournament-constants':constants,'./match-submission-identity':load('src/lib/match-submission-identity.ts')});
 return {api,state:()=>remote};
}
test('all 17 keys reject wrong campus/game writes and accept their own assignment',async()=>{
 const {api,state}=storeFixture();
 for(const [campus,keys] of Object.entries(fixtures))for(const game of campusPolicy.getCampusGameIds(campus)){
   const input={campusId:campus,gameId:game,pocCode:keys.gameKeys[game],matchNumber:1,proofUrl:'fixture-only',teamResults:[{teamId:`${campus}-${game}-1`,placement:1,kills:0}]};
   const otherCampus=campus==='bangalore'?'kanyakumari':'bangalore';
   assert.equal((await api.recordMatchSubmissionAsync({...input,campusId:otherCampus})).success,false);
   assert.equal((await api.recordMatchSubmissionAsync({...input,gameId:games[(games.indexOf(game)+1)%games.length]})).success,false);
   assert.equal((await api.recordMatchSubmissionAsync(input)).success,true);
 }
 assert.equal(state().matches.length,17);
});
test('saving rejects cross-campus collisions and admin/game key collisions',async()=>{
 const {api,state}=storeFixture();
 const keys=structuredClone(fixtures.bangalore);
 keys.gameKeys.BGMI=fixtures.kanyakumari.gameKeys.FREE_FIRE;
 assert.equal((await api.saveCampusPasskeysAsync({campusId:'bangalore',passkeys:keys,pocCode:TEST_ADMIN})).success,false);
 keys.gameKeys.BGMI=keys.campusAdminKey;
 assert.equal((await api.saveCampusPasskeysAsync({campusId:'bangalore',passkeys:keys,pocCode:TEST_ADMIN})).success,false);
 assert.deepEqual(state().campusPasskeys.bangalore,fixtures.bangalore);
});
test('regeneration rotates every Bangalore key and invalidates old assignments',async()=>{
 const {api,state}=storeFixture();
 const result=await api.regenerateCampusPasskeysAsync({campusId:'bangalore',pocCode:TEST_ADMIN});
 assert.equal(result.success,true);
 assert.notEqual(result.passkeys.campusAdminKey,fixtures.bangalore.campusAdminKey);
 for(const game of campusPolicy.getCampusGameIds("bangalore")){
  assert.notEqual(result.passkeys.gameKeys[game],fixtures.bangalore.gameKeys[game]);
  assert.equal(constants.resolveAdminAccess(fixtures.bangalore.gameKeys[game],state().campusPasskeys).isValid,false);
  assert.equal(constants.resolveAdminAccess(result.passkeys.gameKeys[game],state().campusPasskeys).gameId,game);
 }
});


test('verification API ignores mismatched requested campus/game for all 17 POC keys',async()=>{
 let loaded;
 const api=load('src/app/api/poc/verify-code/route.ts',{
  'next/server':{NextResponse:{json:(body,options)=>({body,...options})}},
  '@/lib/tournament-access':constants,'@/lib/tournament-constants':constants,
  '@/lib/tournament-store':{getStoreAsync:async()=>({campusPasskeys:fixtures}),isCampusLocked:()=>false,getGameLeaderboardAsync:async(game,hidden,campus)=>{loaded={game,campus};return [];}},
 });
 for(const [campus,keys] of Object.entries(fixtures))for(const game of campusPolicy.getCampusGameIds(campus)){
  const response=await api.POST({json:async()=>({code:keys.gameKeys[game],campusId:'wrong-campus',gameId:games[(games.indexOf(game)+1)%games.length]})});
  assert.equal(response.body.success,true);assert.equal(response.body.campusId,campus);assert.equal(response.body.gameId,game);
  assert.deepEqual(loaded,{campus,game});
 }
});


test('campus game policy preserves Mangalore and restricts every other campus',()=>{
 assert.deepEqual(campusPolicy.getCampusGameIds('mangalore'),['FREE_FIRE','BGMI','VALORANT','EFOOTBALL','MATIKS']);
 for(const campus of ['bangalore','coimbatore','kanyakumari']){
  assert.deepEqual(campusPolicy.getCampusGameIds(campus),['FREE_FIRE','BGMI','COD','MATIKS']);
  for(const game of ['VALORANT','EFOOTBALL']) assert.equal(constants.resolveAdminAccess(fixtures[campus].gameKeys[game],fixtures).isValid,false);
 }
 assert.equal(constants.resolveAdminAccess(fixtures.mangalore.gameKeys.COD,fixtures).isValid,false);
});
test('disabled game cannot be submitted even with Super Admin credentials',async()=>{
 const {api}=storeFixture();
 const result=await api.recordMatchSubmissionAsync({campusId:'bangalore',gameId:'VALORANT',pocCode:TEST_ADMIN,matchNumber:1,proofUrl:'fixture',teamResults:[{teamId:'bangalore-VALORANT-1',placement:1,kills:1}]});
 assert.equal(result.success,false);
});
test('Call of Duty uses configured placement plus kills without changing Mangalore records',async()=>{
 const {api,state}=storeFixture();const original=structuredClone(state().teams);
 const result=await api.recordMatchSubmissionAsync({campusId:'bangalore',gameId:'COD',pocCode:fixtures.bangalore.gameKeys.COD,matchNumber:1,proofUrl:'fixture',teamResults:[{teamId:'bangalore-COD-1',placement:1,kills:7}]});
 assert.equal(result.success,true);assert.equal(state().matches[0].teamResults[0].matchPoints,22);assert.deepEqual(state().teams,original);
});

test('special awards are Free Fire only; legacy other-game awards stay stored but hidden',async()=>{
 const {api,state}=storeFixture();
 state().campusAwards={bangalore:{BGMI:{winnerTeam:'Legacy winner',mvp:{playerName:'Legacy MVP'}}}};
 state().awardsSubmissions=[{id:'legacy-bgmi-award',campusId:'bangalore',gameId:'BGMI',status:'PENDING',awards:{winnerTeam:'Legacy winner'}}];
 for(const gameId of ['BGMI','COD','MATIKS','VALORANT','EFOOTBALL']){
  assert.equal((await api.saveAwardsAsync({campusId:'bangalore',gameId,adminPassword:TEST_ADMIN,awards:{winnerTeam:'Blocked'}})).success,false);
  assert.deepEqual(await api.getAwardsAsync(gameId,'bangalore'),{});
  assert.equal(await api.getLatestAwardsSubmissionAsync('bangalore',gameId),null);
 }
 assert.deepEqual(await api.getAwardsSubmissionsAsync(),[]);
 assert.equal((await api.reviewAwardsSubmissionAsync({submissionId:'legacy-bgmi-award',action:'APPROVE',adminPassword:TEST_ADMIN})).success,false);
 assert.equal(state().campusAwards.bangalore.BGMI.winnerTeam,'Legacy winner');
 assert.equal(state().awardsSubmissions[0].status,'PENDING');
 assert.equal((await api.saveAwardsAsync({campusId:'bangalore',gameId:'FREE_FIRE',adminPassword:TEST_ADMIN,awards:{winnerTeam:'Free Fire winner'}})).success,true);
});
