import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { PageTitle, Icon, Modal, Empty } from "../components/UI";
import { useStudio } from "../state/StudioContext";
type Entry = {
  name: string;
  kind: string;
  handle?: any;
  file?: File;
  size?: number;
};
const kind = (f: File) =>
  f.type.startsWith("image/")
    ? "image"
    : f.type.startsWith("video/")
      ? "video"
      : "file";
const size = (n: number) =>
  n > 1e9
    ? (n / 1e9).toFixed(1) + " GB"
    : n > 1e6
      ? (n / 1e6).toFixed(1) + " MB"
      : Math.max(1, Math.round(n / 1000)) + " KB";
export default function ProjectFiles() {
  const { data } = useStudio();
  const [params, setParams] = useSearchParams();
  const project = params.get("project") || data.projects[0]?.id || "";
  const [connections, C] = useState<
    Record<
      string,
      { root: any; entries: Entry[]; path: { name: string; handle: any }[] }
    >
  >({});
  const current = connections[project];
  const [query, Q] = useState(""),
    [filter, F] = useState("All files"),
    [grid, G] = useState(true),
    [modal, M] = useState(false),
    [error, E] = useState(""),
    [busy, B] = useState(false),
    [host, H] = useState(() => {
      try {
        return localStorage.getItem("mrt-nas-host") || "";
      } catch {
        return "";
      }
    }),
    [message, T] = useState("");
  const [preview, V] = useState<{ entry: Entry; url: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );
  useEffect(() => {
    Q("");
    F("All files");
  }, [project]);
  async function read(h: any) {
    const list: Entry[] = [];
    for await (const [name, handle] of h.entries()) {
      if (handle.kind === "directory")
        list.push({ name, handle, kind: "folder" });
      else {
        const file = await handle.getFile();
        list.push({ name, handle, file, kind: kind(file), size: file.size });
      }
    }
    return list.sort(
      (a, b) =>
        Number(a.kind !== "folder") - Number(b.kind !== "folder") ||
        a.name.localeCompare(b.name),
    );
  }
  async function connect() {
    E("");
    if (!project) {
      E("Create a project first.");
      return;
    }
    if (!(window as any).showDirectoryPicker) {
      input.current?.click();
      return;
    }
    B(true);
    try {
      const root = await (window as any).showDirectoryPicker({ mode: "read" });
      const entries = await read(root);
      C((s) => ({ ...s, [project]: { root, entries, path: [] } }));
      M(false);
      T("Project folder connected for this session.");
    } catch (e: any) {
      if (e.name !== "AbortError")
        E(
          "Folder access failed. Mount your NAS share and select the folder again.",
        );
    } finally {
      B(false);
    }
  }
  async function browse(h: any, path: { name: string; handle: any }[]) {
    try {
      const entries = await read(h);
      C((s) => ({ ...s, [project]: { ...s[project], entries, path } }));
      E("");
    } catch {
      E("Folder is unavailable. Check your network or reconnect the share.");
    }
  }
  function fallback(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = Array.from(e.target.files || []);
    if (!fs.length) return;
    C((s) => ({
      ...s,
      [project]: {
        root: { name: fs[0].webkitRelativePath.split("/")[0] },
        path: [],
        entries: fs.map((file) => ({
          name: file.webkitRelativePath.split("/").slice(1).join("/"),
          file,
          kind: kind(file),
          size: file.size,
        })),
      },
    }));
    M(false);
    T("Folder imported. Reselect the folder to refresh its contents.");
    e.target.value = "";
  }
  function open(x: Entry) {
    if (x.kind === "folder") {
      browse(x.handle, [...current.path, { name: x.name, handle: x.handle }]);
      return;
    }
    if (x.file) V({ entry: x, url: URL.createObjectURL(x.file) });
  }
  function saveHost() {
    try {
      const u = new URL(host);
      if (!["http:", "https:"].includes(u.protocol) || u.username || u.password)
        throw Error();
      localStorage.setItem("mrt-nas-host", u.href);
      H(u.href);
      E("");
      T("NAS web shortcut saved.");
    } catch {
      E("Enter a valid HTTP or HTTPS address without a username or password.");
    }
  }
  const validHost = (() => {
    try {
      const u = new URL(host);
      return (
        ["http:", "https:"].includes(u.protocol) && !u.username && !u.password
      );
    } catch {
      return false;
    }
  })();
  const shown = (current?.entries || []).filter(
    (x) =>
      x.name.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All files" ||
        (filter === "Folders" && x.kind === "folder") ||
        (filter === "Images" && x.kind === "image") ||
        (filter === "Video" && x.kind === "video") ||
        (filter === "Documents" && x.kind === "file")),
  );
  return (
    <>
      <PageTitle
        title="Project files"
        description="From the first frame to the final delivery."
        action={
          <button className="primary" onClick={() => M(true)}>
            <Icon name="drive" size={16} />
            {current ? "Manage connection" : "Connect NAS"}
            <Icon name="arrow" size={16} />
          </button>
        }
      />
      <div className="connection-banner">
        <div className="drive-tile">
          <Icon name="drive" size={30} />
        </div>
        <div>
          <h2>
            Your studio, connected.{" "}
            <span className={"badge " + (current ? "status-running" : "")}>
              {current ? "Folder connected" : "Not connected"}
            </span>
          </h2>
          <p>
            {current
              ? "Browsing " + current.root.name + " on this device."
              : "Open your UGREEN NAS project share directly from your computer."}
          </p>
          <small>UGREEN NASync · Local network or Tailscale · Read-only</small>
        </div>
        <button className="secondary" onClick={() => M(true)}>
          Connection details
          <Icon name="chevron" size={14} />
        </button>
      </div>
      <section className="panel project-selector">
        <div className="project-icon">
          <Icon name="camera" size={25} />
        </div>
        <div>
          <label htmlFor="project-select" className="eyebrow">
            PROJECT WORKSPACE
          </label>
          <select
            id="project-select"
            value={project}
            onChange={(e) => {
              setParams({ project: e.target.value });
              T("");
              E("");
            }}
          >
            {data.projects.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
            {!data.projects.length && <option value="">No projects yet</option>}
          </select>
          <p>
            {data.projects.find((p) => p.id === project)?.client ||
              "Create a project to organise your files."}
          </p>
        </div>
        <Link to="/projects" className="text-link">
          Manage projects
          <Icon name="arrow" size={14} />
        </Link>
      </section>
      <div className="section-heading">
        <div>
          <h2>
            Files & folders <span className="count">{shown.length}</span>
          </h2>
          <p>Your selected files stay on your NAS.</p>
        </div>
        <div className="row-actions">
          <button
            className="icon-button outlined"
            aria-label="Refresh folder"
            disabled={!current}
            onClick={() =>
              current?.root.entries
                ? browse(
                    current.path.at(-1)?.handle || current.root,
                    current.path,
                  )
                : connect()
            }
          >
            <Icon name="refresh" size={16} />
          </button>
          <button className="secondary" onClick={connect} disabled={!project}>
            <Icon name="folder" size={16} />
            Select folder
          </button>
        </div>
      </div>
      <div className="file-toolbar">
        <div className="search">
          <Icon name="search" size={17} />
          <input
            aria-label="Search files"
            placeholder="Search this folder..."
            value={query}
            onChange={(e) => Q(e.target.value)}
          />
        </div>
        <div className="tabs compact">
          {["All files", "Folders", "Images", "Documents", "Video"].map((s) => (
            <button
              key={s}
              className={filter === s ? "selected" : ""}
              onClick={() => F(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="view-toggle">
          <button
            aria-label="Grid view"
            className={grid ? "selected" : ""}
            onClick={() => G(true)}
          >
            <Icon name="grid" size={17} />
          </button>
          <button
            aria-label="List view"
            className={!grid ? "selected" : ""}
            onClick={() => G(false)}
          >
            <Icon name="list" size={17} />
          </button>
        </div>
      </div>
      {current && (
        <div className="breadcrumbs">
          <button
            onClick={() =>
              current.root.entries
                ? browse(current.root, [])
                : T(
                    "Imported folders show file paths. Reselect the folder to refresh.",
                  )
            }
          >
            <Icon name="drive" size={13} />
            {current.root.name}
          </button>
          {current.path.map((p, i) => (
            <span key={i}>
              <Icon name="chevron" size={12} />
              <button
                onClick={() => browse(p.handle, current.path.slice(0, i + 1))}
              >
                {p.name}
              </button>
            </span>
          ))}
        </div>
      )}
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="file-message" role="status">
          {message}
        </div>
      )}
      {current ? (
        shown.length ? (
          <div className={"file-grid " + (!grid ? "file-list" : "")}>
            {shown.map((x) => (
              <button
                className={"file-card " + x.kind}
                key={x.name}
                onClick={() => open(x)}
              >
                <Icon
                  name={
                    x.kind === "folder"
                      ? "folder"
                      : x.kind === "image"
                        ? "image"
                        : "file"
                  }
                  size={grid ? 36 : 23}
                />
                <div>
                  <h3>{x.name}</h3>
                  <p>{x.kind === "folder" ? "Folder" : size(x.size || 0)}</p>
                </div>
                <Icon name="chevron" size={14} />
              </button>
            ))}
          </div>
        ) : (
          <Empty
            title="No files found"
            description="This folder is empty or no files match your filters."
          />
        )
      ) : (
        <div className="file-empty">
          <div className="empty">
            <Icon name="folder" size={38} />
            <h3>A home for every part of your shoot</h3>
            <p>
              Connect a mounted NAS folder to browse your real project files.
            </p>
            <button className="primary" onClick={connect} disabled={!project}>
              Choose project folder
              <Icon name="arrow" size={15} />
            </button>
          </div>
          <div className="folder-guide">
            {["01_RAW", "02_Selects", "03_Edits", "04_Delivery"].map((n) => (
              <div key={n}>
                <Icon name="folder" size={25} />
                <span>{n}</span>
              </div>
            ))}
          </div>
          <small>
            Suggested structure. No folders are created or uploaded.
          </small>
        </div>
      )}
      <div className="file-footer">
        <span>
          <Icon name="check" size={14} />
          Read-only folder access
        </span>
        <span>No uploads. No duplicate storage.</span>
      </div>
      {modal && (
        <Modal title="Connect your UGREEN NAS" onClose={() => M(false)}>
          <p>
            Mount your NAS share on this computer, then select the folder for
            this gig.
          </p>
          <ol className="connection-steps">
            <li>Join your NAS network, or connect through Tailscale.</li>
            <li>
              Mount the SMB share in Finder or File Explorer using your NAS
              account.
            </li>
            <li>Select the project folder and allow read access.</li>
          </ol>
          <button
            className="primary full"
            onClick={connect}
            disabled={!project || busy}
          >
            <Icon name="folder" size={17} />
            {busy ? "Opening folder…" : "Choose mounted NAS folder"}
          </button>
          <p className="small-note">
            Desktop Chrome and Edge support direct folder browsing. Other
            browsers use folder import. Reconnect after reloading this page.
          </p>
          <hr />
          <h3>UGREEN web shortcut</h3>
          <label>
            NAS web address
            <input
              placeholder="https://your-nas-address:port"
              value={host}
              onChange={(e) => H(e.target.value)}
            />
          </label>
          <div className="row-actions">
            <button className="secondary" onClick={saveHost}>
              Save address
            </button>
            {validHost && (
              <a
                className="secondary"
                href={host}
                target="_blank"
                rel="noreferrer"
              >
                Open UGOS
                <Icon name="arrow" size={14} />
              </a>
            )}
          </div>
          <p className="small-note">
            The shortcut opens UGOS separately. This page does not log in to
            UGOS or connect over SMB directly.
          </p>
          {current && (
            <button
              className="text-link disconnect"
              onClick={() => {
                C((s) => {
                  const next = { ...s };
                  delete next[project];
                  return next;
                });
                M(false);
                T("Folder disconnected.");
              }}
            >
              Disconnect this project folder
            </button>
          )}
          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}
        </Modal>
      )}
      {preview && (
        <Modal title={preview.entry.name} onClose={() => V(null)}>
          {preview.entry.kind === "image" ? (
            <img
              className="file-preview"
              src={preview.url}
              alt={preview.entry.name}
            />
          ) : preview.entry.kind === "video" ? (
            <video className="file-preview" src={preview.url} controls />
          ) : (
            <p>Download this file to open it in its original application.</p>
          )}
          <a
            className="primary"
            href={preview.url}
            download={preview.entry.file?.name}
          >
            <Icon name="download" size={16} />
            Download file
          </a>
        </Modal>
      )}
      <input
        ref={input}
        type="file"
        multiple
        {...({ webkitdirectory: "" } as any)}
        hidden
        onChange={fallback}
      />
    </>
  );
}
