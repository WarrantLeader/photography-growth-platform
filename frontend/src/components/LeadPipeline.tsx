const stages = [
  {
    name: "New",
    amount: 124,
  },
  {
    name: "Contacted",
    amount: 68,
  },
  {
    name: "Qualified",
    amount: 42,
  },
  {
    name: "Converted",
    amount: 23,
  },
];

export default function LeadPipeline() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <h2 className="mb-5 text-xl font-bold">Lead Pipeline</h2>

      <div className="space-y-4">
        {stages.map((stage) => (
          <div
            key={stage.name}
            className="flex justify-between rounded-xl bg-slate-100 p-4"
          >
            <span>{stage.name}</span>

            <span className="font-bold">{stage.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
