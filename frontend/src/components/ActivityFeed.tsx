const activities = [
  "New lead added from website form",
  "Email campaign sent to 50 contacts",
  "John Smith moved to contacted",
  "New company imported",
];

export default function ActivityFeed() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <h2 className="mb-5 text-xl font-bold">Activity Feed</h2>

      <div className="space-y-4">
        {activities.map((activity) => (
          <p key={activity} className="border-b pb-3 text-slate-600">
            {activity}
          </p>
        ))}
      </div>
    </div>
  );
}
