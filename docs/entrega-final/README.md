# Entrega final de Ingeniería Web — StudyRoom

Esta es una **copia académica independiente** del proyecto StudyRoom, preparada el 15 de noviembre de 2026. El repositorio original no se modifica por esta entrega. Los cambios nuevos se integraron a `main` desde ramas por funcionalidad mediante pull requests. El repositorio privado es `cristhianDavidOrbes/studyroom-taller-final-ramas`.

## Entregables

| Criterio del curso | Evidencia en esta copia |
|---|---|
| Constitución SDD | [Constitución](../../.specify/memory/constitution.md) |
| Especificación y Non-Goals | [spec.md](../../specs/001-studyroom-reporte/spec.md) |
| Plan técnico | [plan.md](../../specs/001-studyroom-reporte/plan.md) |
| Tareas | [tasks.md](../../specs/001-studyroom-reporte/tasks.md) |
| Necesidad y clases | [necesidad-y-clases.md](necesidad-y-clases.md) |
| Requisitos → código → pruebas | [trazabilidad.md](trazabilidad.md) |
| Pruebas y límites | [verificacion.md](verificacion.md) |
| Exposición de más de cinco minutos | [guion-presentacion.md](guion-presentacion.md) |
| Video del taller, seis criterios y checklist final | [guion-video-taller-final.md](guion-video-taller-final.md) |
| Ramas y PR por funcionalidad | [flujo-git.md](flujo-git.md) |
| Instalación y ejecución | [README principal](../../README.md) y archivos `.env.example` de cada aplicación |

## Preparación rápida en VS Code

1. Abrir **esta carpeta**, no la carpeta original, con `code .` o **Archivo → Abrir carpeta**.
2. Revisar **Control de código fuente**: `main` contiene los PR integrados; las ramas `feature/*`, `test/*`, `chore/*` y `docs/*` se conservan. `origin` apunta al repositorio académico privado.
3. Iniciar sesión en GitHub en VS Code si solicita autenticación. La autenticación de `gh` y el remoto Git ya permiten operaciones de Git; Copilot puede requerir una sesión propia en la interfaz.
4. Desde la terminal integrada ejecutar `npm ci`, `npm run build`, `npm run typecheck` y `npm test`.
5. Usar las instrucciones del README principal para PostgreSQL y el emulador Firebase. Nunca ejecutar pruebas de integración contra Supabase de producción.
6. En el chat de Copilot, los comandos de la versión instalada de Spec Kit aparecen como `/speckit-constitution`, `/speckit-specify`, `/speckit-plan` y `/speckit-tasks`. `specify` se ejecuta en terminal; los comandos con `/` se ejecutan en el chat.

## Qué se puede afirmar hoy

La copia compila, pasa tipos, supera 198 pruebas unitarias y 18 escenarios de integración con PostgreSQL y Firebase Auth aislados. La llamada real en dos equipos y la demo completa del flujo de voz/reporte/IA requieren ejecución adicional. Esas tareas permanecen abiertas en `tasks.md`; no se presentan como realizadas. El repositorio conserva código previo, por lo que esta documentación es una adopción SDD sobre un proyecto existente, no prueba de que todo el desarrollo histórico siguiera SDD desde el inicio.

## Trabajo colaborativo

El historial anterior se conserva y esta entrega tiene [ramas y pull requests revisables](flujo-git.md). El historial de Git muestra autores reales; no se atribuyen commits o revisiones ficticios. Si el curso exige participación de otros integrantes, cada integrante debe contribuir con su propia cuenta, rama, commit y revisión antes de la entrega grupal. Cada persona deberá subir su propia entrega a Campus UCC según los criterios del curso.
