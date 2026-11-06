import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageTitle, Badge, Icon, Empty } from "../components/UI";
import { useStudio, money, stages } from "../state/StudioContext";
import { LeadForm } from "./Leads";
export default function LeadDetails() {
  const { id } = useParams();
  const { data, setData, log } = useStudio();
  const [edit, E] = useState(false);
  const l = data.leads.find((x) => x.id === id);
  if (!l)
    return (
      <>
        <Empty
          title="Enquiry not found"
          description="This enquiry is no longer in your workspace."
        />
        <Link to="/leads" className="secondary">
          Back to leads
        </Link>
      </>
    );
  return (
    <>
      <Link to="/leads" className="back-link">
        ← All enquiries
      </Link>
      <PageTitle
        title={l.name}
        description={l.company || "Independent contact"}
        action={
          <button className="primary" onClick={() => E(true)}>
            Edit enquiry
            <Icon name="arrow" size={16} />
          </button>
        }
      />
      <div className="detail-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Contact details</h2>
            <Badge status={l.status} />
          </div>
          <dl className="details">
            <div>
              <dt>Email</dt>
              <dd>
                {l.email ? (
                  <a href={"mailto:" + l.email}>{l.email}</a>
                ) : (
                  "Not provided"
                )}
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                {l.phone ? (
                  <a href={"tel:" + l.phone}>{l.phone}</a>
                ) : (
                  "Not provided"
                )}
              </dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{l.source}</dd>
            </div>
            <div>
              <dt>Estimated fee</dt>
              <dd>{money(l.value)}</dd>
            </div>
            <div>
              <dt>Campaign</dt>
              <dd>
                {data.campaigns.find((c) => c.id === l.campaign)?.name ||
                  "No campaign"}
              </dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{new Date(l.created).toLocaleDateString("en-GB")}</dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <h2>Keep things moving</h2>
          <label className="status-field">
            Enquiry status
            <select
              value={l.status}
              onChange={(e) => {
                const status = e.target.value;
                setData((s) => ({
                  ...s,
                  leads: s.leads.map((x) =>
                    x.id === id ? { ...x, status } : x,
                  ),
                }));
                log(l.name + " moved to " + status);
              }}
            >
              {stages.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <h3>Project notes</h3>
          <p className="notes">
            {l.notes || "No notes yet. Edit this enquiry to add the details."}
          </p>
        </section>
      </div>
      {edit && (
        <LeadForm
          lead={l}
          onClose={() => E(false)}
          onSave={(lead) => {
            setData((s) => ({
              ...s,
              leads: s.leads.map((x) => (x.id === id ? lead : x)),
            }));
            log("Enquiry updated: " + lead.name);
            E(false);
          }}
        />
      )}
    </>
  );
}
