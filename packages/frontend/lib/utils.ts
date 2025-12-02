import type { GeoLocation } from "shared";
import type { SetState } from "./types";
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

/** @returns km */
export function getSegmentDistance(from: GeoLocation, to: GeoLocation): number {
  const R = 6371000; // Earth radius (m)
  const [lon1, lat1] = from;
  const [lon2, lat2] = to;
  
  const latAngle1 = lat1 * Math.PI / 180;
  const latAngle2 = lat2 * Math.PI / 180;
  const deltaLatAngle = (lat2 - lat1) * Math.PI / 180;
  const deltaLonAngle = (lon2 - lon1) * Math.PI / 180;

  // Haversine formula
  const a = (
    Math.sin(deltaLatAngle / 2) * Math.sin(deltaLatAngle / 2) +
    Math.cos(latAngle1) * Math.cos(latAngle2) *
    Math.sin(deltaLonAngle / 2) * Math.sin(deltaLonAngle / 2)
  );

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c / 1000; // km
}

export function estimateEtaDay(origin: GeoLocation, destination: GeoLocation, progress: number): number {
  const distance = getSegmentDistance(origin, destination);
  const speed = 1000; // km / day
  return distance * (1 - progress) / speed;
}
