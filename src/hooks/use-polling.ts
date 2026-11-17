"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { POLLING_INTERVAL_MS } from "@/lib/constants";
import { PublicApiResponse } from "@/types";

interface UsePollingOptions {
  interval?: number;
  enabled?: boolean;
  key?: string;
}

// Global in-memory cache across component mounts and tab switches for instant 0ms renders
const clientDataCache = new Map<string, any>();
const clientMetaCache = new Map<string, any>();
const inFlightRequests = new Map<string, Promise<PublicApiResponse<any>>>();

export function usePolling<T>(
  fetcher: () => Promise<PublicApiResponse<T>>,
  initialData?: T,
  options: UsePollingOptions = {}
) {
  const { interval = POLLING_INTERVAL_MS, enabled = true, key } = options;

  const cachedData = key ? (clientDataCache.get(key) as T | undefined) : undefined;
  const cachedMeta = key ? clientMetaCache.get(key) : undefined;

  const [data, setData] = useState<T | undefined>(
    cachedData !== undefined ? cachedData : initialData
  );
  const [meta, setMeta] = useState<PublicApiResponse<T>["meta"] | undefined>(cachedMeta);
  const [isLoading, setIsLoading] = useState<boolean>(
    cachedData === undefined && initialData === undefined
  );
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isTabActive, setIsTabActive] = useState<boolean>(true);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const prevKeyRef = useRef<string | undefined>(key);

  const executeFetch = useCallback(
    async (isManual = false) => {
      if (isManual) {
        setIsRefreshing(true);
      }
      try {
        let responsePromise: Promise<PublicApiResponse<T>>;
        if (key && inFlightRequests.has(key)) {
          responsePromise = inFlightRequests.get(key)!;
        } else {
          responsePromise = fetcherRef.current();
          if (key) {
            inFlightRequests.set(key, responsePromise);
            responsePromise.finally(() => inFlightRequests.delete(key));
          }
        }

        const response = await responsePromise;
        if (response.success && response.data !== undefined) {
          setData(response.data);
          setMeta(response.meta);
          if (key) {
            clientDataCache.set(key, response.data);
            if (response.meta) clientMetaCache.set(key, response.meta);
          }
          setError(null);
          setLastUpdated(new Date());
        } else if (response.error) {
          setError(response.error);
        }
      } catch (err: any) {
        console.error("[usePolling Error]", err);
        setError(err?.message || "Failed to fetch live updates");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [key]
  );

  // When polling key changes (e.g. campus or game switched), instant load from cache if available
  useEffect(() => {
    if (key !== undefined && key !== prevKeyRef.current) {
      prevKeyRef.current = key;
      const existing = clientDataCache.get(key) as T | undefined;
      if (existing !== undefined) {
        setData(existing);
        setMeta(clientMetaCache.get(key));
        setIsLoading(false);
      } else {
        setData(initialData);
        setIsLoading(!initialData);
      }
      executeFetch(false);
    }
  }, [key, initialData, executeFetch]);

  // Track tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      const active = document.visibilityState === "visible";
      setIsTabActive(active);
      if (active) {
        // Immediately refresh when tab becomes visible again
        executeFetch(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [executeFetch]);

  // Polling loop
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch on mount
    executeFetch(false);

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        executeFetch(false);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [enabled, interval, executeFetch, key]);

  const manualRefresh = useCallback(() => {
    return executeFetch(true);
  }, [executeFetch]);

  return {
    data,
    meta,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    isTabActive,
    refresh: manualRefresh,
  };
}
