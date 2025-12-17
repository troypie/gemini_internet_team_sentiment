import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  RotateCcw,
  Terminal,
  ExternalLink,
  Cpu,
  Activity,
} from "lucide-react";
import { runSentimentAnalysisTool } from "../services/toolService";
import { ToolState } from "../types";

export const ToolDashboard: React.FC = () => {
  const [team1, setTeam1] = useState("Kansas City Chiefs");
  const [team2, setTeam2] = useState("San Francisco 49ers");

  const [state, setState] = useState<ToolState>({
    status: "IDLE",
    logs: [],
  });

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.logs]);

  const addLog = (msg: string) => {
    setState((prev) => ({ ...prev, logs: [...prev.logs, msg] }));
  };

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ status: "RUNNING", logs: [], data: undefined });

    try {
      const result = await runSentimentAnalysisTool(team1, team2, addLog);
      setState((prev) => ({ ...prev, status: "COMPLETE", data: result }));
    } catch (err: any) {
      setState((prev) => ({ ...prev, status: "ERROR", error: err.message }));
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel: Configuration & Console */}
      <div className="flex flex-col gap-6">
        {/* Input Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6 text-blue-400">
            <Cpu size={20} />
            <h2 className="text-sm font-bold uppercase tracking-widest">
              Input Configuration
            </h2>
          </div>

          <form onSubmit={handleRun} className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 font-mono mb-1 block">
                ARGUMENT: TEAM_1
              </label>
              <input
                type="text"
                value={team1}
                onChange={(e) => setTeam1(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 font-mono text-sm rounded-md px-3 py-2 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-mono mb-1 block">
                ARGUMENT: TEAM_2
              </label>
              <input
                type="text"
                value={team2}
                onChange={(e) => setTeam2(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 font-mono text-sm rounded-md px-3 py-2 focus:border-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={state.status === "RUNNING"}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-sm py-2 rounded-md flex items-center justify-center gap-2 transition-all"
            >
              {state.status === "RUNNING" ? (
                <Activity className="animate-spin" size={16} />
              ) : (
                <Play size={16} />
              )}
              EXECUTE TOOL
            </button>
          </form>
        </div>

        {/* Console / Logs */}
        <div className="flex-1 bg-black border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-hidden flex flex-col min-h-[300px] shadow-inner">
          <div className="flex items-center gap-2 text-slate-500 mb-2 border-b border-slate-800 pb-2">
            <Terminal size={14} />
            <span>EXECUTION LOGS</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-2 max-h-[300px]">
            {state.logs.length === 0 && (
              <span className="text-slate-700">Waiting for execution...</span>
            )}
            {state.logs.map((log, i) => (
              <div key={i} className="text-emerald-500/80">
                <span className="text-slate-600 mr-2">
                  {new Date().toLocaleTimeString()}
                </span>
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>

      {/* Right Panel: Output Visualization */}
      <div className="flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-purple-400">
              <Activity size={20} />
              <h2 className="text-sm font-bold uppercase tracking-widest">
                Tool Output
              </h2>
            </div>
            {state.status === "COMPLETE" && (
              <span className="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded border border-emerald-900">
                STATUS: 200 OK
              </span>
            )}
          </div>

          {state.status === "IDLE" && (
            <div className="flex-1 flex items-center justify-center text-slate-600 text-sm font-mono">
              NO OUTPUT GENERATED
            </div>
          )}

          {state.status === "ERROR" && (
            <div className="flex-1 flex items-center justify-center text-red-400 text-sm font-mono p-4 border border-red-900/50 bg-red-900/10 rounded-lg">
              ERROR: {state.error}
            </div>
          )}

          {state.status === "COMPLETE" && state.data && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6">
              {/* Rational Score Display */}
              <div className="bg-slate-950 rounded-lg p-6 border border-slate-800 text-center">
                <div className="text-xs text-slate-500 font-mono mb-2">
                  RATIONAL SCORE (-1.0 to 1.0)
                </div>
                <div
                  className={`text-5xl font-mono font-bold tracking-tighter ${
                    state.data.rationalScore < 0
                      ? "text-blue-400"
                      : state.data.rationalScore > 0
                      ? "text-red-400"
                      : "text-slate-200"
                  }`}
                >
                  {state.data.rationalScore > 0 ? "+" : ""}
                  {state.data.rationalScore.toFixed(4)}
                </div>

                {/* Mini Visualization Bar */}
                <div className="mt-4 h-2 bg-slate-800 rounded-full relative overflow-hidden w-full max-w-[200px] mx-auto">
                  <div className="absolute top-0 bottom-0 w-0.5 bg-slate-500 left-1/2 z-10"></div>
                  <div
                    className={`absolute top-0 bottom-0 transition-all duration-1000 ${
                      state.data.rationalScore < 0
                        ? "bg-blue-500 right-1/2"
                        : "bg-red-500 left-1/2"
                    }`}
                    style={{
                      width: `${Math.abs(state.data.rationalScore * 50)}%`,
                    }}
                  ></div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono w-full max-w-[200px] mx-auto">
                  <span>{team1} (-1.0)</span>
                  <span>{team2} (+1.0)</span>
                </div>
              </div>

              {/* Reasoning */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-mono">
                  REASONING_TRACE
                </label>
                <div className="bg-slate-950 p-4 rounded-md border border-slate-800 text-sm text-slate-300 font-mono leading-relaxed">
                  {state.data.reasoning}
                </div>
              </div>

              {/* Sources */}
              <div className="space-y-2">
                <label className="text-xs text-slate-500 font-mono">
                  GROUNDING_SOURCES [{state.data.sources.length}]
                </label>
                <div className="bg-slate-950 rounded-md border border-slate-800 max-h-[150px] overflow-y-auto">
                  {state.data.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                      className="block px-3 py-2 text-xs font-mono text-blue-400/80 hover:text-blue-300 hover:bg-slate-900 border-b border-slate-900 last:border-0 truncate flex items-center gap-2"
                    >
                      <ExternalLink size={10} />
                      {src}
                    </a>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-slate-600 font-mono text-right">
                MODEL_CONFIDENCE: {(state.data.confidence * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
