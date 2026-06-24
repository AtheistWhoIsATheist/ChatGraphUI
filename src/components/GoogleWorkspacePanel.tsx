import React, { useState, useEffect } from 'react';
import { 
  FileText, HardDrive, RefreshCw, Key, Search, Loader2, Sparkles, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight, DownloadCloud,
  Table, Play, Folder, Settings, ExternalLink, SlidersHorizontal, Info, ChevronRight, FolderOpen, ArrowUpCircle, HardDriveUpload
} from 'lucide-react';
import { cn } from '../lib/utils';
import { IngestionFile } from '../utils/runIngestion';
import { useAppStore } from '../store/appStore';
import { useSynthesisStore } from '../store/synthesisStore';

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

type FilterType = 'all' | 'doc' | 'sheet' | 'slide' | 'pdf' | 'text';

export const GoogleWorkspacePanel: React.FC<GoogleWorkspacePanelProps> = ({
  files,
  setFiles,
  onClose
}) => {
  // Retrieve global store capabilities for sync orchestration
  const { 
    nodes, links,
    setGDriveConnected,
    setGDriveSyncStatus,
    setGDriveSyncMessage,
    gdriveSyncStatus
  } = useAppStore();

  // Retrieve current synthesis reports
  const synthesisText = useSynthesisStore((state) => state.synthesis);
  const synthesisMessages = useSynthesisStore((state) => state.messages);

  // State for Google Auth
  const [accessToken, setAccessToken] = useState<string>(() => {
    return localStorage.getItem('google_access_token') || '';
  });
  const [clientId, setClientId] = useState<string>(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('google_client_id') || '';
  });
  
  // File Browser Breadcrumbs Stack
  const [pathStack, setPathStack] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'My Drive' }
  ]);
  const currentFolder = pathStack[pathStack.length - 1];

  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [driveFiles, setDriveFiles] = useState<GoogleFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [importingFileId, setImportingFileId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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
  }, []);

  // Save changes to client configuration
  useEffect(() => {
    if (clientId) {
      localStorage.setItem('google_client_id', clientId);
    } else {
      localStorage.removeItem('google_client_id');
    }
  }, [clientId]);

  // Synchronize Google Connection State with AppStore
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('google_access_token', accessToken);
      setGDriveConnected(true);
    } else {
      localStorage.removeItem('google_access_token');
      setGDriveConnected(false);
    }
  }, [accessToken, setGDriveConnected]);

  // Refetch when path stack or filter type changes
  useEffect(() => {
    if (accessToken) {
      fetchDriveFiles(accessToken, currentFolder.id);
    }
  }, [pathStack, filterType]);

  // Handle GIS Authorization
  const handleConnectGoogle = () => {
    setErrorStatus(null);
    setSuccessMessage(null);
    const resolvedClientId = clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!resolvedClientId) {
      setErrorStatus("Google Client ID is missing. Supply it in Settings below or configure VITE_GOOGLE_CLIENT_ID.");
      setShowSettings(true);
      return;
    }

    if (!(window as any).google?.accounts?.oauth2) {
      setErrorStatus("Google Auth library is not yet loaded in browser. Wait a brief moment and retry.");
      return;
    }

    try {
      setIsLoading(true);
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: resolvedClientId,
        scope: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.readonly'
        ].join(' '),
        callback: (resp: any) => {
          setIsLoading(false);
          if (resp.error) {
            setErrorStatus(`Authorization failed: ${resp.error_description || resp.error}`);
            return;
          }
          if (resp.access_token) {
            setAccessToken(resp.access_token);
            setSuccessMessage("Google connection successfully established.");
            fetchDriveFiles(resp.access_token, currentFolder.id);
          }
        },
      });
      tokenClient.requestAccessToken();
    } catch (e: any) {
      setIsLoading(false);
      setErrorStatus(`Failed to trigger OAuth popup: ${e.message}`);
    }
  };

  // Fetch from Google Drive API scoped to current path stack directory
  const fetchDriveFiles = async (token = accessToken, folderId = currentFolder.id) => {
    if (!token) return;
    setIsLoading(true);
    setGDriveSyncStatus('scanning');
    setGDriveSyncMessage(`Scanning directory: "${currentFolder.name}"...`);
    setErrorStatus(null);
    
    try {
      const mimeTypesMap = {
        doc: "(mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/vnd.google-apps.folder')",
        sheet: "(mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'application/vnd.google-apps.folder')",
        slide: "(mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/vnd.google-apps.folder')",
        pdf: "(mimeType = 'application/pdf' or mimeType = 'application/vnd.google-apps.folder')",
        text: "(mimeType = 'text/plain' or mimeType = 'application/vnd.google-apps.folder')",
        all: "(mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/pdf' or mimeType = 'text/plain' or mimeType = 'application/vnd.google-apps.folder')"
      };

      let q = `'${folderId}' in parents and trashed = false and ${mimeTypesMap[filterType]}`;
      if (searchQuery.trim()) {
        const safeQuery = searchQuery.replace(/'/g, "\\'");
        q += ` and name contains '${safeQuery}'`;
      }

      const url = `https://www.googleapis.com/drive/v3/files?pageSize=80&fields=files(id,name,mimeType,size,modifiedTime,owners)&q=${encodeURIComponent(q)}`;
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          setAccessToken('');
          throw new Error("Credentials expired or invalid. Please authorize again.");
        }
        const errPayload = await res.json().catch(() => ({}));
        throw new Error(errPayload.error?.message || `Drive API error (${res.status})`);
      }

      const data = await res.json();
      
      // Sort: Directories first, then alphabetically
      const sorted = (data.files || []).sort((a: any, b: any) => {
        const isAFolder = a.mimeType === 'application/vnd.google-apps.folder';
        const isBFolder = b.mimeType === 'application/vnd.google-apps.folder';
        if (isAFolder && !isBFolder) return -1;
        if (!isAFolder && isBFolder) return 1;
        return a.name.localeCompare(b.name);
      });

      setDriveFiles(sorted);
      setGDriveSyncStatus('idle');
      setGDriveSyncMessage('');
    } catch (e: any) {
      console.error(e);
      setErrorStatus(e.message || "An error occurred fetching Drive contents.");
      setGDriveSyncStatus('error');
      setGDriveSyncMessage(e.message || "Fetch fault.");
    } finally {
      setIsLoading(false);
    }
  };

  // Directory Browser Traversal Helpers
  const handleEnterFolder = (id: string, name: string) => {
    setPathStack(prev => [...prev, { id, name }]);
    setSearchQuery('');
  };

  const handleNavigateToBreadcrumb = (index: number) => {
    setPathStack(prev => prev.slice(0, index + 1));
    setSearchQuery('');
  };

  const handleGoUp = () => {
    if (pathStack.length > 1) {
      setPathStack(prev => prev.slice(0, -1));
      setSearchQuery('');
    }
  };

  // Direct export of Knowledge Graph and Synthesis to Google Drive
  const handleExportToGDrive = async (targetFolderId?: string, targetFolderName?: string) => {
    if (!accessToken) return;
    
    const folderId = targetFolderId || currentFolder.id;
    const folderName = targetFolderName || currentFolder.name;
    
    setGDriveSyncStatus('exporting');
    setGDriveSyncMessage(`Preparing export bundle for folder "${folderName}"...`);
    setErrorStatus(null);
    setSuccessMessage(null);

    try {
      let finalFolderId = folderId;
      
      // If exporting to a specific auto-created folder at the root
      if (targetFolderName === 'REN-Analysis-Exports') {
        setGDriveSyncMessage('Searching for "REN-Analysis-Exports" folder...');
        const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent("name = 'REN-Analysis-Exports' and mimeType = 'application/vnd.google-apps.folder' and trashed = false")}`;
        const searchRes = await fetch(searchUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!searchRes.ok) {
          throw new Error("Failed to query existing export directories.");
        }
        
        const searchData = await searchRes.json();
        if (searchData.files && searchData.files.length > 0) {
          finalFolderId = searchData.files[0].id;
          setGDriveSyncMessage('Existing directory located.');
        } else {
          setGDriveSyncMessage('Creating "REN-Analysis-Exports" directory...');
          const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: "REN-Analysis-Exports",
              mimeType: "application/vnd.google-apps.folder",
              parents: ["root"]
            })
          });
          
          if (!createRes.ok) {
            throw new Error("Directory creation transaction rejected.");
          }
          
          const createData = await createRes.json();
          finalFolderId = createData.id;
          setGDriveSyncMessage('Created "REN-Analysis-Exports" directory.');
        }
      }

      // Bundle structure with complete graph state + synthesis reports
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        version: "2.1.0",
        graph: {
          nodeCount: nodes.length,
          linkCount: links.length,
          nodes,
          links
        },
        synthesis: {
          current: synthesisText || '',
          messages: synthesisMessages || []
        }
      };

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `ren_analysis_bundle_${timestamp}.json`;
      setGDriveSyncMessage(`Uploading analysis bundle: ${filename}...`);

      const boundary = "314_ren_boundary_314";
      const metadata = {
        name: filename,
        parents: [finalFolderId],
        mimeType: "application/json"
      };

      const multipartBody = 
        `\r\n--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\n` +
        `Content-Type: application/json\r\n\r\n` +
        `${JSON.stringify(exportPayload, null, 2)}\r\n` +
        `--${boundary}--`;

      const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: multipartBody
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload transaction rejected (${uploadRes.status})`);
      }

      setGDriveSyncStatus('success');
      setGDriveSyncMessage(`Exported successfully to Google Drive.`);
      setSuccessMessage(`Graph & reports exported successfully as "${filename}"`);
      
      // Auto-refresh file listing
      setTimeout(() => {
        fetchDriveFiles(accessToken, currentFolder.id);
      }, 1500);

    } catch (e: any) {
      console.error(e);
      setGDriveSyncStatus('error');
      setGDriveSyncMessage(e.message || "Failed to execute Google Drive export.");
      setErrorStatus(`Export failed: ${e.message}`);
    }
  };

  // Clear connection
  const handleDisconnect = () => {
    setAccessToken('');
    setDriveFiles([]);
    setSuccessMessage(null);
    setGDriveConnected(false);
  };

  // Import Doc/Sheet/Slide or file text substrate
  const handleImportFile = async (gFile: GoogleFile) => {
    if (!accessToken) return;
    setImportingFileId(gFile.id);
    setGDriveSyncStatus('importing');
    setGDriveSyncMessage(`Harvesting raw substrate: "${gFile.name}"...`);
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
          throw new Error(`Failed to fetch Google Doc: ${res.statusText}`);
        }

        const docData = await res.json();
        textContent = parseGoogleDocJSON(docData);

      } else if (gFile.mimeType === "application/vnd.google-apps.spreadsheet") {
        // Parse Google Spreadsheet Grid
        textContent = await parseGoogleSheetValues(gFile.id, accessToken);

      } else if (gFile.mimeType === "application/vnd.google-apps.presentation") {
        // Parse Google Presentation Slides
        textContent = await parseGoogleSlidePresentation(gFile.id, accessToken);

      } else {
        // Plain text file or PDF - read alt=media from Drive API
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
        throw new Error("Extracted text is empty or has 0 bytes.");
      }

      // Convert to HTML/Text virtual IngestionFile
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
      setGDriveSyncStatus('success');
      setGDriveSyncMessage(`Import complete.`);
      setSuccessMessage(`Substrate "${gFile.name}" loaded into Document Repository.`);
    } catch (e: any) {
      console.error(e);
      setGDriveSyncStatus('error');
      setGDriveSyncMessage(e.message || "Extraction error.");
      setErrorStatus(`Extraction failure: ${e.message}`);
    } finally {
      setImportingFileId(null);
    }
  };

  // Parser for Google Sheets values into Markdown tables
  const parseGoogleSheetValues = async (spreadsheetId: string, token: string): Promise<string> => {
    try {
      const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
      const metaRes = await fetch(metaUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!metaRes.ok) {
        throw new Error(`Spreadsheet metadata fetch failed: ${metaRes.statusText}`);
      }
      const metadata = await metaRes.json();
      const sheets = metadata.sheets || [];
      if (sheets.length === 0) return "Empty Spreadsheet";

      let fullMarkdown = `# Spreadsheet: ${metadata.properties?.title || 'Untitled Sheet'}\n\n`;

      for (const sheet of sheets) {
        const sheetTitle = sheet.properties?.title;
        if (!sheetTitle) continue;

        const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetTitle)}!A1:Z1000?valueRenderOption=FORMATTED_VALUE`;
        const valuesRes = await fetch(valuesUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!valuesRes.ok) {
          console.warn(`Failed to fetch values for tab: ${sheetTitle}`);
          continue;
        }

        const data = await valuesRes.json();
        const rows = data.values || [];

        fullMarkdown += `## Sheet Tab: ${sheetTitle}\n\n`;

        if (rows.length === 0) {
          fullMarkdown += "*No data in this sheet tab*\n\n";
          continue;
        }

        const maxCols = Math.max(...rows.map((r: any[]) => r.length));
        const headerRow = rows[0];
        const headers = Array.from({ length: maxCols }, (_, i) => {
          return (headerRow[i] !== undefined && headerRow[i] !== null) ? String(headerRow[i]).trim() : `Column ${i + 1}`;
        });
        
        fullMarkdown += `| ${headers.join(" | ")} |\n`;
        fullMarkdown += `| ${Array(maxCols).fill("---").join(" | ")} |\n`;

        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];
          const cells = Array.from({ length: maxCols }, (_, i) => {
            return (row[i] !== undefined && row[i] !== null) ? String(row[i]).trim().replace(/\|/g, "\\|").replace(/\n/g, " ") : "";
          });
          fullMarkdown += `| ${cells.join(" | ")} |\n`;
        }
        fullMarkdown += "\n\n";
      }

      return fullMarkdown;
    } catch (err: any) {
      console.error(err);
      throw new Error(`Failed parsing Google Sheet: ${err.message}`);
    }
  };

  // Parser for Google Slides presentations into Markdown sections
  const parseGoogleSlidePresentation = async (presentationId: string, token: string): Promise<string> => {
    try {
      const url = `https://slides.googleapis.com/v1/presentations/${presentationId}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error(`Presentation fetch failed: ${res.statusText}`);
      }
      const presentation = await res.json();
      const slides = presentation.slides || [];
      if (slides.length === 0) return "Empty Presentation";

      let fullMarkdown = `# Presentation: ${presentation.title || 'Untitled Slides'}\n\n`;

      slides.forEach((slide: any, index: number) => {
        fullMarkdown += `## Slide ${index + 1}\n\n`;
        const pageElements = slide.pageElements || [];
        const texts: string[] = [];

        for (const el of pageElements) {
          if (el.shape && el.shape.text && el.shape.text.textElements) {
            const textParts = el.shape.text.textElements
              .map((te: any) => te.textRun?.content || "")
              .join("")
              .trim();
            if (textParts) {
              texts.push(textParts);
            }
          }
        }

        if (texts.length === 0) {
          fullMarkdown += "*Blank Slide*\n\n";
        } else {
          texts.forEach(txt => {
            const lines = txt.split('\n').map(l => l.trim()).filter(Boolean);
            lines.forEach((line, lineIdx) => {
              if (lineIdx === 0 && line.length < 100 && !line.startsWith('-') && !line.startsWith('*')) {
                fullMarkdown += `### ${line}\n`;
              } else {
                fullMarkdown += `- ${line}\n`;
              }
            });
            fullMarkdown += "\n";
          });
        }
        fullMarkdown += "\n";
      });

      return fullMarkdown;
    } catch (err: any) {
      console.error(err);
      throw new Error(`Failed parsing Google Slide: ${err.message}`);
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
          
          <div className="flex gap-1.5">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="p-1 px-2 border border-white/5 hover:border-emerald-500/20 bg-zinc-900 hover:text-white rounded text-[9px] font-mono tracking-wider transition-all duration-300 flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              HELP GUIDE
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 px-2 border border-white/5 hover:border-emerald-500/20 bg-zinc-900 hover:text-white rounded text-[9px] font-mono tracking-wider transition-all duration-300 flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-500" />
              SETTINGS
            </button>
          </div>
        </div>
        <p className="text-[9px] text-zinc-500 leading-normal">
          Harvest knowledge, structured tables, and slideshow contents or export research graphs and reports directly.
        </p>
      </div>

      {/* Help Instructions Card */}
      {showHelp && (
        <div className="p-4 bg-zinc-900/80 border-b border-white/5 flex flex-col gap-3 shrink-0 text-zinc-300">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
            <Info className="w-4 h-4" />
            <span>HOW TO ACCESS GOOGLE WORKSPACE SUBSTRATE</span>
          </div>
          <div className="space-y-2 text-[9px] text-zinc-400 leading-relaxed">
            <p>
              <strong className="text-white">Option A: Automatic Authorization (OAuth)</strong>
              <br />
              1. Open <strong className="text-white">SETTINGS</strong>.
              <br />
              2. Supply your GCP OAuth <strong className="text-white">Client ID</strong>.
              <br />
              3. Click the green <strong className="text-white">AUTHORIZE</strong> button to trigger the secure login popup.
            </p>
            <p>
              <strong className="text-white">Option B: Manual Access Token Fallback (Instant Setup)</strong>
              <br />
              If you block cross-origin cookies or prefer local direct tokens:
              <br />
              1. Head to <a href="https://developers.google.com/oauthplayground/" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline inline-flex items-center gap-0.5">OAuth Playground <ExternalLink className="w-2.5 h-2.5" /></a>.
              <br />
              2. Select <strong className="text-zinc-300">Drive API v3</strong> read/write scopes.
              <br />
              3. Authorize, exchange code, and paste the <strong className="text-white">Access Token</strong> directly into Settings.
            </p>
          </div>
        </div>
      )}

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
                    setSuccessMessage("Manual direct token connection loaded.");
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
              Useful if security settings or sandbox origins block the GSI login popup.
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
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-3 bg-zinc-900/50 border border-emerald-500/10 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-emerald-400 tracking-wider font-bold animate-pulse">COOPERATIVE ACCESS ACTIVE</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => fetchDriveFiles(accessToken, currentFolder.id)}
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

            {/* Quick Export Panel Options */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleExportToGDrive()}
                disabled={gdriveSyncStatus === 'exporting'}
                className="py-2.5 bg-zinc-900 hover:bg-emerald-950/15 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl text-[9px] font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5"
                title={`Export graph and synthesis to folder: ${currentFolder.name}`}
              >
                {gdriveSyncStatus === 'exporting' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <HardDriveUpload className="w-3 h-3" />
                )}
                EXPORT TO "{currentFolder.name.substring(0, 10)}{currentFolder.name.length > 10 ? '..' : ''}"
              </button>

              <button
                onClick={() => handleExportToGDrive('root', 'REN-Analysis-Exports')}
                disabled={gdriveSyncStatus === 'exporting'}
                className="py-2.5 bg-zinc-900 hover:bg-emerald-950/15 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl text-[9px] font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5"
                title="Create and export directly into standard 'REN-Analysis-Exports' root directory"
              >
                {gdriveSyncStatus === 'exporting' ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <FolderOpen className="w-3 h-3 text-emerald-500" />
                )}
                EXPORT TO "REN-EXPORTS"
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

      {/* Directory Navigation Breadcrumbs */}
      {accessToken && (
        <div className="px-4 py-2.5 bg-zinc-900/30 border-b border-white/5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap custom-scrollbar pr-2 py-0.5">
            <Folder className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            {pathStack.map((folder, index) => (
              <React.Fragment key={folder.id}>
                {index > 0 && <span className="text-zinc-600 font-sans text-[8px]">/</span>}
                <button
                  onClick={() => handleNavigateToBreadcrumb(index)}
                  disabled={index === pathStack.length - 1}
                  className={cn(
                    "text-[9px] uppercase tracking-wider transition-colors",
                    index === pathStack.length - 1 
                      ? "text-emerald-400 font-bold" 
                      : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>
          
          {pathStack.length > 1 && (
            <button
              onClick={handleGoUp}
              className="px-2 py-0.5 border border-white/5 bg-zinc-900 hover:border-emerald-500/20 text-zinc-400 hover:text-white rounded-lg text-[8px] uppercase tracking-widest font-bold transition-all shrink-0"
            >
              GO UP
            </button>
          )}
        </div>
      )}

      {/* File Lister / Search */}
      {accessToken && (
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Scented Search Filter */}
          <div className="p-3 bg-zinc-900/10 border-b border-white/5 flex gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" />
              <input 
                type="text" 
                placeholder={`Search inside ${currentFolder.name}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDriveFiles(accessToken, currentFolder.id)}
                className="w-full bg-zinc-950 pl-8 pr-3 py-2 border border-white/5 rounded-xl text-[10px] font-mono outline-none focus:border-emerald-500/20 text-zinc-100"
              />
            </div>
            <button 
              onClick={() => fetchDriveFiles(accessToken, currentFolder.id)}
              className="px-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 rounded-xl text-[9px] font-sans font-bold transition-colors flex items-center gap-1"
            >
              <SlidersHorizontal className="w-2.5 h-2.5" />
              Sift
            </button>
          </div>

          {/* File Type Filter Tabs */}
          <div className="px-3 py-2 bg-zinc-900/10 border-b border-white/5 flex gap-1.5 overflow-x-auto shrink-0 custom-scrollbar">
            {(['all', 'doc', 'sheet', 'slide', 'pdf', 'text'] as const).map((type) => {
              const labelMap = {
                all: 'All Files',
                doc: 'Docs',
                sheet: 'Sheets',
                slide: 'Slides',
                pdf: 'PDFs',
                text: 'TXT'
              };
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[9px] font-mono tracking-wider transition-all uppercase shrink-0 border",
                    filterType === type 
                      ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400 font-bold" 
                      : "bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-zinc-800"
                  )}
                >
                  {labelMap[type]}
                </button>
              );
            })}
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
                  No files or directories matching this criteria detected in "{currentFolder.name}".
                </p>
              </div>
            ) : (
              driveFiles.map((gFile) => {
                const isImporting = importingFileId === gFile.id;
                const isFolder = gFile.mimeType === 'application/vnd.google-apps.folder';
                const isDoc = gFile.mimeType === 'application/vnd.google-apps.document';
                const isSheet = gFile.mimeType === 'application/vnd.google-apps.spreadsheet';
                const isSlide = gFile.mimeType === 'application/vnd.google-apps.presentation';
                const isPdf = gFile.mimeType === 'application/pdf';
                
                let FileIconComponent = FileText;
                let fileColorClass = "text-zinc-400";
                let typeLabel = "Plain Text";
                
                if (isFolder) {
                  FileIconComponent = Folder;
                  fileColorClass = "text-amber-500";
                  typeLabel = "Directory";
                } else if (isDoc) {
                  FileIconComponent = FileText;
                  fileColorClass = "text-blue-400";
                  typeLabel = "Google Doc";
                } else if (isSheet) {
                  FileIconComponent = Table;
                  fileColorClass = "text-emerald-400";
                  typeLabel = "Google Sheet";
                } else if (isSlide) {
                  FileIconComponent = Play;
                  fileColorClass = "text-amber-400";
                  typeLabel = "Google Slides";
                } else if (isPdf) {
                  FileIconComponent = FileText;
                  fileColorClass = "text-red-400";
                  typeLabel = "PDF Document";
                }
                
                return (
                  <div 
                    key={gFile.id}
                    className={cn(
                      "p-3 bg-zinc-900/30 hover:bg-zinc-900/60 w-full border rounded-xl flex items-center justify-between gap-3 transition-all duration-300 hover:scale-[1.01]",
                      isFolder 
                        ? "border-amber-500/10 hover:border-amber-500/30 cursor-pointer" 
                        : "border-white/5 hover:border-emerald-500/10"
                    )}
                    onClick={() => isFolder && handleEnterFolder(gFile.id, gFile.name)}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="p-2 border border-white/10 bg-zinc-950 mt-0.5 shrink-0 rounded-lg">
                        <FileIconComponent className={cn("w-3.5 h-3.5", fileColorClass)} />
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <span className="text-[11px] font-bold text-white tracking-wide truncate pr-2">
                          {gFile.name}
                        </span>
                        <div className="flex items-center gap-2 text-[8px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">
                          <span className={cn("font-semibold", fileColorClass)}>{typeLabel}</span>
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

                    {isFolder ? (
                      <button
                        className="shrink-0 p-1.5 px-3 bg-zinc-950 hover:bg-amber-950/20 text-amber-500 hover:text-amber-400 border border-amber-500/20 hover:border-amber-500/50 rounded-lg text-[9px] font-bold tracking-wider transition-all flex items-center gap-1"
                      >
                        <ChevronRight className="w-2.5 h-2.5" />
                        OPEN
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Stop folder enter triggers
                          handleImportFile(gFile);
                        }}
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
                    )}
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
