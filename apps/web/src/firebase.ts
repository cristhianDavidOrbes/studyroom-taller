import { initializeApp } from "firebase/app";
import {
  browserSessionPersistence,
  connectAuthEmulator,
  initializeAuth,
} from "firebase/auth";
const env = import.meta.env;
const emulator = env.DEV && env.VITE_USE_FIREBASE_EMULATOR === "true";
export const configurationError =
  !emulator && (!env.VITE_FIREBASE_API_KEY || !env.VITE_FIREBASE_PROJECT_ID)
    ? "El acceso todavía no está configurado. El administrador debe conectar Firebase Authentication para habilitar las cuentas."
    : null;
const app = initializeApp({
  apiKey:
    env.VITE_FIREBASE_API_KEY || (emulator ? "demo-api-key" : "unconfigured"),
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "demo-studyroom.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "demo-studyroom",
  appId: env.VITE_FIREBASE_APP_ID || "demo-studyroom-web",
});
export const auth = initializeAuth(app, {
  persistence: browserSessionPersistence,
});
auth.languageCode = "es";
if (emulator)
  connectAuthEmulator(
    auth,
    env.VITE_FIREBASE_AUTH_EMULATOR_URL || "http://127.0.0.1:9099",
    { disableWarnings: true },
  );
