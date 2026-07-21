import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function getInitialTheme(): Theme {
  return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  return { theme, toggleTheme };
}
