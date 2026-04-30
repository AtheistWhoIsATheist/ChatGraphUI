import React, { useEffect, useState } from 'react';
import { bbClient, ButterbaseRecord } from '../lib/client';
import { Loader2, Plus, Trash2, Upload } from 'lucide-react';

export function ButterbaseDashboard({ onLogout }: { onLogout: () => void }) {
  const [records, setRecords] = useState<ButterbaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newVal, setNewVal] = useState('');
  const [uploading, setUploading] = useState(false);

  const mainTable = 'main_table';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await bbClient.fetchRecords(mainTable);
      setRecords(data);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVal.trim()) return;
    try {
      await bbClient.createRecord(mainTable, { title: newVal });
      setNewVal('');
      loadData();
    } catch (e: any) {
      setError(e.message || 'Failed to create record.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await bbClient.deleteRecord(mainTable, id);
      loadData();
    } catch (e: any) {
      setError(e.message || 'Failed to delete record.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      await bbClient.uploadFile(e.target.files[0]);
      alert('File uploaded successfully!');
    } catch (e: any) {
      setError(e.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-xl font-bold tracking-tight">Butterbase Dashboard</h1>
          <button onClick={onLogout} className="text-sm text-gray-500 hover:text-gray-900 transition font-medium">Log out</button>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold">{mainTable} Records</h2>
                <button onClick={loadData} className="text-xs text-blue-600 hover:text-blue-700 font-medium tracking-wide uppercase">Refresh</button>
              </div>
              <div className="p-4">
                {loading ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                ) : records.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No records found. Create one.</p>
                ) : (
                  <ul className="space-y-2">
                    {records.map(r => (
                      <li key={r.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition group">
                        <span className="font-medium text-sm">{r.title || JSON.stringify(r)}</span>
                        <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                type="text"
                placeholder="New record title..."
                value={newVal}
                onChange={e => setNewVal(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
              <button disabled={!newVal.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold mb-4 text-sm tracking-wide text-gray-500 uppercase">Storage</h3>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 hover:bg-gray-50 hover:border-blue-300 transition cursor-pointer group">
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mb-2 transition" />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition">Upload File</span>
                  </>
                )}
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
