const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const source=ts.transpileModule(fs.readFileSync('src/app/api/poc/match-status/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
function fixture(access) {
 const module={exports:{}};
 const store={matches:[{id:'mine',campusId:'a',gameId:'FREE_FIRE',timestamp:'2026-01-01',status:'REJECTED',matchNumber:1,pocCode:'secret',proofUrl:'private-image',rejectionReason:'Check kills',teamResults:[{}]},
 {id:'other-campus',campusId:'b',gameId:'FREE_FIRE',timestamp:'2026-01-02',status:'PENDING',teamResults:[]},
 {id:'other-game',campusId:'a',gameId:'BGMI',timestamp:'2026-01-03',status:'APPROVED',teamResults:[]}]};
 const mocks={'@/lib/campus-games':{isCampusGameEnabled:()=>true},'next/server':{NextResponse:{json:(body,options)=>({body,...options})}},'@/lib/tournament-store':{getStoreAsync:async()=>store},
 '@/lib/tournament-access':{resolveAdminAccess:()=>access},'@/lib/constants':{GAMES_CONFIG:{FREE_FIRE:{},BGMI:{}}}};
 new Function('require','module','exports',source)(name=>mocks[name],module,module.exports);
 return body=>module.exports.POST({json:async()=>body});
}
test('POC scope ignores requested campus and excludes credentials and proof',async()=>{
 const response=await fixture({isValid:true,campusId:'a',gameId:'FREE_FIRE'})({code:'test',campusId:'b',gameId:'FREE_FIRE'});
 assert.deepEqual(response.body.submissions.map(s=>s.id),['mine']);
 assert.equal(response.body.submissions[0].rejectionReason,'Check kills');
 assert.equal(response.body.submissions[0].pocCode,undefined);assert.equal(response.body.submissions[0].proofUrl,undefined);
 assert.deepEqual(response.body.counts,{pending:0,approved:0,rejected:1});
});
test('unauthorized game and invalid credentials are rejected',async()=>{
 assert.equal((await fixture({isValid:true,campusId:'a',gameId:'FREE_FIRE'})({code:'test',gameId:'BGMI'})).status,403);
 assert.equal((await fixture({isValid:false})({code:'test',gameId:'FREE_FIRE'})).status,401);
});
test('campus admin can view games only within their campus',async()=>{
 const response=await fixture({isValid:true,campusId:'a',gameId:'ALL'})({code:'test',campusId:'b',gameId:'BGMI'});
 assert.deepEqual(response.body.submissions.map(s=>s.id),['other-game']);
});
