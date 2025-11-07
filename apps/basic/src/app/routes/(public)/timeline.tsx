// b_path:: apps/basic/src/app/routes/(public)/timeline.tsx
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/(public)/timeline")({
  component: TimelineExperiment,
});

type SessionData = {
  meta: {
    generated_at: string;
    total_sessions: number;
    total_commits: number;
    first_commit_date: string;
    last_commit_date: string;
    test_files: number;
  };
  sessions: Array<{
    number: number;
    title: string;
    date: string;
    focus: string;
    tags: string[];
    git: {
      ref: string;
      commit_date: string;
      commit_message: string;
      stats: {
        files_changed: number;
        insertions: number;
        deletions: number;
      };
    };
    accomplishments: string[];
    artifacts: string[];
    metrics: {
      tests_passing: number;
    };
  }>;
};

function TimelineExperiment() {
  const [data, setData] = useState<SessionData | null>(null);

  useEffect(() => {
    fetch("/sessions.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-4">Git Commit River Timeline</h1>
        <p className="text-slate-300 mb-8">
          {data.meta.total_sessions} sessions • {data.meta.total_commits} commits • {data.meta.test_files} test files
        </p>

        <div className="space-y-4">
          {data.sessions.map((session, idx) => (
            <motion.div
              key={session.number}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6 hover:bg-slate-800/70 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-purple-400">
                      {session.number.toString().padStart(3, "0")}
                    </span>
                    <h3 className="text-xl font-semibold text-white">{session.title}</h3>
                  </div>
                  <p className="text-slate-300 mb-3">{session.focus}</p>
                  <div className="flex gap-2 flex-wrap">
                    {session.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-sm mb-2">{session.date}</div>
                  <div className="text-green-400 font-mono text-sm">{session.metrics.tests_passing} tests</div>
                  <div className="text-slate-500 text-xs mt-1">
                    +{session.git.stats.insertions} -{session.git.stats.deletions}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
