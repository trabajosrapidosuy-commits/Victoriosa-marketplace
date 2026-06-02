import { listAutopilotConnectors } from "@/services/autopilot-service";

export default function ConnectorsPage() {
  return (
    <main className="card overflow-x-auto">
      <h2 className="text-xl font-bold">Conectores</h2>
      <p className="mt-2 text-sm">Los conectores externos no fallan el sistema: quedan en needs_credentials hasta su configuracion segura.</p>
      <table className="mt-4 w-full min-w-[760px] text-left text-sm">
        <thead><tr className="border-b"><th className="p-2">Nombre</th><th className="p-2">Tipo</th><th className="p-2">Estado</th><th className="p-2">Capacidades</th><th className="p-2">Variables requeridas</th></tr></thead>
        <tbody>
          {listAutopilotConnectors().map((connector) => (
            <tr className="border-b align-top" key={connector.id}>
              <td className="p-2 font-bold">{connector.name}</td>
              <td className="p-2">{connector.type}</td>
              <td className="p-2"><span className="badge">{connector.status}</span></td>
              <td className="p-2">{connector.capabilities.join(", ")}</td>
              <td className="p-2">{connector.requiredEnvVars.join(", ") || "ninguna"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
