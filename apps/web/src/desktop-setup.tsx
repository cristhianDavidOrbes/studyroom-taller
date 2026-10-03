import { useEffect, useState } from "react";
import { ArrowRight, Check, CheckCircle2, Download, ExternalLink, LogOut, Monitor, Pencil, ShieldCheck } from "lucide-react";
import { Brand, Spinner } from "./ui";
import { desktopInstallerURL, isWindowsUserAgent, monitorDesktopHelper, type DesktopSetupStatus } from "./desktop-setup-probe";

export function DesktopSetup({ onReady, onLogout }: { onReady: () => void; onLogout: () => void }) {
  const windows = isWindowsUserAgent(navigator.userAgent);
  const [status, setStatus] = useState<DesktopSetupStatus>("connecting");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!windows) return;
    const monitor = monitorDesktopHelper(setStatus);
    return monitor.stop;
  }, [windows, attempt]);
  function checkAgain() {
    setStatus("connecting");
    setAttempt((value) => value + 1);
  }
  const installed = windows && status === "ready";
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
        <section className={`desktop-setup-card ${installed ? "setup-installed" : ""}`} aria-label="Preparar herramienta de escritorio">
          <span className="setup-device-icon" aria-hidden="true">{installed ? <CheckCircle2 size={31} /> : <Monitor size={30} />}</span>
          <h2>{installed ? "La aplicación ya está instalada" : windows ? "Solo necesitas instalarla una vez" : "Necesitas un equipo con Windows"}</h2>
          {windows ? <>
            {installed ? <>
              <p className="setup-installed-description">Detectamos la herramienta abierta y conectada en este equipo. Ya puedes continuar a StudyRoom.</p>
              <div className="setup-ready-notice" role="status"><CheckCircle2 size={20} /> Herramienta lista para usar</div>
              <button className="button primary full setup-continue" onClick={onReady}>Continuar <ArrowRight size={18} /></button>
              <p className="setup-stay-note">Esta página permanecerá aquí hasta que pulses Continuar.</p>
            </> : <>
            <ol className="setup-steps">
              <li><span>1</span><div><strong>Descarga el instalador</strong><p>Guárdalo donde prefieras, por ejemplo en Descargas.</p></div></li>
              <li><span>2</span><div><strong>Abre el archivo descargado</strong><p>Abre <b>Instalar-StudyRoom.exe</b> y espera el mensaje de instalación completada. No necesitas extraer un ZIP.</p></div></li>
              <li><span>3</span><div><strong>Vuelve a esta página</strong><p>Si el navegador pide permiso para conectarse con la herramienta en tu equipo, permite esa conexión. Si ya la instalaste antes, usa <b>Abrir herramientas instaladas</b>.</p></div></li>
              <li><span>4</span><div><strong>Pulsa Continuar</strong><p>Cuando aparezca <b>La aplicación ya está instalada</b>, pulsa <b>Continuar</b> para entrar. No te llevaremos a otra página automáticamente.</p></div></li>
            </ol>
            <a className="button primary full" href={desktopInstallerURL} download><Download size={18} /> Descargar para Windows</a>
            <div className={`setup-probe-status ${status}`} role="status" aria-live="polite">
              {status === "connecting" ? <Spinner label="Comprobando la herramienta en tu equipo…" /> : <p>Todavía no detectamos la herramienta. Abre el instalador o la aplicación instalada y pulsa Comprobar otra vez.</p>}
            </div>
            <details className="setup-security-help">
              <summary>Windows bloqueó el instalador</summary>
              <p>Si aparece <b>Smart App Control</b> o un aviso de publicador no verificable, Windows ha bloqueado la ejecución. Descargar el archivo no significa que la aplicación se haya instalado.</p>
              <p>Para esos equipos se necesita una distribución con una firma reconocida por Windows. Contacta al administrador de StudyRoom para obtener una versión compatible. Mantén la protección del equipo activada.</p>
              <a href="https://support.microsoft.com/en-us/windows/security/threat-malware-protection/smart-app-control-frequently-asked-questions" target="_blank" rel="noopener noreferrer">Ver la explicación de Microsoft <ExternalLink size={13} /></a>
            </details>
            </>}
            <a className="button secondary full setup-open-link" href="studyroom-tools://open"><ExternalLink size={17} /> Abrir herramientas instaladas</a>
            <button className="text-button setup-retry" onClick={checkAgain}>Comprobar otra vez</button>
            <p className="setup-footnote">Guardar el archivo no lo instala. La página comprueba que la herramienta esté abierta; no puede revisar tu carpeta Descargas.</p>
          </> : <p className="setup-unsupported">Las herramientas de escritorio están disponibles para Windows por ahora. Abre StudyRoom en tu equipo con Windows para completar este paso y entrar a tus salas y reportes.</p>}
        </section>
      </main>
    </div>
  );
}
