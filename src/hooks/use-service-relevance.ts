import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ServiceInventoryItem } from "@/lib/sap-services";

export type RelevanceLevel = "hoch" | "mittel" | "niedrig";

export interface ServiceRelevance {
  relevance: RelevanceLevel;
  reason: string;
  cached: boolean;
}

interface RelevanceResponse {
  success: boolean;
  data?: ServiceRelevance;
  error?: string;
}

/**
 * Fetches or classifies the basis relevance of a single service
 */
async function fetchServiceRelevance(
  service: ServiceInventoryItem,
  forceReclassify = false
): Promise<ServiceRelevance | null> {
  const { data, error } = await supabase.functions.invoke<RelevanceResponse>("classify-relevance", {
    body: {
      serviceName: service.displayName,
      serviceDescription: service.description || "",
      serviceCategory: service.category || "",
      technicalId: service.technicalId,
      forceReclassify,
    },
  });

  if (error) {
    console.error("Relevance fetch error:", error);
    return null;
  }

  if (!data?.success || !data.data) {
    console.warn("Relevance classification failed:", data?.error);
    return null;
  }

  return data.data;
}

/**
 * Hook to get the relevance classification for a single service
 */
export function useServiceRelevance(service: ServiceInventoryItem | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["service-relevance", service?.technicalId],
    queryFn: () => (service ? fetchServiceRelevance(service) : null),
    enabled: !!service,
    staleTime: 1000 * 60 * 60, // 1 hour - classifications are stable
    gcTime: 1000 * 60 * 60 * 24, // 24 hours cache
    retry: 1,
  });

  const reclassify = async () => {
    if (!service) return;
    const result = await fetchServiceRelevance(service, true);
    if (result) {
      queryClient.setQueryData(["service-relevance", service.technicalId], result);
    }
  };

  return { ...query, reclassify };
}

/**
 * Batch fetch relevance for multiple services (with caching)
 */
async function fetchBatchRelevance(
  services: ServiceInventoryItem[]
): Promise<Map<string, ServiceRelevance>> {
  const results = new Map<string, ServiceRelevance>();

  // First, check cache in database directly
  const { data: cached } = await supabase
    .from("service_relevance_cache")
    .select("service_technical_id, relevance, reason")
    .in("service_technical_id", services.map((s) => s.technicalId));

  // Add cached results to map
  if (cached) {
    for (const item of cached) {
      results.set(item.service_technical_id, {
        relevance: item.relevance as RelevanceLevel,
        reason: item.reason,
        cached: true,
      });
    }
  }

  // Find services not in cache
  const uncached = services.filter((s) => !results.has(s.technicalId));

  // Classify uncached services (parallel, but limited to avoid rate limits)
  const BATCH_SIZE = 5;
  for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
    const batch = uncached.slice(i, i + BATCH_SIZE);
    const promises = batch.map(async (service) => {
      try {
        const result = await fetchServiceRelevance(service);
        if (result) {
          results.set(service.technicalId, result);
        }
      } catch (err) {
        console.warn(`Failed to classify ${service.technicalId}:`, err);
      }
    });
    await Promise.all(promises);
    
    // Small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < uncached.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return results;
}

/**
 * Hook to batch-load relevance for all visible services
 * Useful for filtering and progressive loading
 */
export function useBatchRelevance(services: ServiceInventoryItem[], enabled = true) {
  return useQuery({
    queryKey: ["batch-relevance", services.map((s) => s.technicalId).sort().join(",")],
    queryFn: () => fetchBatchRelevance(services),
    enabled: enabled && services.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 0, // Don't retry batch operations
  });
}

/**
 * Prefetch relevance for services (useful for background loading)
 */
export function usePrefetchRelevance() {
  const queryClient = useQueryClient();

  return async (services: ServiceInventoryItem[]) => {
    const results = await fetchBatchRelevance(services);
    
    // Populate individual query caches
    results.forEach((relevance, technicalId) => {
      queryClient.setQueryData(["service-relevance", technicalId], relevance);
    });

    return results;
  };
}

/**
 * Color mapping for relevance badges
 */
export const relevanceColors = {
  hoch: {
    bg: "bg-green-500/20",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-500/30",
    dot: "bg-green-500",
  },
  mittel: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-500/30",
    dot: "bg-yellow-500",
  },
  niedrig: {
    bg: "bg-red-500/20",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/30",
    dot: "bg-red-500",
  },
} as const;

/**
 * Label mapping for relevance levels
 */
export const relevanceLabels = {
  hoch: "Hoch",
  mittel: "Mittel",
  niedrig: "Niedrig",
} as const;
