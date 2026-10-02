import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { io } from 'socket.io-client';

const base=process.env.TEST_API_URL??'http://127.0.0.1:3000/api';
const auth=process.env.TEST_AUTH_URL??'http://127.0.0.1:9099';
async function account(name){const r=await fetch(`${auth}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:`${name}-${randomUUID()}@studyroom.test`,password:'Prueba-local-492!',returnSecureToken:true})});const a=await r.json();assert.equal(r.status,200,JSON.stringify(a));return{token:a.idToken,id:a.localId};}
async function req(user,path,method='GET',body){const r=await fetch(base+path,{method,headers:{...(user?{Authorization:`Bearer ${user.token}`} : {}),...(body!==undefined?{'Content-Type':'application/json'}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});const data=await r.json().catch(()=>null);return{status:r.status,data};}
async function ok(user,path,method='GET',body){const r=await req(user,path,method,body);assert.ok(r.status>=200&&r.status<300,`${method} ${path}: ${r.status} ${JSON.stringify(r.data)}`);return r.data;}
function audioWav(ms=1000){const b=Buffer.alloc(44+ms*32);b.write('RIFF',0);b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(16000,24);b.writeUInt32LE(32000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(b.length-44,40);return b;}
async function audioReq(user,path,fields,audio=audioWav()){const form=new FormData();for(const[k,v]of Object.entries(fields))form.set(k,String(v));form.set('audio',new Blob([audio],{type:'audio/wav'}),'microphone.wav');const r=await fetch(base+path,{method:'POST',headers:{Authorization:`Bearer ${user.token}`},body:form});return{status:r.status,data:await r.json()};}
const roomBody=(title,more={})=>({title,subject:'Álgebra',modality:'colaborativa',level:'principiante',capacity:4,...more});
test('Flujos reales Firebase+PostgreSQL: acceso, salas, colaboración e historial',{timeout:120000},async t=>{
 const owner=await account('anfitrion'),member=await account('participante'),outsider=await account('externo');
 await t.test('rechaza token ausente e inválido',async()=>{assert.equal((await req(null,'/me')).status,401);assert.equal((await req({token:'fake'},'/me')).status,401);});
 await t.test('perfil idempotente y preferencias validadas',async()=>{const p=await ok(owner,'/me');assert.equal(p.id,owner.id);assert.equal((await ok(owner,'/me')).id,p.id);const edited=await ok(owner,'/me','PATCH',{displayName:'Ana de prueba',interests:['Álgebra'],onboarded:true,notifications:{inApp:true,email:false}});assert.equal(edited.displayName,'Ana de prueba');assert.equal((await req(owner,'/me','PATCH',{role:'admin'})).status,400);});
 let room;
 await t.test('crear, buscar, filtrar y editar salas',async()=>{room=await ok(owner,'/rooms','POST',roomBody('Álgebra integración'));assert.equal(room.myRole,'host');assert.equal(room.participantCount,1);assert.ok((await ok(owner,'/rooms?q=integración&subject=Álgebra')).some(x=>x.id===room.id));assert.equal((await req(owner,'/rooms','POST',roomBody('X',{capacity:100}))).status,400);await ok(owner,`/rooms/${room.id}`,'PATCH',{description:'Vectores y matrices'});assert.equal((await ok(owner,`/rooms/${room.id}`)).description,'Vectores y matrices');});
 await t.test('aislamiento y autorización de participantes',async()=>{assert.equal((await req(outsider,`/rooms/${room.id}/messages`)).status,403);assert.equal((await req(outsider,`/rooms/${room.id}/notes`)).status,403);await ok(member,`/rooms/${room.id}/join`,'POST',{});await ok(member,`/rooms/${room.id}/join`,'POST',{});assert.equal((await ok(owner,`/rooms/${room.id}`)).participantCount,2);assert.equal((await req(member,`/rooms/${room.id}`,'PATCH',{title:'Ataque'})).status,403);});
 await t.test('chat idempotente y notas privadas',async()=>{const payload={text:'Una matriz organiza números en filas y columnas.',clientId:randomUUID()};const first=await ok(member,`/rooms/${room.id}/messages`,'POST',payload);assert.equal((await ok(member,`/rooms/${room.id}/messages`,'POST',payload)).id,first.id);assert.equal((await req(member,`/rooms/${room.id}/messages`,'POST',{text:'',clientId:'empty'})).status,400);await ok(owner,`/rooms/${room.id}/notes`,'PUT',{text:'Nota privada del anfitrión'});assert.equal((await ok(member,`/rooms/${room.id}/notes`)).text,'');assert.equal((await ok(owner,`/rooms/${room.id}/notes`)).text,'Nota privada del anfitrión');});
 await t.test('temporizador y moderación por rol',async()=>{assert.equal((await req(member,`/rooms/${room.id}/timer`,'PUT',{action:'start',mode:'focus'})).status,403);await ok(owner,`/rooms/${room.id}/members/${member.id}`,'PATCH',{role:'moderator'});const timer=await ok(member,`/rooms/${room.id}/timer`,'PUT',{action:'start',mode:'focus',durationSeconds:60});assert.equal(timer.running,true);await ok(member,`/rooms/${room.id}/timer`,'PUT',{action:'pause',mode:'focus'});assert.equal((await ok(owner,`/rooms/${room.id}/timer`)).running,false);assert.equal((await req(member,`/rooms/${room.id}/members/${owner.id}`,'DELETE')).status,403);});
 await t.test('socket requiere membresía y devuelve estado tras reconectar',async()=>{const socket=io(base.replace(/\/api$/,''),{auth:{token:member.token},transports:['websocket'],autoConnect:false});try{await new Promise((resolve,reject)=>{socket.once('connect',resolve);socket.once('connect_error',reject);socket.connect();});const snapshot=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Sin snapshot')),5000);socket.once('room:state',s=>{clearTimeout(timer);resolve(s)});});socket.emit('room:join',{roomId:room.id});const state=await snapshot;assert.ok(state.members.some(x=>x.userId===member.id));socket.disconnect();await new Promise((resolve,reject)=>{socket.once('connect',resolve);socket.once('connect_error',reject);socket.connect();});const next=new Promise(resolve=>socket.once('room:state',resolve));socket.emit('room:join',{roomId:room.id});assert.ok((await next).messages.length>=1);}finally{socket.disconnect();}});
 await t.test('IA protege contexto y resultados privados',async()=>{assert.equal((await req(outsider,`/rooms/${room.id}/ai`,'POST',{question:'Resume el chat',includeChat:true,documentIds:[]})).status,403);assert.equal((await req(member,`/rooms/${room.id}/ai`,'POST',{question:'Explica este documento',documentIds:[randomUUID()]})).status,403);const job=await ok(owner,`/rooms/${room.id}/ai`,'POST',{question:'Qué organiza una matriz?',includeChat:true,documentIds:[]});assert.equal((await req(member,`/ai/jobs/${job.id}`)).status,403);await ok(owner,`/ai/jobs/${job.id}/cancel`,'POST',{});assert.equal((await ok(owner,`/ai/jobs/${job.id}`)).status,'cancelled');});
 let audioFields,transcriptionBatch;
 await t.test('transcripción exige consentimiento propio, WAV real y sesión autorizada',async()=>{
  const root=`/rooms/${room.id}/transcription`;
  assert.equal((await req(outsider,`${root}/consent`,'POST',{enabled:true})).status,403);
  assert.equal((await req(owner,`${root}/consent`,'POST',{enabled:true,userId:member.id})).status,400);
  const clock=await ok(owner,root);
  audioFields={clientId:randomUUID(),sessionId:clock.sessionId,startMs:0,endMs:1000};
  assert.equal((await audioReq(member,`${root}/audio`,audioFields)).status,403);
  await ok(owner,`${root}/consent`,'POST',{enabled:true});
  assert.equal((await audioReq(owner,`${root}/audio`,{...audioFields,sessionId:randomUUID()})).status,403);
  assert.equal((await audioReq(owner,`${root}/audio`,audioFields,Buffer.from('fake WAV'))).status,400);
  audioFields.startMs=Date.now()-new Date(clock.startedAt).getTime();
  await new Promise(resolve=>setTimeout(resolve,1050));audioFields.endMs=audioFields.startMs+1000;
  const result=await audioReq(owner,`${root}/audio`,audioFields);assert.equal(result.status,201,JSON.stringify(result.data));transcriptionBatch=result.data;
  assert.equal(transcriptionBatch.speakerId,owner.id);assert.ok(['succeeded','silent','failed'].includes(transcriptionBatch.status));assert.equal(transcriptionBatch.audioHash,undefined);
  assert.equal((await audioReq(owner,`${root}/audio`,audioFields)).data.id,transcriptionBatch.id);
  const changed=audioWav();changed[50]=1;assert.equal((await audioReq(owner,`${root}/audio`,audioFields,changed)).status,409);
  const current=await ok(owner,`${root}?limit=1`);assert.ok(current.batches.some(b=>b.id===transcriptionBatch.id));assert.equal(current.participants.find(p=>p.userId===owner.id).enabled,true);
  assert.equal((await req(member,`${root}?cursor=${randomUUID()}`)).status,403);
 });
 await t.test('pérdidas de captura quedan visibles y revocar consentimiento bloquea lotes nuevos',async()=>{
  const root=`/rooms/${room.id}/transcription`;
  const gap=await ok(owner,`${root}/gaps`,'POST',{...audioFields,clientId:randomUUID(),reason:'queue_overflow'});assert.equal(gap.status,'failed');assert.match(gap.error,/cola/);
  const view=await ok(owner,root);assert.ok(view.coverage.failedBatches>=1);
  await ok(owner,`${root}/consent`,'POST',{enabled:false});assert.equal((await audioReq(owner,`${root}/audio`,{...audioFields,clientId:randomUUID()})).status,403);
 });
 await t.test('cerrar almacena sesión, limita modificaciones y preserva historial',async()=>{const session=await ok(owner,`/rooms/${room.id}/close`,'POST',{});assert.ok(session.id);assert.equal((await req(outsider,`/sessions/${session.id}`)).status,403);assert.ok((await ok(member,'/sessions')).some(x=>x.id===session.id));assert.equal((await req(member,`/rooms/${room.id}/messages`,'POST',{text:'tarde',clientId:randomUUID()})).status,409);const detail=await ok(member,`/sessions/${session.id}`);assert.equal(detail.roomId,room.id);assert.equal(detail.context,undefined);assert.equal((await req(member,`/sessions/${session.id}/quiz/attempts`,'POST',{answers:[0]})).status,409);});
 await t.test('reporte íntegro y consulta privada protegen audio, notas y procedencia de archivos',async()=>{
  const report=await ok(member,`/sessions/${room.sessionId}/report`);assert.equal(report.id,room.sessionId);assert.ok(report.transcription.batches.some(b=>b.id===transcriptionBatch.id));assert.ok(report.messages.some(m=>m.text.includes('matriz')));assert.equal(JSON.stringify(report).includes('Nota privada del anfitrión'),false);
  assert.equal((await req(outsider,`/sessions/${room.sessionId}/report`)).status,403);
  assert.equal((await req(outsider,`/sessions/${room.sessionId}/questions`,'POST',{question:'Qué estudiaron?'})).status,403);
  assert.equal((await req(member,`/sessions/${room.sessionId}/documents/${randomUUID()}/url`)).status,403);
  const exported=await ok(member,`/sessions/${room.sessionId}/export?format=json`);assert.deepEqual(exported.transcription.batches,report.transcription.batches);
  const answer=await ok(member,`/sessions/${room.sessionId}/questions`,'POST',{question:'Qué organiza una matriz?',clientId:randomUUID()});assert.equal(answer.kind,'answer');assert.equal(answer.shared,false);assert.equal((await req(owner,`/ai/jobs/${answer.id}`)).status,403);await ok(member,`/ai/jobs/${answer.id}/cancel`,'POST',{});
 });
 await t.test('sala privada: código, enlace y expulsión',async()=>{const p=await ok(owner,'/rooms','POST',roomBody('Privada integración',{privacy:'private',accessCode:'estudiar-2026'}));assert.equal((await req(member,`/rooms/${p.id}/join`,'POST',{code:'incorrecto'})).status,403);const invite=await ok(owner,`/rooms/${p.id}/invites`,'POST',{});assert.match(invite.url,/\/salas\//);await ok(member,`/rooms/${p.id}/join`,'POST',{inviteToken:invite.token});await ok(owner,`/rooms/${p.id}/members/${member.id}`,'DELETE');assert.equal((await req(member,`/rooms/${p.id}/join`,'POST',{code:'estudiar-2026'})).status,403);assert.equal((await req(member,`/rooms/${p.id}/state`)).status,403);await ok(owner,`/rooms/${p.id}/close`,'POST',{});});
 await t.test('capacidad bajo solicitudes simultáneas',async()=>{const p=await ok(owner,'/rooms','POST',roomBody('Capacidad integración',{capacity:2}));const r=await Promise.all([req(member,`/rooms/${p.id}/join`,'POST',{}),req(outsider,`/rooms/${p.id}/join`,'POST',{})]);assert.equal(r.filter(x=>x.status===201).length,1);assert.equal(r.filter(x=>x.status===409).length,1);assert.equal((await ok(owner,`/rooms/${p.id}`)).participantCount,2);await ok(owner,`/rooms/${p.id}/close`,'POST',{});});
 await t.test('programación futura y cancelación',async()=>{const p=await ok(owner,'/rooms','POST',roomBody('Programada integración',{scheduledAt:new Date(Date.now()+3600000).toISOString()}));assert.equal(p.status,'scheduled');assert.equal((await req(member,`/rooms/${p.id}/join`,'POST',{})).status,409);await ok(owner,`/rooms/${p.id}/cancel`,'POST',{});assert.equal((await ok(owner,`/rooms/${p.id}`)).status,'cancelled');});
 await t.test('cuotas disponibles sin revelar secretos',async()=>{const u=await ok(owner,'/usage');assert.ok(u.limits.participantMinutes<=5000);assert.equal(JSON.stringify(u).includes('service_role'),false);});
 await t.test('nuevas anotaciones rechazan acceso ajeno y payloads inválidos antes de consultar medios',async()=>{
  const artist=await account('dibujo');
  await ok(artist,'/me');
  const drawing=await ok(artist,'/rooms','POST',roomBody('Herramientas integración'));
  const path=`/rooms/${drawing.id}/annotations`;
  try{
   const shape={action:'rectangle',screenId:'TR_test',points:[{x:0.1,y:0.1},{x:0.8,y:0.8}]};
   assert.equal((await req(outsider,path,'POST',shape)).status,403);
   for(const payload of [
    {...shape,strokeWidth:25},
    {...shape,points:[{x:0.1,y:0.1}]},
    {action:'text',screenId:'TR_test',x:0.5,y:0.5,text:'a'.repeat(301)},
    {action:'erase',screenId:'TR_test',targetIds:[randomUUID()],userId:outsider.id},
    {action:'erase',screenId:'TR_test',targetIds:[]},
   ])assert.equal((await req(artist,path,'POST',payload)).status,400,JSON.stringify(payload));
  }finally{await ok(artist,`/rooms/${drawing.id}/cancel`,'POST',{});}
 });
});
