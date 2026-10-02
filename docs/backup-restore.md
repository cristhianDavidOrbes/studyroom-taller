# Respaldo lógico y restauración comprobada

El 2 de octubre de 2026 se tomó una instantánea consistente de las 13 tablas públicas de StudyRoom en Supabase y se restauró en la base local nueva `studyroom_restore_test`. Se conservaron las cinco filas presentes (usuario, sala, membresía, sesión y consumo); las demás tablas estaban vacías. Los conteos y hashes SHA-256 coincidieron en las 13 tablas. Las ocho claves externas permanecieron habilitadas y validadas, y RLS quedó activo. [Resultado sin datos personales](verification/logical-restore.json).

El origen se leyó con una transacción `REPEATABLE READ READ ONLY`, TLS verificado y el rol de ejecución sin privilegios de superusuario ni bypass de RLS. No se alteraron políticas, datos ni esquema en la nube. La restauración creó una base aislada en `127.0.0.1:54322`; no modificó la base local principal. Si el nombre ya existe, el script crea otro con sufijo aleatorio.

La copia usa JSON lógico y la migración SQL versionada. Los binarios PostgreSQL embebidos disponibles no incluyen `pg_dump` ni `pg_restore`, por lo que este formato se declara expresamente. La prueba valida el contenido que existía durante esa instantánea; no demuestra recuperación de grandes volúmenes, una base completa del proveedor, cuentas Firebase ni el contenido binario de Supabase Storage.

## Repetir en este PC

```powershell
node scripts/verify-logical-restore.cjs
```

Requiere la base local activa y los archivos privados `.local/cloud-env.json` y `.local/postgres.json` ya configurados. El script usa el paquete PostgreSQL `pg`: lo busca en el proyecto o en el entorno local preparado `../work/pg-tools`. En otro equipo, `STUDYROOM_PG_PACKAGE` puede indicar el `package.json` de un entorno que tenga instalado `pg`. La migración y el certificado CA se leen del repositorio.

Cada ejecución crea una carpeta nueva en `.local/backups` con `snapshot.json` y `schema.sql`; en Windows aplica una ACL que permite únicamente al usuario actual acceder. Estos archivos contienen datos privados y están excluidos de Git. El resultado público registra cantidades, hashes y condiciones, nunca las filas ni credenciales. No borrar una copia anterior para repetir la prueba.

Para una recuperación operacional completa falta conservar y ensayar por separado los objetos de Storage y las identidades Firebase, definir retención y cifrado de una copia externa, y probar una restauración con datos representativos. Cualquier restauración sobre una base utilizada por usuarios requiere un procedimiento específico; este script solo permite crear su base local de ensayo.
