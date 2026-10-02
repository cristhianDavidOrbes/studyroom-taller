import {readFile,writeFile} from 'node:fs/promises';
import {setTimeout as delay} from 'node:timers/promises';
import assert from 'node:assert/strict';
const app=new URL('../../apps/ai-gateway/',import.meta.url);
const config=await readFile(new URL('.env',app),'utf8');
const token=config.match(/^AI_GATEWAY_SECRET=(.+)$/m)?.[1]?.trim();
assert(token,'Falta la credencial local');
const saved=JSON.parse(await readFile(new URL('.local/public-url.json',app),'utf8'));
const url=new URL(saved.AI_GATEWAY_URL);
assert(url.protocol==='https:'&&/^[a-z0-9-]+\.ngrok-free\.(app|dev)$/.test(url.hostname),'Dominio gratuito inválido');
async function request(path,options={}){
  for(let attempt=0;attempt<3;attempt++){
    try{return await fetch(new URL(path,url),{...options,signal:AbortSignal.timeout(120000),redirect:'error'});}
    catch(error){
      if(attempt===2)throw new Error(`Conexión pública falló: ${error.cause?.code??error.name}`);
      await delay(1000);
    }
  }
}
const unauthorized=await request('/v1/health');
assert.equal(unauthorized.status,401,'Una ruta privada debe devolver401 sin secreto');
await unauthorized.body?.cancel();
const healthResponse=await request('/v1/health',{headers:{Authorization:`Bearer ${token}`}});
assert.equal(healthResponse.status,200);
const health=await healthResponse.json();
const response=await request('/v1/generate',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({prompt:'Responde exactamente: StudyRoom conectado.',system:'Sigue la instrucción.',maxTokens:32,stream:true})});
assert.equal(response.status,200);
const events=(await response.text()).trim().split('\n').map(line=>JSON.parse(line));
assert.equal(events.at(-1).type,'done');
assert.match(events.filter(event=>event.type==='delta').map(event=>event.text).join(''),/StudyRoom conectado/);
const result={observedAt:new Date().toISOString(),publicUrl:url.origin,ngrokAgentConnected:true,publicDnsResolvesFromPc:true,unauthorizedStatus:401,authenticatedHealth:health.status,publicInferenceVerified:true,model:health.model,events,livekitCallTestExecuted:false};
await writeFile(new URL('tunnel-verification.json',app),JSON.stringify(result,null,2)+'\n');
console.log('ngrok público verificado: sin credencial401; salud autenticada y respuesta final por streaming correctas.');
