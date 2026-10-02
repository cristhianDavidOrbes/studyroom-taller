import { Component, type ReactNode } from "react";
import { Brand } from "./ui";

/** Recover explicitly: failed lazy imports stay rejected until a page reload. */
export class AppErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <main className="page narrow" role="alert">
          <Brand />
          <h1>No pudimos cargar esta vista</h1>
          <p>
            Comprueba tu conexión y vuelve a intentarlo. Tus datos guardados
            siguen en tu cuenta.
          </p>
          <button
            className="button primary"
            onClick={() => window.location.reload()}
          >
            Reintentar carga
          </button>
          <a className="button secondary" href="/">
            Volver al inicio
          </a>
        </main>
      );
    }
    return this.props.children;
  }
}
