import type { GeoLocation } from "shared";
import { storageKey } from "./global";

function getLocalStorage() {
  if(typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  throw new Error("localStorage is not defined.");
}

interface StorageDataType {
  "store-location": GeoLocation
}

const defaultValues: StorageDataType = {
  "store-location": [118.796877, 32.060255] // 江苏省 南京市 玄武区
};

export function getStorageValue<K extends keyof StorageDataType>(key: K): StorageDataType[K] {
  const storage = getLocalStorage();
  const value = storage.getItem(`${storageKey}.${key}`);
  if(!value) {
    setStorageValue(key, defaultValues[key]);
    return defaultValues[key];
  }
  return JSON.parse(value) as StorageDataType[K];
}

export function setStorageValue<K extends keyof StorageDataType>(key: K, value: StorageDataType[K]): void {
  const storage = getLocalStorage();
  storage.setItem(`${storageKey}.${key}`, JSON.stringify(value));
}
