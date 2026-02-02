import { supabase } from '@/integrations/supabase/client';

type FirecrawlResponse<T = unknown> = {
  success: boolean;
  error?: string;
  links?: string[];
  data?: T;
};

type ScrapeData = {
  markdown?: string;
  html?: string;
  rawHtml?: string;
  links?: string[];
  screenshot?: string;
  metadata?: {
    title?: string;
    description?: string;
    language?: string;
    sourceURL?: string;
    statusCode?: number;
  };
};

type MapOptions = {
  search?: string;
  limit?: number;
  includeSubdomains?: boolean;
};

type ScrapeOptions = {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot')[];
  onlyMainContent?: boolean;
  waitFor?: number;
  location?: { country?: string; languages?: string[] };
};

export type ScrapeResult = {
  url: string;
  success: boolean;
  error?: string;
  data?: ScrapeData;
};

export const firecrawlApi = {
  /**
   * Map a website to discover all URLs (fast sitemap generation)
   * Uses Firecrawl's Map API to find all accessible URLs on a domain
   */
  async map(url: string, options?: MapOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-map', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  /**
   * Scrape a single URL and extract its content
   * Returns markdown, html, links, etc. based on options
   */
  async scrape(url: string, options?: ScrapeOptions): Promise<FirecrawlResponse<ScrapeData>> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    
    // Handle nested data structure from Firecrawl API
    const scrapeData = data?.data || data;
    return {
      success: data?.success ?? true,
      error: data?.error,
      data: scrapeData,
    };
  },

  /**
   * Scrape multiple URLs in sequence with progress callback
   * Returns array of results for each URL
   */
  async scrapeMultiple(
    urls: string[],
    options?: ScrapeOptions,
    onProgress?: (completed: number, total: number, current: string, result: ScrapeResult) => void
  ): Promise<ScrapeResult[]> {
    const results: ScrapeResult[] = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      try {
        const response = await this.scrape(url, options);
        
        const result: ScrapeResult = {
          url,
          success: response.success,
          error: response.error,
          data: response.data,
        };
        
        results.push(result);
        
        if (onProgress) {
          onProgress(i + 1, urls.length, url, result);
        }
      } catch (error) {
        const result: ScrapeResult = {
          url,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        
        results.push(result);
        
        if (onProgress) {
          onProgress(i + 1, urls.length, url, result);
        }
      }
    }
    
    return results;
  },
};
