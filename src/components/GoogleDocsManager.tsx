import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Plus,
  RefreshCw,
  LogOut,
  ExternalLink,
  Import,
  CheckCircle2,
  AlertCircle,
  FileDown,
  ChevronRight,
  User as UserIcon,
  BookOpen
} from 'lucide-react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, googleLogout } from '../lib/googleAuth';
import {
  listGoogleDocs,
  getGoogleDoc,
  createGoogleDoc,
  GoogleDriveFile,
  GoogleDocTextContent
} from '../lib/googleDocs';

export interface GoogleDocsManagerProps {
  onImportDocToGraph?: (docTitle: string, docText: string, docId: string) => void;
  onExportGraphToDoc?: (title: string) => Promise<string>;
  isOpen?: boolean;
}

export const GoogleDocsManager: React.FC<GoogleDocsManagerProps> = ({
  onImportDocToGraph,
  onExportGraphToDoc,
  isOpen = true
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const [docsList, setDocsList] = useState<GoogleDriveFile[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [selectedDoc, setSelectedDoc] = useState<GoogleDocTextContent | null>(null);
  const [isLoadingSingleDoc, setIsLoadingSingleDoc] = useState<boolean>(false);

  const [newDocTitle, setNewDocTitle] = useState<string>('');
  const [newDocContent, setNewDocContent] = useState<string>('');
  const [isCreatingDoc, setIsCreatingDoc] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Initialize auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (u, token) => {
        setUser(u);
        setAccessToken(token);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const fetchDocs = useCallback(async (token: string, search?: string) => {
    setIsLoadingDocs(true);
    setErrorMsg(null);
    try {
      const files = await listGoogleDocs(token, search);
      setDocsList(files);
    } catch (err: any) {
      console.error('Fetch docs error:', err);
      setErrorMsg(err.message || 'Failed to load Google Docs.');
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchDocs(accessToken, searchQuery);
    }
  }, [accessToken, fetchDocs, searchQuery]);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setNeedsAuth(false);
        fetchDocs(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setErrorMsg('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await googleLogout();
    setUser(null);
    setAccessToken(null);
    setNeedsAuth(true);
    setDocsList([]);
    setSelectedDoc(null);
  };

  const handleSelectDoc = async (file: GoogleDriveFile) => {
    if (!accessToken) return;
    setIsLoadingSingleDoc(true);
    setErrorMsg(null);
    try {
      const docDetails = await getGoogleDoc(accessToken, file.id);
      setSelectedDoc(docDetails);
    } catch (err: any) {
      setErrorMsg(`Could not read "${file.name}": ${err.message}`);
    } finally {
      setIsLoadingSingleDoc(false);
    }
  };

  const handleImportToGraph = () => {
    if (!selectedDoc) return;
    if (onImportDocToGraph) {
      onImportDocToGraph(selectedDoc.title, selectedDoc.plainText, selectedDoc.documentId);
      setSuccessMsg(`Successfully imported "${selectedDoc.title}" into Knowledge Graph!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleCreateNewDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newDocTitle.trim()) return;

    setIsCreatingDoc(true);
    setErrorMsg(null);
    try {
      const newDoc = await createGoogleDoc(accessToken, newDocTitle.trim(), newDocContent);
      setSuccessMsg(`Created Google Doc "${newDoc.title}"!`);
      setShowCreateModal(false);
      setNewDocTitle('');
      setNewDocContent('');
      fetchDocs(accessToken);
      setSelectedDoc(newDoc);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(`Failed to create Google Doc: ${err.message}`);
    } finally {
      setIsCreatingDoc(false);
    }
  };

  const handleExportSynthesis = async () => {
    if (!accessToken) return;
    setIsCreatingDoc(true);
    setErrorMsg(null);
    try {
      let exportText = "Knowledge Graph Synthesis Export\n\nGenerated automatically from Nil.Experientia Sacra Analysis.";
      if (onExportGraphToDoc) {
        exportText = await onExportGraphToDoc("Graph Synthesis");
      }
      const title = `Graph Synthesis - ${new Date().toLocaleDateString()}`;
      const newDoc = await createGoogleDoc(accessToken, title, exportText);
      setSuccessMsg(`Exported Graph Synthesis to Google Doc "${title}"!`);
      fetchDocs(accessToken);
      setSelectedDoc(newDoc);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(`Export failed: ${err.message}`);
    } finally {
      setIsCreatingDoc(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-100 font-sans border-r border-neutral-850">
      {/* Header */}
      <div className="p-4 border-b border-neutral-850 bg-neutral-900/90 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              Google Docs Integration
            </h2>
            <p className="text-[11px] text-neutral-400 font-mono">
              Import research notes & export synthesis docs
            </p>
          </div>
        </div>

        {user && (
          <button
            onClick={handleSignOut}
            className="px-2.5 py-1 bg-neutral-850 hover:bg-neutral-800 border border-neutral-750 rounded-lg text-xs font-mono text-neutral-400 hover:text-rose-300 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Sign out of Google"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="flex-1">{successMsg}</span>
          </div>
        )}

        {/* Authentication Panel */}
        {needsAuth ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 bg-neutral-900/60 border border-neutral-850 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-200">Connect Google Workspace</h3>
              <p className="text-xs text-neutral-400 max-w-xs mt-1">
                Access your Google Docs directly inside Nil.Experientia Sacra to import raw notes or export graph synthesis notes with permission from your Google account.
              </p>
            </div>

            {/* Official Google Sign-In Button */}
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="inline-flex items-center justify-center bg-white hover:bg-neutral-100 text-neutral-800 font-sans text-xs font-semibold px-4 py-2.5 rounded-xl border border-neutral-300 shadow-md transition-all cursor-pointer disabled:opacity-50 gap-3"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="space-y-4">
            {/* User Profile Info Card */}
            <div className="p-3 bg-neutral-900/80 border border-neutral-850 rounded-xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2.5">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-7 h-7 rounded-full border border-neutral-700" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <div className="font-bold text-neutral-200">{user?.displayName || 'Google User'}</div>
                  <div className="text-[10px] text-neutral-400">{user?.email}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                Connected
              </span>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> New Google Doc
              </button>

              <button
                onClick={handleExportSynthesis}
                disabled={isCreatingDoc}
                className="p-2.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <FileDown className="w-4 h-4" /> Export Graph Doc
              </button>
            </div>

            {/* Search and Refresh Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Google Docs..."
                  className="w-full pl-8 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={() => accessToken && fetchDocs(accessToken, searchQuery)}
                className="p-2 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer"
                title="Refresh Documents"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDocs ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Docs List */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                <span>Your Google Docs ({docsList.length})</span>
              </div>

              {isLoadingDocs ? (
                <div className="p-8 text-center text-xs font-mono text-neutral-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                  Loading Google Docs...
                </div>
              ) : docsList.length === 0 ? (
                <div className="p-6 bg-neutral-900/40 border border-neutral-850 rounded-xl text-center text-xs text-neutral-500 font-mono">
                  No Google Docs found. Click "New Google Doc" above to create one.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {docsList.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => handleSelectDoc(file)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        selectedDoc?.documentId === file.id
                          ? 'bg-blue-500/15 border-blue-500/50 text-blue-200'
                          : 'bg-neutral-900/80 hover:bg-neutral-850 border-neutral-850 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 shrink-0 text-blue-400" />
                        <div className="truncate">
                          <div className="font-semibold text-xs truncate">{file.name}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            Modified: {new Date(file.modifiedTime).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 shrink-0 text-neutral-600 group-hover:text-blue-400 transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Document Preview & Import Section */}
            {isLoadingSingleDoc ? (
              <div className="p-6 bg-neutral-900 border border-neutral-850 rounded-xl text-center text-xs font-mono text-neutral-400">
                Reading document content...
              </div>
            ) : selectedDoc ? (
              <div className="p-3 bg-neutral-900/90 border border-blue-500/30 rounded-2xl space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <div className="truncate font-bold text-xs text-blue-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="truncate">{selectedDoc.title}</span>
                  </div>

                  <a
                    href={`https://docs.google.com/document/d/${selectedDoc.documentId}/edit`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-neutral-400 hover:text-blue-400 transition-colors"
                    title="Open in Google Docs web editor"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Plain Text Preview */}
                <div className="max-h-36 overflow-y-auto p-2 bg-neutral-950 border border-neutral-850 rounded-xl text-[11px] font-mono text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {selectedDoc.plainText ? selectedDoc.plainText : <span className="text-neutral-500 italic">Empty Document</span>}
                </div>

                {/* Import Action Button */}
                <button
                  onClick={handleImportToGraph}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Import className="w-3.5 h-3.5" /> Import Content to Knowledge Graph
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Modal for Creating Google Doc */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <h3 className="font-bold text-sm text-neutral-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" /> Create New Google Doc
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-500 hover:text-neutral-300 font-mono text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewDoc} className="space-y-3 font-mono">
              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g., Ontological Synthesis Notes"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-neutral-400 mb-1">Initial Text / Content (Optional)</label>
                <textarea
                  rows={4}
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  placeholder="Enter initial philosophical analysis or notes..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingDoc}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreatingDoc ? 'Creating...' : 'Create Doc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
