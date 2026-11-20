const campusPolicySource = require('typescript').transpileModule(require('fs').readFileSync('src/lib/campus-games.ts','utf8'),{compilerOptions:{module:require('typescript').ModuleKind.CommonJS}}).outputText;
const campusPolicy={};new Function('exports',campusPolicySource)(campusPolicy);
const {adminPassword:TEST_ADMIN}=require('./access-test-env.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript');
function load(file,mocks={}) {const m={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;new Function('require','exports',code)(n=>n in mocks?mocks[n]:(['./campus-games','@/lib/campus-games'].includes(n)?campusPolicy:require(n)),m.exports);return m.exports;}
const publicConstants=load('src/lib/tournament-constants.ts');
const constants={...publicConstants,...load('src/lib/tournament-access.ts',{'server-only':{},'./tournament-constants':publicConstants})},scope=load('src/lib/campus-admin-context.ts');
const games=['FREE_FIRE','BGMI','VALORANT','EFOOTBALL','MATIKS','COD'];
const keyset=campus=>({campusAdminKey:`TEST-${campus}-ADMIN`,gameKeys:Object.fromEntries(games.map(g=>[g,`TEST-${campus}-${g}`]))});
function fixture(){
 const calls=[];
 const t=(c)=>({id:`${c}-team`,teamName:`${c} team`,gameId:'FREE_FIRE',matchesPlayed:0,placementPoints:0,killPoints:0,totalPoints:0,rank:1});
 const lists=c=>Object.fromEntries(games.map(g=>[g,g==='FREE_FIRE'?[t(c)]:[]]));
 const match=c=>({id:`${c}-match`,campusId:c,gameId:'FREE_FIRE',matchNumber:1,status:'PENDING',timestamp:'2026-11-20',pocCode:'SECRET',proofUrl:'https://example.com/proof.png',teamResults:[{teamId:`${c}-team`,teamName:'Team',placement:1,placementPoints:12,kills:2,matchPoints:14}]});
 const state={campusPasskeys:Object.fromEntries(Object.keys(constants.CAMPUSES_REGISTRY).map(c=>[c,keyset(c)])),campusLocks:{bangalore:false,coimbatore:false,mangalore:false,kanyakumari:false},teams:lists('mangalore'),campusTeams:{bangalore:lists('bangalore'),coimbatore:lists('coimbatore'),kanyakumari:lists('kanyakumari')},matches:[match('bangalore'),match('coimbatore')],awardsSubmissions:[{id:'bangalore-award',campusId:'bangalore',gameId:'FREE_FIRE',status:'PENDING',awards:{winnerTeam:'A'},pocCode:'SECRET'},{id:'coimbatore-award',campusId:'coimbatore',gameId:'FREE_FIRE',status:'PENDING',awards:{winnerTeam:'B'},pocCode:'SECRET'}]};
 const disk={existsSync:()=>true,statSync:()=>({mtimeMs:1}),readFileSync:()=>JSON.stringify(state),writeFileSync:()=>{}};
 const db={isSupabaseConfigured:()=>true,fetchStoreFromSupabase:async()=>state,persistStoreToSupabase:async next=>{Object.assign(state,next);return true;},fetchMatchWriteSnapshot:async()=>({store:structuredClone(state),revision:'test'}),commitMatchWrite:async next=>{Object.assign(state,next);return true;}};
 const store=load('src/lib/tournament-store.ts',{'fs':disk,'./tournament-access':constants,'./tournament-constants':constants,'./campus-admin-context':scope,'./supabase':db,'./match-submission-identity':load('src/lib/match-submission-identity.ts')});
 const api=load('src/app/api/campus-admin/route.ts',{'next/server':{NextResponse:{json:(body,opts)=>({body,status:opts?.status||200})}},'@/lib/campus-admin-context':scope,'@/lib/tournament-access':constants,'@/lib/tournament-constants':constants,'@/lib/constants':{GAMES_CONFIG:Object.fromEntries(games.map(g=>[g,{}]))},'@/lib/tournament-store':{...store,getStoreAsync:async()=>state}});
 const request=(body,key=keyset('bangalore').campusAdminKey)=>api.POST({headers:{get:n=>n==='authorization'?`Bearer ${key}`:null},nextUrl:{origin:'http://localhost'},json:async()=>body});
 return {state,request,store};
}
test('campus portal rejects missing, game POC and Super Admin keys',async()=>{
 const f=fixture();for(const key of ['',keyset('bangalore').gameKeys.FREE_FIRE,TEST_ADMIN])assert.ok([401,403].includes((await f.request({action:'LOAD'},key)).status));
});
test('campus load returns only assigned records and never returns passkeys or POC codes',async()=>{
 const f=fixture(),r=await f.request({action:'LOAD',gameId:'FREE_FIRE'});assert.equal(r.status,200);assert.equal(r.body.campusId,'bangalore');assert.deepEqual(r.body.matches.map(m=>m.id),['bangalore-match']);assert.deepEqual(r.body.awardsSubmissions.map(m=>m.id),['bangalore-award']);assert.equal(JSON.stringify(r.body).includes('SECRET'),false);assert.equal(r.body.campusPasskeys,undefined);
 for(const campus of Object.keys(constants.CAMPUSES_REGISTRY)){const own=await f.request({action:'LOAD'},keyset(campus).campusAdminKey);assert.equal(own.body.campusId,campus);}
});
test('forged campus, foreign submission and foreign team IDs are rejected',async()=>{
 const f=fixture();assert.equal((await f.request({action:'LOAD',campusId:'coimbatore'})).status,403);
 assert.equal((await f.request({action:'REVIEW_MATCH',submissionId:'coimbatore-match',decision:'APPROVE'})).status,404);
 assert.equal((await f.request({action:'REVIEW_AWARDS',submissionId:'coimbatore-award',decision:'APPROVE'})).status,404);
 assert.equal((await f.request({action:'REMOVE_TEAM',teamId:'coimbatore-team'})).status,404);
});
test('campus admin cannot reset, lock campuses, generate keys, undo or delete matches',async()=>{
 const f=fixture();for(const action of ['RESET','LOCK','GENERATE_KEYS','DELETE_MATCH','UNDO_MATCH'])assert.equal((await f.request({action})).status,403);
 assert.equal((await f.request({action:'REVIEW_MATCH',submissionId:'bangalore-match',decision:'DELETE'})).status,400);
 await scope.campusAdminContext.run({campusId:'bangalore'},async()=>{assert.equal((await f.store.regenerateCampusPasskeysAsync({campusId:'bangalore'})).success,false);assert.equal((await f.store.resetGameScoresAsync('','FREE_FIRE','bangalore')).success,false);});
});
test('own pending match can be published; another campus and unscoped calls cannot',async()=>{
 const f=fixture();assert.equal((await f.store.reviewMatchSubmissionAsync({submissionId:'bangalore-match',action:'APPROVE',adminPassword:''})).success,false);
 await scope.campusAdminContext.run({campusId:'bangalore'},async()=>{assert.equal((await f.store.reviewMatchSubmissionAsync({submissionId:'coimbatore-match',action:'APPROVE',adminPassword:''})).success,false);});
 const r=await f.request({action:'REVIEW_MATCH',submissionId:'bangalore-match',decision:'APPROVE'});assert.equal(r.status,200);assert.equal(f.state.matches.find(m=>m.id==='bangalore-match').status,'APPROVED');assert.equal(f.state.matches.find(m=>m.id==='coimbatore-match').status,'PENDING');
});
test('own roster and awards work; locked campus blocks all mutations',async()=>{
 const f=fixture();assert.equal((await f.request({action:'ADD_TEAM',teamName:'New local team'})).status,200);
 assert.equal((await f.request({action:'REVIEW_AWARDS',submissionId:'bangalore-award',decision:'APPROVE'})).status,200);
 assert.equal(f.state.awardsSubmissions.find(a=>a.id==='coimbatore-award').status,'PENDING');
 f.state.campusLocks.bangalore=true;assert.equal((await f.request({action:'ADD_TEAM',teamName:'Blocked'})).status,403);assert.equal((await f.request({action:'LOAD'})).status,200);
});
test('direct campus scoring validates and publishes only the assigned campus',async()=>{
 const f=fixture();const payload={action:'SUBMIT_MATCH',matchNumber:2,proofUrl:'https://example.com/proof.png',teamResults:[{teamId:'bangalore-team',placement:1,placementPoints:12,kills:3}]};
 assert.equal((await f.request({...payload,teamResults:[{...payload.teamResults[0],teamId:'coimbatore-team'}]})).status,400);
 assert.equal((await f.request(payload)).status,200);assert.equal(f.state.matches[0].campusId,'bangalore');assert.equal(f.state.matches[0].status,'APPROVED');assert.equal(f.state.campusTeams.bangalore.FREE_FIRE[0].totalPoints,15);assert.equal(f.state.campusTeams.coimbatore.FREE_FIRE[0].totalPoints,0);
});
