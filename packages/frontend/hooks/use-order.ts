import type { OrderInfoDTO } from "types";
import useSWR from "swr";
import { backendAPI } from "@/lib/global";

export function useOrder(id: string) {
  const { data, error, isLoading, mutate } = useSWR(`/orders/${id}`, async () => {
    return (await backendAPI.get(`/orders/${id}`)).data;
  });

  return {
    order: (!isLoading && !error) ? data.order as OrderInfoDTO : null,
    error,
    isLoading,
    deliver() {
      return backendAPI.post(`/orders/${id}/deliver`);
    },
    receive() {
      return backendAPI.post(`/orders/${id}/receive`);
    },
    cancel() {
      return backendAPI.post(`/orders/${id}/cancel`);
    },
    delete() {
      return backendAPI.delete(`/orders/${id}`);
    },
    mutate
  };
}
