// Deterministic test credentials. These are not deployment credentials.
const crypto=require('node:crypto');
const adminPassword='TEST-SUPER-ONLY-DO-NOT-USE';
process.env.ADMIN_PASSWORD_HASH=crypto.createHash('sha256').update(adminPassword).digest('hex');
process.env.CLUTCH_DEFAULT_PASSKEYS=JSON.stringify(Object.fromEntries(['mangalore','kanyakumari','coimbatore','bangalore'].map(c=>[c,{campusAdminKey:`DEFAULT-${c}-ADMIN`,gameKeys:Object.fromEntries(['FREE_FIRE','BGMI','VALORANT','EFOOTBALL','MATIKS'].map(g=>[g,`DEFAULT-${c}-${g}`]))}])));
module.exports={adminPassword};
