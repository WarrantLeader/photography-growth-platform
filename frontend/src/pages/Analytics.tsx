import { PageTitle, Metric, Empty } from "../components/UI";
import { useStudio, money, stages } from "../state/StudioContext";
export default function Analytics() {
  const { data } = useStudio();
  const sources = [...new Set(data.leads.map((l) => l.source))];
  const open = data.leads.filter(
    (l) => !["Converted", "Lost"].includes(l.status),
  );
  return (
    <>
      <PageTitle
        title="Studio insights"
        description="A clear picture of the work coming through your door."
      />
      <div className="metrics three">
        <Metric
          title="Pipeline value"
          value={money(open.reduce((s, l) => s + l.value, 0))}
          detail="Open enquiry estimates"
        />
        <Metric
          title="Conversion rate"
          value={
            (data.leads.length
              ? Math.round(
                  (data.leads.filter((l) => l.status === "Converted").length /
                    data.leads.length) *
                    100,
                )
              : 0) + "%"
          }
          detail="Converted / total enquiries"
        />
        <Metric
          title="Delivered projects"
          value={data.projects.filter((p) => p.status === "Delivered").length}
          detail="Marked as delivered"
          icon="check"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Where enquiries come from</h2>
            <span className="subtle">All recorded leads</span>
          </div>
          {sources.length ? (
            sources.map((s) => {
              const count = data.leads.filter((l) => l.source === s).length;
              return (
                <div className="analytics-row" key={s}>
                  <div>
                    <span>{s}</span>
                    <b>{count}</b>
                  </div>
                  <div className="progress-track">
                    <span
                      style={{ width: (count / data.leads.length) * 100 + "%" }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <Empty
              title="No enquiry data"
              description="Add leads to see their sources here."
            />
          )}
        </section>
        <section className="panel">
          <h2>Enquiries by stage</h2>
          <div
            className="bar-chart"
            role="img"
            aria-label={stages
              .map(
                (s) =>
                  s + ": " + data.leads.filter((l) => l.status === s).length,
              )
              .join(", ")}
          >
            {stages.map((s) => {
              const n = data.leads.filter((l) => l.status === s).length;
              return (
                <div className="bar-col" key={s}>
                  <strong>{n}</strong>
                  <div className="bar-slot">
                    <div
                      style={{
                        height:
                          (data.leads.length
                            ? (n / data.leads.length) * 100
                            : 0) + "%",
                      }}
                    />
                  </div>
                  <small>{s}</small>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <div className="notice">
        Figures come from your saved workspace records. Project fees represent
        booked value, not received payments.
      </div>
    </>
  );
}
