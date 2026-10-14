import { lazy, Suspense, useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Compass,
  History,
  UserRound,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
  WifiOff,
  Leaf,
} from "lucide-react";
import { AuthPage, ProfilePage, useAuth } from "./auth";
import { Brand, ErrorBox, Spinner, useToast } from "./ui";
import { ExplorePage } from "./explore";
const RoomPage = lazy(() =>
  import("./room").then((module) => ({ default: module.RoomPage })),
);
import { HistoryPage, SessionPage } from "./history";
import { errorText } from "./api";
import { UsageButton } from "./usage";
import { LandingPage } from "./landing";
import { DesktopSetup } from "./desktop-setup";

// Temporarily optional while the Windows signing application is under review.
const desktopInstallationRequired = false;

function Protected() {
  const { user, loading, error, reload, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [readyUser, setReadyUser] = useState<string | null>(null);
  useEffect(() => {
    if (!user) setReadyUser(null);
  }, [user]);
  if (loading)
    return (
      <div className="fullscreen-loading">
        <Brand />
        <Spinner label="Preparando tu espacio…" />
      </div>
    );
  if (!user && location.pathname === "/") return <LandingPage />;
  if (!user)
    return (
      <Navigate
        replace
        to={`/acceso?next=${encodeURIComponent(location.pathname + location.search)}`}
      />
    );
  if (error && !profile)
    return (
      <div className="page narrow">
        <Brand />
        <h1>No pudimos cargar tu perfil</h1>
        <ErrorBox message={error} retry={() => void reload()} />
        <button
          className="button secondary"
          onClick={() =>
            void logout()
              .catch(() => {})
              .finally(() => navigate("/acceso"))
          }
        >
          Volver a iniciar sesión
        </button>
      </div>
    );
  if (desktopInstallationRequired && readyUser !== user.uid)
    return (
      <DesktopSetup
        key={user.uid}
        onReady={() => setReadyUser(user.uid)}
        onLogout={() =>
          void logout().catch(() => {}).finally(() => navigate("/"))
        }
      />
    );
  return <Outlet />;
}
function Shell() {
  const { profile, logout } = useAuth();
  const [menu, setMenu] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();
  useEffect(() => setMenu(false), [location.pathname]);
  useEffect(() => {
    const change = () => setOnline(navigator.onLine);
    window.addEventListener("online", change);
    window.addEventListener("offline", change);
    return () => {
      window.removeEventListener("online", change);
      window.removeEventListener("offline", change);
    };
  }, []);
  async function exit() {
    try {
      await logout();
      navigate("/acceso");
    } catch (e) {
      toast(errorText(e));
      navigate("/acceso");
    }
  }
  const nav = (
    <>
      <NavLink to="/" end>
        <Compass size={20} />
        Explorar salas
      </NavLink>
      <NavLink to="/historial">
        <History size={20} />
        Mis reportes
      </NavLink>
      <NavLink to="/perfil">
        <UserRound size={20} />
        Mi perfil
      </NavLink>
    </>
  );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <aside className={`sidebar ${menu ? "mobile-open" : ""}`}>
        <Link className="brand-link" to="/" aria-label="StudyRoom, inicio">
          <Brand />
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label="Cerrar navegación"
          onClick={() => setMenu(false)}
        >
          <X size={22} />
        </button>
        <span className="nav-label">TU CAMPUS</span>
        <nav aria-label="Principal">{nav}</nav>
        <div className="sidebar-bottom">
          <div className="grow-card">
            <Leaf size={22} />
            <strong>Una idea a la vez</strong>
            <p>Reserva un momento para aprender algo nuevo hoy.</p>
            <Link to="/">
              Encuentra tu sala
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <button className="user-menu" onClick={() => navigate("/perfil")}>
            <span className="avatar">
              {profile?.displayName?.slice(0, 2).toUpperCase() || "TÚ"}
            </span>
            <span>
              <strong>{profile?.displayName || "Mi perfil"}</strong>
              <small>Mi espacio personal</small>
            </span>
          </button>
          <button className="logout" onClick={() => void exit()}>
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <button
            className="mobile-toggle icon-button"
            aria-label="Abrir navegación"
            onClick={() => setMenu(true)}
          >
            <Menu size={23} />
          </button>
          <span className="topbar-label">Tu espacio para aprender juntos</span>
          <UsageButton />
          <Link
            to="/perfil"
            className="topbar-avatar avatar"
            aria-label="Mi perfil"
          >
            {profile?.displayName?.slice(0, 1) || "T"}
          </Link>
        </header>
        {!online && (
          <div className="offline-banner" role="status">
            <WifiOff size={17} />
            Estás sin conexión. Tus cambios se enviarán cuando vuelvas a
            intentarlo.
          </div>
        )}
        <main id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="app-footer">
          StudyRoom · Aprender también es compartir
        </footer>
      </div>
    </div>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/acceso" element={<AuthPage />} />
      <Route element={<Protected />}>
        <Route element={<Shell />}>
          <Route index element={<ExplorePage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="historial" element={<HistoryPage />} />
          <Route path="sesiones/:id" element={<SessionPage />} />
        </Route>
        <Route
          path="salas/:id"
          element={
            <Suspense fallback={<Spinner label="Preparando tu sala…" />}>
              <RoomPage />
            </Suspense>
          }
        />
      </Route>
      <Route
        path="*"
        element={
          <div className="page narrow">
            <Brand />
            <h1>Esta página no está aquí</h1>
            <p>Vuelve a explorar para encontrar tu espacio de estudio.</p>
            <Link className="button primary" to="/">
              Ir al inicio
            </Link>
          </div>
        }
      />
    </Routes>
  );
}
