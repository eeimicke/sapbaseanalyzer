import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Lock, Sparkles, Shield, FileText, Bot } from "lucide-react";

interface GuestLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestLimitDialog({ open, onOpenChange }: GuestLimitDialogProps) {
  const { t } = useLanguage();

  const benefits = [
    { icon: Bot, textKey: "guest.benefit1" },
    { icon: FileText, textKey: "guest.benefit2" },
    { icon: Shield, textKey: "guest.benefit3" },
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-xl">
              {t("guest.limitReached")}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {t("guest.limitDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-muted-foreground">{t(benefit.textKey)}</span>
            </div>
          ))}
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="mt-0">
            {t("guest.maybeLater")}
          </AlertDialogCancel>
          <Link to="/auth" className="w-full sm:w-auto">
            <AlertDialogAction className="w-full nagarro-gradient text-background nagarro-glow">
              <Sparkles className="w-4 h-4 mr-2" />
              {t("guest.registerNow")}
            </AlertDialogAction>
          </Link>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
