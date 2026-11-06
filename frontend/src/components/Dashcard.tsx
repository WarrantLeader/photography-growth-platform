interface DashboardCardProps {
  title: string;
  value: string;
}

export default function DashboardCard({ title, value }: DashboardCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <p className="text-sm text-slate-500">{title}</p>

      <h2 className="mt-2 text-3xl font-bold text-slate-900">{value}</h2>
    </div>
  );
}
