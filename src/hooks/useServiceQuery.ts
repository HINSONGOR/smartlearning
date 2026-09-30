"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getServices, type Services } from "@/services/container";

/** 喺 client component 使用 Service */
export function useServices(): Services {
  return getServices();
}

/**
 * 讀取資料，並喺資料有改動（新增／編輯／刪除）時自動重新讀取。
 * 未讀完之前回傳 undefined。
 */
export function useServiceQuery<T>(
  query: (services: Services) => Promise<T>,
  deps: readonly unknown[],
): T | undefined {
  const services = getServices();
  const version = useSyncExternalStore(
    services.changes.subscribe,
    services.changes.getVersion,
    () => 0,
  );
  const [result, setResult] = useState<{ key: string; value: T }>();
  const key = JSON.stringify([version, ...deps]);

  useEffect(() => {
    let cancelled = false;
    query(services).then((value) => {
      if (!cancelled) setResult({ key, value });
    });
    return () => {
      cancelled = true;
    };
    // query 由 deps 決定，唔需要放入依賴
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return result?.key === key ? result.value : undefined;
}
