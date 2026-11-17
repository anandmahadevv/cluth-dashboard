"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { POLLING_INTERVAL_MS } from "@/lib/constants";
import { PublicApiResponse } from "@/types";

interface UsePollingOptions {
  interval?: number;
  enabled?: boolean;
  key?: string;
}

export function usePolling<T>(
  fetcher: () => Promise<PublicApiResponse<T>>,
  initialData?: T,
  options: UsePollingOptions = {}
) {
  const { interval = POLLING_INTERVAL_MS, enabled = true, key } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [meta, setMeta] = useState<PublicApiResponse<T>["meta"] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isTabActive, setIsTabActive] = useState<boolean>(true);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const prevKeyRef = useRef<string | undefined>(key);

  const executeFetch = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }
    try {
      const response = await fetcherRef.current();
      if (response.success && response.data !== undefined) {
        setData(response.data);
        setMeta(response.meta);
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
  }, []);

  // When polling key changes (e.g. campus or game switched), immediately clear stale data & refetch
  useEffect(() => {
    if (key !== undefined && key !== prevKeyRef.current) {
      prevKeyRef.current = key;
      setData(initialData);
      setIsLoading(true);
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
