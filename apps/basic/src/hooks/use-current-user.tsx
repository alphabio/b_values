// b_path:: apps/basic/src/hooks/use-current-user.tsx
import { api } from "@b/b_server/convex/_generated/api";
import { useQuery } from "convex/react";

export const useCurrentUser = () => {
  const currentUser = useQuery(api.users.currentUser);

  const isLoading = currentUser === undefined;

  return {
    isLoading,
    currentUser,
  };
};
