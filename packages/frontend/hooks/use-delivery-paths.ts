import type { DeliveryPath } from "types";
import useSWR from "swr";
import { backendAPI } from "@/lib/global";

export function useDeliveryPaths(id: string) {
  const { data, error, isLoading } = useSWR(`/paths/${id}`, async () => {
    return (await backendAPI.get(`/paths/${id}`)).data;
  });

  return {
    paths: (!isLoading && !error) ? data.paths as DeliveryPath[] : [],
    error,
    isLoading
  };
}
