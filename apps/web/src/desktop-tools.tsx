import { useState } from "react";
import { Download, ExternalLink, Pencil, Monitor } from "lucide-react";
import { Modal } from "./ui";
import type { DesktopBridgeStatus } from "./desktop-bridge";
import { desktopInstallerURL } from "./desktop-setup-probe";

export function DesktopTools({
  sharing,
  displaySurface,
  status = "idle",
}: {
  sharing: boolean;
  displaySurface?: string;
  status?: DesktopBridgeStatus | "idle";
}) {
  const [help, setHelp] = useState(false);
  const fullScreen = displaySurface === "monitor";
  const partialScreen =
    displaySurface === "browser" || displaySurface === "window";
  return (
    <>
      <div className="desktop-tools-banner">
        <div>
          <strong>
            <Monitor size={17} /> En el escritorio
          </strong>
          <p>
            El menú aparece al compartir tu pantalla y se oculta al terminar.
          </p>
        </div>
        <a className="button primary" href="studyroom-tools://open">
          <Pencil size={16} />
          Dibujar en el escritorio
        </a>
        <button className="text-button" onClick={() => setHelp(true)}>
          Primera vez / instalar
        </button>
        {sharing && (
          <p className="desktop-connection-state" role="status">
            {status === "ready"
              ? "Menú de escritorio conectado. Si lo cierras por accidente, volverá a aparecer mientras compartes."
              : status === "unavailable"
                ? "Conecta las herramientas instaladas con el botón de arriba. Si es tu primera vez, descárgalas. Tu pantalla sigue compartiéndose."
                : "Buscando tus herramientas de escritorio…"}
          </p>
        )}
        {!sharing && (
          <p className="desktop-share-notice">
            Cada participante puede abrir sus herramientas en Windows. Para que
            los demás vean tus dibujos, comparte{" "}
            <strong>Pantalla completa</strong> cuando estés listo.
          </p>
        )}
        {sharing && partialScreen && (
          <p className="desktop-share-notice" role="status">
            Estás compartiendo una pestaña o ventana. Deja de compartir y
            selecciona <strong>Pantalla completa</strong> en el selector del
            navegador. Una pestaña o ventana puede dejar fuera el menú y sus
            trazos.
          </p>
        )}
        {sharing && !fullScreen && !partialScreen && (
          <p className="desktop-share-notice">
            Comprueba que seleccionaste <strong>Pantalla completa</strong> para
            que los demás vean también los dibujos sobre el escritorio. Este
            navegador no indica qué tipo de contenido estás compartiendo.
          </p>
        )}
        {sharing && fullScreen && (
          <p className="desktop-share-notice">
            Compartes la pantalla completa. Los dibujos del menú de Windows se
            verán sobre las aplicaciones de esa pantalla.
          </p>
        )}
      </div>
      {help && (
        <Modal
          title="Herramientas de escritorio para Windows"
          onClose={() => setHelp(false)}
        >
          <p>
            El menú pequeño permanece sobre las otras aplicaciones. Puedes
            expandirlo para elegir lápiz, borrador, formas, texto, tamaños y
            colores.
          </p>
          <ol className="desktop-install-steps">
            <li>Descarga el instalador para Windows.</li>
            <li>
              Abre <strong>Instalar-StudyRoom.exe</strong> una vez. Instala y
              prepara la herramienta automáticamente, sin extraer un ZIP.
            </li>
            <li>
              Comparte <strong>Pantalla completa</strong> y selecciona la
              pantalla donde vas a dibujar.
            </li>
          </ol>
          <a
            className="button primary"
            href={desktopInstallerURL}
            download
          >
            <Download size={17} />
            Descargar herramientas para Windows
          </a>
          <a className="button secondary" href="studyroom-tools://open">
            <ExternalLink size={17} />
            Abrir herramientas instaladas
          </a>
          <p className="desktop-tools-note">
            Se instalan solo para tu usuario. El navegador puede pedirte permiso
            para abrir la aplicación y conectarse a ella en tu equipo. Las
            herramientas de escritorio dibujan localmente; la pantalla
            compartida transmite el resultado. El menú de la cámara sirve para
            señalar sobre la vista de StudyRoom.
          </p>
        </Modal>
      )}
    </>
  );
}
