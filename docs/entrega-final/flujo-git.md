# Ramas y pull requests de esta entrega

El repositorio privado [studyroom-taller-final-ramas](https://github.com/cristhianDavidOrbes/studyroom-taller-final-ramas) comenzó con una **copia del código existente** de StudyRoom. No se presenta ese código anterior como si hubiera sido creado en los PR de esta entrega. Los cambios posteriores se hicieron en ramas con nombres de su función y se integraron a `main` mediante PR. Se conservaron las ramas para poder mostrar el recorrido en el video.

| Rama | PR | Cambio verificable |
|---|---|---|
| `feature/control-edad-salas` | [#1](https://github.com/cristhianDavidOrbes/studyroom-taller-final-ramas/pull/1) | Fecha de nacimiento, edad mínima, filtro de salas y validación en API |
| `feature/contexto-visual-ia` | [#2](https://github.com/cristhianDavidOrbes/studyroom-taller-final-ramas/pull/2) | Descripción visual local de imágenes junto con OCR y pruebas |
| `feature/adjuntos-cronologicos-zip` | [#3](https://github.com/cristhianDavidOrbes/studyroom-taller-final-ramas/pull/3) | Adjuntos disponibles numerados en orden de envío, aun si se eliminó otro original |
| `feature/migraciones-api-despliegue` | [#4](https://github.com/cristhianDavidOrbes/studyroom-taller-final-ramas/pull/4) | Aplicar migraciones antes de iniciar la API |
| `test/integracion-salas-reportes` | [#5](https://github.com/cristhianDavidOrbes/studyroom-taller-final-ramas/pull/5) | Adaptar integración a edad y rutas vigentes; 18 escenarios aprobados |
| `chore/actualizar-dependencias` | [#6](https://github.com/cristhianDavidOrbes/studyroom-taller-final-ramas/pull/6) | Actualizar dependencias y revisar avisos de seguridad |
| `docs/artefactos-sdd-entrega` | [#7](https://github.com/cristhianDavidOrbes/studyroom-taller-final-ramas/pull/7) | Constitución, spec, plan, tareas, trazabilidad y guiones del taller |

## Cómo mostrarlo en el video

1. Abre **Pull requests → Closed** y enseña los PR integrados. Abre #1 para mostrar **Commits** y **Files changed**; después #2 y #3 para señalar funcionalidades diferentes.
2. En **Branches**, enseña `main` y las ramas conservadas. Cada PR muestra la rama de origen y `main` como destino.
3. Explica que el PR permitió revisar antes de integrar y que el merge conservó el historial. No afirmes que alguien aprobó los PR si **Reviews** no lo demuestra.

La cuenta mostró un bloqueo de facturación en GitHub Actions: los trabajos no llegaron a ejecutar pruebas. La evidencia automatizada válida está en [verificacion.md](verificacion.md) y proviene de ejecuciones locales. El repositorio es privado; el evaluador necesita acceso para abrir estos enlaces.
