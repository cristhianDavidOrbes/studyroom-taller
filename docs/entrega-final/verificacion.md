# Registro de verificación de la copia académica

**Fecha:** 2026-11-15, hora de Bogotá. **Repositorio:** `studyroom-taller-final-ramas`; cambios integrados a `main` mediante ramas y PR separados.

| Comprobación | Resultado | Evidencia observada |
|---|---|---|
| `npm ci --no-audit --no-fund` | Aprobó | 793 paquetes instalados desde el lockfile actualizado |
| `npm run build` | Aprobó | Gateway TypeScript, API/Prisma y web/Vite compilados; Vite advirtió un chunk >500 kB |
| `npm run typecheck` | Aprobó | Tres workspaces sin errores de tipos; Prisma avisó que su configuración en `package.json` será obsoleta en una versión mayor futura |
| `npm test` | Aprobó | Gateway 26/26, API 118/118 y web 54/54; total 198 pruebas |
| `npm audit --audit-level=high` tras actualizar dependencias | Aprobó | 0 avisos altos o críticos; permanecen 16 moderados y 4 bajos en el árbol completo |
| Exclusión de secretos del nuevo repositorio | Aprobó | `.env` y `.local` ignorados; el PR de documentación no incluye credenciales. Esto no es auditoría exhaustiva del historial heredado |
| Integración con PostgreSQL y Firebase aislados | Aprobó | Docker Desktop iniciado; PostgreSQL en `127.0.0.1:54322`, cuatro migraciones aplicadas y emulador Firebase Auth en `127.0.0.1:9099`; `node --test tests/api.integration.mjs`: 18/18 escenarios. No se usó la base de producción |
| Dos usuarios, cámara y micrófono reales | Pendiente | Se requiere prueba manual con cuentas y dispositivos distintos |
| Cronología, Word/ZIP y pregunta real a IA | Pendiente de demo de extremo a extremo | Las pruebas de código pasaron; no se registró en esta copia una reunión nueva completa |
| GitHub Actions del pull request | No inició | Los dos trabajos terminaron sin pasos: GitHub indicó «recent account payments have failed or your spending limit needs to be increased». No se activó facturación; las pruebas locales anteriores son la evidencia disponible |

## Cómo repetir

Desde la raíz de esta copia, con Node.js 22–24:

```powershell
npm ci
npm run build
npm run typecheck
npm test
```

Para integración, iniciar PostgreSQL aislado y el emulador Firebase según `README.md` y ejecutar `node --test tests/api.integration.mjs`. La prueba actualiza perfiles con fecha de nacimiento de prueba y usa anfitriones distintos para respetar el límite de creación de salas. No conectar las pruebas a Supabase de producción. Para la demo, seguir [el guion](guion-presentacion.md) y registrar capturas, hora, participantes y resultados reales.

## Límites de la evidencia

Las pruebas unitarias usan dobles de algunos servicios. La integración sí ejercita Firebase Auth emulado y PostgreSQL local, pero no prueba que Firebase, Supabase, LiveKit, ngrok o Render estén disponibles el día de la presentación. El informe de voz conserva lo reconocido, no garantiza exactitud palabra por palabra. Las limitaciones deben decirse de manera explícita durante la exposición.

Se actualizaron en esta copia `@nestjs/platform-express`, `zod`, `vite`, `vitest` y dependencias transitivas mediante npm para eliminar los avisos altos detectados. Se repitieron compilación y las 198 pruebas después del cambio; los tipos ya habían aprobado con este mismo stack. Los 20 avisos moderados/bajos restantes deben revisarse antes de un despliegue productivo; no se ejecutó `npm audit fix --force` porque proponía cambios incompatibles en herramientas de prueba.

Las funcionalidades, pruebas y documentos se relacionan con [siete ramas y PR separados](flujo-git.md). La falla de GitHub Actions corresponde a la cuenta y ocurrió antes de que se asignaran runners; no es un fallo observado del código. El repositorio sigue privado y no se modificó ningún ajuste de pagos.
