import { useState } from "react";
import { Link } from "react-router-dom";
import { PageTitle, Metric, Badge, Icon, Modal, Empty } from "../components/UI";
import { useStudio, money, uid, type Project } from "../state/StudioContext";
export default function Projects() {
  const { data, setData, log } = useStudio();
  const [edit, E] = useState<Project | null | undefined>(undefined);
  const [query, Q] = useState("");
  const shown = data.projects.filter((p) =>
    (p.name + " " + p.client).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title="Projects"
        description="Every shoot, from the booking to the final export."
        action={
          <button className="primary" onClick={() => E(null)}>
            <Icon name="plus" size={16} />
            Add project
          </button>
        }
      />
      <div className="metrics three">
        <Metric
          title="Active projects"
          value={data.projects.filter((p) => p.status !== "Delivered").length}
          detail="Work currently in progress"
          icon="camera"
        />
        <Metric
          title="In editing"
          value={data.projects.filter((p) => p.status === "Editing").length}
          detail="Ready for your creative touch"
        />
        <Metric
          title="Project value"
          value={money(data.projects.reduce((s, p) => s + p.value, 0))}
          detail="Recorded fees across all projects"
        />
      </div>
      <div className="search standalone">
        <Icon name="search" size={16} />
        <input
          aria-label="Search projects"
          placeholder="Search your projects..."
          value={query}
          onChange={(e) => Q(e.target.value)}
        />
      </div>
      <div className="campaign-grid">
        {shown.map((p) => (
          <section className="panel project-panel" key={p.id}>
            <div className="project-art">
              <Icon name="camera" size={44} />
              <span>{p.date || "DATE TO CONFIRM"}</span>
            </div>
            <div className="panel-heading">
              <span className="eyebrow">PHOTOGRAPHY PROJECT</span>
              <Badge status={p.status} />
            </div>
            <h2>{p.name}</h2>
            <p>{p.client}</p>
            <div className="project-fee">
              {money(p.value)}
              <span>Project fee</span>
            </div>
            <div className="campaign-actions">
              <Link
                to={"/files?project=" + encodeURIComponent(p.id)}
                className="text-link"
              >
                Open project files
                <Icon name="arrow" size={14} />
              </Link>
              <button className="secondary" onClick={() => E(p)}>
                Edit
              </button>
            </div>
          </section>
        ))}
      </div>
      {!shown.length && (
        <Empty
          title="No projects yet"
          description="Add your next shoot to get started."
        />
      )}
      {edit !== undefined && (
        <Modal
          title={edit ? "Edit project" : "New project"}
          onClose={() => E(undefined)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const p: Project = {
                id: edit?.id || uid(),
                name: String(f.get("name")).trim(),
                client: String(f.get("client")).trim(),
                date: String(f.get("date")),
                status: String(f.get("status")),
                value: Number(f.get("value")),
              };
              setData((s) => ({
                ...s,
                projects: edit
                  ? s.projects.map((x) => (x.id === p.id ? p : x))
                  : [...s.projects, p],
              }));
              log("Project saved: " + p.name);
              E(undefined);
            }}
          >
            <div className="form-grid">
              <label className="span-two">
                Project name
                <input
                  name="name"
                  defaultValue={edit?.name}
                  required
                  maxLength={120}
                />
              </label>
              <label className="span-two">
                Client
                <input
                  name="client"
                  defaultValue={edit?.client}
                  required
                  maxLength={120}
                />
              </label>
              <label>
                Shoot date
                <input name="date" type="date" defaultValue={edit?.date} />
              </label>
              <label>
                Status
                <select name="status" defaultValue={edit?.status || "Booked"}>
                  {["Booked", "Shooting", "Editing", "Delivered"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label>
                Project fee (£)
                <input
                  name="value"
                  type="number"
                  min="0"
                  max="10000000"
                  step="0.01"
                  defaultValue={edit?.value || 0}
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
              <button className="primary">Save project</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
