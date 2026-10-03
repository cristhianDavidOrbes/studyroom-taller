# Firma del instalador directo de StudyRoom

Se conserva el instalador EXE para Windows y la misma herramienta de escritorio. El titular descartó Microsoft Store y la entrega de documentos de identidad. No se cambia el funcionamiento del menú, su activación al compartir pantalla, la detección local ni el botón Continuar.

El instalador y la herramienta de esta versión pasan el análisis local de Microsoft Defender sin amenazas. Ambos siguen **sin firma de publicador**. El bloqueo de Smart App Control mostrado por el usuario se refiere al publicador no verificable; un resultado limpio de antivirus no concede esa confianza. Ni recompilar ni cambiar a ZIP/MSI garantiza que Windows permita instalarlo. [Opciones de firma de Microsoft](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options).

## Alternativa gratuita sin documentos personales

[SignPath Foundation](https://signpath.org/) ofrece firma gratuita para proyectos de código abierto y declara que no necesita identificación personal del titular. Verifica la relación entre el repositorio abierto y el binario, y utiliza su propia identidad de publicador. Su aceptación depende de sus [condiciones](https://signpath.org/terms.html), incluida reputación verificable. No garantiza aprobar cualquier proyecto ni una fecha.

El titular autorizó expresamente publicar únicamente la herramienta Windows con licencia MIT. Se creó [studyroom-windows-tools](https://github.com/cristhianDavidOrbes/studyroom-windows-tools), con 21 fuentes/scripts de la herramienta sin cambios, licencia, documentación de privacidad/seguridad/firma y CI trazable. La [release de fuentes 1.1.0](https://github.com/cristhianDavidOrbes/studyroom-windows-tools/releases/tag/v1.1.0) identifica que la firma está pendiente. La web, API, IA, datos y credenciales siguen en el repositorio privado de StudyRoom; MIT solo se concede a la copia de este componente publicado.

El titular envió la solicitud en el formulario oficial de SignPath, que mostró «Form submitted». Se utilizaron únicamente enlaces públicos del nuevo componente y los datos de contacto que indicó el titular; no se enviaron documentos de identidad ni secretos de StudyRoom. **Enviada no significa aprobada**: no tenemos acceso de firma ni certificado. La CI pública compiló y pasó las pruebas en Windows: [ejecución verificada](https://github.com/cristhianDavidOrbes/studyroom-windows-tools/actions/runs/37095154823).

Queda pendiente:

1. Aprobación de elegibilidad y reputación por SignPath, y verificar MFA del responsable en GitHub y SignPath. Las políticas publicadas no acreditan por sí solas MFA ni aceptación de todas las condiciones del proveedor.
2. Acceso/configuración reales de firma tras la aprobación. No se anuncia firma proporcionada ni se simulan credenciales mientras la aceptación esté pendiente.
3. Integración de la firma: firmar primero la herramienta, generar los hashes y recursos a partir de esa herramienta firmada, compilar el instalador y firmarlo después. Incluir la licencia y verificar firmas/contenido incorporado antes de reemplazar las descargas públicas. Cada release necesita aprobación manual de firma.
4. Probar descarga e instalación de la distribución firmada en otro Windows con sus protecciones activas. Una firma reconocida resuelve la falta de firma, pero no garantiza cero avisos de SmartScreen en todos los equipos ni inmunidad a detecciones futuras.

Mientras esos pasos estén pendientes, la descarga publicada conserva su estado **NotSigned**. No se crean certificados autofirmados, no se instalan raíces de confianza y no se añaden exclusiones ni se alteran protecciones de Windows.
