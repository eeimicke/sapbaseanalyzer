import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AnalysisPrompt {
  id: string;
  name: string;
  prompt_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAnalysisPrompt() {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState<AnalysisPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the active prompt
  useEffect(() => {
    const loadPrompt = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("analysis_prompts")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .single();

      if (fetchError) {
        console.error("Error loading prompt:", fetchError);
        setError(fetchError.message);
      } else {
        setPrompt(data as AnalysisPrompt);
      }
      setIsLoading(false);
    };

    loadPrompt();
  }, []);

  // Save/update the prompt
  const savePrompt = async (newPromptText: string) => {
    if (!prompt) return;

    setIsSaving(true);
    setError(null);

    const { data, error: updateError } = await supabase
      .from("analysis_prompts")
      .update({ prompt_text: newPromptText })
      .eq("id", prompt.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error saving prompt:", updateError);
      setError(updateError.message);
      toast({
        title: "Fehler beim Speichern",
        description: updateError.message,
        variant: "destructive",
      });
    } else {
      setPrompt(data as AnalysisPrompt);
      toast({
        title: "Prompt gespeichert",
        description: "Der Analyse-Prompt wurde aktualisiert.",
      });
    }

    setIsSaving(false);
  };

  return {
    prompt,
    isLoading,
    isSaving,
    error,
    savePrompt,
  };
}
