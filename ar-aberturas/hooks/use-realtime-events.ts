import { getSupabaseClient } from "@/lib/supabase-client";
import { useEffect, useState, useCallback, useRef } from "react";

interface CacheEntry<T> {
  data: T[];
}

export function useRealtimeEvents<T extends { id: string }>(
  table: string,
  fetchFromDb: () => Promise<T[]>,
  cacheKey?: string
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = getSupabaseClient();
  const cacheKeyFinal = cacheKey || `infinite_cache_${table}`;

  const initializedRef = useRef(false);

  const getCachedData = useCallback((): T[] | null => {
    try {
      const cached = localStorage.getItem(cacheKeyFinal);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      return entry.data;
    } catch {
      return null;
    }
  }, [cacheKeyFinal]);

  const setCachedData = useCallback(
    (newData: T[]) => {
      try {
        const entry: CacheEntry<T> = { data: newData };
        localStorage.setItem(cacheKeyFinal, JSON.stringify(entry));
      } catch {
      }
    },
    [cacheKeyFinal]
  );

  const fetchData = useCallback(async () => {

    const cached = getCachedData();
    if (cached) {
      setData(cached);
      setLoading(false);
    }

    try {
      const res = await fetchFromDb();
      setData(res);
      setCachedData(res);
    } catch (err: any) {
      setError(err?.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, [fetchFromDb, getCachedData, setCachedData]);

  const processRealtimeEvent = useCallback(
    (payload: any) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      setData(currentData => {
        let newData = [...currentData];

        switch (eventType) {
          case "INSERT":
            if (newRecord) {
              newData.unshift(newRecord);
            }
            break;

          case "UPDATE":
            if (newRecord?.id) {
              const index = newData.findIndex(
                item => item.id === newRecord.id
              );

              if (index !== -1) {
                newData[index] = newRecord;
              } else {

                fetchData();
                return currentData;
              }
            }
            break;

          case "DELETE":
            if (oldRecord?.id) {
              newData = newData.filter(
                item => item.id !== oldRecord.id
              );
            }
            break;
        }

        setCachedData(newData);
        return newData;
      });
    },
    [fetchData, setCachedData]
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!table) return;

    const channel = supabase
      .channel(`${table}-infinite-cache`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        processRealtimeEvent
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, processRealtimeEvent, supabase]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
    clearCache: () => {
      localStorage.removeItem(cacheKeyFinal);
      fetchData();
    },
  };
}
