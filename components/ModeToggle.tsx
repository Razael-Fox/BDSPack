"use client";

interface ModeToggleProps {
  mode: "A" | "B";
  onChange: (mode: "A" | "B") => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex bg-muted p-1 rounded-xl border border-border w-full max-w-md mx-auto">
      <button
        onClick={() => onChange("A")}
        className={`flex-1 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer text-center ${
          mode === "A"
            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
            : "text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
        }`}
      >
        Mode A: Generate Baru
      </button>
      <button
        onClick={() => onChange("B")}
        className={`flex-1 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-pointer text-center ${
          mode === "B"
            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
            : "text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
        }`}
      >
        Mode B: Append JSON
      </button>
    </div>
  );
}
