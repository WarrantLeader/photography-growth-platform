import { useEffect, useRef, type ReactNode } from "react";
export function Icon({
  name,
  size = 19,
  ...props
}: {
  name: string;
  size?: number;
  [key: string]: any;
}) {
  const p: Record<string, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3m2-16a3 3 0 0 1 0 6m2 3a6 6 0 0 1 3 5v2" />
      </>
    ),
    folder: (
      <path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V3h8v4M3 12h18M10 12v3h4v-3" />
      </>
    ),
    campaign: (
      <>
        <path d="m3 10 18-7v16L3 14Zm4 6 2 6h4l-2-5M21 7v8" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h19M7 16v-5m5 5V7m5 9V4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2" />
      </>
    ),
    drive: (
      <>
        <path d="m6 4-4 11h20L18 4ZM2 15v5h20v-5M6 18h1m3 0h1" />
      </>
    ),
    arrow: <path d="M6 18 18 6M6 6h12v12" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    plus: <path d="M12 4v16M4 12h16" />,
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 6 6" />
      </>
    ),
    close: <path d="m5 5 14 14M5 19 19 5" />,
    check: <path d="m4 12 5 5L20 6" />,
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    list: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13M3 6h1m-1 6h1m-1 6h1" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8" cy="8" r="1" />
        <path d="m3 18 6-6 4 4 3-3 5 5" />
      </>
    ),
    file: (
      <>
        <path d="M5 2h9l5 5v15H5Zm9 0v6h5M8 12h8m-8 4h8" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 10a8 8 0 1 0-1 8M20 3v7h-7" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" />
      </>
    ),
    logout: (
      <>
        <path d="M9 3H3v18h6m5-15 6 6-6 6M8 12h12" />
      </>
    ),
    camera: (
      <>
        <circle cx="12" cy="13" r="4" />
        <path d="M3 6h4l2-3h6l2 3h4v15H3Z" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 2v6m10-6v6M3 11h18" />
      </>
    ),
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {p[name] || p.file}
    </svg>
  );
}
export function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark">
        <Icon name="camera" size={25} />
      </div>
      <div>
        mr t captures<small>STUDIO WORKSPACE</small>
      </div>
    </div>
  );
}
export function PageTitle({
  eyebrow = "YOUR STUDIO, IN FOCUS",
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>
          {title}
          <span>.</span>
        </h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Metric({
  title,
  value,
  detail,
  icon = "chart",
}: {
  title: string;
  value: string | number;
  detail: string;
  icon?: string;
}) {
  return (
    <div className="metric">
      <div className="metric-top">
        {title}
        <Icon name={icon} size={17} />
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
export function Badge({ status }: { status: string }) {
  return (
    <span className={"badge status-" + status.toLowerCase().replace(/ /g, "-")}>
      {status}
    </span>
  );
}
export function Empty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty">
      <Icon name="folder" size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    ref.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab") {
        const all = ref.current?.querySelectorAll<HTMLElement>(
          'button,a[href],input,select,textarea,[tabindex="0"]',
        );
        if (!all?.length) return;
        const first = all[0],
          last = all[all.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      prev?.focus();
    };
  }, []);
  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal"
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
