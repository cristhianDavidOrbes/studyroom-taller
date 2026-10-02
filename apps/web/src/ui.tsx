import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, X, BookOpen, Inbox } from 'lucide-react';
export function Brand(){return <span className="brand"><span className="brand-mark"><BookOpen size={23}/></span>Study<span>Room</span></span>}
export function Spinner({label='Cargando…'}:{label?:string}){return <div role="status" className="loading"><LoaderCircle className="spin" size={21}/>{label}</div>}
export function ErrorBox({message,retry}:{message?:string;retry?:()=>void}){if(!message)return null;return <div className="notice error" role="alert"><AlertCircle size={18}/><span>{message}</span>{retry&&<button className="text-button" onClick={retry}>Reintentar</button>}</div>}
export function Empty({title,children,action}:{title:string;children?:ReactNode;action?:ReactNode}){return <div className="empty"><span className="empty-icon"><Inbox size={30}/></span><h3>{title}</h3><p>{children}</p>{action}</div>}
export function Modal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const dialog=ref.current;const previous=document.activeElement as HTMLElement|null;dialog?.showModal();return()=>{dialog?.close();previous?.focus();}},[]);
  return <dialog ref={ref} className="modal" aria-labelledby="modal-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal-header"><h2 id="modal-title">{title}</h2><button className="icon-button" aria-label="Cerrar ventana" onClick={onClose}><X size={20}/></button></div>{children}</dialog>
}
export function Badge({children,tone=''}:{children:ReactNode;tone?:string}){return <span className={`badge ${tone}`}>{children}</span>}
export const dateTime=(value?:string)=>value ? new Intl.DateTimeFormat('es-CO',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)) : 'Ahora';
export const shortTime=(value:string)=>new Intl.DateTimeFormat('es-CO',{hour:'2-digit',minute:'2-digit'}).format(new Date(value));
export const initials=(name:string)=>name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'E';
export const prettyBytes=(n:number)=>n<1024*1024 ? `${Math.ceil(n/1024)} KB` : `${(n/(1024*1024)).toFixed(1)} MB`;
const ToastContext=createContext<(message:string)=>void>(()=>{});
export function ToastProvider({children}:{children:ReactNode}){const[toast,setToast]=useState('');useEffect(()=>{if(toast){const id=setTimeout(()=>setToast(''),4500);return()=>clearTimeout(id);}},[toast]);return <ToastContext.Provider value={setToast}>{children}{toast&&<div className="toast" role="status"><CheckCircle2 size={19}/>{toast}<button aria-label="Cerrar aviso" className="icon-button" onClick={()=>setToast('')}><X size={16}/></button></div>}</ToastContext.Provider>}
export const useToast=()=>useContext(ToastContext);
