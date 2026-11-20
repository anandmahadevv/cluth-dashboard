const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function load(file,mocks={}){const m={exports:{}};new Function('require','exports',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText)(name=>mocks[name]||require(name),m.exports);return m.exports;}
const response={NextResponse:{json:(body,options)=>({body,status:options?.status||200})}};
for(const name of ['campus-keys','submissions','awards/submissions'])test(`${name} rejects anonymous credential/history reads`,async()=>{
 const api=load(`src/app/api/poc/${name}/route.ts`,{'next/server':response,'@/lib/tournament-store':{verifyAdminPassword:()=>false}});
 const result=await api.GET({headers:{get:()=>null}});assert.equal(result.status,401);assert.equal(result.body.passkeys,undefined);assert.equal(result.body.submissions,undefined);
});
test('public match endpoint returns an allowlist and strips all credential fields',async()=>{
 const api=load('src/app/api/public/matches/[game]/route.ts',{'next/server':response,'@/lib/tournament-store':{getGameMatchesAsync:async()=>[{id:'fixture',gameId:'FREE_FIRE',matchNumber:1,status:'APPROVED',teamResults:[],pocCode:'SECRET',campusPasskeys:'SECRET',submissionFingerprint:'PRIVATE'}]}});
 const result=await api.GET({url:'https://example.com/api/public/matches/free-fire'},{params:{game:'free-fire'}});assert.equal(result.status,200);assert.equal(JSON.stringify(result).includes('SECRET'),false);assert.equal(JSON.stringify(result).includes('PRIVATE'),false);
});
test('browser-shared constants contain no credential exports or campus admin codes',()=>{
 const exported=load('src/lib/tournament-constants.ts');for(const name of ['SUPER_ADMIN_CODE','DEFAULT_CAMPUS_PASSKEYS','VALID_GAME_CODES','ADMIN_PASSWORD_HASH','resolveAdminAccess'])assert.equal(exported[name],undefined);
 for(const campus of Object.values(exported.CAMPUSES_REGISTRY))assert.equal(campus.adminCode,undefined);
});
