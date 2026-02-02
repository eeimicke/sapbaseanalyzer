import { useQuery } from "@tanstack/react-query";
import {
  fetchServiceInventory,
  fetchServiceDetails,
  type ServiceInventoryItem,
  type ServiceDetails,
} from "@/lib/sap-services";

/**
 * Hook zum Laden des kompletten SAP BTP Service-Katalogs
 * Verwendet TanStack Query für automatisches Caching und Loading-States
 * 
 * Daten werden direkt vom SAP GitHub Repository geladen:
 * https://github.com/SAP-samples/btp-service-metadata
 */
export function useServiceInventory() {
  return useQuery<ServiceInventoryItem[], Error>({
    queryKey: ["sap-service-inventory"],
    queryFn: fetchServiceInventory,
    staleTime: 1000 * 60 * 30, // 30 Minuten - Services ändern sich selten
    gcTime: 1000 * 60 * 60, // 1 Stunde im Cache behalten
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook zum Laden der Detail-Informationen eines spezifischen Services
 * Wird nur aufgerufen wenn ein fileName übergeben wird
 * 
 * Enthält: Links (kategorisiert), servicePlans, Regionen, Support-Komponenten
 * HINWEIS: Nutzt fileName statt technicalId, da die Groß-/Kleinschreibung unterschiedlich sein kann
 */
export function useServiceDetails(fileName: string | null) {
  return useQuery<ServiceDetails, Error>({
    queryKey: ["sap-service-details", fileName],
    queryFn: () => fetchServiceDetails(fileName!),
    enabled: !!fileName, // Nur laden wenn fileName vorhanden
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
