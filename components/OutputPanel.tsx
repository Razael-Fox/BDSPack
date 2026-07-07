"use client";

import { useState } from "react";
import { Download, Clipboard, Check, Eye, List } from "lucide-react";
import { formatJson } from "@/lib/prettier";
import { PackEntry } from "@/lib/utils";

interface OutputPanelProps {
  jsonValue: string;
  fileName: string;
  packs?: PackEntry[]; // For visual diff/summary in Mode B
  showDiff?: boolean;
}

export default function OutputPanel({
  jsonValue,
  fileName,
  packs = [],
  showDiff = false,
}: OutputPanelProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"raw" | "summary">("raw");

  const handleCopy = async () => {
    setLoading(true);
    const formatted = await formatJson(jsonValue);
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    const formatted = await formatJson(jsonValue);
    try {
      const blob = new Blob([formatted], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border bg-muted/20 rounded-xl p-4 flex flex-col h-full space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">
            Output File
          </span>
          <span className="text-sm font-bold font-mono text-primary">
            {fileName}
          </span>
        </div>

        <div className="flex space-x-2">
          {showDiff && packs.length > 0 && (
            <div className="flex bg-muted p-0.5 rounded-lg border border-border mr-2 text-xs">
              <button
                onClick={() => setActiveTab("raw")}
                className={`px-2.5 py-1 rounded-md flex items-center space-x-1 cursor-pointer transition-all ${
                  activeTab === "raw"
                    ? "bg-background shadow-sm text-foreground font-semibold"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Raw JSON</span>
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-2.5 py-1 rounded-md flex items-center space-x-1 cursor-pointer transition-all ${
                  activeTab === "summary"
                    ? "bg-background shadow-sm text-foreground font-semibold"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Diff Summary</span>
              </button>
            </div>
          )}

          <button
            onClick={handleCopy}
            disabled={loading || !jsonValue}
            className="p-2 bg-muted hover:bg-black/5 dark:hover:bg-white/5 rounded-lg border border-border cursor-pointer transition-colors"
            title="Copy to Clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Clipboard className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={loading || !jsonValue}
            className="flex items-center space-x-1.5 py-1.5 px-3 bg-primary text-white hover:bg-opacity-95 rounded-lg text-xs font-bold transition-all shadow-md shadow-primary/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-[#050505] border border-border rounded-xl p-3 overflow-auto max-h-[350px] min-h-[200px] flex flex-col">
        {activeTab === "raw" || !showDiff || packs.length === 0 ? (
          <pre className="text-xs font-mono whitespace-pre text-foreground/80 flex-1">
            {jsonValue || "// Output JSON akan tampil di sini..."}
          </pre>
        ) : (
          <div className="space-y-2 flex-1 text-xs">
            <h4 className="font-semibold text-foreground/60 border-b border-border pb-1">
              Perubahan Entry JSON:
            </h4>
            <div className="space-y-1.5">
              {packs.map((pack, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border flex items-center justify-between ${
                    pack.isNew
                      ? "bg-green-500/5 dark:bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 font-semibold"
                      : "bg-muted/30 border-border text-foreground/75"
                  }`}
                >
                  <div className="truncate flex-1">
                    <span className="font-mono">{pack.pack_id}</span>
                    <span className="text-[10px] opacity-60 ml-2">
                      v{pack.version.join(".")}
                    </span>
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded">
                    {pack.isNew ? "+ Added" : "Unchanged"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
