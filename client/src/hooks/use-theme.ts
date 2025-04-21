import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Intentar obtener el tema del localStorage
    const savedTheme = localStorage.getItem("theme") as Theme;
    // Verificar preferencia del sistema si no hay tema guardado
    if (!savedTheme) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return savedTheme;
  });

  useEffect(() => {
    // Actualizar el DOM y localStorage cuando cambie el tema
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === "light" ? "dark" : "light");
  };

  return { theme, toggleTheme };
} 