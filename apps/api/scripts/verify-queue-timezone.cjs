require('dotenv/config');
const {PrismaClient}=require('@prisma/client');
const {UTC_NOW}=require('../dist/ai.js');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const db=new PrismaClient();
async function main(){
 const results=[];
 for(const zone of ['America/Bogota','UTC']){
  const due=new Date(Date.now()-1000).toISOString();
  const row=await db.$transaction(async tx=>{
   await tx.$executeRawUnsafe(`SET LOCAL TIME ZONE '${zone}'`);
   const rows=await tx.$queryRaw`SELECT current_setting('TimeZone') AS zone, ${due}::timestamp <= ${UTC_NOW} AS due, EXTRACT(EPOCH FROM (${UTC_NOW}+INTERVAL '4 minutes')-${UTC_NOW})::float8 AS "leaseSeconds"`;
   return rows[0];
  });
  assert.equal(row.due,true,'Un trabajo vencido debe reclamarse inmediatamente en cualquier zona');
  assert.equal(row.leaseSeconds,240);
  results.push(row);
 }
 const output=path.resolve(__dirname,'../../../docs/verification');fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'queue-timezone.json'),JSON.stringify({at:new Date().toISOString(),status:'passed',database:'PostgreSQL real',results},null,2));
 console.log(JSON.stringify({status:'passed',results}));
}
main().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>db.$disconnect());
