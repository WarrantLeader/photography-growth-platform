import DashboardCard from "./Dashcard";

export default function DashboardMetrics() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <DashboardCard title="New Leads" value="124" />

      <DashboardCard title="Follow Ups" value="18" />

      <DashboardCard title="Converted" value="23" />
    </div>
  );
}
