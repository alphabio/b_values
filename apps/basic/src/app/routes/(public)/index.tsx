// b_path:: apps/basic/src/app/routes/(public)/index.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/(public)/")({
  component: App,
});

const experiments = [
  {
    path: "/timeline",
    title: "Git Commit River Timeline",
    description: "Animated flowing river of commits, each session as a wave",
    color: "from-purple-500 to-pink-500",
  },
  {
    path: "/test-growth",
    title: "Test Count Growth Animation",
    description: "0 → 2021+ tests with sparkles and milestones",
    color: "from-emerald-500 to-teal-500",
  },
  {
    path: "/journey-map",
    title: "Interactive Session Map",
    description: "Isometric path through all 51 sessions",
    color: "from-blue-500 to-cyan-500",
  },
];

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">b_values Journey</h1>
          <p className="text-xl text-slate-300">51 sessions of building a world-class CSS values library</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {experiments.map((exp, idx) => (
            <motion.div
              key={exp.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link to={exp.path} className="block h-full">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`h-full bg-gradient-to-br ${exp.color} p-8 rounded-xl shadow-2xl cursor-pointer`}
                >
                  <h2 className="text-2xl font-bold text-white mb-3">{exp.title}</h2>
                  <p className="text-white/80">{exp.description}</p>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-slate-400"
        >
          <p>Click any card to explore →</p>
        </motion.div>
      </div>
    </div>
  );
}
