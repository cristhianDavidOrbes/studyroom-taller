import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, errorText } from "./api";
import { ErrorBox, Modal, Spinner } from "./ui";
interface Usage {
  used: Record<string, number>;
  limits: Record<string, number>;
  warnings: string[];
  configured: { media: boolean; storage: boolean; ai: boolean };
}
const labels: Record<string, string> = {
  ngrokRequests: "Consultas al equipo de IA",
  ngrokBytes: "Transferencia de IA",
  participantMinutes: "Minutos de videollamada",
  mediaBytes: "Transferencia de videollamadas",
  storage: "Archivos guardados",
  storageEgress: "Descargas de archivos",
  database: "Datos guardados",
};
export function UsageButton() {
  const [open, setOpen] = useState(false);
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["usage"],
    queryFn: () => api<Usage>("/usage"),
    enabled: open,
    staleTime: 60000,
  });
  return (
    <>
      <button className="plan-indicator" onClick={() => setOpen(true)}>
        <span />
        Plan gratuito
      </button>
      {open && (
        <Modal
          title="Tu espacio, dentro del plan gratuito"
          onClose={() => setOpen(false)}
        >
          <p>
            El servicio se detiene al llegar a un límite. No se activa una
            opción de pago automáticamente.
          </p>
          {isPending ? (
            <Spinner />
          ) : error ? (
            <ErrorBox message={errorText(error)} retry={() => void refetch()} />
          ) : (
            data && (
              <>
                <div className="usage-meters">
                  {Object.entries(data.used)
                    .filter(([key]) => labels[key])
                    .map(([key, value]) => {
                      const limit = data.limits[key] || 1,
                        percentage = Math.min(
                          100,
                          Math.round((value / limit) * 100),
                        );
                      return (
                        <div className="usage-meter" key={key}>
                          <div>
                            <label htmlFor={`usage-${key}`}>
                              {labels[key]}
                            </label>
                            <strong>{percentage}%</strong>
                          </div>
                          <progress
                            id={`usage-${key}`}
                            max={limit}
                            value={value}
                          />
                          <small>
                            {data.warnings.includes(key)
                              ? "Cerca del límite. Algunas funciones podrían quedar en espera."
                              : "Capacidad disponible"}
                            {key === "mediaBytes" ||
                            key === "participantMinutes"
                              ? " · Reserva estimada al entrar a la llamada"
                              : ""}
                          </small>
                        </div>
                      );
                    })}
                </div>
                <p className="small-text muted">
                  El consumo es compartido por toda la comunidad. Las reservas
                  de videollamadas protegen la capacidad gratuita; el
                  administrador contrasta el uso con el proveedor.
                </p>
              </>
            )
          )}
        </Modal>
      )}
    </>
  );
}
