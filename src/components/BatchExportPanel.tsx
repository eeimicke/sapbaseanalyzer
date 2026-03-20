import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { downloadAsFile } from "@/lib/confluence-export";
import {
  Loader2,
  Download,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
} from "lucide-react";
import type { ServiceInventoryItem } from "@/lib/sap-services";

interface BatchExportPanelProps {
  services: ServiceInventoryItem[];
  onClose: () => void;
}

type BatchStatus = "idle" | "starting" | "running" | "completed" | "failed";

export function BatchExportPanel({ services, onClose }: BatchExportPanelProps) {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [batchId, setBatchId] = useState<string | null>(null);
  const [status, setStatus] = useState<BatchStatus>("idle");
  const [totalServices, setTotalServices] = useState(0);
  const [completedServices, setCompletedServices] = useState(0);
  const [failedServices, setFailedServices] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const progressPercent = totalServices > 0 ? Math.round((completedServices / totalServices) * 100) : 0;

  // Subscribe to realtime updates on batch_exports
  useEffect(() => {
    if (!batchId) return;

    const channel = supabase
      .channel(`batch-${batchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'batch_exports',
          filter: `id=eq.${batchId}`,
        },
        (payload) => {
          const row = payload.new as any;
          setCompletedServices(row.completed_services || 0);
          setFailedServices(row.failed_services || 0);
          setTotalServices(row.total_services || 0);
          if (row.status === 'completed') {
            setStatus('completed');
            toast({
              title: language === 'de' ? 'Batch-Export abgeschlossen' : 'Batch export completed',
              description: language === 'de'
                ? `${row.completed_services} von ${row.total_services} Services analysiert.`
                : `${row.completed_services} of ${row.total_services} services analyzed.`,
            });
          } else if (row.status === 'failed') {
            setStatus('failed');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [batchId, language, toast]);

  const startBatchExport = useCallback(async () => {
    if (!isAuthenticated) {
      toast({
        title: language === 'de' ? 'Anmeldung erforderlich' : 'Authentication required',
        description: language === 'de'
          ? 'Bitte melden Sie sich an, um den Batch-Export zu nutzen.'
          : 'Please sign in to use batch export.',
        variant: 'destructive',
      });
      return;
    }

    setStatus('starting');
    try {
      const { data, error } = await supabase.functions.invoke('batch-export', {
        body: {
          action: 'start',
          services: services.map(s => ({
            technicalId: s.technicalId,
            displayName: s.displayName,
            fileName: s.fileName,
          })),
          language,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Unknown error');

      setBatchId(data.batchId);
      setTotalServices(services.length);
      setCompletedServices(0);
      setFailedServices(0);
      setStatus('running');
    } catch (err: any) {
      setStatus('failed');
      toast({
        title: language === 'de' ? 'Fehler beim Starten' : 'Failed to start',
        description: err.message,
        variant: 'destructive',
      });
    }
  }, [isAuthenticated, services, language, toast]);

  const downloadResult = useCallback(async () => {
    if (!batchId) return;
    setIsDownloading(true);

    try {
      const { data, error } = await supabase.functions.invoke('batch-export', {
        body: { action: 'download', batchId },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Download failed');

      downloadAsFile(
        data.markdown,
        `SAP_BTP_Batch_Analyse_${new Date().toISOString().slice(0, 10)}.md`,
        'text/markdown'
      );

      toast({
        title: language === 'de' ? 'Download gestartet' : 'Download started',
        description: language === 'de' ? 'Die Markdown-Datei wird heruntergeladen.' : 'The Markdown file is downloading.',
      });
    } catch (err: any) {
      toast({
        title: language === 'de' ? 'Download fehlgeschlagen' : 'Download failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  }, [batchId, language, toast]);

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">
              {language === 'de' ? 'Batch-Export' : 'Batch Export'}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>
          {language === 'de'
            ? `${services.length} Services werden im Backend analysiert und als Markdown exportiert.`
            : `${services.length} services will be analyzed in the backend and exported as Markdown.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        {(status === 'running' || status === 'completed') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedServices + failedServices} / {totalServices}
              </span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {completedServices > 0 && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  {completedServices} {language === 'de' ? 'erfolgreich' : 'completed'}
                </span>
              )}
              {failedServices > 0 && (
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-destructive" />
                  {failedServices} {language === 'de' ? 'fehlgeschlagen' : 'failed'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Status badge */}
        {status === 'running' && (
          <Badge variant="outline" className="border-primary/30 text-primary">
            <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
            {language === 'de' ? 'Wird verarbeitet...' : 'Processing...'}
          </Badge>
        )}

        {status === 'completed' && (
          <Badge variant="outline" className="border-green-500/30 text-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1.5" />
            {language === 'de' ? 'Abgeschlossen' : 'Completed'}
          </Badge>
        )}

        {status === 'failed' && (
          <Badge variant="outline" className="border-destructive/30 text-destructive">
            <AlertCircle className="w-3 h-3 mr-1.5" />
            {language === 'de' ? 'Fehlgeschlagen' : 'Failed'}
          </Badge>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {status === 'idle' && (
            <Button onClick={startBatchExport} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              {language === 'de' ? 'Batch-Export starten' : 'Start Batch Export'}
            </Button>
          )}

          {status === 'starting' && (
            <Button disabled className="flex-1">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {language === 'de' ? 'Wird gestartet...' : 'Starting...'}
            </Button>
          )}

          {status === 'completed' && (
            <Button onClick={downloadResult} disabled={isDownloading} className="flex-1">
              {isDownloading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {language === 'de' ? 'Markdown herunterladen' : 'Download Markdown'}
            </Button>
          )}

          {(status === 'failed') && (
            <Button onClick={startBatchExport} variant="outline" className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              {language === 'de' ? 'Erneut versuchen' : 'Retry'}
            </Button>
          )}
        </div>

        {!isAuthenticated && (
          <p className="text-xs text-muted-foreground text-center">
            {language === 'de'
              ? 'Anmeldung erforderlich für den Batch-Export.'
              : 'Sign in required for batch export.'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
