import type { SetState } from "./types";
import { getSegmentDistance, type GeoLocation } from "shared";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function copyToClipboard(text: string): Promise<void> {
  await window.navigator.clipboard.writeText(text);
}

export function formatDate(date: Date | number): string {
  if(typeof date === "number") {
    date = new Date(date);
  }

  const formatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  return formatter.format(date).replaceAll("/", "-");
}

export function getCurrentState<T>(setState: SetState<T>): Promise<T> {
  return new Promise((resolve) => {
    setState((prev) => {
      resolve(prev);
      return prev;
    });
  });
}

export function estimateEtaDay(origin: GeoLocation, destination: GeoLocation, progress: number): number {
  const distance = getSegmentDistance(origin, destination);
  const speed = 1000; // km / day
  return distance * (1 - progress) / speed;
}
