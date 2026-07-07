"use client";

import { PackEntry } from "@/lib/utils";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";

interface PackListProps {
  packs: PackEntry[];
  type: "behavior" | "resource";
  onReorder: (index: number, direction: "up" | "down") => void;
  onDelete: (index: number) => void;
}

export default function PackList({
  packs,
  type,
  onReorder,
  onDelete,
}: PackListProps) {
  return (
    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
      {packs.length === 0 ? (
        <div className="text-center py-8 text-foreground/45 border border-dashed border-border rounded-xl">
          Belum ada {type === "behavior" ? "Behavior" : "Resource"} Pack yang
          ditambahkan.
        </div>
      ) : (
        packs.map((pack, index) => (
          <div
            key={`${pack.pack_id}-${index}`}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              pack.isNew
                ? "bg-secondary/5 border-secondary/30 dark:bg-secondary/10 shadow-[inset_0_0_8px_rgba(234,179,8,0.05)]"
                : "bg-muted/50 border-border"
            }`}
          >
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm truncate">
                  {pack.name || "Unnamed Pack"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    type === "behavior"
                      ? "bg-primary text-white font-sans"
                      : "bg-secondary text-black font-sans"
                  }`}
                >
                  {type === "behavior" ? "BP" : "RP"}
                </span>
                {pack.isNew && (
                  <span className="bg-green-500/10 text-green-500 dark:bg-green-500/20 border border-green-500/30 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">
                    New
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground/60 truncate font-mono mt-0.5">
                UUID: {pack.pack_id}
              </p>
              <p className="text-xs text-foreground/50 truncate">
                Version: {pack.version.join(".")}
              </p>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => onReorder(index, "up")}
                disabled={index === 0}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed"
                title="Move Up"
              >
                <ArrowUp className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => onReorder(index, "down")}
                disabled={index === packs.length - 1}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed"
                title="Move Down"
              >
                <ArrowDown className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => onDelete(index)}
                className="p-1.5 hover:bg-destructive/10 text-destructive rounded-md transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
