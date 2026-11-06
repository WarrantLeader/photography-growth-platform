const tasks = [
  "Call John Smith",
  "Send proposal to Sarah Ltd",
  "Follow up with Tech Company",
];

export default function Tasks() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <h2 className="mb-5 text-xl font-bold">Tasks</h2>

      {tasks.map((task) => (
        <div key={task} className="flex items-center gap-3 mb-3">
          <input type="checkbox" />

          <p>{task}</p>
        </div>
      ))}
    </div>
  );
}
