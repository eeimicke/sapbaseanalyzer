// SAP BTP Service Metadata API
// Datenquelle: https://github.com/SAP-samples/btp-service-metadata

const BASE_URL = "https://raw.githubusercontent.com/SAP-samples/btp-service-metadata/main/v1";

// ============= TypeScript Types =============

export interface ServiceInventoryItem {
  technicalId: string;
  displayName: string;
  description: string;
  fileName: string;
  category: string;
}

export interface ServiceInventory {
  services: ServiceInventoryItem[];
}

export interface ServiceLink {
  value: string;
  classification: string;
  type: string;
}

export interface ServicePlan {
  name: string;
  displayName: string;
  description: string;
  isFree: boolean;
  dataCenters: {
    name: string;
    displayName: string;
    region: string;
  }[];
}

export interface ServiceDetails {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  links: ServiceLink[];
  servicePlans: ServicePlan[];
  supportComponents?: {
    value: string;
    classification: string;
  }[];
}

// ============= Link Classification Helpers =============

export const linkClassifications = {
  "Discovery Center": { icon: "database", label: "Discovery Center", priority: 1 },
  "Documentation": { icon: "book-open", label: "Dokumentation", priority: 2 },
  "SAP Help Portal": { icon: "book-open", label: "SAP Help Portal", priority: 3 },
  "Tutorial": { icon: "graduation-cap", label: "Tutorial", priority: 4 },
  "API Hub": { icon: "code", label: "API Hub", priority: 5 },
  "Support": { icon: "headphones", label: "Support", priority: 6 },
  "Marketing": { icon: "megaphone", label: "Marketing", priority: 7 },
} as const;

export type LinkClassification = keyof typeof linkClassifications;

export function groupLinksByClassification(links: ServiceLink[]) {
  const grouped: Record<string, ServiceLink[]> = {};
  
  for (const link of links) {
    const classification = link.classification || "Other";
    if (!grouped[classification]) {
      grouped[classification] = [];
    }
    grouped[classification].push(link);
  }
  
  // Sort by priority
  const sorted = Object.entries(grouped).sort((a, b) => {
    const priorityA = linkClassifications[a[0] as LinkClassification]?.priority ?? 99;
    const priorityB = linkClassifications[b[0] as LinkClassification]?.priority ?? 99;
    return priorityA - priorityB;
  });
  
  return Object.fromEntries(sorted);
}

// ============= API Functions =============

/**
 * Lädt den kompletten Service-Katalog vom SAP GitHub Repository
 * Enthält über 200 SAP BTP Services mit technicalId, displayName, description und category
 */
export async function fetchServiceInventory(): Promise<ServiceInventoryItem[]> {
  const response = await fetch(`${BASE_URL}/inventory.json`);
  
  if (!response.ok) {
    throw new Error(`Fehler beim Laden der Services: ${response.status} ${response.statusText}`);
  }
  
  const data: ServiceInventory = await response.json();
  return data.services;
}

/**
 * Lädt die Detail-Informationen eines spezifischen Services
 * Enthält Links, servicePlans, Regionen und Support-Komponenten
 */
export async function fetchServiceDetails(technicalId: string): Promise<ServiceDetails> {
  const response = await fetch(`${BASE_URL}/developer/${technicalId}.json`);
  
  if (!response.ok) {
    throw new Error(`Fehler beim Laden der Service-Details für ${technicalId}: ${response.status}`);
  }
  
  return response.json();
}

// ============= Helper Functions =============

/**
 * Extrahiert einzigartige Kategorien aus der Service-Liste
 */
export function extractCategories(services: ServiceInventoryItem[]): string[] {
  const categories = new Set<string>();
  for (const service of services) {
    if (service.category) {
      categories.add(service.category);
    }
  }
  return Array.from(categories).sort();
}

/**
 * Filtert Services nach Suchbegriff und Kategorie
 */
export function filterServices(
  services: ServiceInventoryItem[],
  searchQuery: string,
  category?: string
): ServiceInventoryItem[] {
  const query = searchQuery.toLowerCase().trim();
  
  return services.filter((service) => {
    // Kategorie-Filter
    if (category && category !== "all" && service.category !== category) {
      return false;
    }
    
    // Suchfilter
    if (query) {
      return (
        service.displayName.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.technicalId.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
}

/**
 * Gibt die Discovery Center URL für einen Service zurück
 */
export function getDiscoveryCenterUrl(technicalId: string): string {
  return `https://discovery-center.cloud.sap/serviceCatalog/${technicalId}`;
}
