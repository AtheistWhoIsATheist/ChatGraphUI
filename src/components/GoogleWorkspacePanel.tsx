import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, HardDrive, RefreshCw, Key, Search, Loader2, Sparkles, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight, DownloadCloud
} from 'lucide-react';
import { cn } from '../lib/utils';
import { IngestionFile } from '../utils/runIngestion';

interface GoogleFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  owners?: Array<{
    displayName: string;
    photoLink?: string;
    emailAddress?: string;
  }>;
}

interface GoogleWorkspacePanelProps {
  files: IngestionFile[];
  setFiles: React.Dispatch<React.SetStateAction<IngestionFile[]>>;
  onClose?: () => void;
}

export const GoogleWorkspacePanel: React.FC<GoogleWorkspacePanelProps> = ({
  files,
  setFiles,
  onClose
}) => {
  // State for Google Auth
  const [accessToken, setAccessToken] = useState<string>(() => {
    return localStorage.getItem('google_access_token') || '';
  });
  const [clientId, setClientId] = useState<string>(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('google_client_id') || '';
  });
  
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [driveFiles, setDriveFiles] = useState<GoogleFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [importingFileId, setImportingFileId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Load Google Identity Services script
  useEffect(() => {
    if ((window as any).google?.accounts?.oauth2) {
      setIsGsiLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGsiLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google Identity Services GSI script');
    };
    document.body.appendChild(script);

    return () => {
      // Keep script to avoid reloading
    };
  }, []);

  // Save changes to client configuration
  useEffect(() => {
    if (clientId) {
      localStorage.setItem('google_client_id', clientId);
    } else {
      localStorage.removeItem('google_client_id');
    }
  }, [clientId]);

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('google_access_token', accessToken);
    } else {
      localStorage.removeItem('google_access_token');
    }
  }, [accessToken]);

  // Handle GIS Authorization
  const handleConnectGoogle = () => {
    setErrorStatus(null);
    setSuccessMessage(null);
    const resolvedClientId = clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!resolvedClientId) {
      setErrorStatus("Google Client ID is missing. Supply it in Settings below or set VITE_GOOGLE_CLIENT_ID.");
      setShowSettings(true);
      return;
    }

    if (!(window as any).google?.accounts?.oauth2) {
      setErrorStatus("Google Auth library is not yet loaded in browser. Wait 2 seconds and retry.");
      return;
    }

    try {
      setIsLoading(true);
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: resolvedClientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/documents.readonly',
        callback: (resp: any) => {
          setIsLoading(false);
          if (resp.error) {
            setErrorStatus(`Authorization failed: ${resp.error_description || resp.error}`);
            return;
          }
          if (resp.access_token) {
            setAccessToken(resp.access_token);
            setSuccessMessage("Successfully authenticating credentials");
            fetchDriveFiles(resp.access_token);
          }
        },
      });
      tokenClient.requestAccessToken();
    } catch (e: any) {
      setIsLoading(false);
      setErrorStatus(`Failed to trigger OAuth popup: ${e.message}`);
    }
  };

  // Fetch from Google Drive API
  const fetchDriveFiles = async (token = accessToken) => {
    if (!token) return;
    setIsLoading(true);
    setErrorStatus(null);
    
    try {
      let q = "trashed = false and (mimeType = 'application/vnd.google-apps.document' or mimeType = 'text/plain' or mimeType = 'application/pdf')";
      if (searchQuery.trim()) {
        // Sanitize search query slightly
        const safeQuery = searchQuery.replace(/'/g, "\\'");
        q += ` and name contains '${safeQuery}'`;
      }

      const url = `https://www.googleapis.com/drive/v3/files?pageSize=40&fields=files(id,name,mimeType,size,modifiedTime,owners)&q=${encodeURIComponent(q)}`;
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Token expired
          setAccessToken('');
          throw new Error("Credentials expired. Please authorize again.");
        }
        const errPayload = await res.json().catch(() => ({}));
        throw new Error(errPayload.error?.message || `Drive API error (${res.status})`);
      }

      const data = await res.json();
      setDriveFiles(data.files || []);
    } catch (e: any) {
      console.error(e);
      setErrorStatus(e.message || "An error occurred fetching Drive contents.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear connection
  const handleDisconnect = () => {
    setAccessToken('');
    setDriveFiles([]);
    setSuccessMessage(null);
  };

  // Import Doc/File text substrate
  const handleImportFile = async (gFile: GoogleFile) => {
    if (!accessToken) return;
    setImportingFileId(gFile.id);
    setErrorStatus(null);
    setSuccessMessage(null);

    try {
      let textContent = "";
      
      if (gFile.mimeType === "application/vnd.google-apps.document") {
        // Fetch from Google Docs API
        const docUrl = `https://docs.googleapis.com/v1/documents/${gFile.id}`;
        const res = await fetch(docUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch Google Doc data: ${res.statusText}`);
        }

        const docData = await res.json();
        
        // Custom parser to map structural Google Doc JSON object into text lines
        textContent = parseGoogleDocJSON(docData);
      } else {
        // Plain text file - read alt=media from Drive API
        const fileMediaUrl = `https://www.googleapis.com/drive/v3/files/${gFile.id}?alt=media`;
        const res = await fetch(fileMediaUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!res.ok) {
          throw new Error(`Failed to extract raw media substrate: ${res.statusText}`);
        }

        textContent = await res.text();
      }

      if (!textContent.trim()) {
        throw new Error("Constructed substrate has 0 bytes or empty text corpus.");
      }

      // Convert loaded textContent to HTML/Text virtual IngestionFile
      const fileBlob = new Blob([textContent], { type: 'text/plain' });
      const virtualFile = new File([fileBlob], gFile.name + ".txt", { type: 'text/plain' });
      
      const newIngestFile: IngestionFile = {
        id: crypto.randomUUID(),
        name: `[GWorkspace] ${gFile.name}`,
        size: textContent.length,
        type: 'text/plain',
        status: 'loaded',
        uploadDate: new Date().toISOString(),
        raw: virtualFile
      };

      setFiles(prev => [newIngestFile, ...prev]);
      setSuccessMessage(`Corpus "${gFile.name}" loaded into Document Repository.`);
    } catch (e: any) {
      console.error(e);
      setErrorStatus(`Extraction failure: ${e.message}`);
    } finally {
      setImportingFileId(null);
    }
  };

  // Helper routine to convert complex nested structure of docs components into plain markdown-like string
  const parseGoogleDocJSON = (doc: any): string => {
    if (!doc || !doc.body || !doc.body.content) {
      return "";
    }
    
    let markdown = `# ${doc.title || 'Extracted Google Document'}\n\n`;
    const elements = doc.body.content;
    
    for (const el of elements) {
      if (el.paragraph) {
        let paraText = "";
        if (el.paragraph.elements) {
          for (const run of el.paragraph.elements) {
            if (run.textRun && run.textRun.content) {
              const content = run.textRun.content;
              const style = run.textRun.textStyle || {};
              
              if (style.bold && style.italic) {
                paraText += ` ***${content.trim()}*** `;
              } else if (style.bold) {
                paraText += ` **${content.trim()}** `;
              } else if (style.italic) {
                paraText += ` *${content.trim()}* `;
              } else {
                paraText += content;
              }
            }
          }
        }
        
        // Map native headers to markdown equivalents
        const styleId = el.paragraph.paragraphStyle?.namedStyleType;
        if (styleId === 'HEADING_1') {
          markdown += `\n\n## ${paraText.trim()}\n\n`;
        } else if (styleId === 'HEADING_2') {
          markdown += `\n\n### ${paraText.trim()}\n\n`;
        } else if (styleId === 'HEADING_3') {
          markdown += `\n\n#### ${paraText.trim()}\n\n`;
        } else {
          markdown += paraText;
        }
      } else if (el.table) {
        // Table fallback representation
        let tableRepr = "\n[Table Extracted]\n";
        if (el.table.tableRows) {
          for (const row of el.table.tableRows) {
            if (row.tableCells) {
              const cells = row.tableCells.map((cell: any) => {
                let cellText = "";
                if (cell.content) {
                  for (const cEl of cell.content) {
                    if (cEl.paragraph && cEl.paragraph.elements) {
                      cellText += cEl.paragraph.elements
                        .map((r: any) => r.textRun?.content || "")
                        .join("");
                    }
                  }
                }
                return cellText.trim().replace(/\n/g, " ");
              });
              tableRepr += `| ${cells.join(" | ")} |\n`;
            }
          }
        }
        markdown += tableRepr + "\n";
      }
    }
    
    return markdown;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 font-mono text-[11px] text-zinc-300">
      
      {/* Sub-Header */}
      <div className="p-4 bg-zinc-900/30 border-b border-white/5 flex flex-col gap-1.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span className="font-bold tracking-widest text-[10px] text-zinc-100 uppercase">GOOGLE WORKSPACE CONNECT</span>
          </div>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 px-2 border border-white/5 hover:border-emerald-500/20 bg-zinc-900 hover:text-white rounded text-[9px] font-mono tracking-wider transition-all duration-300 flex items-center gap-1.5"
          >
            <Key className="w-3 h-3 text-emerald-500" />
            SETTINGS
          </button>
        </div>
        <p className="text-[9px] text-zinc-500 leading-normal">
          Harvest research metadata directly from your cloud files. Parses headings, structural blocks, and custom annotations into nodes.
        </p>
      </div>

      {/* Advanced Settings Fold */}
      {showSettings && (
        <div className="p-4 bg-zinc-900/60 border-b border-white/5 flex flex-col gap-3 shrink-0">
          <div className="flex flex-col gap-1">
            <label className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">GOOGLE OAUTH CLIENT ID</label>
            <input 
              type="text" 
              placeholder="Supply VITE_GOOGLE_CLIENT_ID..."
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-zinc-950 p-2.5 border border-white/10 rounded-xl focus:border-emerald-500/30 text-white font-mono text-[10px] outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">MANUAL ACCESS TOKEN (FALLBACK)</label>
            <div className="flex gap-2">
              <input 
                type="password" 
                placeholder="Paste Access Token..."
                value={accessToken}
                onChange={(e) => {
                  setAccessToken(e.target.value);
                  if (e.target.value) {
                    setSuccessMessage("Manual entry loaded successfully");
                  }
                }}
                className="flex-1 bg-zinc-950 p-2.5 border border-white/10 rounded-xl focus:border-emerald-500/30 text-white font-mono text-[10px] outline-none placeholder:text-zinc-600"
              />
              {accessToken && (
                <button 
                  onClick={handleDisconnect}
                  className="px-3 bg-zinc-950 hover:bg-red-950/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-xl text-[9px] transition-all"
                >
                  CLEAR
                </button>
              )}
            </div>
            <p className="text-[8px] text-zinc-600">
              Useful if cross-origin cookies block authentication within the applet iframe.
            </p>
          </div>
        </div>
      )}

      {/* Connection Actions / Status bar */}
      <div className="p-4 border-b border-white/5 bg-zinc-950 shrink-0">
        {!accessToken ? (
          <button
            onClick={handleConnectGoogle}
            disabled={isLoading}
            className="w-full relative flex items-center justify-center gap-2.5 py-4 bg-zinc-900 border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-950/10 text-emerald-400 hover:text-emerald-300 text-[10px] uppercase font-bold tracking-widest rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.03)]"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <DownloadCloud className="w-3.5 h-3.5" />
            )}
            AUTHORIZE ACCOUNT SUBSTRATE
          </button>
        ) : (
          <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-emerald-500/10 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] text-emerald-400 tracking-wider font-bold">COOPERATIVE ACCESS ACTIVE</span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => fetchDriveFiles()}
                disabled={isLoading}
                className="p-1 px-2 border border-white/5 hover:border-emerald-500/20 bg-zinc-900 rounded hover:text-white transition-all flex items-center gap-1 text-[9px]"
              >
                <RefreshCw className={cn("w-2.5 h-2.5", isLoading && "animate-spin")} />
                SCAN
              </button>
              <button 
                onClick={handleDisconnect}
                className="p-1 px-2 border border-red-500/10 hover:border-red-500/30 bg-red-950/10 hover:bg-red-950/20 text-red-400 rounded transition-all text-[9px]"
              >
                DISCONNECT
              </button>
            </div>
          </div>
        )}

        {/* Info alerts */}
        {errorStatus && (
          <div className="mt-3 p-3 bg-red-950/10 border border-red-500/10 rounded-xl text-red-400 flex items-start gap-2 text-[9px] leading-relaxed">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{errorStatus}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-3 p-2.5 bg-emerald-950/10 border border-emerald-500/10 rounded-xl text-emerald-400 flex items-start gap-2 text-[9px] leading-relaxed">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* File Lister / Search */}
      {accessToken && (
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Scented Search Filter */}
          <div className="p-3 bg-zinc-900/10 border-b border-white/5 flex gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Sift Drive files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDriveFiles()}
                className="w-full bg-zinc-950 pl-8 pr-3 py-2 border border-white/5 rounded-xl text-[10px] font-mono outline-none focus:border-emerald-500/20 text-zinc-100"
              />
            </div>
            <button 
              onClick={() => fetchDriveFiles()}
              className="px-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 rounded-xl text-[9px] font-sans font-bold transition-colors"
            >
              FIND
            </button>
          </div>

          {/* Scrolling Result Substrate */}
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
            {isLoading && driveFiles.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center gap-2 text-zinc-500">
                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                <span className="text-[9px] uppercase tracking-widest">Retrieving cosmic records...</span>
              </div>
            ) : driveFiles.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center gap-1 text-zinc-600 text-center p-4">
                <HelpCircle className="w-6 h-6 text-zinc-700 mb-1" />
                <p className="text-[10px] font-bold text-zinc-500">Void is Empty</p>
                <p className="text-[8px] max-w-xs leading-normal">
                  No compatible text documents, PDFs, or Google Docs detected. Adjust your search parameters.
                </p>
              </div>
            ) : (
              driveFiles.map((gFile) => {
                const isImporting = importingFileId === gFile.id;
                const isDoc = gFile.mimeType === 'application/vnd.google-apps.document';
                
                return (
                  <div 
                    key={gFile.id}
                    className="p-3 bg-zinc-900/30 hover:bg-zinc-90 w-full border border-white/5 rounded-xl flex items-center justify-between gap-3 transition-colors duration-300 hover:scale-[1.01]"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-2 border border-white/10 bg-zinc-950 mt-0.5 shrink-0">
                        <FileText className={cn("w-3.5 h-3.5", isDoc ? "text-emerald-400" : "text-zinc-400")} />
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <span className="text-[11px] font-bold text-white tracking-wide truncate pr-2">
                          {gFile.name}
                        </span>
                        <div className="flex items-center gap-2 text-[8px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">
                          <span>{isDoc ? 'Google Doc' : 'Text corpus'}</span>
                          {gFile.size && (
                            <>
                              <span>•</span>
                              <span>{Math.round(parseInt(gFile.size) / 1024)} KB</span>
                            </>
                          )}
                          <span>•</span>
                          <span>{new Date(gFile.modifiedTime).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleImportFile(gFile)}
                      disabled={isImporting}
                      className="shrink-0 p-1.5 px-3 bg-zinc-950 hover:bg-emerald-950/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/50 rounded-lg text-[9px] font-bold tracking-wider transition-all flex items-center gap-1"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          IMPORTING...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-2.5 h-2.5" />
                          HARVEST
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
