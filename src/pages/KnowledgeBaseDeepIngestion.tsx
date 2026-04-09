import React, { useMemo, useState } from "react";

type SupportedExt = "txt" | "md" | "pdf" | "csv" | "json" | "docx";

type QueueStatus =
  | "QUEUED"
  | "EXTRACTING"
  | "MAPPING"
  | "AWAITING_REVIEW"
  | "COMMITTING"
  | "COMPLETE"
  | "FAILED";

type ProposedEntity =
  | {
      kind: "rpe";
      entity_id?: string;
      name: string;
      core_fracture: string;
      source_file: string;
      une_signature?: string;
      transcendence_score?: number;
      void_resonance?: number;
      aporia_markers?: string[];
      metadata?: Record<string, unknown>;
      hard_truth?: boolean; // true if from csv/json
      operation: "insert" | "update" | "merge";
      confidence: number;
    }
  | {
      kind: "axiom";
      entity_id?: string;
      name: string;
      statement: string;
      source_file: string;
      metadata?: Record<string, unknown>;
      hard_truth?: boolean;
      operation: "insert" | "update" | "merge";
      confidence: number;
    };

type MappingPreview = {
  file_id: string;
  file_name: string;
  file_type: string;
  entities: ProposedEntity[];
  graph_links: Array<{
    source_entity_type: "axiom";
    source_entity_id: "AXIOM-PRIMARY-SOURCE";
    target_entity_type: "file";
    target_entity_id: string; // FILE::<sha>
    relation: "PRIMARY_SOURCE_OF";
  }>;
};

type QueueItem = {
  id: string;
  file: File;
  ext: SupportedExt;
  status: QueueStatus;
  progress: number; // 0..100
  message: string;
  preview?: MappingPreview;
  error?: string;
};

function extOf(name: string): SupportedExt | null {
  const ext = name.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  if (["txt", "md", "pdf", "csv", "json", "docx"].includes(ext)) return ext as SupportedExt;
  return null;
}

export default function KnowledgeBaseDeepIngestion() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [activePreview, setActivePreview] = useState<MappingPreview | null>(null);

  const enqueueFiles = (files: File[]) => {
    const items: QueueItem[] = [];
    for (const f of files) {
      const ext = extOf(f.name);
      if (!ext) continue;
      items.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        file: f,
        ext,
        status: "QUEUED",
        progress: 0,
        message: "Queued for densification…",
      });
    }
    setQueue((q) => [...q, ...items]);
    items.forEach((it) => processOne(it));
  };

  const processOne = async (item: QueueItem) => {
    try {
      setQueue((q) =>
        q.map((x) =>
          x.id === item.id ? { ...x, status: "EXTRACTING", progress: 15, message: "Extracting substrate…" } : x
        )
      );

      // 1) Extract text (layout-aware where feasible)
      const extracted = await extractClientSide(item.file, item.ext);

      setQueue((q) =>
        q.map((x) =>
          x.id === item.id ? { ...x, status: "MAPPING", progress: 55, message: "Scanning for Void Resonance…" } : x
        )
      );

      // 2) Ask backend to map into schema (no DB writes yet)
      const preview = await requestMappingPreview({
        file_name: item.file.name,
        file_type: item.ext,
        extracted,
      });

      setQueue((q) =>
        q.map((x) =>
          x.id === item.id
            ? { ...x, status: "AWAITING_REVIEW", progress: 80, message: "Awaiting human verification.", preview }
            : x
        )
      );
    } catch (e: any) {
      setQueue((q) =>
        q.map((x) =>
          x.id === item.id
            ? { ...x, status: "FAILED", progress: 100, message: "Void rupture detected.", error: e?.message ?? String(e) }
            : x
        )
      );
    }
  };

  const openPreview = (id: string) => {
    const it = queue.find((q) => q.id === id);
    if (it?.preview) setActivePreview(it.preview);
  };

  const commitPreview = async (preview: MappingPreview) => {
    // Update UI to committing
    setQueue((q) =>
      q.map((x) => (x.id === preview.file_id ? { ...x, status: "COMMITTING", progress: 90, message: "Committing to the graph…" } : x))
    );

    await commitToIngestion(preview);

    setQueue((q) =>
      q.map((x) =>
        x.id === preview.file_id ? { ...x, status: "COMPLETE", progress: 100, message: "Densification complete." } : x
      )
    );
    setActivePreview(null);
  };

  return (
    <div className="flex flex-col h-full neo-bg font-sans relative overflow-y-auto custom-scrollbar p-8">
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-serif tracking-widest text-zinc-200 uppercase">Knowledge Base :: Deep Ingestion</h1>
        <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-2">
          Status: clinical pipeline active • mode: bulk densification
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            enqueueFiles(Array.from(e.dataTransfer.files));
          }}
          className="mt-8 border border-dashed border-white/10 rounded-2xl p-8 bg-black/20 flex flex-col items-center justify-center gap-4 transition-colors hover:bg-black/40"
        >
          <div className="text-center">
            <div className="font-semibold text-zinc-300">Drop files into the void</div>
            <div className="text-zinc-500 text-sm mt-1">Supports: .txt .md .pdf .csv .json .docx</div>
          </div>
          <label className="cursor-pointer px-4 py-2 border border-white/10 rounded-xl text-zinc-300 hover:text-orange-400 hover:border-orange-500/30 transition-colors neo-convex">
            Select Files
            <input
              type="file"
              multiple
              accept=".txt,.md,.pdf,.csv,.json,.docx"
              className="hidden"
              onChange={(e) => enqueueFiles(Array.from(e.target.files ?? []))}
            />
          </label>
        </div>

        {/* Queue */}
        <div className="mt-8 space-y-4">
          {queue.length === 0 ? (
            <div className="text-zinc-600 p-6 border border-white/5 rounded-2xl text-center neo-flat">
              No artifacts queued. The engine is idle.
            </div>
          ) : (
            <div className="grid gap-4">
              {queue.map((it) => (
                <div key={it.id} className="border border-white/5 rounded-2xl p-5 neo-flat">
                  <div className="flex justify-between gap-4 items-start">
                    <div>
                      <div className="font-semibold text-zinc-200">{it.file.name}</div>
                      <div className="text-xs text-zinc-500 font-mono mt-1">
                        {it.status} :: {it.message}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      {it.status === "AWAITING_REVIEW" && (
                        <button
                          onClick={() => openPreview(it.id)}
                          className="px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors text-xs font-mono uppercase tracking-wider"
                        >
                          Mapping Preview
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-1.5 bg-black/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500" 
                        style={{ 
                          width: `${it.progress}%`, 
                          backgroundColor: it.status === "FAILED" ? "#ef4444" : "#f97316" 
                        }} 
                      />
                    </div>
                    {it.error && <div className="mt-2 text-red-400 text-xs font-mono">{it.error}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {activePreview && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl">
              <div className="p-6 border-b border-white/5">
                <div className="text-xl font-serif text-zinc-200">Mapping Preview</div>
                <div className="text-xs text-zinc-500 font-mono mt-1">
                  File: {activePreview.file_name} • verify categorization before commit
                </div>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                {activePreview.entities.map((e, idx) => (
                  <div key={idx} className="border border-white/5 rounded-xl p-4 neo-flat">
                    <div className="flex justify-between gap-4">
                      <div>
                        <div className="font-mono text-[10px] text-orange-500/80 uppercase tracking-widest">
                          {e.kind} • {e.operation} • hard_truth={String(!!(e as any).hard_truth)}
                        </div>
                        <div className="mt-2 font-semibold text-zinc-200">{e.name}</div>
                      </div>
                      <div className="text-right font-mono text-xs text-zinc-500">
                        confidence={(e.confidence * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed">
                      {"core_fracture" in e ? e.core_fracture.slice(0, 700) : e.statement.slice(0, 700)}
                      {("core_fracture" in e ? e.core_fracture.length : e.statement.length) > 700 ? "\n…[truncated]" : ""}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/20">
                <button 
                  onClick={() => setActivePreview(null)} 
                  className="px-4 py-2 rounded-xl border border-white/10 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => commitPreview(activePreview)} 
                  className="px-4 py-2 rounded-xl bg-orange-500 text-black font-semibold hover:bg-orange-400 transition-colors"
                >
                  Commit Densification
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** CLIENT-SIDE EXTRACTION (layout-aware where feasible) */
async function extractClientSide(file: File, ext: SupportedExt): Promise<{
  text: string;
  layout?: { headings?: Array<{ level: number; text: string; offset: number }> };
  structured?: any;
}> {
  if (ext === "json") {
    const text = await file.text();
    return { text, structured: JSON.parse(text) };
  }
  if (ext === "csv") {
    const text = await file.text();
    return { text, structured: text };
  }
  if (ext === "txt" || ext === "md") {
    const text = await file.text();
    return { text };
  }

  // pdf/docx: implement real extractors in your app:
  // - PDF: pdfjs-dist (extract per-page text, preserve heading heuristics)
  // - DOCX: mammoth (extract headings/paragraphs)
  // Here we fall back to raw bytes -> (not useful) placeholder:
  const fallback = await file.text().catch(() => "");
  return { text: fallback };
}

async function requestMappingPreview(payload: {
  file_name: string;
  file_type: SupportedExt;
  extracted: { text: string; layout?: any; structured?: any };
}): Promise<MappingPreview> {
  const res = await fetch("/functions/v1/ingest-philosophical-data?mode=preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function commitToIngestion(preview: MappingPreview) {
  const res = await fetch("/functions/v1/ingest-philosophical-data?mode=commit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preview),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
