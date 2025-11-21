import type { Order } from "types";
import useSWR from "swr";
import { backendAPI } from "@/lib/global";

export function useOrder(id: string) {
  const { data, error, isLoading } = useSWR(`/orders/${id}`, async () => {
    return (await backendAPI.get(`/orders/${id}`)).data;
  });

  return {
    order: (!isLoading && !error) ? data.order as Order : null,
    error,
    isLoading,
    deliver(id: string) {
      return backendAPI.post(`/orders/${id}/deliver`);
    },
    receive(id: string) {
      return backendAPI.post(`/orders/${id}/receive`);
    },
    cancel(id: string) {
      return backendAPI.post(`/orders/${id}/cancel`);
    },
    delete(id: string) {
      return backendAPI.delete(`/orders/${id}`);
    }
  };
}
