import { useEffect, useRef, useState } from "react";
import { Check, Download, ExternalLink, LogOut, Monitor, Pencil, ShieldCheck } from "lucide-react";
import { Brand, Spinner } from "./ui";
import { desktopInstallerURL, isWindowsUserAgent, monitorDesktopHelper, type DesktopSetupStatus } from "./desktop-setup-probe";

export function DesktopSetup({ onReady, onLogout }: { onReady: () => void; onLogout: () => void }) {
  const windows = isWindowsUserAgent(navigator.userAgent);
  const [status, setStatus] = useState<DesktopSetupStatus>("connecting");
  const retry = useRef<(() => void) | undefined>();
  const ready = useRef(onReady);
  ready.current = onReady;
  useEffect(() => {
    if (!windows) return;
    const monitor = monitorDesktopHelper((next) => {
      setStatus(next);
      if (next === "ready") ready.current();
    });
    retry.current = monitor.retry;
    return () => {
      retry.current = undefined;
      monitor.stop();
    };
  }, [windows]);
  return (
    <div className="desktop-setup-page">
      <header className="public-header desktop-setup-header">
        <Brand />
        <button className="button secondary" onClick={onLogout}><LogOut size={17} /> Cerrar sesión</button>
      </header>
      <main className="desktop-setup-layout">
        <section className="desktop-setup-story">
          <span className="eyebrow">UN MOMENTO ANTES DE ENTRAR</span>
          <h1>Prepara tus herramientas</h1>
          <p className="desktop-setup-intro">Tus ideas también pueden dibujarse. Conecta el pequeño menú de StudyRoom para señalar sobre tu escritorio mientras compartes pantalla.</p>
          <div className="setup-pencil-preview" aria-hidden="true">
            <span className="setup-pencil-mark"><Pencil size={25} /></span>
            <div><strong>Una herramienta siempre a mano</strong><p>Lápiz, figuras, texto, color y borrador.</p></div>
          </div>
          <ul className="setup-benefits">
            <li><Check size={18} /> Aparece al compartir pantalla y se oculta al terminar.</li>
            <li><Check size={18} /> Ves tus trazos y los demás también al compartir la pantalla completa.</li>
            <li><ShieldCheck size={18} /> Se instala para tu usuario de Windows, sin pagar.</li>
          </ul>
        </section>
        <section className="desktop-setup-card" aria-label="Preparar herramienta de escritorio">
          <span className="setup-device-icon"><Monitor size={30} /></span>
          <h2>{windows ? "Solo necesitas instalarla una vez" : "Necesitas un equipo con Windows"}</h2>
          {windows ? <>
            <ol className="setup-steps">
              <li><span>1</span><div><strong>Descarga el instalador</strong><p>Guárdalo donde prefieras, por ejemplo en Descargas.</p></div></li>
              <li><span>2</span><div><strong>Abre el archivo descargado</strong><p>Abre <b>Instalar-StudyRoom.exe</b> una vez. El instalador deja la herramienta lista; no tienes que extraer un ZIP.</p></div></li>
              <li><span>3</span><div><strong>Vuelve a esta página</strong><p>Entrarás automáticamente cuando detectemos la herramienta. Permite la conexión con tu equipo si el navegador la solicita.</p></div></li>
            </ol>
            <a className="button primary full" href={desktopInstallerURL} download><Download size={18} /> Descargar para Windows</a>
            <a className="button secondary full setup-open-link" href="studyroom-tools://open"><ExternalLink size={17} /> Abrir herramientas instaladas</a>
            <div className={`setup-probe-status ${status}`} role="status" aria-live="polite">
              {status === "connecting" ? <Spinner label="Buscando la herramienta en tu equipo…" /> : status === "ready" ? <p><Check size={18} /> Herramienta lista. Entrando…</p> : <p>Todavía no detectamos la herramienta. Abre el instalador y permite la conexión si tu navegador la solicita.</p>}
            </div>
            <button className="text-button setup-retry" onClick={() => retry.current?.()}>Comprobar otra vez</button>
            <p className="setup-footnote">Guardar el archivo no lo instala. La página comprueba que la herramienta esté abierta; no puede revisar tu carpeta Descargas.</p>
          </> : <p className="setup-unsupported">Las herramientas de escritorio están disponibles para Windows por ahora. Abre StudyRoom en tu equipo con Windows para completar este paso y entrar a tus salas y reportes.</p>}
        </section>
      </main>
    </div>
  );
}
