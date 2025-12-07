import type { StatisticsDTO } from "shared";
import useSWR from "swr";
import { backendAPI } from "@/lib/global";

export function useStatistics() {
  const { data, error, isLoading, mutate } = useSWR(`/statistics`, async () => {
    return (await backendAPI.get(`/statistics`)).data;
  });

  return {
    statistics: (!isLoading && !error) ? data as StatisticsDTO : null,
    error,
    isLoading,
    mutate
  };
}
