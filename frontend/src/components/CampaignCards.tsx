interface CampaignCardProps {
  name: string;
  type: string;
  completed: number;
  total: number;
  status: string;
  leads: number;
  replies: number;
  conversions: number;
}

export default function CampaignCard({
  name,
  type,
  completed,
  total,
  status,
  leads,
  replies,
  conversions,
}: CampaignCardProps) {
  const progress = Math.round((completed / total) * 100);

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{name}</h2>

          <p className="text-sm text-slate-500">{type}</p>
        </div>

        <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
          {status}
        </span>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm">
          <span>Progress</span>

          <span>{progress}%</span>
        </div>

        <div className="mt-2 h-3 rounded-full bg-slate-200">
          <div
            className="h-3 rounded-full bg-blue-600"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-slate-100 p-3 text-center">
          <p className="text-xs text-slate-500">Leads</p>

          <p className="font-bold">{leads}</p>
        </div>

        <div className="rounded-lg bg-slate-100 p-3 text-center">
          <p className="text-xs text-slate-500">Replies</p>

          <p className="font-bold">{replies}</p>
        </div>

        <div className="rounded-lg bg-slate-100 p-3 text-center">
          <p className="text-xs text-slate-500">Converted</p>

          <p className="font-bold">{conversions}</p>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">
          View
        </button>

        <button className="rounded-lg bg-slate-100 px-4 py-2">Edit</button>
      </div>
    </div>
  );
}
