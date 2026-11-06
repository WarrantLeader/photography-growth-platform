import { useState } from "react";
import { Link } from "react-router-dom";
import { PageTitle, Metric, Badge, Icon, Modal, Empty } from "../components/UI";
import {
  useStudio,
  money,
  stages,
  uid,
  type Lead,
} from "../state/StudioContext";
export function LeadForm({
  lead,
  onSave,
  onClose,
}: {
  lead?: Lead;
  onSave: (lead: Lead) => void;
  onClose: () => void;
}) {
  const { data } = useStudio();
  return (
    <Modal title={lead ? "Edit enquiry" : "New enquiry"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          onSave({
            id: lead?.id || uid(),
            name: String(f.get("name")).trim(),
            company: String(f.get("company")).trim(),
            email: String(f.get("email")).trim(),
            phone: String(f.get("phone")).trim(),
            source: String(f.get("source")),
            campaign: String(f.get("campaign")),
            status: String(f.get("status")),
            value: Number(f.get("value")),
            notes: String(f.get("notes")).trim(),
            created: lead?.created || new Date().toISOString(),
          });
        }}
      >
        <div className="form-grid">
          <label>
            Contact name
            <input
              name="name"
              defaultValue={lead?.name}
              required
              maxLength={100}
            />
          </label>
          <label>
            Company or society
            <input
              name="company"
              defaultValue={lead?.company}
              maxLength={120}
            />
          </label>
          <label>
            Email
            <input name="email" type="email" defaultValue={lead?.email} />
          </label>
          <label>
            Phone
            <input name="phone" type="tel" defaultValue={lead?.phone} />
          </label>
          <label>
            Source
            <select name="source" defaultValue={lead?.source || "Instagram"}>
              {[
                "Instagram",
                "Website",
                "Email",
                "Referral",
                "LinkedIn",
                "Other",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select name="status" defaultValue={lead?.status || "New"}>
              {stages.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Estimated fee (£)
            <input
              name="value"
              type="number"
              min="0"
              max="10000000"
              step="0.01"
              defaultValue={lead?.value || 0}
              required
            />
          </label>
          <label>
            Campaign
            <select name="campaign" defaultValue={lead?.campaign || ""}>
              <option value="">No campaign</option>
              {data.campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="span-two">
            Notes
            <textarea
              name="notes"
              rows={3}
              defaultValue={lead?.notes}
              maxLength={5000}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="primary">Save enquiry</button>
        </div>
      </form>
    </Modal>
  );
}
export default function Leads() {
  const { data, setData, log } = useStudio();
  const [query, Q] = useState(""),
    [status, S] = useState("All"),
    [add, A] = useState(false);
  const shown = data.leads.filter(
    (l) =>
      (status === "All" || l.status === status) &&
      [l.name, l.company, l.email]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title="Leads & clients"
        description="Turn a good conversation into your next booking."
        action={
          <button className="primary" onClick={() => A(true)}>
            <Icon name="plus" size={16} />
            Add enquiry
          </button>
        }
      />
      <div className="metrics four">
        <Metric
          title="Total enquiries"
          value={data.leads.length}
          detail="All recorded contacts"
          icon="users"
        />
        <Metric
          title="New enquiries"
          value={data.leads.filter((l) => l.status === "New").length}
          detail="Ready for a first reply"
        />
        <Metric
          title="Qualified"
          value={data.leads.filter((l) => l.status === "Qualified").length}
          detail="Ready for a proposal"
        />
        <Metric
          title="Converted"
          value={data.leads.filter((l) => l.status === "Converted").length}
          detail="Enquiries marked as booked"
          icon="check"
        />
      </div>
      <section className="panel no-pad">
        <div className="table-tools">
          <div className="search">
            <Icon name="search" size={17} />
            <input
              placeholder="Search name, company or email..."
              aria-label="Search leads"
              value={query}
              onChange={(e) => Q(e.target.value)}
            />
          </div>
          <select
            aria-label="Filter lead status"
            value={status}
            onChange={(e) => S(e.target.value)}
          >
            <option value="All">All statuses</option>
            {stages.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <span className="subtle">{shown.length} enquiries</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>CONTACT</th>
                <th>SOURCE</th>
                <th>STATUS</th>
                <th>EST. VALUE</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link to={"/leads/" + l.id} className="contact-cell">
                      <div className="avatar peach">
                        {l.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <b>{l.name}</b>
                        <small>
                          {l.company || l.email || "Independent contact"}
                        </small>
                      </div>
                    </Link>
                  </td>
                  <td>{l.source}</td>
                  <td>
                    <Badge status={l.status} />
                  </td>
                  <td>{money(l.value)}</td>
                  <td>
                    <Link to={"/leads/" + l.id} className="text-link">
                      View
                      <Icon name="chevron" size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!shown.length && (
          <Empty
            title="No enquiries found"
            description="Try another search or add your first enquiry."
          />
        )}
      </section>
      {add && (
        <LeadForm
          onClose={() => A(false)}
          onSave={(l) => {
            setData((s) => ({ ...s, leads: [l, ...s.leads] }));
            log("New enquiry added: " + l.name);
            A(false);
          }}
        />
      )}
    </>
  );
}
