import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function searchStringCompare(str: string, search: string): boolean {
  const strArr = str.toLowerCase().split(" ");
  const searchArr = search.toLowerCase().split(" ");
  const results: boolean[] = [];
  searchLoop: for(const searchWord of searchArr) {
    for(const strWord of strArr) {
      if(strWord.includes(searchWord)) {
        results.push(true);
        continue searchLoop;
      }
    }
    results.push(false);
  }
  for(const result of results) {
    if(!result) return false;
  }
  return true;
}
