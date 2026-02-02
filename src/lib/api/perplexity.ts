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

export type ServiceLink = {
  classification: string;
  text: string;
  value: string;
};

export const perplexityApi = {
  /**
   * Analyze a SAP service for a specific category using Perplexity AI
   * Perplexity will search the web using the provided links as starting points
   */
  async analyze(
    serviceName: string,
    serviceDescription: string,
    serviceLinks: ServiceLink[],
    category: AnalysisCategory
  ): Promise<AnalysisResponse> {
    const { data, error } = await supabase.functions.invoke('perplexity-analyze', {
      body: {
        serviceName,
        serviceDescription,
        serviceLinks,
        category,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};
