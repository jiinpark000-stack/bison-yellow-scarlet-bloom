import { useEffect, useRef } from "react";
import { toast } from "sonner";

function isInspectShortcut(e: KeyboardEvent) {
  const ctrl = e.ctrlKey || e.metaKey;
  const key = e.key;
  if (key === "F12") return true;
  if (ctrl && e.shiftKey && ["I", "J", "C", "K"].includes(key.toUpperCase())) return true;
  if (ctrl && key.toUpperCase() === "U") return true;
  return false;
}

export function InspectGuard() {
  const lastWarn = useRef(0);

  useEffect(() => {
    const warn = () => {
      const now = Date.now();
      if (now - lastWarn.current < 2500) return;
      lastWarn.current = now;
      toast.message("화면을 고쳐도 통장은 바뀌지 않아요. 숫자는 은행만 바꿔요.");
    };

    const onMenu = (e: MouseEvent) => {
      e.preventDefault();
      warn();
    };

    const onKey = (e: KeyboardEvent) => {
      if (!isInspectShortcut(e)) return;
      e.preventDefault();
      e.stopPropagation();
      warn();
    };

    document.addEventListener("contextmenu", onMenu);
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("contextmenu", onMenu);
      window.removeEventListener("keydown", onKey, true);
    };
  }, []);

  return null;
}
