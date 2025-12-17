import React from "react";
import { ToolDashboard } from "./components/ToolDashboard";
import { Database } from "lucide-react";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.05] pointer-events-none"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <header className="mb-8 border-b border-slate-800 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/10 p-2 rounded-lg border border-blue-500/20">
              <Database className="text-blue-500" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                MCP Sentiment Tool
              </h1>
              <p className="text-xs text-slate-500 font-mono">
                VER 2.0.0 • GEMINI-2.5-FLASH • GROUNDING
              </p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-xs text-slate-500 font-mono">
              STATUS: ONLINE
            </div>
            <div className="text-xs text-emerald-500 font-mono">
              SYSTEM: READY
            </div>
          </div>
        </header>

        {/* Tool Interface */}
        <main>
          <ToolDashboard />
        </main>

        <footer className="mt-12 text-center text-[10px] text-slate-600 font-mono uppercase">
          Generated for MCP Integration • Output Format: Rational Float [-1.0,
          1.0]
        </footer>
      </div>
    </div>
  );
};

export default App;
