// b_path:: apps/basic/src/app/routes/(public)/test-growth.tsx
import { createFileRoute } from "@tanstack/react-router";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/(public)/test-growth")({
  component: TestGrowthExperiment,
});

type SessionData = {
  meta: {
    total_sessions: number;
  };
  sessions: Array<{
    number: number;
    title: string;
    date: string;
    metrics: {
      tests_passing: number;
    };
  }>;
};

function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: "easeOut",
    });

    const unsubscribe = rounded.on("change", (latest) => setDisplayValue(latest));

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, count, rounded]);

  return <span>{displayValue.toLocaleString()}</span>;
}

function TestGrowthExperiment() {
  const [data, setData] = useState<SessionData | null>(null);

  useEffect(() => {
    fetch("/sessions.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-8">Loading...</div>;

  const maxTests = Math.max(...data.sessions.map((s) => s.metrics.tests_passing));

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-900 via-teal-900 to-slate-900 p-8 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-8xl font-bold text-white mb-8"
        >
          <AnimatedCounter value={maxTests} />
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-3xl text-emerald-300 mb-12"
        >
          Tests Written
        </motion.p>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-10 gap-2">
            {data.sessions.map((session, idx) => {
              const height = (session.metrics.tests_passing / maxTests) * 100;
              return (
                <motion.div
                  key={session.number}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  className="bg-emerald-400/70 rounded-t hover:bg-emerald-300 transition-colors cursor-pointer relative group"
                  style={{ minHeight: "4px" }}
                  title={`Session ${session.number}: ${session.metrics.tests_passing} tests`}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    S{session.number}: {session.metrics.tests_passing}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-8 text-slate-300">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              {data.meta.total_sessions} sessions of obsessive testing
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
