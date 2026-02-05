// Hook for tracking guest analysis usage in localStorage

const STORAGE_KEY = "sap-basis-analyzer-guest-analyses";
const GUEST_LIMIT = 5;

interface GuestUsageData {
  count: number;
  lastReset: number;
}

function getStoredData(): GuestUsageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading guest usage from localStorage:", e);
  }
  return { count: 0, lastReset: Date.now() };
}

function setStoredData(data: GuestUsageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving guest usage to localStorage:", e);
  }
}

export function useGuestUsage() {
  const getGuestAnalysisCount = (): number => {
    return getStoredData().count;
  };

  const incrementGuestAnalysisCount = (): void => {
    const data = getStoredData();
    data.count += 1;
    setStoredData(data);
  };

  const hasReachedGuestLimit = (): boolean => {
    return getStoredData().count >= GUEST_LIMIT;
  };

  const getRemainingAnalyses = (): number => {
    return Math.max(0, GUEST_LIMIT - getStoredData().count);
  };

  const resetGuestUsage = (): void => {
    setStoredData({ count: 0, lastReset: Date.now() });
  };

  return {
    getGuestAnalysisCount,
    incrementGuestAnalysisCount,
    hasReachedGuestLimit,
    getRemainingAnalyses,
    resetGuestUsage,
    GUEST_LIMIT,
  };
}
