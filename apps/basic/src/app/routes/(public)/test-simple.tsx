// b_path:: apps/basic/src/app/routes/(public)/test-simple.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(public)/test-simple")({
  component: SimpleTest,
});

function SimpleTest() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: "2rem", background: "#111", minHeight: "100vh", color: "white" }}>
      <h1 style={{ fontSize: "3rem" }}>Simple Test - No Framer Motion</h1>
      <p>Count: {count}</p>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        style={{ padding: "1rem 2rem", fontSize: "1.5rem", cursor: "pointer" }}
      >
        Click me
      </button>
    </div>
  );
}
