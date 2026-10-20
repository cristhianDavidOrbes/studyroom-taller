import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, FileText, Files, MessageCircle, Mic, MonitorUp, Users, Video } from "lucide-react";
import { Brand } from "./ui";

const features = [
  { icon: Video, title: "Conversa y aprende", text: "Reúnete con tu grupo, enciende la cámara cuando quieras y comparte lo que sabes." },
  { icon: MonitorUp, title: "Comparte tu pantalla", text: "Muestra tu trabajo al grupo mientras conversan y resuelven dudas juntos." },
  { icon: FileText, title: "Vuelve a lo que hablaron", text: "Consulta el reporte con la transcripción de la conversación, el chat, las imágenes y los archivos de la sesión." },
  { icon: MessageCircle, title: "Pregunta sobre tu reporte", text: "Pídele al asistente que te explique una idea y vuelve al fragmento o archivo que sustenta su respuesta." },
];

function SessionPreview() {
  return (
    <div className="landing-preview-wrap" aria-hidden="true">
      <div className="landing-preview">
        <div className="preview-topline"><span className="preview-dots"><i /><i /><i /></span><span>Un espacio para tus ideas</span><span className="preview-live">En sesión</span></div>
        <div className="preview-session-title"><span className="preview-topic">MATEMÁTICAS · EN COMPAÑÍA</span><strong>Entenderlo, juntos.</strong></div>
        <div className="preview-workspace">
          <div className="preview-paper"><span className="preview-paper-label">Una idea, paso a paso</span><div className="preview-formula">A = base × altura</div><svg className="preview-shape" viewBox="0 0 310 125"><rect x="44" y="15" width="218" height="80" rx="6" fill="#edf3dc" stroke="#92a966" strokeWidth="2.5" /><path d="M48 113 Q153 94 258 112" fill="none" stroke="#d5a64b" strokeWidth="3.5" strokeLinecap="round" /><text x="134" y="116" fill="#647757" fontSize="12">base</text><text x="272" y="61" fill="#647757" fontSize="12">altura</text></svg><div className="preview-students"><span className="preview-student one">A<span>Alicia</span></span><span className="preview-student two">M<span>Mateo</span></span><span className="preview-student three">TÚ<span>Tú</span></span></div></div>
        </div>
        <div className="preview-controls"><Mic size={16} /><Video size={17} /><MonitorUp size={17} /><span>Comparte tu forma de verlo</span></div>
      </div>
      <div className="preview-report-note"><span><FileText size={20} /></span><div><strong>La sesión continúa en tu reporte</strong><small>Voces, ideas y archivos en un solo lugar</small></div><Check size={19} /></div>
      <span className="preview-handwritten">Una buena pregunta<br />puede cambiarlo todo.</span>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="landing-page">
      <a className="skip-link" href="#landing-main">Saltar al contenido</a>
      <header className="public-header">
        <Link to="/" aria-label="StudyRoom, inicio"><Brand /></Link>
        <nav aria-label="Navegación de la portada" className="landing-navigation"><a href="#como-funciona" className="landing-nav-section">Cómo funciona</a><Link to="/acceso" className="button secondary">Iniciar sesión</Link><Link to="/acceso?mode=register" className="button primary landing-nav-register">Crear mi cuenta <ArrowUpRight size={16} /></Link></nav>
      </header>
      <main id="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-copy"><span className="landing-kicker"><span /> TU ESPACIO DE ESTUDIO COMPARTIDO</span><h1>Aprende en compañía.<br /><em>Conserva cada idea.</em></h1><p>El lugar donde tu grupo se reúne, comparte pantalla y entiende mejor. Al terminar, vuelve a la conversación con tu reporte y pregúntale al asistente lo que necesites.</p><div className="landing-hero-actions"><Link to="/acceso?mode=register" className="button primary">Crear mi cuenta <ArrowRight size={18} /></Link><a className="landing-how-link" href="#como-funciona">Conoce StudyRoom <ArrowUpRight size={16} /></a></div></div>
          <SessionPreview />
        </section>
        <section id="como-funciona" className="landing-features" aria-labelledby="features-title"><div className="landing-section-heading"><span className="eyebrow">DE LA CONVERSACIÓN A LA COMPRENSIÓN</span><h2 id="features-title">Todo lo que tu grupo necesita<br />para seguir aprendiendo.</h2><p>Trae tus preguntas. StudyRoom guarda el hilo de la sesión para que puedas retomarlo después.</p></div><div className="landing-feature-grid">{features.map(({ icon: Icon, title, text }, i) => <article className="landing-feature" key={title}><span className={`landing-feature-icon tone-${i}`}><Icon size={24} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
        <section className="landing-report-section"><div className="landing-report-illustration" aria-hidden="true"><div className="report-paper"><span className="report-paper-overline">REPORTE DE LA SESIÓN</span><strong>Lo que aprendimos hoy</strong><div className="report-paper-row"><Mic size={16} /><span>La conversación, con sus palabras.</span></div><div className="report-paper-row"><Files size={16} /><span>Los archivos que compartimos.</span></div><div className="report-paper-lines"><i /><i /><i /></div><div className="report-paper-question"><MessageCircle size={17} /><span>¿Me explicas esta parte?</span><ArrowUpRight size={17} /></div></div></div><div className="landing-report-copy"><span className="eyebrow">TU APRENDIZAJE TIENE CONTINUIDAD</span><h2>La reunión termina.<br />Las ideas se quedan.</h2><p>Vuelve a tus sesiones desde <strong>Mis reportes</strong>. Revisa lo que se dijo, abre las imágenes y archivos compartidos y haz preguntas sobre el reporte.</p><ul><li><Check size={18} /> Transcripción automática con el micrófono encendido.</li><li><Check size={18} /> El reporte queda disponible para quienes participaron.</li><li><Check size={18} /> Las respuestas te llevan a sus fuentes en la sesión.</li></ul><p className="landing-ai-note">El asistente estará disponible mientras el equipo que lo proporciona esté conectado.</p></div></section>
        <section className="landing-final-cta"><span className="landing-cta-icon"><Users size={26} /></span><div><h2>Tu próxima idea empieza con una conversación.</h2><p>Encuentra tu grupo y dale un lugar a lo que estás aprendiendo.</p></div><Link to="/acceso?mode=register" className="button primary">Empezar con StudyRoom <ArrowRight size={18} /></Link></section>
      </main>
      <footer className="landing-footer"><Brand /><span>Aprender también es compartir.</span><Link to="/acceso">Entrar a mi espacio <ArrowUpRight size={15} /></Link></footer>
    </div>
  );
}
