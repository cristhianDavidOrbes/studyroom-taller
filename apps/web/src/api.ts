import { auth } from './firebase';
export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export const SOCKET_URL = API_URL.startsWith('http') ? new URL(API_URL).origin : window.location.origin;
export class ApiError extends Error { constructor(message:string, public status:number, public code?:string) { super(message); } }
export async function api<T>(path:string, options:RequestInit = {}):Promise<T> {
  const token = await auth.currentUser?.getIdToken();
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type','application/json');
  let response:Response;
  try { response = await fetch(`${API_URL}${path}`, {...options, headers, signal:options.signal || AbortSignal.timeout(90000)}); }
  catch (error) { if (options.signal?.aborted) throw error; throw new ApiError('No pudimos conectar. Revisa tu internet y vuelve a intentar; el servidor puede tardar un momento en despertar.',0); }
  if (!response.ok) {
    const body = await response.json().catch(()=>({}));
    const message = Array.isArray(body.message) ? body.message.join('. ') : body.message;
    throw new ApiError(message || (response.status === 401 ? 'Tu sesión terminó. Vuelve a iniciar sesión.' : 'No se pudo completar la acción.'),response.status,body.code);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export const json = (method:string, body?:unknown):RequestInit => ({method, ...(body === undefined ? {} : {body:JSON.stringify(body)})});
export const errorText = (error:unknown) => error instanceof Error ? error.message : 'No se pudo completar la acción.';
export function authError(error:unknown) {
  const code = (error as {code?:string})?.code;
  const known:Record<string,string> = {'auth/invalid-credential':'El correo o la contraseña no son correctos.','auth/wrong-password':'El correo o la contraseña no son correctos.','auth/user-not-found':'El correo o la contraseña no son correctos.','auth/email-already-in-use':'No se pudo crear la cuenta con ese correo. Intenta iniciar sesión o recuperar tu contraseña.','auth/weak-password':'Usa una contraseña de al menos 8 caracteres.','auth/too-many-requests':'Hay demasiados intentos. Espera unos minutos e inténtalo de nuevo.','auth/network-request-failed':'No hay conexión con el servicio de acceso.','auth/expired-action-code':'El enlace venció. Solicita otro correo de recuperación.','auth/invalid-action-code':'El enlace no es válido o ya fue utilizado. Solicita otro correo.'};
  return known[code || ''] || 'No pudimos completar el acceso. Comprueba los datos y vuelve a intentarlo.';
}
