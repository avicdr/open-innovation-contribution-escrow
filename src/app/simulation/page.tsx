import { AppShell } from "@/components/layout/app-shell";
import { SimulationWorkspace } from "@/features/simulation/components/simulation-workspace";

export default function SimulationPage() {
  return (
    <AppShell title="Simulation" eyebrow="one-click lifecycle">
      <SimulationWorkspace />
    </AppShell>
  );
}
