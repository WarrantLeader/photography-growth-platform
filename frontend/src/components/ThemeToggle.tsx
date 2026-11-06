import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDark(true);

      document.documentElement.classList.add("dark");
    }
  }, []);

  function toggleTheme() {
    if (dark) {
      document.documentElement.classList.remove("dark");

      localStorage.setItem("theme", "light");

      setDark(false);
    } else {
      document.documentElement.classList.add("dark");

      localStorage.setItem("theme", "dark");

      setDark(true);
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 rounded-lg px-4 py-2 hover:bg-slate-800"
    >
      {dark ? "☀ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}
