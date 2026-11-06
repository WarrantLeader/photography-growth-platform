import { useAuth } from "../auth/AuthContext";
import { useState } from "react";
import { PageTitle, Icon } from "../components/UI";
import { useStudio } from "../state/StudioContext";
export default function Settings() {
  const { data } = useStudio();
  const auth = useAuth();
  const [theme, S] = useState(
    document.documentElement.dataset.theme || "light",
  );
  const [message, M] = useState("");
  function changeTheme(t: string) {
    S(t);
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("mrt-theme", t);
      M("Appearance saved.");
    } catch {
      M("Appearance changed for this session.");
    }
  }
  function download() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            format: "mrt-studio-export",
            version: 1,
            exportedAt: new Date().toISOString(),
            ...data,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "mrt-studio-records-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    M("Workspace records exported. NAS files are not included.");
  }
  return (
    <>
      <PageTitle
        title="Settings"
        description="Make this workspace feel like your studio."
      />
      <div className="settings-stack">
        <section className="panel">
          <h2>Appearance</h2>
          <p>Choose how your studio looks on this device.</p>
          <div className="theme-options">
            {["light", "dark"].map((t) => (
              <button
                key={t}
                className={"theme-choice " + (theme === t ? "chosen" : "")}
                onClick={() => changeTheme(t)}
              >
                <span className={"theme-sample " + t}>
                  <i />
                  <i />
                  <i />
                </span>
                <span>
                  {t === "light" ? "Light studio" : "Dark studio"}
                  {theme === t && <Icon name="check" size={16} />}
                </span>
              </button>
            ))}
          </div>
        </section>
        <section className="panel settings-row">
          <div>
            <h2>Your workspace records</h2>
            <p>
              Export leads, campaigns, projects, tasks and activity as JSON.
            </p>
            <small>
              Records save only in this browser. Export a backup before clearing
              browser data.
            </small>
          </div>
          <button className="secondary" onClick={download}>
            <Icon name="download" size={16} />
            Export records
          </button>
        </section>
        <section className="panel">
          <h2>Account & integrations</h2>
          <dl className="details">
            <div>
              <dt>Workspace</dt>
              <dd>Mr T Captures</dd>
            </div>
            <div>
              <dt>Account mode</dt>
              <dd>{auth?.demo ? "Browser demo" : "Provider sign-in"}</dd>
            </div>
            <div>
              <dt>NAS access</dt>
              <dd>Read-only mounted folder</dd>
            </div>
            <div>
              <dt>Email & Instagram</dt>
              <dd>No sending or scraping integration</dd>
            </div>
          </dl>
          <p>
            Provider sign-in and live invoices need connected services. Other
            CRM records remain saved on this device.
          </p>
        </section>
      </div>
      {message && (
        <div className="notice" role="status">
          {message}
        </div>
      )}
    </>
  );
}
