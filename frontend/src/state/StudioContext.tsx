import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  campaign: string;
  status: string;
  value: number;
  notes: string;
  created: string;
};
export type Campaign = {
  id: string;
  name: string;
  type: string;
  status: string;
  goal: number;
  sent: number;
};
export type Project = {
  id: string;
  name: string;
  client: string;
  date: string;
  status: string;
  value: number;
};
export type Task = { id: string; title: string; done: boolean };
type State = {
  leads: Lead[];
  campaigns: Campaign[];
  projects: Project[];
  tasks: Task[];
  activity: { id: string; text: string; time: string }[];
};
const now = new Date().toISOString();
const initial: State = {
  leads: [
    {
      id: "lead-1",
      name: "Bristol Society",
      company: "University society",
      email: "",
      phone: "",
      source: "Instagram",
      campaign: "camp-1",
      status: "New",
      value: 250,
      notes:
        "Example enquiry for a winter formal. Replace with your real lead.",
      created: now,
    },
    {
      id: "lead-2",
      name: "Theatre production team",
      company: "Student theatre",
      email: "",
      phone: "",
      source: "Referral",
      campaign: "",
      status: "Qualified",
      value: 400,
      notes: "Example enquiry for rehearsal and production photography.",
      created: now,
    },
    {
      id: "lead-3",
      name: "Corporate events team",
      company: "Bristol business",
      email: "",
      phone: "",
      source: "Website",
      campaign: "camp-2",
      status: "Contacted",
      value: 425,
      notes: "Example corporate event enquiry.",
      created: now,
    },
  ],
  campaigns: [
    {
      id: "camp-1",
      name: "Winter formals",
      type: "Instagram",
      status: "Running",
      goal: 30,
      sent: 0,
    },
    {
      id: "camp-2",
      name: "Bristol event outreach",
      type: "Email",
      status: "Paused",
      goal: 50,
      sent: 0,
    },
  ],
  projects: [
    {
      id: "project-1",
      name: "Winter formal",
      client: "Bristol society",
      date: "2026-11-27",
      status: "Booked",
      value: 250,
    },
    {
      id: "project-2",
      name: "Theatre production",
      client: "Student theatre",
      date: "2026-11-14",
      status: "Editing",
      value: 400,
    },
  ],
  tasks: [
    { id: "task-1", title: "Follow up on winter formal enquiry", done: false },
    {
      id: "task-2",
      title: "Prepare theatre photography proposal",
      done: false,
    },
    { id: "task-3", title: "Check delivery exports", done: false },
  ],
  activity: [
    {
      id: "act-1",
      text: "Demo workspace created. Replace examples with your own work.",
      time: now,
    },
  ],
};
function valid(s: any): s is State {
  return (
    s &&
    Array.isArray(s.leads) &&
    s.leads.every(
      (x: any) =>
        typeof x.id === "string" &&
        typeof x.name === "string" &&
        typeof x.company === "string" &&
        typeof x.status === "string" &&
        typeof x.value === "number",
    ) &&
    Array.isArray(s.campaigns) &&
    s.campaigns.every(
      (x: any) => typeof x.name === "string" && typeof x.goal === "number",
    ) &&
    Array.isArray(s.projects) &&
    s.projects.every(
      (x: any) => typeof x.name === "string" && typeof x.value === "number",
    ) &&
    Array.isArray(s.tasks) &&
    s.tasks.every((x: any) => typeof x.title === "string") &&
    Array.isArray(s.activity)
  );
}
const Context = createContext<{
  data: State;
  setData: React.Dispatch<React.SetStateAction<State>>;
  log: (text: string) => void;
  storageError: string;
} | null>(null);
export function StudioProvider({
  children,
  storageKey = "mrt-studio-v1",
}: {
  children: ReactNode;
  storageKey?: string;
}) {
  const [data, setData] = useState<State>(() => {
    try {
      const x = JSON.parse(localStorage.getItem(storageKey) || "null");
      return valid(x) ? x : initial;
    } catch {
      return initial;
    }
  });
  const [storageError, err] = useState("");
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      err("");
    } catch {
      err(
        "Browser storage is unavailable. Export your records before closing this page.",
      );
    }
  }, [data, storageKey]);
  function log(text: string) {
    setData((s) => ({
      ...s,
      activity: [
        { id: uid(), text, time: new Date().toISOString() },
        ...s.activity,
      ].slice(0, 80),
    }));
  }
  return (
    <Context.Provider value={{ data, setData, log, storageError }}>
      {children}
    </Context.Provider>
  );
}
export function useStudio() {
  const x = useContext(Context);
  if (!x) throw Error("Missing StudioProvider");
  return x;
}
export const stages = ["New", "Contacted", "Qualified", "Converted", "Lost"];
export const money = (n: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(n);
export function uid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}
