import React from 'react';
import { Settings, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="w-full h-full flex bg-[#0D0D0D]">
      {/* Settings Navigation */}
      <div className="w-48 bg-[#121212] border-r border-[#1E1E1E] p-4 flex flex-col gap-2 shrink-0">
        {['General', 'Voice', 'Ingestion', 'Display', 'Boundary', 'Export', 'About'].map(section => (
          <button key={section} className="text-left px-3 py-2 rounded-lg text-xs font-mono tracking-widest uppercase hover:bg-[#1E1E1E] text-[#8A8278] hover:text-[#C8C0B0] transition-colors">
            {section}
          </button>
        ))}
      </div>
      
      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-6">
            <h1 className="text-xl font-display text-[#C8C0B0] flex items-center gap-3">
              <Settings className="w-6 h-6 text-[#C8C0B0]" />
              Settings
            </h1>
            <button className="px-4 py-2 bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#3A6A3A] border border-[#2A3A2A] rounded-xl transition-colors flex items-center gap-2 text-xs font-mono uppercase tracking-widest font-bold">
              <Save className="w-3 h-3" /> Save Changes
            </button>
          </div>
          
          <div className="flex flex-col gap-6">
            <h2 className="text-xs font-mono text-[#5A5450] tracking-widest uppercase font-bold border-b border-[#1E1E1E] pb-2">General Settings</h2>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-2">
                <label className="text-[#8A8278] font-mono text-[10px] uppercase tracking-widest">Theme</label>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-[#1E1E1E] border border-[#3A6A3A] text-[#3A6A3A] rounded-lg">Dark</button>
                  <button className="flex-1 py-1.5 bg-[#121212] border border-[#1E1E1E] text-[#5A5450] hover:text-[#8A8278] rounded-lg">Light</button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#8A8278] font-mono text-[10px] uppercase tracking-widest">Default Thinking Mode</label>
                <select className="w-full bg-[#121212] border border-[#1E1E1E] rounded-lg px-3 py-2 text-[#C8C0B0] focus:border-[#3A6A3A] outline-none">
                  <option>Auto</option>
                  <option>Deep</option>
                  <option>Fast</option>
                </select>
              </div>
            </div>
            
            {/* Additional settings sections would go here */}
            <div className="p-6 border border-[#2A1A0A] bg-[#1A0A0A] rounded-2xl flex flex-col gap-2 mt-8">
              <h3 className="text-xs font-mono text-[#C8C0B0] uppercase tracking-widest font-bold">Boundary Engine (LOCKED)</h3>
              <p className="text-[10px] font-mono text-[#8A8278] leading-relaxed">
                Safety thresholds are non-negotiable and cannot be disabled. CS-2 immediate threshold is locked at 0.30.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
