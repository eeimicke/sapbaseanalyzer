import { supabase } from '@/integrations/supabase/client';
import type { ServiceDetails, ServicePlan } from '@/lib/sap-services';

// Categories used for UI display (4 cards)
export type AnalysisCategoryUI = 'security' | 'integration' | 'monitoring' | 'lifecycle';

// Categories used for API calls (includes full-basis for combined analysis)
export type AnalysisCategory = AnalysisCategoryUI | 'full-basis';

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

export type SupportComponent = {
  value: string;
  classification: string;
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

  /**
   * Analyze a SAP service with full context: base prompt from DB + complete service metadata
   * This is the new unified analysis method combining basis-prompt with service data
   */
  async analyzeWithFullContext(
    serviceName: string,
    serviceDescription: string,
    serviceDetails: ServiceDetails,
    basePrompt: string,
    fileName?: string
  ): Promise<AnalysisResponse> {
    // Build GitHub repository URL for the service metadata
    const githubRepoUrl = fileName 
      ? `https://github.com/SAP-samples/btp-service-metadata/blob/main/v1/developer/${fileName}.json`
      : null;

    // Prepare service links
    const serviceLinks: ServiceLink[] = (serviceDetails.links || [])
      .filter(l => l.value?.startsWith('http'))
      .map(l => ({
        classification: l.classification || 'Other',
        text: l.text || l.classification || 'Link',
        value: l.value,
      }));

    // Prepare service plans (simplified for context)
    const servicePlans: Array<{
      name: string;
      displayName: string;
      description: string;
      isFree: boolean;
      regions: string[];
    }> = (serviceDetails.servicePlans || []).map(plan => ({
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description,
      isFree: plan.isFree,
      regions: plan.dataCenters?.map(dc => dc.region || dc.name) || [],
    }));

    // Prepare support components
    const supportComponents: SupportComponent[] = serviceDetails.supportComponents || [];

    const { data, error } = await supabase.functions.invoke('perplexity-analyze', {
      body: {
        serviceName,
        serviceDescription,
        serviceLinks,
        servicePlans,
        supportComponents,
        githubRepoUrl,
        category: 'full-basis',
        basePrompt,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};
