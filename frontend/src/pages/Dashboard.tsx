import { useState } from "react";
import { Link } from "react-router-dom";
import { PageTitle, Metric, Badge, Icon } from "../components/UI";
import { useStudio, money, stages, uid } from "../state/StudioContext";
export default function Dashboard() {
  const { data, setData } = useStudio();
  const [task, T] = useState("");
  const open = data.leads.filter(
    (l) => !["Converted", "Lost"].includes(l.status),
  );
  const next = [...data.projects]
    .filter((p) => p.status !== "Delivered")
    .sort((a, b) => a.date.localeCompare(b.date));
  return (
    <>
      <PageTitle
        title="Your studio, at a glance"
        description="A little clarity before your next big shoot."
        action={
          <Link to="/leads" className="primary">
            <Icon name="plus" size={16} />
            Manage enquiries
          </Link>
        }
      />
      <div className="welcome-banner">
        <div>
          <div className="eyebrow">MAKE ROOM FOR YOUR BEST WORK</div>
          <h2>Good morning, Tiago.</h2>
          <p>
            You have {open.length} open enquiries and{" "}
            {data.tasks.filter((t) => !t.done).length} tasks to keep things
            moving.
          </p>
        </div>
        <div className="banner-camera">
          <Icon name="camera" size={70} />
        </div>
        <Link to="/projects">
          View your projects <Icon name="arrow" size={16} />
        </Link>
      </div>
      <div className="metrics four">
        <Metric
          title="Open enquiries"
          value={open.length}
          detail="Across your active pipeline"
          icon="users"
        />
        <Metric
          title="Pipeline value"
          value={money(open.reduce((s, l) => s + l.value, 0))}
          detail="Estimated open enquiry value"
          icon="chart"
        />
        <Metric
          title="Active projects"
          value={data.projects.filter((p) => p.status !== "Delivered").length}
          detail="From booking to delivery"
          icon="briefcase"
        />
        <Metric
          title="Booked value"
          value={money(data.projects.reduce((s, p) => s + p.value, 0))}
          detail="Recorded project fees, not payments"
          icon="camera"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Enquiry pipeline</h2>
            <Link to="/leads" className="text-link">
              View leads <Icon name="arrow" size={13} />
            </Link>
          </div>
          <p className="panel-description">
            From first contact to a confirmed booking.
          </p>
          <div className="pipeline">
            {stages.slice(0, 4).map((s, i) => {
              const count = data.leads.filter((l) => l.status === s).length;
              return (
                <div className="pipeline-row" key={s}>
                  <span className={"pipeline-dot dot-" + i} />
                  <span>{s}</span>
                  <div className="pipeline-track">
                    <span
                      style={{
                        width:
                          (data.leads.length
                            ? (count / data.leads.length) * 100
                            : 0) + "%",
                      }}
                    />
                  </div>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
          <div className="panel-bottom">
            <span>Conversion rate</span>
            <b>
              {data.leads.length
                ? Math.round(
                    (data.leads.filter((l) => l.status === "Converted").length /
                      data.leads.length) *
                      100,
                  )
                : 0}
              %
            </b>
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Your to-do list</h2>
            <span className="subtle">
              {data.tasks.filter((t) => !t.done).length} remaining
            </span>
          </div>
          <div className="task-list">
            {data.tasks.map((t) => (
              <label key={t.id} className={"task " + (t.done ? "done" : "")}>
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() =>
                    setData((s) => ({
                      ...s,
                      tasks: s.tasks.map((x) =>
                        x.id === t.id ? { ...x, done: !x.done } : x,
                      ),
                    }))
                  }
                />
                <span>{t.title}</span>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={"Delete task " + t.title}
                  onClick={(e) => {
                    e.preventDefault();
                    setData((s) => ({
                      ...s,
                      tasks: s.tasks.filter((x) => x.id !== t.id),
                    }));
                  }}
                >
                  <Icon name="close" size={12} />
                </button>
              </label>
            ))}
          </div>
          <form
            className="inline-add"
            onSubmit={(e) => {
              e.preventDefault();
              if (task.trim()) {
                setData((s) => ({
                  ...s,
                  tasks: [
                    ...s.tasks,
                    { id: uid(), title: task.trim(), done: false },
                  ],
                }));
                T("");
              }
            }}
          >
            <input
              value={task}
              onChange={(e) => T(e.target.value)}
              placeholder="Add a task..."
              aria-label="New task"
              required
              maxLength={180}
            />
            <button aria-label="Add task" className="icon-button">
              <Icon name="plus" size={17} />
            </button>
          </form>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Upcoming & active projects</h2>
            <Link to="/projects" className="text-link">
              View all <Icon name="arrow" size={13} />
            </Link>
          </div>
          <div className="project-list">
            {next.length ? (
              next.slice(0, 3).map((p) => (
                <Link
                  key={p.id}
                  to={"/files?project=" + encodeURIComponent(p.id)}
                  className="project-row"
                >
                  <div className="project-icon">
                    <Icon name="camera" />
                  </div>
                  <div>
                    <h3>{p.name}</h3>
                    <p>
                      {p.client} · {p.date || "Date to confirm"}
                    </p>
                  </div>
                  <Badge status={p.status} />
                  <Icon name="chevron" size={14} />
                </Link>
              ))
            ) : (
              <p>No active projects. Add your next shoot in Projects.</p>
            )}
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Recent activity</h2>
            <span className="subtle">Workspace updates</span>
          </div>
          <div className="activity-list">
            {data.activity.slice(0, 4).map((a) => (
              <div key={a.id}>
                <span className="activity-dot" />
                <div>
                  <p>{a.text}</p>
                  <small>
                    {new Date(a.time).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="bottom-callout">
        <Icon name="drive" size={27} />
        <div>
          <h3>All the files. One project.</h3>
          <p>Open your UGREEN NAS project folder from your workspace.</p>
        </div>
        <Link to="/files" className="secondary">
          Open project files
          <Icon name="arrow" size={14} />
        </Link>
      </div>
    </>
  );
}
