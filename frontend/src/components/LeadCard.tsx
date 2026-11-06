import { Link } from "react-router-dom";

interface LeadCardProps {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  campaign: string;
  status: string;
  lastContact: string;
}

export default function LeadCard({
  id,
  name,
  company,
  email,
  phone,
  source,
  campaign,
  status,
  lastContact,
}: LeadCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{name}</h2>

          <p className="text-slate-500">{company}</p>
        </div>

        <span
          className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium ${
            status === "New"
              ? "bg-blue-100 text-blue-700"
              : status === "Qualified"
                ? "bg-green-100 text-green-700"
                : status === "Converted"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-5">
        <div>
          <p className="text-sm text-slate-500">Email</p>

          <p className="font-medium">{email}</p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Phone</p>

          <p className="font-medium">{phone}</p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Source</p>

          <p className="font-medium">{source}</p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Campaign</p>

          <p className="font-medium">{campaign}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">Last contact: {lastContact}</p>

        <Link
          to={`/leads/${id}`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          View Lead
        </Link>
      </div>
    </div>
  );
}
