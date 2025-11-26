import type { OrderInfoDTO } from "types";
import useSWR from "swr";
import { backendAPI } from "@/lib/global";

export function useOrders() {
  const { data, error, isLoading, mutate } = useSWR("/orders", async () => {
    return (await backendAPI.get("/orders")).data;
  }, {
    
  });

  return {
    orders: (!isLoading && !error) ? data.orders as OrderInfoDTO[] : [],
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
    },
    mutate
  };
}
