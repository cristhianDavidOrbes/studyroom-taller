# Guion de video del taller final de Ingeniería Web

**Duración prevista:** 10 a 11 minutos. Este es el recorrido que debes **mostrar y explicar** en el video, siguiendo los seis criterios de la rúbrica y los seis puntos del checklist final. El [guion anterior](guion-presentacion.md) sirve para una exposición general del producto; este guía la entrega del taller.

**Preparación:** abre en VS Code la carpeta `studyroom-taller-final-por-funcionalidades`, en `main`. Ten abiertas una terminal, la aplicación de prueba y la [lista de pull requests](https://github.com/cristhianDavidOrbes/studyroom-taller/pulls?q=is%3Apr+is%3Aclosed). Prepara una cuenta y una reunión de prueba. Usa dos cuentas o ventanas si vas a demostrar actualización en tiempo real. No abras archivos `.env` reales ni muestres contraseñas o tokens.

## 0:00–0:45 — Presentación y necesidad

**En pantalla:** explorador de la copia académica en VS Code y portada de StudyRoom.

**Di:** «Hola. Este es mi taller final de Ingeniería Web. El proyecto es StudyRoom, una aplicación para estudiar en grupo mediante salas, videollamada y materiales compartidos. El problema que resuelve es recuperar después de cada reunión lo que se dijo y lo que se envió en su orden original. Voy a demostrar los artefactos de desarrollo guiado por especificaciones, el funcionamiento, la calidad técnica, las pruebas, el trabajo en Git y la documentación. Al final recorreré el checklist de entrega.»

## 0:45–1:45 — Cómo incorporé Spec Kit a un proyecto existente

**En pantalla:** muestra el commit base de `main` y después las carpetas `.specify/` y `.github/skills/`. Abre `.specify/init-options.json` e `.specify/integration.json` para que se lea `copilot`, `ps` y `here`. Enseña la línea siguiente en este guion o en la terminal como explicación histórica; **no vuelvas a ejecutar `init` durante la grabación**:

```powershell
specify init --here --force --non-interactive --integration copilot --script ps
```

**Di:** «StudyRoom ya tenía código, así que primero hice una copia independiente con su historial de Git. Inspeccioné sus carpetas, dependencias, API, base de datos y pruebas para documentar lo que realmente existía. Después inicialicé Spec Kit dentro de esa copia con este comando de terminal. La opción `--here` lo coloca en el proyecto actual; la integración `copilot` añade los recursos para VS Code y `--script ps` usa PowerShell. La evidencia de esa configuración está en estos archivos. Spec Kit creó su estructura en `.specify` y las habilidades de Copilot en `.github/skills`. Luego redacté la constitución según el stack y las reglas reales, escribí la especificación con requisitos y Non-Goals, el plan técnico y las tareas. Finalmente relacioné requisitos con código y pruebas y trabajé los cambios nuevos en ramas y PR. Los comandos `/speckit-...` quedaron disponibles en Copilot Chat; no voy a afirmar que todo el código previo fue generado por esos comandos. Esto es una adopción SDD de un proyecto existente.»

## 1:45–2:30 — 01: constitución

**En pantalla:** abre `.specify/memory/constitution.md`. Desplázate por naturaleza, stack, reglas, acceso, errores y límites del agente.

**Di:** «Aquí está la constitución. Define el propósito y las restricciones reales del proyecto. La interfaz usa React y TypeScript; la API usa NestJS, PostgreSQL y Prisma; Firebase maneja identidad; LiveKit maneja medios. Las reglas de negocio incluyen validar membresía y edad en el servidor, proteger reportes privados y rechazar actividad cuando una sesión ya cerró. También indica cómo validar entradas y responder a errores sin exponer secretos. Estas son reglas generales que deben respetar todas las funciones.»

## 2:30–3:20 — 01: especificación y Non-Goals

**En pantalla:** abre `specs/001-studyroom-reporte/spec.md`. Señala FR-001 a FR-016, escenarios de aceptación y **Non-Goals**.

**Di:** «La especificación define dieciséis requisitos verificables. Incluye acceso, salas, chat, enlaces, archivos, videollamada, transcripción, reporte cronológico, Word y ZIP, y preguntas al reporte con IA. La aceptación incluye casos positivos y negativos: una persona autorizada entra y ve su reporte; una persona ajena no puede obtenerlo. Los Non-Goals aclaran lo que no se construye en esta iteración, como cuestionarios, pagos, una aplicación móvil nativa y la instalación obligatoria de la herramienta de dibujo. Esta delimitación permite comparar el código con lo prometido.»

## 3:20–4:10 — 01: plan, tareas y coherencia

**En pantalla:** abre `plan.md`, `tasks.md` y `docs/entrega-final/trazabilidad.md`. Sigue el ejemplo FR-013 desde la especificación hasta `apps/api/src/report-archive.ts` y su prueba.

**Di:** «El plan explica la arquitectura y las decisiones de implementación. Las tareas organizan el trabajo concreto y marcan lo comprobado y lo pendiente. Esta tabla da trazabilidad entre requisito, código y prueba. Por ejemplo, FR-013 pide un ZIP con Word y adjuntos en orden. Aquí está el módulo de exportación y aquí la prueba correspondiente. Así se ve coherencia entre lo propuesto, lo planificado y lo implementado. La documentación SDD se aplicó sobre un proyecto existente; no afirmo que todo su desarrollo histórico comenzara con Spec Kit.»

## 4:10–6:35 — 02: funcionamiento de la aplicación

**En pantalla:** muestra `README.md` en «Ejecutar en este PC»; enseña la terminal con web y API iniciadas. Abre `http://localhost:3000/api/health` y `http://localhost:5173` si estás usando la copia local. Si usas la web desplegada, aclara que esa URL corresponde a producción y muestra la copia académica por separado.

**Di:** «El README enumera requisitos y pasos para instalar y ejecutar la aplicación. Aquí se ve que la API responde y que la interfaz abre. Ahora hago una acción real, porque ver una pantalla no demuestra que el backend funcione.»

**En pantalla:** inicia sesión con un usuario de prueba; crea o abre una sala; envía un mensaje y un enlace. Si tienes un segundo participante, enseña que recibe el cambio sin recargar. Sube una imagen o documento y señala el indicador de carga. Si LiveKit está disponible, conecta cámara y micrófono. Cierra una reunión de prueba, abre **Reportes**, recorre la cronología, descarga el ZIP, abre el Word y la carpeta `adjuntos`. Si la IA local está activa, formula una pregunta sobre ese reporte.

**Di mientras navegas:** «Al entrar, la API comprueba identidad, edad, privacidad, capacidad y estado de la sala. Los mensajes y archivos se guardan y se anuncian a los participantes. El reporte ordena voz, chat, enlaces y archivos por el momento en que ocurrieron. La exportación reúne el Word y los adjuntos. El asistente puede responder con el contexto disponible para este participante, sin leer notas privadas.»

**Si una parte falla:** «Esta función depende de [nombre del servicio]. Muestro el error real y la dejo como limitación documentada; no la voy a presentar como demostrada.»

## 6:35–7:35 — 03 y 05: calidad de código y pruebas

**En pantalla:** muestra la estructura `apps/web`, `apps/api`, `apps/ai-gateway`; abre un validador y una comprobación de autorización de la API. Muestra `.gitignore` y los archivos `.env.example`, sin abrir `.env`. Después abre `docs/entrega-final/verificacion.md` y, si tienes tiempo, ejecuta `npm run build`, `npm run typecheck` y `npm test` en la terminal.

**Di:** «El código está organizado por responsabilidades. Las entradas y permisos se validan en la API, no solo en el navegador. Los secretos están excluidos de Git y el repositorio contiene ejemplos de configuración. La copia compiló, pasó tipos, 198 pruebas unitarias y 18 escenarios de integración con PostgreSQL y Firebase Auth aislados. Hay casos de éxito y de error: token ausente, acceso prohibido, capacidad de la sala y rechazo de mensajes después del cierre. Para comprobar persistencia no me quedo solo con una respuesta HTTP 200: vuelvo a consultar el dato guardado.»

## 7:35–8:40 — 04: rama, commits y pull request

**En pantalla:** muestra la rama `main` en VS Code y el [mapa de ramas y PR](flujo-git.md). En GitHub abre **Branches** para enseñar `feature/control-edad-salas`, `feature/contexto-visual-ia`, `feature/adjuntos-cronologicos-zip` y las demás. Abre [PR #1](https://github.com/cristhianDavidOrbes/studyroom-taller/pull/1), [PR #2](https://github.com/cristhianDavidOrbes/studyroom-taller/pull/2) y [PR #3](https://github.com/cristhianDavidOrbes/studyroom-taller/pull/3): enseña **Commits**, **Files changed**, rama de origen, destino `main` y el estado integrado.

**Di:** «Para este taller los cambios nuevos no se hicieron directamente en `main`. Separé funcionalidades en ramas con nombres concretos: control de edad, contexto visual de IA, adjuntos cronológicos y migraciones al iniciar la API. Cada rama tuvo su propio commit y pull request hacia `main`; después de comprobarla se integró mediante merge. Los PR conservan los archivos y commits para revisarlos. El código que ya existía está en la base inicial y no lo atribuyo a estos PR. El historial muestra autores reales. No voy a afirmar que otra persona revisó los cambios si la pestaña Reviews no lo demuestra. Si el trabajo es grupal, cada integrante debe aportar evidencia propia.»

## 8:40–9:45 — 06: README, decisiones y pendientes

**En pantalla:** muestra `README.md`, `apps/api/.env.example`, `apps/web/.env.example`, `docs/entrega-final/README.md`, `verificacion.md` y las casillas abiertas de `tasks.md`.

**Di:** «El README explica instalación, variables de ejemplo y cómo iniciar base de datos, autenticación emulada, API e interfaz. La carpeta de entrega reúne los artefactos SDD, trazabilidad y evidencia de pruebas. Las decisiones relevantes están documentadas: las claves permanecen en el servidor, las pruebas usan una base aislada y el reporte guardado sigue disponible si la IA local se apaga. También constan los límites: falta una llamada real documentada en dos dispositivos y una demostración nueva del flujo completo de voz, ZIP e IA. GitHub Actions no ejecutó sus trabajos por una restricción de facturación de la cuenta; por eso la evidencia que muestro es local.»

## 9:45–10:30 — Checklist final

**En pantalla:** vuelve a esta lista y señala cada punto mientras hablas.

**Di:** «Repaso el checklist: uno, la constitución refleja StudyRoom y sus restricciones; dos, funcionalidades y Non-Goals están definidos en la especificación; tres, el plan y las tareas tienen correspondencia con los requisitos y el código; cuatro, mostré la ejecución de la aplicación y distinguí cualquier función no disponible; cinco, cada cambio nuevo está en Git mediante su rama, commits y un PR integrado y revisable; seis, las decisiones, pruebas, limitaciones y pendientes están documentados. Esta entrega muestra tanto el producto como la evidencia que permite evaluarlo. Muchas gracias.»

## Comprobación antes de enviar

- El video dura **más de cinco minutos** y se oyen tu voz y las explicaciones.
- Se leen los **cuatro artefactos SDD**: constitución, spec con Non-Goals, plan y tareas.
- Se explica la **adopción de Spec Kit sobre el código existente** y se muestra su configuración, sin repetir `specify init` ni atribuirle el desarrollo anterior.
- Se ve una **operación real** y su resultado, o se explica con honestidad la dependencia que la impidió.
- Se ven **pruebas, casos de error, estructura de código y ejemplos de variables**, sin secretos.
- Se ven **las ramas de funcionalidad, sus commits y los PR integrados**, no solo capturas de VS Code.
- Se muestran **README, limitaciones y tareas pendientes**; no se atribuyen contribuciones ajenas inexistentes.
