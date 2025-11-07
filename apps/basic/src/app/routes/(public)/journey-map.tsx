// b_path:: apps/basic/src/app/routes/(public)/journey-map.tsx
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/(public)/journey-map")({
  component: JourneyMapExperiment,
});

type SessionData = {
  sessions: Array<{
    number: number;
    title: string;
    date: string;
    focus: string;
    tags: string[];
    accomplishments: string[];
    artifacts: string[];
    metrics: {
      tests_passing: number;
    };
  }>;
};

const tagColors: Record<string, string> = {
  tests: "bg-green-500",
  bugfix: "bg-red-500",
  generators: "bg-blue-500",
  parsers: "bg-purple-500",
  architecture: "bg-yellow-500",
  refactor: "bg-orange-500",
  performance: "bg-pink-500",
  dx: "bg-cyan-500",
};

function JourneyMapExperiment() {
  const [data, setData] = useState<SessionData | null>(null);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);

  useEffect(() => {
    fetch("/sessions.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-8">Loading...</div>;

  const selected = selectedSession ? data.sessions.find((s) => s.number === selectedSession) : null;

  return (
    <div className="min-h-screen bg-slate-950 p-8 overflow-x-auto">
      <h1 className="text-4xl font-bold text-white mb-8 text-center">The Journey: Interactive Session Map</h1>

      <div className="relative max-w-7xl mx-auto">
        {/* Path line */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <title>Journey path connecting all sessions</title>
          <motion.path
            d={`M 50 50 ${data.sessions
              .map((_, idx) => {
                const x = (idx % 10) * 120 + 50;
                const y = Math.floor(idx / 10) * 150 + 50;
                return `L ${x} ${y}`;
              })
              .join(" ")}`}
            stroke="rgba(139, 92, 246, 0.3)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>

        {/* Session nodes */}
        <div className="relative">
          {data.sessions.map((session, idx) => {
            const x = (idx % 10) * 120;
            const y = Math.floor(idx / 10) * 150;

            return (
              <motion.div
                key={session.number}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="absolute"
                style={{ left: x, top: y }}
              >
                <motion.button
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white shadow-lg cursor-pointer relative ${
                    session.tags[0] && tagColors[session.tags[0]] ? tagColors[session.tags[0]] : "bg-slate-600"
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedSession(session.number)}
                >
                  {session.number}
                  {session.artifacts.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full text-xs flex items-center justify-center text-slate-900">
                      {session.artifacts.length}
                    </span>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Height for all nodes */}
        <div
          style={{
            height: Math.ceil(data.sessions.length / 10) * 150 + 100,
          }}
        />
      </div>

      {/* Detail panel */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-6 shadow-2xl"
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Session {selected.number}: {selected.title}
                </h2>
                <p className="text-slate-300">{selected.focus}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-slate-400 mb-2">Accomplishments</h3>
                <ul className="text-slate-200 text-sm space-y-1">
                  {selected.accomplishments.slice(0, 5).map((acc) => (
                    <li key={acc}>• {acc}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-slate-400 mb-2">Artifacts</h3>
                <div className="flex flex-wrap gap-2">
                  {selected.artifacts.map((artifact) => (
                    <span key={artifact} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-sm">
                      {artifact}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
