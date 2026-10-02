import {
  createContext,
  useContext,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  verifyPasswordResetCode,
  confirmPasswordReset,
  type User,
} from "firebase/auth";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Sprout,
  Users,
  Sparkles,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { auth, configurationError } from "./firebase";
import { api, authError, errorText, json } from "./api";
import type { Profile } from "./types";
import { Brand, ErrorBox, Spinner, useToast } from "./ui";
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [profile, setProfile] = useState<Profile | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const client = useQueryClient();
  async function reload() {
    if (!auth.currentUser) return;
    setError("");
    try {
      setProfile(await api<Profile>("/me"));
    } catch (e) {
      setError(errorText(e));
    }
  }
  useEffect(() => {
    let previousUid: string | null = null;
    let request = 0;
    return onIdTokenChanged(auth, (u) => {
      setUser(u);
      if (u?.uid && u.uid === previousUid) return;
      previousUid = u?.uid || null;
      const current = ++request;
      setError("");
      if (!u) {
        setProfile(null);
        client.clear();
        setLoading(false);
        return;
      }
      setLoading(true);
      api<Profile>("/me")
        .then((p) => {
          if (current === request) setProfile(p);
        })
        .catch((e) => {
          if (current === request) setError(errorText(e));
        })
        .finally(() => {
          if (current === request) setLoading(false);
        });
    });
  }, [client]);
  async function logout() {
    let revocationError: unknown;
    try {
      await api("/auth/logout", json("POST"));
    } catch (e) {
      revocationError = e;
    } finally {
      await signOut(auth);
      setProfile(null);
      client.clear();
    }
    if (revocationError)
      throw new Error(
        "La sesión se cerró en este navegador. No se pudo confirmar el cierre en otros dispositivos.",
      );
  }
  return (
    <AuthContext.Provider
      value={{ user, profile, loading, error, reload, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function AuthPage() {
  const { reload } = useAuth();
  const [params] = useSearchParams();
  const resetCode = params.get("oobCode");
  const [mode, setMode] = useState<"login" | "register" | "recover" | "reset">(
    resetCode ? "reset" : "login",
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (resetCode)
      verifyPasswordResetCode(auth, resetCode).catch((e) =>
        setError(authError(e)),
      );
  }, [resetCode]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (configurationError) return;
    setBusy(true);
    setError("");
    setMessage("");
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "").trim(),
      password = String(data.get("password") || "");
    try {
      if (mode === "recover") {
        try {
          await sendPasswordResetEmail(auth, email);
        } catch (e) {
          if ((e as { code?: string }).code !== "auth/user-not-found") throw e;
        }
        setMessage(
          "Si existe una cuenta con ese correo, recibirás un enlace para cambiar la contraseña. Revisa también el correo no deseado.",
        );
      } else if (mode === "reset") {
        await confirmPasswordReset(auth, resetCode!, password);
        setMessage("Contraseña actualizada. Ya puedes iniciar sesión.");
        setMode("login");
      } else if (mode === "register") {
        const { user } = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(user, { displayName: String(data.get("name")) });
        await api(
          "/me",
          json("PATCH", { displayName: String(data.get("name")) }),
        );
        await reload();
        navigate("/perfil");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate(
          params.get("next")?.startsWith("/") &&
            !params.get("next")?.startsWith("//")
            ? params.get("next")!
            : "/",
        );
      }
    } catch (e) {
      setError(authError(e));
    } finally {
      setBusy(false);
    }
  }
  const title = {
    login: "Qué bueno verte de nuevo",
    register: "Tu próxima idea empieza aquí",
    recover: "Recupera tu acceso",
    reset: "Elige una nueva contraseña",
  }[mode];
  return (
    <div className="auth-page">
      <section className="auth-story">
        <Brand />
        <div className="auth-story-main">
          <span className="eyebrow light">APRENDER ES MEJOR EN COMPAÑÍA</span>
          <h1>
            Un lugar para
            <br />
            conectar.
            <br />
            <em>Y entender.</em>
          </h1>
          <p>
            Encuentra tu grupo, comparte ideas y construye conocimiento, una
            sesión a la vez.
          </p>
          <div className="auth-illustration" aria-hidden="true">
            <div className="orbit orbit-one">
              <Sprout size={36} />
            </div>
            <div className="orbit orbit-two">
              <Sparkles size={28} />
            </div>
            <div className="study-card">
              <div className="avatar-stack">
                <span>JM</span>
                <span>AL</span>
                <span>TÚ</span>
              </div>
              <strong>Las buenas ideas se comparten</strong>
              <span>Tu espacio de estudio colaborativo</span>
              <div className="illustration-lines">
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
        </div>
        <p className="auth-footer">
          <Users size={17} /> Crece con tu comunidad de estudio
        </p>
      </section>
      <main className="auth-content">
        <div className="auth-form-wrap">
          <span className="eyebrow">BIENVENIDO A STUDYROOM</span>
          <h2>{title}</h2>
          <p className="muted">
            {mode === "login"
              ? "Entra y retoma lo que estás aprendiendo."
              : mode === "register"
                ? "Crea una cuenta para encontrar tu siguiente sala."
                : "Te ayudamos a volver a tus sesiones."}
          </p>
          <ErrorBox message={configurationError || error} />
          {message && (
            <div className="notice success" role="status">
              <Check size={18} />
              {message}
            </div>
          )}
          <form onSubmit={submit} className="form-stack">
            {mode === "register" && (
              <label>
                Tu nombre
                <input
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={60}
                  placeholder="Cómo te llamas"
                />
              </label>
            )}
            {mode !== "reset" && (
              <label>
                Correo electrónico
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  placeholder="tu@correo.com"
                />
              </label>
            )}
            {mode !== "recover" && (
              <label>
                Contraseña
                <div className="password-field">
                  <input
                    name="password"
                    type={visible ? "text" : "password"}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    required
                    minLength={mode === "login" ? 1 : 8}
                    maxLength={128}
                    placeholder={
                      mode === "login"
                        ? "Tu contraseña"
                        : "Al menos 8 caracteres"
                    }
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={
                      visible ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    onClick={() => setVisible(!visible)}
                  >
                    {visible ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </label>
            )}
            {mode === "login" && (
              <button
                type="button"
                className="text-button align-end"
                onClick={() => {
                  setMode("recover");
                  setError("");
                }}
              >
                Olvidé mi contraseña
              </button>
            )}
            <button
              className="button primary full"
              disabled={busy || !!configurationError}
            >
              {busy ? (
                <Spinner label="Un momento…" />
              ) : (
                <>
                  {mode === "login"
                    ? "Iniciar sesión"
                    : mode === "register"
                      ? "Crear cuenta"
                      : mode === "reset"
                        ? "Guardar contraseña"
                        : "Enviar enlace"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
          <div className="auth-switch">
            {mode === "login" ? (
              <>
                ¿Todavía no tienes cuenta?{" "}
                <button
                  className="text-button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setMessage("");
                  }}
                >
                  Regístrate
                </button>
              </>
            ) : (
              <button
                className="text-button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setMessage("");
                }}
              >
                Volver a iniciar sesión
              </button>
            )}
          </div>
          <p className="privacy-note">
            Tu sesión se guarda solo durante esta visita. En un equipo
            compartido, cierra sesión cuando termines.
          </p>
        </div>
      </main>
    </div>
  );
}
export function ProfilePage() {
  const { profile, reload } = useAuth();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  if (!profile) return <Spinner />;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const d = new FormData(e.currentTarget);
    try {
      await api(
        "/me",
        json("PATCH", {
          displayName: String(d.get("displayName")),
          bio: String(d.get("bio")),
          interests: String(d.get("interests"))
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
            .slice(0, 20),
          level: String(d.get("level")),
          notifications: {
            inApp: d.get("inApp") === "on",
            email: d.get("email") === "on",
          },
          onboarded: true,
        }),
      );
      await reload();
      toast("Tu perfil se guardó");
      if (!profile?.onboarded) navigate("/");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page narrow">
      <span className="eyebrow">TU ESPACIO</span>
      <h1>{profile.onboarded ? "Mi perfil" : "Hagamos este espacio tuyo"}</h1>
      <p className="page-intro">
        Tus intereses nos ayudan a acercarte a las salas adecuadas.
      </p>
      <form className="panel form-stack" onSubmit={submit}>
        <ErrorBox message={error} />
        <div className="profile-heading">
          <span className="avatar large">
            {profile.displayName?.slice(0, 2).toUpperCase() || "TÚ"}
          </span>
          <div>
            <strong>{profile.email}</strong>
            <p className="muted">Estudiante de StudyRoom</p>
          </div>
        </div>
        <label>
          Nombre visible
          <input
            name="displayName"
            required
            minLength={2}
            maxLength={60}
            defaultValue={profile.displayName}
          />
        </label>
        <label>
          Sobre mí
          <textarea
            name="bio"
            maxLength={500}
            rows={3}
            defaultValue={profile.bio}
            placeholder="¿Qué te gustaría aprender o compartir?"
          />
        </label>
        <label>
          Intereses de estudio
          <input
            name="interests"
            maxLength={500}
            defaultValue={profile.interests.join(", ")}
            placeholder="Matemáticas, programación, idiomas"
          />
          <small>Separa cada interés con una coma.</small>
        </label>
        <label>
          Nivel
          <select name="level" defaultValue={profile.level || "universitario"}>
            <option value="secundaria">Secundaria</option>
            <option value="universitario">Universitario</option>
            <option value="avanzado">Avanzado</option>
            <option value="todos">Todos los niveles</option>
          </select>
        </label>
        <fieldset>
          <legend>Notificaciones</legend>
          <label className="check-row">
            <input
              type="checkbox"
              name="inApp"
              defaultChecked={profile.notifications?.inApp !== false}
            />
            Avisos dentro de StudyRoom
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              name="email"
              defaultChecked={!!profile.notifications?.email}
            />
            Permitir avisos por correo cuando estén disponibles
          </label>
          <small>
            Los mensajes de seguridad y recuperación se envían cuando los
            solicitas.
          </small>
        </fieldset>
        <div className="form-actions">
          <Link to="/" className="button secondary">
            Volver
          </Link>
          <button className="button primary" disabled={busy}>
            {busy ? "Guardando…" : "Guardar perfil"}
          </button>
        </div>
      </form>
    </div>
  );
}
