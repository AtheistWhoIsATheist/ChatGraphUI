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
    <div className="flex flex-col h-full bg-zinc-950 font-mono relative overflow-y-auto custom-scrollbar p-8">
      <div className="max-w-6xl mx-auto w-full relative z-10">
        <h1 className="text-4xl font-serif font-semibold tracking-tighter text-zinc-200  border-b border-white/10 pb-2 inline-block">Knowledge Base :: Deep Ingestion</h1>
        <div className="text-sm text-zinc-300 font-mono  tracking-widest mt-3 bg-[#0a0a0a] inline-block px-3 py-1 border border-white/10">
          Status: Clinical Pipeline Active • Mode: Bulk Densification
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            enqueueFiles(Array.from(e.dataTransfer.files));
          }}
          className="mt-12 border border-dashed border-white/10 p-12 bg-black flex flex-col items-center justify-center gap-6 transition-colors hover:border-white/10 hover:bg-white/10 relative group overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiAvPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMzMzIiAvPgo8L3N2Zz4=')] opacity-30 pointer-events-none"></div>
          <div className="text-center z-10">
            <div className="text-2xl font-bold font-serif text-white tracking-widest  group-hover:text-zinc-200 transition-colors">Drop Files Into The Void</div>
            <div className="text-zinc-400 font-mono text-sm mt-3  tracking-wider">Supports: .txt .md .pdf .csv .json .docx</div>
          </div>
          <label className="cursor-pointer px-8 py-3 bg-zinc-950 border border-white/10 text-zinc-200 font-bold tracking-widest  hover:bg-zinc-200 text-black border-transparent hover:bg-zinc-300 hover:text-zinc-950 transition-all shadow-xl hover:shadow-xl z-10">
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
        <div className="mt-12 space-y-6">
          {queue.length === 0 ? (
            <div className="text-[#666] p-8 border-l border-white/5 font-mono  tracking-widest bg-zinc-900/40">
              System Null. The Engine is Idle.
            </div>
          ) : (
            <div className="grid gap-6">
              {queue.map((it) => (
                <div key={it.id} className="rounded-xl transition duration-300 backdrop-blur-md p-6 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#333] group-hover:bg-zinc-200 text-black border-transparent hover:bg-zinc-300 transition-colors"></div>
                  <div className="flex justify-between gap-4 items-start pl-4">
                    <div>
                      <div className="font-bold text-xl text-zinc-100 tracking-tight">{it.file.name}</div>
                      <div className="text-xs text-zinc-300 font-mono mt-2  tracking-widest">
                        [{it.status}] :: {it.message}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      {it.status === "AWAITING_REVIEW" && (
                        <button
                          onClick={() => openPreview(it.id)}
                          className="px-4 py-2 bg-transparent border border-white/10 text-zinc-300 hover:bg-zinc-800 text-white border-transparent hover:bg-zinc-700 hover:text-zinc-950 transition-colors text-xs font-bold font-mono  tracking-widest shadow-xl hover:shadow-none translate-x-[-2px] translate-y-[-2px] hover:translate-x-0 hover:translate-y-0"
                        >
                          Review Matrix
                        </button>
                      )}
                    </div>
                  </div>
 
                  <div className="mt-6 pl-4">
                    <div className="h-2 bg-white/5 w-full border border-white/5 overflow-hidden relative">
                      <div 
                        className="h-full transition-all duration-500 relative" 
                        style={{ 
                          width: `${it.progress}%`, 
                          backgroundColor: it.status === "FAILED" ? "#ef4444" : "#FF3A00" 
                        }} 
                      >
                         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJyZ2JhKDEsMSwxLDApIiAvPgo8cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSI0IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMykiIC8+Cjwvc3ZnPg==')] opacity-50"></div>
                      </div>
                    </div>
                    {it.error && <div className="mt-3 text-red-500 text-sm font-mono border-l-2 border-red-500 pl-2">{it.error}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {activePreview && (
          <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-md z-50 flex items-center justify-center p-6 border-8 border-white/10">
            <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-zinc-900/40 border border-white/10 shadow-xl relative">
              
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white/10 -translate-x-3 -translate-y-3"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white/10 translate-x-3 translate-y-3"></div>

              <div className="p-8 border-b-2 border-white/5 bg-zinc-950">
                <div className="text-3xl font-serif font-bold text-zinc-200 tracking-widest ">Entity Review Protocol</div>
                <div className="text-sm text-zinc-300 font-mono mt-2 flex items-center gap-3">
                  <span className="w-2 h-2 bg-zinc-800 text-white border-transparent hover:bg-zinc-700 animate-pulse"></span>
                  Target: {activePreview.file_name} • Verification Mandatory
                </div>
              </div>
 
              <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMwYTBhMGEiIC8+PGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEiIGZpbGw9IiMxYTFhMWEiIC8+PC9zdmc+')]">
                {activePreview.entities.map((e, idx) => (
                  <div key={idx} className="bg-zinc-950 border border-white/5 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 bg-white/5 border-b border-l border-white/5 text-[10px] text-zinc-300 font-mono">
                      CONFIDENCE: {(e.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="flex justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-mono text-xs text-zinc-200 bg-white/5 inline-block px-2 py-1 mb-3  tracking-widest">
                          [{e.kind}] • OP:{e.operation} • TRUTH_LOCK:{String(!!(e as any).hard_truth)}
                        </div>
                        <div className="text-xl font-bold text-white tracking-tight leading-tight">{e.name}</div>
                      </div>
                    </div>
 
                    <div className="mt-4 text-sm text-[#aaa] whitespace-pre-wrap font-mono leading-relaxed border-l-2 border-white/10 pl-4 bg-[#0a0a0a] p-3">
                      {"core_fracture" in e ? e.core_fracture.slice(0, 700) : e.statement.slice(0, 700)}
                      {("core_fracture" in e ? e.core_fracture.length : e.statement.length) > 700 ? "\n\n[WARNING: DATA TRUNCATED]" : ""}
                    </div>
                  </div>
                ))}
              </div>
 
              <div className="p-6 border-t-2 border-white/5 flex justify-end gap-6 bg-zinc-950">
                <button 
                  onClick={() => setActivePreview(null)} 
                  className="px-6 py-3 font-mono font-bold tracking-widest  border border-[#666] text-zinc-400 hover:text-white hover:border-white transition-colors"
                >
                  Abort
                </button>
                <button 
                  onClick={() => commitPreview(activePreview)} 
                  className="px-8 py-3 font-mono font-bold tracking-widest  bg-zinc-200 text-black border-transparent hover:bg-zinc-300 text-black border border-white/10 hover:bg-black hover:text-zinc-200 transition-colors shadow-xl hover:shadow-none translate-x-[-2px] translate-y-[-2px] hover:translate-x-0 hover:translate-y-0"
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
