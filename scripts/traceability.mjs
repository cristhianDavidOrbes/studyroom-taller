import { readFile, writeFile, access, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = async path => JSON.parse(await readFile(resolve(root,path),'utf8'));
const exists = async path => access(resolve(root,path)).then(()=>true,()=>false);
const sourcePath='docs/jira-requirements.json';
const sourceText=await readFile(resolve(root,sourcePath),'utf8');
const issues=JSON.parse(sourceText);
const byKey=new Map(issues.map(issue=>[issue.key,issue]));
const plain=html=>String(html??'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const web='apps/web/src/', api='apps/api/src/';
const db='apps/api/prisma/schema.prisma', contract='docs/implementation-contract.md';
const migration='apps/api/prisma/migrations/20261002050007_studyroom_initial/migration.sql';
const suites={
  apiUnit:{file:'apps/api/test/security.spec.ts',command:'npm test -w @studyroom/api',reported:'19 pruebas unitarias API aprobadas en la sesión según el agente principal; verificar el artefacto actualizado si existe.'},
  authz:{file:'apps/api/test/authorization.spec.ts',command:'npm test -w @studyroom/api',reported:'Parte de las pruebas unitarias API.'},
  queue:{file:'apps/api/test/queue.spec.ts',command:'npm test -w @studyroom/api',reported:'Parte de las pruebas unitarias API.'},
  apiIntegration:{file:'tests/api.integration.mjs',command:'node --test tests/api.integration.mjs',reported:'14 pruebas/subpruebas aprobadas contra Firebase Auth emulator y PostgreSQL según el agente principal. No acredita Firebase de producción.'},
  browser:{file:'apps/web/tests/browser-smoke.mjs',command:'node apps/web/tests/browser-smoke.mjs',artifact:'apps/web/test-results/browser-smoke.json'},
  annotation:{file:'apps/web/src/annotations.test.ts',command:'npm test -w @studyroom/web',reported:'Casos de transformación de coordenadas; no acredita transmisión en dispositivos reales.'},
  gateway:{file:'apps/ai-gateway/test/gateway.test.ts',command:'npm test -w @studyroom/ai-gateway',reported:'13 pruebas aprobadas observadas directamente durante esta implementación.'},
  localModel:{file:'scripts/local-ai/verify.ps1',command:'.\\scripts\\local-ai\\verify.ps1',artifact:'apps/ai-gateway/model-verification.json'},
};
const gates={
  deployment:'DEPLOYMENT_FREE: comprobar Render Free, HTTPS, cold start, orígenes Firebase/CORS, planes gratuitos y límites en los paneles reales. Un despliegue local no satisface esta puerta.',
  accessibility:'ACCESSIBILITY: lector de pantalla, navegación completa con teclado, zoom 200%, contraste y dispositivos móviles reales; el smoke test solo cubre una parte.',
  auth:'AUTH_PRODUCTION: correo real de recuperación, enlace vencido, sesión revocada entre dispositivos y validación Firebase de producción.',
  media:'MEDIA_60_MIN: cuatro dispositivos/redes reales, 60 minutos, RTT p95<300ms, congelamientos<1%, sin desconexiones; repetir con inferencia local.',
  recovery:'MEDIA_RECOVERY: UDP bloqueado/TURN-TLS, Wi-Fi→datos, corte5s y recuperación≤10s; reinicio API conservando medios, chat y señales recuperan estado.',
  annotations:'ANNOTATIONS_REAL: señalamientos visibles para otros participantes sobre la pantalla compartida, resoluciones distintas, teclado y permisos reales; no hay pizarra separada.',
  storage:'STORAGE_REAL: subida/descarga/eliminación autorizadas en Supabase privado con dos usuarios, documento inválido, cuota y URL vencida; comprobar extracción de PDFs.',
  restore:'RESTORE: restaurar un respaldo PostgreSQL en una base vacía y validar relaciones; la migración aplicada no sustituye una restauración.',
  aiTunnel:'AI_TUNNEL: llamada desde Render por HTTPS ngrok al PC, 401 público sin secreto, PC suspendido/apagado y túnel caído; sin fallback facturable.',
  aiQuality:'AI_QUALITY: evaluar español, fidelidad y quizzes con material real variado; tres muestras correctas no son una evaluación estadística.',
  aiRecovery:'AI_DURABLE: reiniciar API durante trabajo y recuperar lease vencido sin duplicar resultado; validar cola y cancelación con motor real.',
  roomFlows:'ROOM_FLOWS: completar positivo y negativo de cada filtro, recomendación, invitación, fecha y transición desde la interfaz con usuarios distintos.',
  collaboration:'COLLABORATION_REAL: dos clientes de sala prueban presencia, reacciones, mano, chat, notas privadas y timer bajo desconexión/reconexión.',
  ci:'CI_REMOTE: ejecutar el workflow en el repositorio conectado con límites gratuitos, retención y bloqueo de gasto; las pruebas locales no prueban GitHub Actions.',
  feedback:'AI_FEEDBACK: usuario autorizado valora/reporta respuesta completa; comprobar persistencia, deduplicación, rechazo de valoración ajena e interfaz.',
  history:'HISTORY_REAL: exportación JSON/Markdown, filtros/fechas, privacidad, intento de quiz y reporte coherente en sesiones y usuarios reales.',
};

// A source mapping is deliberately separate from acceptance. No issue is closed here.
// Tuple: number, behavior, web sources, server/data sources, relevant suite ids, tested scope, remaining gates.
const rows=[
 [2,'Alta y acceso email/contraseña con Firebase; uid sincronizado de forma idempotente.', ['auth.tsx','firebase.ts'],['core.ts','rooms.ts'],['apiIntegration','browser'],'Credenciales inválidas, token ausente/inválido, registro y perfil.',['auth']],
 [3,'Onboarding, perfil e intereses persistidos.',['auth.tsx'],['rooms.ts','validation.ts'],['apiIntegration','browser'],'Edición de perfil y onboarding; no todos los campos tienen aserción individual.',['auth']],
 [4,'Solicitud genérica de recuperación, validación de código y cambio de contraseña.',['auth.tsx'],['core.ts'],[],'Código presente; no hay evidencia del correo real y el enlace expirado.',['auth']],
 [5,'Renovación de Firebase, cierre local, revocación y desconexión de sockets.',['auth.tsx','api.ts'],['core.ts','controller.ts','realtime.ts'],['apiIntegration'],'Rechazo de tokens; falta probar cierre/revocación entre dispositivos.',['auth']],
 [6,'Edición de intereses, nivel y preferencias.',['auth.tsx'],['rooms.ts','validation.ts'],['apiIntegration','browser'],'Persistencia de perfil y preferencias en integración; cobertura parcial.',['roomFlows']],
 [7,'Diseño adaptable, foco, etiquetas y estados accesibles.',['App.tsx','styles.css','ui.tsx'],['controller.ts'],['browser'],'Smoke móvil, ausencia de desbordamiento y foco; evaluación accesible completa pendiente.',['accessibility']],
 [8,'Preferencias de avisos in-app/email almacenadas; recuperación independiente.',['auth.tsx','room.tsx'],['rooms.ts','validation.ts'],['apiIntegration'],'Preferencias se envían al perfil; no acredita un servicio de correos de avisos.',['auth']],
 [10,'Catálogo, búsqueda textual y filtros de salas.',['explore.tsx'],['rooms.ts','validation.ts'],['apiIntegration','browser'],'Crear y localizar sala por búsqueda/materia.',['roomFlows']],
 [11,'Tarjeta y detalle con capacidad, privacidad, fecha y entrada.',['explore.tsx'],['rooms.ts'],['browser'],'Detalle en creación/entrada; revisar cada estado y fecha.',['roomFlows']],
 [12,'Filtros por materia, modalidad y nivel.',['explore.tsx'],['rooms.ts'],['apiIntegration'],'Filtro de materia cubierto; modalidad/nivel pendientes de aserciones específicas.',['roomFlows']],
 [13,'Ordenamiento por relevancia, actividad y fechas.',['explore.tsx'],['rooms.ts'],[],'Ordenadores implementados; no existe caso automático específico de ranking.',['roomFlows']],
 [14,'Recomendaciones según intereses y nivel del perfil.',['explore.tsx'],['rooms.ts'],[],'Cálculo implementado; falta verificar ranking y cambios de preferencias.',['roomFlows']],
 [15,'Consulta de futuras salas y estados programados.',['explore.tsx'],['rooms.ts'],['apiIntegration'],'Estado programado y rechazo de entrada anticipada.',['roomFlows']],
 [16,'Estados de carga, error, vacío y acción para crear/limpiar filtros.',['explore.tsx','ui.tsx'],['rooms.ts'],[],'Componentes presentes; falta caso automático de cada resultado vacío/error.',['roomFlows']],
 [18,'Entrada/salida idempotentes y aforo transaccional.',['room.tsx','explore.tsx'],['rooms.ts'],['apiIntegration','apiUnit'],'Aforo bajo solicitudes simultáneas, doble entrada y rechazo de capacidad inválida.',['collaboration']],
 [19,'Creación validada con anfitrión y sesión.',['explore.tsx'],['rooms.ts','validation.ts'],['apiIntegration','browser'],'Flujo de creación y datos inválidos de capacidad.',['roomFlows']],
 [20,'Edición autorizada de metadatos.',['explore.tsx','room.tsx'],['rooms.ts'],['apiIntegration'],'Anfitrión edita; participante rechazado.',['roomFlows']],
 [21,'Privacidad y código protegido con salt; acceso validado.',['explore.tsx'],['rooms.ts','core.ts'],['apiIntegration','apiUnit'],'Código incorrecto, comprobación/hash y expulsión.',['roomFlows']],
 [22,'Invitación por enlace con token y expiración.',['room.tsx'],['rooms.ts'],['apiIntegration'],'Enlace permite entrar; invitación vencida requiere caso específico.',['roomFlows']],
 [23,'Roles, moderación y expulsión autorizadas.',['room.tsx'],['rooms.ts','realtime.ts'],['apiIntegration','authz'],'Moderador autorizado, anfitrión protegido, expulsado sin acceso.',['collaboration']],
 [24,'Programar fecha futura y validar acceso temporal.',['explore.tsx'],['rooms.ts','validation.ts'],['apiIntegration'],'Programada y entrada antes de tiempo; reloj/fecha real pendiente.',['roomFlows']],
 [25,'Cierre/cancelación autorizados con estado final y sesión persistida.',['room.tsx','explore.tsx'],['rooms.ts','controller.ts'],['apiIntegration','browser'],'Cierre, historial, rechazo de mensaje posterior y cancelación futura.',['collaboration']],
 [27,'Persistencia PostgreSQL para perfiles, salas, membresías, sesiones y trabajos.',['auth.tsx','history.tsx'],['core.ts','rooms.ts'],['apiIntegration'],'Datos reales persistidos entre solicitudes; restauración pendiente.',['restore']],
 [28,'API autenticada, validación, límites, HTTPS previsto y OpenAPI.',['api.ts'],['core.ts','controller.ts','main.ts','validation.ts'],['apiIntegration','apiUnit'],'JWT ausente/inválido, payload no autorizado y límites; HTTPS Render pendiente.',['auth']],
 [29,'Autorización por rol y membresía en REST, archivos, IA y sockets.',['room.tsx'],['rooms.ts','realtime.ts','documents.ts','ai.ts'],['authz','apiIntegration'],'Salas ajenas/expulsión, timer, pantalla, notas y trabajos privados.',['storage','collaboration']],
 [30,'Migraciones, RLS y seed de desarrollo; conexión de ejecución restringida.',['App.tsx'],['core.ts'],['apiIntegration'],'Base consultable para pruebas; no equivale a prueba de restore.',['restore']],
 [31,'Supabase Storage privado, límites y URLs firmadas autorizadas.',['room.tsx'],['documents.ts','storage-guard.ts'],['apiUnit'],'MIME real y nombre seguro; integración Storage completa pendiente.',['storage']],
 [32,'Errores públicos saneados, identificador de solicitud y registros de eventos.',['api.ts','ui.tsx'],['core.ts','main.ts','events.ts'],['apiIntegration'],'Respuestas de error ejercitadas; revisión de retención y redacción en producción pendiente.',['auth']],
 [33,'Pruebas unitarias/integración/navegador y automatización de calidad.',['annotations.test.ts'],['validation.ts'],['apiUnit','authz','queue','apiIntegration','browser','gateway'],'Suites locales; ejecución remota de CI requiere evidencia.',['ci']],
 [35,'Presencia por usuario, autorización de sala y snapshot al reconectar.',['room.tsx'],['realtime.ts','rooms.ts'],['apiIntegration'],'Socket reconecta y obtiene snapshot.',['collaboration']],
 [36,'Chat persistente idempotente con distribución a sala.',['room.tsx'],['rooms.ts','realtime.ts','events.ts'],['apiIntegration','browser'],'Enviar, persistir, idempotencia y texto vacío.',['collaboration']],
 [37,'Reacciones permitidas y estado de mano levantada.',['room.tsx'],['realtime.ts','rooms.ts'],[],'Eventos implementados; falta caso automático específico entre dos clientes.',['collaboration']],
 [38,'Videollamada LiveKit SFU con ajuste de calidad y estadísticas exportables.',['media.tsx'],['rooms.ts'],['queue'],'Límite de duración/reserva unitario; no hay llamada real de aceptación.',['media','recovery']],
 [39,'Cámara, micrófono, selección de dispositivos, reproducción y solo audio.',['media.tsx'],['rooms.ts'],[],'Controles presentes; hardware real/denegación de permisos pendiente.',['media','recovery']],
 [40,'Pantalla compartida con audio opcional y límite720p/15fps.',['media.tsx'],['rooms.ts'],[],'Código de publicación presente; dos receptores reales pendientes.',['media','recovery']],
 [41,'Menú compacto sobre cámara; puntero/trazo/borrado sincronizados sobre pantalla.',['media.tsx','annotations.ts'],['rooms.ts','validation.ts'],['annotation','authz','apiUnit'],'Normalización/barras negras, límites y permiso de pantalla; transmisión real pendiente.',['media','recovery','annotations']],
 [42,'Subir/listar/ver/borrar documentos con URLs privadas.',['room.tsx'],['documents.ts'],['apiUnit'],'Validación de archivo falso/nombre; integración completa pendiente.',['storage']],
 [43,'Notas privadas persistentes por usuario y sala.',['room.tsx'],['rooms.ts'],['apiIntegration','browser'],'Aislamiento entre dos usuarios y persistencia al recargar.',['collaboration']],
 [44,'Temporizador compartido de enfoque/descanso con control por rol.',['room.tsx'],['rooms.ts'],['apiIntegration','authz','browser'],'Inicio/pausa y rechazo de participante.',['collaboration']],
 [46,'Adaptador al gateway local autenticado; modelo fijo sin proveedor de pago.',['ai.tsx'],['ai.ts'],['gateway','localModel','queue'],'Gateway, credenciales, disponibilidad y muestras reales de inferencia.',['aiTunnel','aiQuality','aiRecovery']],
 [47,'Preguntas privadas con contexto elegido, cola, streaming y cancelación.',['ai.tsx','room.tsx'],['ai.ts'],['apiIntegration','gateway','localModel'],'Acceso privado, cancelación, streaming del gateway; trabajador de extremo a extremo pendiente de evidencia específica.',['aiTunnel','aiQuality','aiRecovery']],
 [48,'@IA en chat crea pregunta compartida idempotente.',['room.tsx'],['controller.ts','ai.ts'],[],'Invocación y asociación implementadas; prueba positiva/negativa de chat+motor pendiente.',['aiTunnel','aiQuality','aiRecovery']],
 [49,'Contexto de chat/documentos autorizados; fragmentación y fuentes; notas privadas excluidas.',['ai.tsx'],['ai.ts','documents.ts'],['apiIntegration','apiUnit'],'Rechazo de documento ajeno, privacidad, UTF8 y ocultación de payload.',['storage','aiQuality']],
 [50,'Cuotas locales/globales, reservas, reintentos y estados reales sin fallback de pago.',['usage.tsx','ai.tsx'],['ai.ts','rooms.ts'],['gateway','queue','apiIntegration'],'429, timeout, offline simulado, cuota durable y cancelación; cuotas de proveedores requieren panel real.',['aiTunnel','aiRecovery','media']],
 [51,'Valoración útil/reporte con motivo y autorización del resultado.',['ai.tsx'],['ai.ts'],[],'Persistencia y UI presentes; faltan pruebas completas positivas/negativas de valoración.',['feedback']],
 [53,'Cerrar almacena participantes/contexto autorizado y conserva historial.',['room.tsx','history.tsx'],['rooms.ts','ai.ts'],['apiIntegration','browser'],'Cierre, lectura autorizada e intento ajeno.',['history']],
 [54,'Resumen automático durable sobre fuentes de sesión.',['history.tsx','ai.tsx'],['ai.ts','rooms.ts'],['localModel','queue'],'Muestra local fiel y fallos/reencolado unitarios; ciclo de cierre+worker real pendiente.',['aiQuality','aiTunnel','aiRecovery','history']],
 [55,'Puntos clave/acuerdos desde contexto autorizado y referencias.',['history.tsx'],['ai.ts'],['localModel'],'Muestra de resumen conserva acuerdo; no prueba completa de artifact keypoints.',['aiQuality','aiTunnel','aiRecovery','history']],
 [56,'Quiz validado, respuestas ocultas hasta intento, corrección y persistencia.',['history.tsx'],['ai.ts','validation.ts'],['apiUnit','localModel','apiIntegration'],'Quiz JSON local correcto, esquema inválido y soluciones protegidas; falta intento real completo.',['aiQuality','history']],
 [57,'Historial, filtros, resultados, intentos y exportación.',['history.tsx'],['ai.ts','controller.ts'],['apiIntegration','browser'],'Lectura autorizada/historial, UI; filtros/exportación requieren cobertura adicional.',['history']],
];
const extraFiles={27:[db],30:[db,migration,'apps/api/prisma/seed.ts','apps/api/supabase/migrations/20261002050007_studyroom_initial.sql'],33:['package.json','.github/workflows/ci.yml'],46:['apps/ai-gateway/src/server.ts','apps/ai-gateway/src/config.ts','apps/ai-gateway/local-ai.md'],50:['apps/ai-gateway/src/core.ts','scripts/local-ai/watchdog.ps1']};
const stories=new Map();
for(const [number,behavior,front,back,testIds,testedScope,manual] of rows){
  const key=`SUT-${number}`;
  const issue=byKey.get(key);
  if(!issue||issue.fields.issuetype.name!=='Story')throw new Error(`Historia inexistente: ${key}`);
  const files=[...front.map(file=>web+file),...back.map(file=>api+file),...(extraFiles[number]??[])];
  const missing=[];
  for(const file of files)if(!await exists(file))missing.push(file);
  const evidence=[];
  for(const id of testIds){
    const suite=suites[id];
    let status=suite.reported?'executed_partial_scope':'not_executed';
    let detail=suite.reported??'Sin resultado registrado.';
    if(suite.artifact&&await exists(suite.artifact)){
      const artifact=await json(suite.artifact);
      if(id==='browser'){
        status=artifact.error?'failed_partial_run':artifact.results?.length>=5&&artifact.results.every(r=>r.status==='passed')?'passed_partial_scope':'partial_run';
        detail=`${artifact.results?.length??0} pasos; ${artifact.error?'el último registro contiene un error':'sin error registrado'}. No acredita todos los flujos de la aplicación.`;
      }else if(id==='localModel'){
        status=artifact.model?.name==='qwen3:4b-instruct'&&artifact.tests?.length===3&&artifact.unauthorizedStatus===401?'passed_partial_scope':'not_verified';
        detail='Tres muestras locales revisadas (español, resumen y quiz), autenticación y streaming. No es prueba del túnel ni de una llamada.';
      }
    }
    evidence.push({id,path:suite.file,command:suite.command,status,scope:detail,...(suite.artifact?{artifact:suite.artifact}:{})});
  }
  stories.set(key,{key,title:issue.fields.summary,epic:issue.fields.parent?.key,implemented:missing.length===0,implementationStatus:missing.length?'partial_missing_files':'source_present',implementationMeaning:'Existe implementación mapeada en código; no significa que todos los criterios de aceptación estén verificados.',behavior,implementationFiles:files,missingFiles:missing,automatedVerified:{status:evidence.length?'partial':'not_executed',scope:testedScope,evidence},manualPending:[...new Set(['deployment','accessibility',...manual])].map(id=>({id,description:gates[id],status:'pending'})),acceptanceComplete:false});
}

const counts={};
for(const issue of issues)counts[issue.fields.issuetype.name]=(counts[issue.fields.issuetype.name]??0)+1;
if(issues.length!==657||counts.Epic!==7||counts.Story!==50||counts.Task!==150||counts.Subtask!==450)throw new Error(`El inventario cambió: ${JSON.stringify(counts)}. Revisar antes de regenerar.`);
if(new Set(issues.map(i=>i.key)).size!==657)throw new Error('Claves Jira duplicadas.');
function storyOf(issue,seen=new Set()){
  if(seen.has(issue.key))throw new Error(`Ciclo de parentesco: ${issue.key}`);seen.add(issue.key);
  const type=issue.fields.issuetype.name;
  if(type==='Story')return issue.key;
  if(type==='Task'){
    const match=plain(issue.fields.description).match(/Historia relacionada:\s*(SUT-\d+)/i);
    if(!match||!stories.has(match[1]))throw new Error(`Tarea sin historia identificable: ${issue.key}`);
    return match[1];
  }
  if(type==='Subtask'){
    const parent=byKey.get(issue.fields.parent?.key);
    if(!parent||parent.fields.issuetype.name!=='Task')throw new Error(`Actividad huérfana: ${issue.key}`);
    return storyOf(parent,seen);
  }
  return null;
}
function workKind(issue){
  const title=issue.fields.summary.toLowerCase();
  if(issue.fields.issuetype.name==='Epic')return 'epic';
  if(issue.fields.issuetype.name==='Story')return 'story';
  if(/accesibilidad|calidad|pruebas|evidencias|escenarios/.test(title))return 'quality';
  if(/contratos|reglas de negocio|documentar/.test(title))return 'contract';
  if(/interfaz|componentes|flujo|pantalla/.test(title)&&!/endpoints/.test(title))return 'frontend';
  return 'services';
}
const trace=[];
for(const issue of issues){
  const type=issue.fields.issuetype.name;
  const storyKey=storyOf(issue);
  const story=storyKey?stories.get(storyKey):null;
  const kind=workKind(issue);
  const children=issues.filter(other=>other.fields.parent?.key===issue.key).map(other=>other.key);
  const relatedStories=type==='Epic'?[...stories.values()].filter(s=>s.epic===issue.key):[];
  let implementationFiles=story?.implementationFiles??[...new Set(relatedStories.flatMap(s=>s.implementationFiles))];
  if(kind==='frontend')implementationFiles=implementationFiles.filter(f=>f.startsWith(web));
  if(kind==='services')implementationFiles=implementationFiles.filter(f=>!f.startsWith(web));
  if(kind==='quality')implementationFiles=[...new Set([...(story?.automatedVerified.evidence??[]).map(e=>e.path),'docs/acceptance-manual.md'])];
  if(kind==='contract')implementationFiles=[contract,...implementationFiles.filter(f=>f.startsWith(api))];
  const manualPending=story?.manualPending??[...new Map(relatedStories.flatMap(s=>s.manualPending).map(g=>[g.id,g])).values()];
  const description=issue.fields.description??'';
  trace.push({key:issue.key,title:issue.fields.summary,type,workKind:kind,jiraUrl:`https://studyroomd.atlassian.net/browse/${issue.key}`,originalStatus:issue.fields.status?.name??null,jiraParent:issue.fields.parent?.key??null,storyKey,epicKey:story?.epic??(type==='Epic'?issue.key:null),children,source:{file:sourcePath,key:issue.key,descriptionSha256:createHash('sha256').update(description).digest('hex'),requirementText:plain(description)},implementationFiles,implemented:kind==='quality'?false:story?.implemented??relatedStories.every(s=>s.implemented),implementationStatus:kind==='quality'?'partial_automated_and_manual_pending':story?.implementationStatus??'aggregate_source_mapping',automatedVerified:story?.automatedVerified??{status:'partial',scope:'Agregación de historias; ninguna épica se considera aceptada automáticamente.',stories:relatedStories.map(s=>s.key)},manualPending,acceptanceComplete:false,sprint:issue.fields.customFields?.Sprint?.value?.[0]?.name??null});
}
const orphaned=trace.filter(i=>!['Epic'].includes(i.type)&&!i.storyKey);
if(orphaned.length)throw new Error('Existen elementos sin historia.');
for(const key of stories.keys()){
  if(trace.filter(i=>i.type==='Task'&&i.storyKey===key).length!==3||trace.filter(i=>i.type==='Subtask'&&i.storyKey===key).length!==9)throw new Error(`Distribución inesperada: ${key}`);
}
const report={generatedAt:new Date().toISOString(),source:{file:sourcePath,sha256:createHash('sha256').update(sourceText).digest('hex')},counts,issueCount:trace.length,relationshipValidation:{orphaned:0,stories:50,tasksPerStory:3,activitiesPerStory:9,duplicateKeys:0},statusPolicy:'implemented solo indica código mapeado. automatedVerified es parcial y nombra alcance. manualPending conserva condiciones externas. No se actualizan estados Jira ni se declaran 657 incidencias aceptadas.',allAcceptanceComplete:false,stories:[...stories.values()],issues:trace};
await mkdir(resolve(root,'docs'),{recursive:true});
await writeFile(resolve(root,'docs/traceability.json'),JSON.stringify(report,null,2)+'\n');
const table=report.stories.map(s=>`| [${s.key}](https://studyroomd.atlassian.net/browse/${s.key}) ${s.title} | ${s.implemented?'Código presente':'Implementación parcial'} | ${s.automatedVerified.status==='partial'?'Parcial; ver escenarios JSON':'Sin prueba específica'} | ${s.manualPending.filter(g=>!['deployment','accessibility'].includes(g.id)).map(g=>g.id).join(', ')} |`).join('\n');
const text=`# Trazabilidad de StudyRoom\n\nGenerado ${report.generatedAt}. Fuente: [inventario Jira](jira-requirements.json), SHA-256 \`${report.source.sha256}\`.\n\nSe relacionan **657 incidencias: 7 épicas, 50 historias, 150 tareas y 450 actividades**. Cada historia tiene 3 tareas y 9 actividades; no hay claves duplicadas ni elementos huérfanos. El JSON conserva texto completo normalizado y hash de cada descripción original, relaciones Jira reales y relación semántica tarea→historia. No se redujo el alcance del inventario.\n\n**Código presente no equivale a aceptación completada.** Cada historia expone por separado \`implemented\`, \`automatedVerified\`, \`manualPending\` y \`acceptanceComplete\`. La existencia de un archivo solo confirma su ubicación: las pruebas y su alcance se enumeran explícitamente. Las tareas/actividades de calidad permanecen parciales mientras falten pruebas reales; ninguna incidencia se marca terminada ni se modifica Jira desde este generador.\n\n[Mapa detallado de las 657 incidencias](traceability.json) · [Contrato](implementation-contract.md) · [Guía de aceptación manual](acceptance-manual.md).\n\n## Historias y estado de verificación\n\nTodas conservan como pendientes la validación del despliegue gratuito y la evaluación completa de accesibilidad. La tabla muestra además las puertas específicas.\n\n| Historia | Implementación | Verificación automática | Pendiente específico |\n|---|---|---|---|\n${table}\n\n## Qué significa cada puerta pendiente\n\n${Object.entries(gates).map(([id,text])=>`- **${id}:** ${text}`).join('\n')}\n\n## Evidencias y límites\n\nEl mapa incluye pruebas unitarias API, integración Firebase Auth emulator/PostgreSQL, navegador, coordenadas de pantalla y seguridad/cola del gateway. Los resultados de navegador se leen de su JSON real al regenerar, conservando un fallo si el último registro falló. La inferencia local se verifica contra su modelo/digest y muestras guardadas. Los resultados de API comunicados por el agente principal se identifican como tales; no se inventan ejecuciones de CI o de producción.\n\nNo existe aceptación automática de todos los criterios por aprobar una suite: faltan, según la historia, casos específicos de ranking, correo real, Storage, medios, valoración y resultados de cierre con motor real. Una llamada de 60 minutos con cuatro equipos/redes, recuperación/TURN y carga de IA requiere evidencia propia. La cuenta Free y sus cuotas deben comprobarse en cada proveedor.\n\nRegenerar desde la raíz con \`npm run traceability\`. El script falla si cambia el inventario, encuentra huérfanos o deja una historia sin sus 3 tareas/9 actividades; actualizar el mapeo y conservar siempre los requisitos nuevos.\n`;
await writeFile(resolve(root,'docs/traceability.md'),text);
console.log(JSON.stringify({issueCount:trace.length,counts,orphans:0,storiesWithSource:report.stories.filter(s=>s.implemented).length,acceptedIssues:0,files:['docs/traceability.json','docs/traceability.md']}));
