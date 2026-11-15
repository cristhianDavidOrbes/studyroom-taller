# Tareas: entrega SDD de StudyRoom

**Especificación:** [spec.md](spec.md) · **Plan:** [plan.md](plan.md)
Una casilla marcada exige evidencia; el código existente por sí solo no prueba funcionamiento.

## Fase 1 — Proteger y comprender

- [x] T001 Crear una copia independiente con historia Git y cambios locales preservados.
- [x] T002 Crear ramas por funcionalidad desde `main` y conservar sus commits y PR separados.
- [x] T003 Inventariar stack, contratos, pruebas y límites existentes.
- [x] T004 Inicializar GitHub Spec Kit con integración Copilot en la copia.

## Fase 2 — Especificar

- [x] T005 Completar constitución real en `.specify/memory/constitution.md`.
- [x] T006 Definir necesidad, requisitos FR-001 a FR-016, aceptación y Non-Goals en `spec.md`.
- [x] T007 Escribir arquitectura, HTTP, seguridad y riesgos en `plan.md`.
- [x] T008 Relacionar requisitos con código y evidencia en `docs/entrega-final/trazabilidad.md`.

## Fase 3 — Comprobar la aplicación

- [x] T009 Ejecutar compilación y tipos de web, API y gateway; resultado en `docs/entrega-final/verificacion.md`.
- [x] T010 Ejecutar pruebas unitarias de edad, permisos, voz, archivos, cronología, Word/ZIP e IA: 198 aprobadas.
- [x] T011 Ejecutar integración aislada con PostgreSQL y emulador Firebase; 18 escenarios aprobados, incluidos persistencia, 401/403 y reconexión.
- [ ] T012 Demostrar con dos cuentas sala → mensaje/enlace/imagen/archivo → cierre → reporte → ZIP → pregunta a IA.
- [ ] T013 Validar cámara, micrófono y pantalla en dos dispositivos; registrar el alcance real.

## Fase 4 — Entrega y colaboración

- [x] T014 Revisar README, variables de ejemplo, instalación y secretos excluidos del commit de respaldo.
- [x] T015 Crear repositorio privado académico en GitHub y conectarlo como remoto de esta copia en VS Code.
- [x] T016 Publicar cada rama y sus PR #1–#7 en el nuevo repositorio; no inventar colaboradores. Actions no inició por el límite de gasto de la cuenta.
- [x] T017 Adjuntar evidencia, límites y guion de demo en `docs/entrega-final/`.
- [x] T018 Revisar coherencia constitución → spec → plan → tareas → código, actualizar pruebas y trazabilidad; las demostraciones con hardware y servicios externos siguen expresamente pendientes.
