import React, { useState } from 'react';
import { Download, Check, Copy, Terminal, FileCode, Package, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { Modal } from './Modal';

interface DownloadProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadProjectModal: React.FC<DownloadProjectModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const agentPrompt = `Here is the complete StockỌja Multi-Tenant Commerce Platform codebase package.
Quickstart instructions for building and running:
1. Extract the stockoja-commerce-platform.zip archive.
2. Run 'npm install' to install frontend and backend dependencies.
3. Run 'npm run dev' to start the full-stack server on port 3000 (Express API + Vite React 19).
4. Run 'npm run build' for production packaging (Vite frontend + esbuild server.cjs).
Refer to README.md and AGENT_INSTRUCTIONS.md inside the bundle for complete architecture specifications, data schemas, and API documentation.`;

  const copyInstructions = () => {
    navigator.clipboard.writeText(agentPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = '/api/v1/download-project-zip';
    link.download = 'stockoja-commerce-platform.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloading(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Download Project Bundle" size="lg">
      <div className="space-y-5 text-slate-800">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-emerald-950 p-5 rounded-2xl text-white shadow-md border border-slate-700/60">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold border border-indigo-400/30">
                <Package size={12} />
                <span>Ready-to-Ship Codebase Archive</span>
              </div>
              <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                StockỌja Commerce Platform
              </h3>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                Full-stack repository archive ready for local development, git check-in, or sending directly to your engineer / AI agent to build and deploy.
              </p>
            </div>
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 items-center justify-center text-indigo-300 font-mono text-xs font-bold">
              .ZIP
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Download size={15} className={isDownloading ? 'animate-bounce' : ''} />
              <span>{isDownloading ? 'Preparing ZIP...' : 'Download Project ZIP (~131 KB)'}</span>
            </button>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <span>Includes 48 source files, README & Agent Guide</span>
            </span>
          </div>
        </div>

        {/* Package Contents Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <FileCode size={14} className="text-indigo-600" />
              <span>What's Inside The ZIP Bundle</span>
            </div>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span><strong>Frontend:</strong> React 19, Tailwind CSS v4, Lucide icons</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span><strong>Backend:</strong> Express TypeScript API with multi-tenancy</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span><strong>Seed DB:</strong> Complete store catalog, orders, and ledger</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span><strong>Guides:</strong> README.md and AGENT_INSTRUCTIONS.md</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-400">
                <span>✓ Zero bloated node_modules (clean & instant to download)</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Terminal size={14} className="text-indigo-600" />
              <span>Agent Execution Steps</span>
            </div>
            <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[10px] space-y-1 select-all overflow-x-auto">
              <p className="text-slate-400"># 1. Unzip the project</p>
              <p className="text-emerald-400">unzip stockoja-commerce-platform.zip</p>
              <p className="text-slate-400"># 2. Install dependencies</p>
              <p className="text-emerald-400">npm install</p>
              <p className="text-slate-400"># 3. Start full-stack dev server</p>
              <p className="text-emerald-400">npm run dev</p>
            </div>
          </div>
        </div>

        {/* Copy Agent Prompt Box */}
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-600" />
              Message / Prompt for Your Agent or Developer
            </span>
            <button
              onClick={copyInstructions}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Prompt'}</span>
            </button>
          </div>
          <p className="text-[11px] text-indigo-900/80 leading-relaxed font-mono bg-white/80 p-2.5 rounded-lg border border-indigo-100 whitespace-pre-line select-all">
            {agentPrompt}
          </p>
        </div>

        {/* Direct Link Alternative */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>Direct URL link: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">/api/v1/download-project-zip</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
