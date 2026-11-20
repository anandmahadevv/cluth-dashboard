const campusPolicySource = require('typescript').transpileModule(require('fs').readFileSync('src/lib/campus-games.ts','utf8'),{compilerOptions:{module:require('typescript').ModuleKind.CommonJS}}).outputText;
const campusPolicy={};new Function('exports',campusPolicySource)(campusPolicy);
const {adminPassword:TEST_ADMIN}=require('./access-test-env.cjs');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

function loadTs(file, overrides = {}) {
  const mod = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  new Function('require', 'module', 'exports', code)(name => name in overrides ? overrides[name] : name === './campus-admin-context' ? loadTs('src/lib/campus-admin-context.ts') : (['./campus-games','@/lib/campus-games'].includes(name)?campusPolicy:require(name)), mod, mod.exports);
  return mod.exports;
}
const identity = loadTs('src/lib/match-submission-identity.ts');
const input = { campusId: 'mangalore', gameId: 'FREE_FIRE', pocCode: 'test-only', matchNumber: 1,
  proofUrl: 'test-evidence', notes: '', teamResults: [{ teamId: 'a', placement: 1, placementPoints: 12, kills: 3 }] };
function fixture() {
  let remote = { teams: { FREE_FIRE: [{ id: 'a', teamName: 'A', gameId: 'FREE_FIRE', matchesPlayed: 0,
    placementPoints: 0, killPoints: 0, totalPoints: 0, rank: 1 }] }, matches: [], campusLocks: { mangalore: false } };
  let revision = 0;
  let unavailable = false;
  const database = {
    isSupabaseConfigured: () => true,
    fetchMatchWriteSnapshot: async () => ({ store: structuredClone(remote), revision }),
    commitMatchWrite: async (store, expected) => {
      if (unavailable) throw new Error('Database unavailable');
      if (expected !== revision) return false;
      remote = structuredClone(store); revision++; return true;
    },
  };
  const mockFs = { existsSync: () => true, statSync: () => ({ mtimeMs: 1 }),
    readFileSync: () => JSON.stringify(remote), writeFileSync: () => {} };
  const constants = { isSuperAdminCredential:password=>password===TEST_ADMIN, resolveAdminAccess: () => ({ isValid: true, isSuperAdmin: true }), PLACEMENT_POINTS: { FREE_FIRE: [12] } };
  const instance = () => loadTs('src/lib/tournament-store.ts', { fs: mockFs, './supabase': database,
    './tournament-access': constants, './tournament-constants': constants, './match-submission-identity': identity });
  return { instance, state: () => remote, unavailable: () => { unavailable = true; } };
}
test('simultaneous retries on independent instances create one pending submission', async () => {
  const f = fixture(), a = f.instance(), b = f.instance();
  const results = await Promise.all([a.recordMatchSubmissionAsync(input), b.recordMatchSubmissionAsync(input)]);
  assert.ok(results.every(r => r.success));
  assert.equal(results[0].submissionId, results[1].submissionId);
  assert.equal(f.state().matches.length, 1);
  assert.equal(f.state().teams.FREE_FIRE[0].matchesPlayed, 0);
});
test('auto-approved retries apply leaderboard points once', async () => {
  const f = fixture(), a = f.instance(), b = f.instance();
  const params = { ...input, pocCode: TEST_ADMIN, autoApprove: true };
  await Promise.all([a.recordMatchSubmissionAsync(params), b.recordMatchSubmissionAsync(params)]);
  assert.equal(f.state().matches.length, 1);
  assert.equal(f.state().teams.FREE_FIRE[0].matchesPlayed, 1);
  assert.equal(f.state().teams.FREE_FIRE[0].totalPoints, 15);
});
test('conflicting scores are blocked; a new round is accepted', async () => {
  const f = fixture(), a = f.instance();
  await a.recordMatchSubmissionAsync(input);
  const conflict = await a.recordMatchSubmissionAsync({ ...input, notes: 'changed' });
  assert.equal(conflict.success, false);
  assert.equal(f.state().matches.length, 1);
  assert.equal((await a.recordMatchSubmissionAsync({ ...input, matchNumber: 2 })).success, true);
  assert.equal(f.state().matches.length, 2);
});
test('rejected match permits corrected resubmission; database failure cannot report success', async () => {
  const f = fixture(), a = f.instance();
  await a.recordMatchSubmissionAsync(input);
  f.state().matches[0].status = 'REJECTED';
  assert.equal((await a.recordMatchSubmissionAsync({ ...input, notes: 'corrected' })).success, true);
  f.unavailable();
  await assert.rejects(a.recordMatchSubmissionAsync({ ...input, matchNumber: 2 }), /Database unavailable/);
  assert.equal(f.state().matches.length, 2);
});
test('database write is conditional on the original revision and propagates failures', async () => {
  const filters = [];
  let response = { data: [{ id: 'row' }], error: null };
  let update;
  const chain = { update(value) { update = value; return this; }, eq(...args) { filters.push(args); return this; },
    select: async () => response };
  const db = loadTs('src/lib/supabase.ts', { '@supabase/supabase-js': { createClient: () => ({ from: () => chain }) } });
  const revision = new Date(Date.now() + 1000).toISOString();
  assert.equal(await db.commitMatchWrite({ matches: [] }, revision), true);
  assert.deepEqual(filters[1], ['updated_at', revision]);
  assert.ok(Date.parse(update.updated_at) > Date.parse(revision));
  response = { data: [], error: null };
  assert.equal(await db.commitMatchWrite({ matches: [] }, revision), false);
  response = { data: null, error: { message: 'offline' } };
  await assert.rejects(db.commitMatchWrite({ matches: [] }, revision), /Could not save match/);
});
