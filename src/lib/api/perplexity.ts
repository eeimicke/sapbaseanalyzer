import { supabase } from '@/integrations/supabase/client';

export type AnalysisCategory = 'security' | 'integration' | 'monitoring' | 'lifecycle';

export type AnalysisResult = {
  category: AnalysisCategory;
  content: string;
  citations: string[];
  model?: string;
};

export type AnalysisResponse = {
  success: boolean;
  error?: string;
  data?: AnalysisResult;
};

export type CrawledContent = {
  url: string;
  markdown: string;
  title?: string;
};

export const perplexityApi = {
  /**
   * Analyze crawled content for a specific SAP Basis category
   */
  async analyze(
    serviceName: string,
    serviceDescription: string,
    crawledContent: CrawledContent[],
    category: AnalysisCategory
  ): Promise<AnalysisResponse> {
    const { data, error } = await supabase.functions.invoke('perplexity-analyze', {
      body: {
        serviceName,
        serviceDescription,
        crawledContent,
        category,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  /**
   * Analyze all 4 categories in parallel
   */
  async analyzeAll(
    serviceName: string,
    serviceDescription: string,
    crawledContent: CrawledContent[],
    onProgress?: (completed: number, total: number, category: AnalysisCategory, result: AnalysisResponse) => void
  ): Promise<Map<AnalysisCategory, AnalysisResponse>> {
    const categories: AnalysisCategory[] = ['security', 'integration', 'monitoring', 'lifecycle'];
    const results = new Map<AnalysisCategory, AnalysisResponse>();

    // Run all analyses in parallel
    const promises = categories.map(async (category, index) => {
      const result = await this.analyze(serviceName, serviceDescription, crawledContent, category);
      results.set(category, result);
      
      if (onProgress) {
        // Calculate how many are done by counting non-pending results
        const completed = Array.from(results.values()).length;
        onProgress(completed, categories.length, category, result);
      }
      
      return { category, result };
    });

    await Promise.all(promises);
    return results;
  },
};
