const leads = [
  {
    name: "John Smith",
    email: "john@email.com",
    status: "New",
  },
  {
    name: "Sarah Ltd",
    email: "contact@sarah.com",
    status: "Follow up",
  },
  {
    name: "Tech Company",
    email: "hello@tech.com",
    status: "Qualified",
  },
];

export default function LeadTable() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <h2 className="mb-5 text-xl font-bold">Recent Leads</h2>

      <table className="w-full">
        <thead>
          <tr className="text-left text-slate-500">
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr key={lead.email} className="border-t">
              <td className="py-3">{lead.name}</td>

              <td>{lead.email}</td>

              <td>{lead.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
