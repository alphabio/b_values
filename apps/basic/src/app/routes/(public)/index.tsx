// b_path:: apps/basic/src/app/routes/(public)/index.tsx
import { Hero } from "@/components";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/")({
  component: App,
});

function App() {
  console.log(",.,,");

  return (
    <div className="min-h-screen flex flex-col">
      <main className="">
        <div className="mb-4 md:mb-8 lg:mb-12">
          <Hero />
        </div>
      </main>
    </div>
  );
}
