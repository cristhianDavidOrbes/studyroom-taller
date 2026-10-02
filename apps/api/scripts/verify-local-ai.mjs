import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir,writeFile } from 'node:fs/promises';

const base=process.env.TEST_API_URL??'http://127.0.0.1:3000/api';
const auth=process.env.TEST_AUTH_URL??'http://127.0.0.1:9099';
if(!['127.0.0.1','localhost'].includes(new URL(auth).hostname))throw new Error('Esta prueba solo crea usuarios en un emulador local');
const created=await fetch(`${auth}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`ai-proof-${randomUUID()}@studyroom.test`,password:'Local-AI-test-492!',returnSecureToken:true})});
assert.equal(created.status,200);
const identity=await created.json();
async function request(path,method='GET',body){const r=await fetch(base+path,{method,headers:{Authorization:`Bearer ${identity.idToken}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const result=await r.json();assert.ok(r.ok,`${method} ${path}: ${r.status} ${JSON.stringify(result)}`);return result;}
await request('/me');
const room=await request('/rooms','POST',{title:'Verificación de IA local',subject:'Álgebra',capacity:4});
await request(`/rooms/${room.id}/messages`,'POST',{text:'Una matriz es una colección rectangular de números ordenados en filas y columnas. Una matriz de 2 filas y 3 columnas tiene 6 elementos.',clientId:randomUUID()});
const started=Date.now();
let job=await request(`/rooms/${room.id}/ai`,'POST',{question:'¿Cuántos elementos tiene la matriz descrita? Responde en una frase.',includeChat:true,documentIds:[]});
let last='';
while(!['completed','failed','cancelled'].includes(job.status)&&Date.now()-started<300000){if(job.status!==last){console.log(`Trabajo local: ${job.status}`);last=job.status;}await new Promise(resolve=>setTimeout(resolve,2000));job=await request(`/ai/jobs/${job.id}`);}
assert.equal(job.status,'completed',job.error??'La cola no completó en cinco minutos');
assert.match(job.result.text,/6|seis/i,'La respuesta debe ser fiel al contexto de seis elementos');
assert.ok(job.result.sources.length>=1,'Debe conservar una fuente autorizada');
await request(`/ai/answers/${job.id}/feedback`,'POST',{rating:1,reason:'Respuesta coincide con el dato de prueba.'});
const before=await request('/usage');
assert.ok(before.used.ngrokRequests>=1);
assert.ok(before.used.ngrokBytes>0);
const evidence={at:new Date().toISOString(),status:'passed',durationMs:Date.now()-started,transport:'API NestJS -> gateway loopback autenticado -> Ollama local; túnel público no incluido en esta prueba',job:{id:job.id,status:job.status,result:job.result},checks:['Firebase emulator real','Contexto de chat autorizado','Cola PostgreSQL real','Modelo local real','Fidelidad de respuesta','Fuente conservada','Feedback guardado','Consumo contabilizado']};
const out=new URL('../../../docs/verification/',import.meta.url);await mkdir(out,{recursive:true});await writeFile(new URL('ai-api-local.json',out),JSON.stringify(evidence,null,2));
await request(`/rooms/${room.id}/cancel`,'POST',{});
console.log(JSON.stringify({status:'passed',durationMs:evidence.durationMs,evidence:'docs/verification/ai-api-local.json'}));
