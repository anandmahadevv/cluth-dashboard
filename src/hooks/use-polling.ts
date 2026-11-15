"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { POLLING_INTERVAL_MS } from "@/lib/constants";
import { PublicApiResponse } from "@/types";

interface UsePollingOptions {
  interval?: number;
  enabled?: boolean;
}

export function usePolling<T>(
  fetcher: () => Promise<PublicApiResponse<T>>,
  initialData?: T,
  options: UsePollingOptions = {}
) {
  const { interval = POLLING_INTERVAL_MS, enabled = true } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [meta, setMeta] = useState<PublicApiResponse<T>["meta"] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isTabActive, setIsTabActive] = useState<boolean>(true);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const initialFetchDone = useRef(false);

  const executeFetch = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }
    try {
      const response = await fetcherRef.current();
      if (response.success && response.data !== undefined) {
        setData((prev) => {
          // Anti-flicker guard: if previous data had real content, do not overwrite with empty object/array on background poll
          if (!isManual && prev !== undefined && response.data !== undefined) {
            const hasPrev = Array.isArray(prev)
              ? prev.length > 0
              : typeof prev === "object" && prev !== null
              ? Object.values(prev).some(
                  (v) =>
                    v !== undefined &&
                    v !== null &&
                    v !== "" &&
                    (typeof v !== "object" || Object.keys(v).length > 0)
                )
              : Boolean(prev);

            const hasNew = Array.isArray(response.data)
              ? response.data.length > 0
              : typeof response.data === "object" && response.data !== null
              ? Object.values(response.data).some(
                  (v) =>
                    v !== undefined &&
                    v !== null &&
                    v !== "" &&
                    (typeof v !== "object" || Object.keys(v).length > 0)
                )
              : Boolean(response.data);

            if (hasPrev && !hasNew) {
              return prev;
            }
          }
          return response.data;
        });
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

    // Initial fetch if needed
    if (!initialFetchDone.current) {
      initialFetchDone.current = true;
      if (!initialData) {
        executeFetch(false);
      }
    }

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        executeFetch(false);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [enabled, interval, executeFetch, initialData]);

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
