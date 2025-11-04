// b_path:: apps/basic/src/app/routes/(protected)/dashboard/route.tsx
import { useCurrentUser } from "@/hooks/use-current-user";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/(protected)/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { currentUser } = useCurrentUser();

  return (
    <div className="container mx-auto pt-16 pb-8">
      <AuthLoading>
        <div className="flex w-full h-full justify-center items-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="ml-2">Loading...</p>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <Navigate to="/login" replace />
      </Unauthenticated>

      <Authenticated>{currentUser?.role === "admin" ? <Navigate to="/admin" replace /> : <Outlet />}</Authenticated>
    </div>
  );
}
