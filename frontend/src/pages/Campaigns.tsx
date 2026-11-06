import { useState } from "react";
import { Link } from "react-router-dom";
import { PageTitle, Metric, Badge, Icon, Modal, Empty } from "../components/UI";
import { useStudio, uid, type Campaign } from "../state/StudioContext";
export default function Campaigns() {
  const { data, setData, log } = useStudio();
  const [filter, F] = useState("All");
  const [editing, E] = useState<Campaign | null | undefined>(undefined);
  const [view, V] = useState<Campaign | null>(null);
  const shown = data.campaigns.filter(
    (c) => filter === "All" || c.status === filter,
  );
  const converted = data.leads.filter(
    (l) => l.campaign && l.status === "Converted",
  ).length;
  const attributed = data.leads.filter((l) => l.campaign).length;
  return (
    <>
      <PageTitle
        title="Campaigns"
        description="Give your next photography booking a little momentum."
        action={
          <button className="primary" onClick={() => E(null)}>
            <Icon name="plus" size={16} />
            Create campaign
          </button>
        }
      />
      <div className="metrics four">
        <Metric
          title="Active campaigns"
          value={data.campaigns.filter((c) => c.status === "Running").length}
          detail="Currently marked as running"
          icon="campaign"
        />
        <Metric
          title="Attributed leads"
          value={attributed}
          detail="Linked to a campaign"
          icon="users"
        />
        <Metric
          title="Outreach logged"
          value={data.campaigns.reduce((s, c) => s + c.sent, 0)}
          detail="Manually recorded contacts"
        />
        <Metric
          title="Conversion rate"
          value={
            (attributed ? Math.round((converted / attributed) * 100) : 0) + "%"
          }
          detail="Converted attributed enquiries"
          icon="check"
        />
      </div>
      <div className="tabs">
        {["All", "Running", "Paused", "Completed"].map((s) => (
          <button
            key={s}
            className={filter === s ? "selected" : ""}
            onClick={() => F(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="campaign-grid">
        {shown.map((c) => {
          const leads = data.leads.filter((l) => l.campaign === c.id);
          const progress = Math.min(100, Math.round((c.sent / c.goal) * 100));
          return (
            <section key={c.id} className="panel campaign-panel">
              <div className="panel-heading">
                <div className="campaign-icon">
                  <Icon name="campaign" size={22} />
                </div>
                <Badge status={c.status} />
              </div>
              <h2>{c.name}</h2>
              <p>{c.type} outreach</p>
              <div className="progress-label">
                <span>Outreach goal</span>
                <b>
                  {c.sent} / {c.goal}
                </b>
              </div>
              <div className="progress-track">
                <span style={{ width: progress + "%" }} />
              </div>
              <div className="campaign-numbers">
                <div>
                  <b>{leads.length}</b>
                  <small>Leads</small>
                </div>
                <div>
                  <b>
                    {
                      leads.filter((l) =>
                        ["Contacted", "Qualified", "Converted"].includes(
                          l.status,
                        ),
                      ).length
                    }
                  </b>
                  <small>Progressed</small>
                </div>
                <div>
                  <b>{leads.filter((l) => l.status === "Converted").length}</b>
                  <small>Converted</small>
                </div>
              </div>
              <div className="campaign-actions">
                <button className="text-link" onClick={() => V(c)}>
                  View campaign <Icon name="arrow" size={14} />
                </button>
                <button className="secondary" onClick={() => E(c)}>
                  Edit
                </button>
              </div>
            </section>
          );
        })}
      </div>
      {!shown.length && (
        <Empty
          title="No campaigns here"
          description="Create a campaign or choose another status."
        />
      )}
      <div className="notice">
        Campaigns track your outreach records. Sending messages and checking
        Instagram require a separate integration.
      </div>
      {editing !== undefined && (
        <Modal
          title={editing ? "Edit campaign" : "Create campaign"}
          onClose={() => E(undefined)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const c: Campaign = {
                id: editing?.id || uid(),
                name: String(f.get("name")).trim(),
                type: String(f.get("type")),
                status: String(f.get("status")),
                goal: Number(f.get("goal")),
                sent: Number(f.get("sent")),
              };
              setData((s) => ({
                ...s,
                campaigns: editing
                  ? s.campaigns.map((x) => (x.id === c.id ? c : x))
                  : [...s.campaigns, c],
              }));
              log("Campaign saved: " + c.name);
              E(undefined);
            }}
          >
            <div className="form-grid">
              <label className="span-two">
                Campaign name
                <input
                  name="name"
                  required
                  maxLength={120}
                  defaultValue={editing?.name}
                />
              </label>
              <label>
                Channel
                <select name="type" defaultValue={editing?.type || "Instagram"}>
                  {["Instagram", "Email", "LinkedIn", "Website", "Other"].map(
                    (s) => (
                      <option key={s}>{s}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Status
                <select
                  name="status"
                  defaultValue={editing?.status || "Running"}
                >
                  {["Running", "Paused", "Completed"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Contact goal
                <input
                  type="number"
                  name="goal"
                  min="1"
                  max="10000000"
                  defaultValue={editing?.goal || 30}
                  required
                />
              </label>
              <label>
                Contacts made
                <input
                  type="number"
                  name="sent"
                  min="0"
                  max="10000000"
                  defaultValue={editing?.sent || 0}
                  required
                />
              </label>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => E(undefined)}
              >
                Cancel
              </button>
              <button className="primary">Save campaign</button>
            </div>
          </form>
        </Modal>
      )}
      {view && (
        <Modal title={view.name} onClose={() => V(null)}>
          <p>
            {view.type} · {view.status} · {view.sent} of {view.goal} contacts
          </p>
          <h3>Linked enquiries</h3>
          {data.leads
            .filter((l) => l.campaign === view.id)
            .map((l) => (
              <Link className="linked-lead" to={"/leads/" + l.id} key={l.id}>
                {l.name}
                <Badge status={l.status} />
                <Icon name="arrow" size={14} />
              </Link>
            ))}
          {!data.leads.some((l) => l.campaign === view.id) && (
            <p>No linked enquiries. Choose this campaign when adding a lead.</p>
          )}
        </Modal>
      )}
    </>
  );
}
