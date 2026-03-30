import { useQuery } from "@tanstack/react-query";
import { api } from "../api/footballData";

export function useCompetition(code) {
  return useQuery({
    queryKey: ["competition", code],
    queryFn: () => api.competition(code),
    enabled: !!code,
    staleTime: 1000 * 60 * 60 * 24,
  });
}
