# Herramientas de StudyRoom en Microsoft Store

La distribución gratuita con una firma pública confiable requiere publicar **MSIX en Microsoft Store**. Microsoft firma el paquete después de aprobar su certificación. Subir el instalador EXE a Store no consigue esa firma: EXE/MSI requieren Authenticode del desarrollador. No se compraron certificados ni se crearon certificados autofirmados. [Opciones oficiales de firma](https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options).

La cuenta Microsoft y la identidad de este producto en Partner Center todavía están pendientes. El borrador técnico no es una instalación disponible para clientes y no resuelve por sí mismo Smart App Control. No se debe ofrecer en la página como una descarga utilizable.

## Preparación técnica disponible

Desde la raíz del repositorio, en Windows x64 con .NET Framework 4.8 y Windows SDK 10.0.26100.0 ya instalados:

```powershell
.\scripts\desktop\package-store.ps1 -PreparationOnly
```

La salida está en `apps/desktop/dist/store/NO-PUBLICABLE-.../`, ignorada por Git. El nombre del MSIX, la identidad, el nombre visible, la descripción y el archivo LEEME identifican el borrador como **NO PUBLICABLE**. Esos valores son marcadores técnicos de preparación, no una identidad reservada ni una firma.

El script compila una variante WPF de `StudyRoom.Tools.exe` con `STORE_PACKAGE`, crea iconos originales y valida el manifiesto y paquete con MakeAppx sin omitir comprobaciones. Después extrae el MSIX en una carpeta de verificación y compara cada archivo mediante SHA-256; guarda `SHA256SUMS.txt` y `verification.json`. No ejecuta la herramienta, instala el paquete, registra protocolos, modifica certificados, cambia protecciones o publica nada. Tampoco recompila ni sustituye los EXE públicos existentes.

Esta variante excluye `Setup.cs`, `Installer.cs` e `InstallerPayload.cs`. Windows administra la instalación, actualización, protocolo y desinstalación del paquete. El botón que antes ejecutaba instalación manual se convierte en información sobre la integración de Store.

## Identidad real y envío

1. El titular crea su cuenta Microsoft y su cuenta de desarrollador en [el portal oficial](https://storedeveloper.microsoft.com/), revisa las condiciones y completa la verificación solicitada. La documentación vigente ofrece registro gratuito para desarrolladores individuales; el tipo de cuenta y la elegibilidad los confirma el portal.
2. En Partner Center reserva el nombre del producto y abre **Product management → Product identity**. Copia exactamente `Package/Identity/Name`, `Package/Identity/Publisher` y `Package/Properties/PublisherDisplayName`. No derivarlos del nombre del repositorio o del correo. [Identidad del producto](https://learn.microsoft.com/en-us/windows/apps/publish/view-app-identity-details).
3. Ejecuta el script con esos valores reales. Sin ellos rechaza el modo de envío antes de generar archivos:

```powershell
.\scripts\desktop\package-store.ps1 `
  -PackageName $storePackageName `
  -Publisher $storePublisher `
  -PublisherDisplayName $storePublisherDisplayName `
  -DisplayName $reservedProductName
```

Las variables del ejemplo deben contener los valores reales de Partner Center; no son una identidad de ejemplo. La versión tiene cuatro componentes y acaba en `.0`. La salida **STORE-SUBMISSION-UNSIGNED** es un MSIX para enviar a la tienda, no un paquete firmado para descargar e instalar directamente. MakeAppx permite preparar un MSIX manualmente y Store acepta ese formato. [Herramienta MakeAppx](https://learn.microsoft.com/en-us/windows/msix/package/create-app-package-with-makeappx-tool), [requisitos MSIX](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/app-package-requirements).

4. Antes del envío, realizar pruebas de ejecución del paquete con su identidad real y Windows App Certification Kit en un entorno de desarrollo autorizado. Esa instalación y ejecución no se realizaron en la preparación. Verificar apertura desde Inicio, `studyroom-tools://open`, segunda apertura con instancia única, puente `/v1/health`, compartir/terminar pantalla, inicio de sesión de Windows, desactivar inicio y desinstalar. No desactivar Smart App Control ni añadir certificados raíz para forzar una prueba en el equipo del usuario.
5. Crear la ficha gratuita, política de privacidad, capturas y explicación de `runFullTrust`: la app WPF dibuja sobre las ventanas del escritorio, usa atajos de teclado y una bandeja, y escucha únicamente en loopback para coordinarse con StudyRoom. El audio y cámara siguen perteneciendo al navegador; el compañero no graba esos dispositivos. Enviar el MSIX a certificación y esperar la firma/publicación de Microsoft.
6. Solo tras la aprobación, copiar el enlace real `https://apps.microsoft.com/detail/<Store-ID-asignado>` del producto y configurarlo como destino de instalación en la página. Después comprobar salud real y que el usuario pueda continuar. No inventar el Store ID ni apuntar al MSIX borrador.

## Integración declarativa

El manifiesto usa `Windows.FullTrustApplication` y `runFullTrust` para conservar WPF como proceso de usuario con integridad media. No usa AppContainer ni elevación; mantiene el puente limitado a `127.0.0.1:8790`. La prueba del puente dentro de la instalación Store real sigue pendiente. [Empaquetado manual de una app de escritorio](https://learn.microsoft.com/en-us/windows/msix/desktop/desktop-to-uwp-manual-conversion).

`uap3:Protocol` registra `studyroom-tools` y pasa la URI como un único argumento. El filtro existente solo admite `studyroom-tools://open`. `desktop:StartupTask` inicia el mismo ejecutable con `--background`, sin entradas manuales HKCU Run ni copiar el binario fuera del paquete. La primera apertura registra la tarea; el usuario puede deshabilitarla en Windows y la aplicación respeta esa decisión. No se solicita `ImmediateRegistration` ni capacidades para forzar inicio. [Protocolo e inicio declarativo](https://learn.microsoft.com/en-us/windows/apps/desktop/modernize/desktop-to-uwp-extensions), [comportamiento StartupTask](https://learn.microsoft.com/en-us/uwp/schemas/appxpackage/uapmanifestschema/element-desktop-startuptask).

Los archivos del paquete son de solo lectura. Esta variante no lanza su antiguo instalador ni intenta registrar por HKCU la integración del sistema, evitando registros virtualizados que no integrarían correctamente el protocolo fuera del paquete.
