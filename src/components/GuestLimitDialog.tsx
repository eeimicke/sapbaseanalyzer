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
import { Linkedin, MessageCircle } from "lucide-react";

interface GuestLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestLimitDialog({ open, onOpenChange }: GuestLimitDialogProps) {
  const { t, language } = useLanguage();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-xl">
              {language === "de" ? "Kontakt aufnehmen" : "Get in Touch"}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            {language === "de" 
              ? "Für weitere Analysen und Fragen kontaktieren Sie mich gerne über LinkedIn."
              : "For more analyses and questions, please contact me via LinkedIn."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-3 text-sm p-4 rounded-lg bg-muted/50">
            <div className="w-10 h-10 rounded-lg bg-[#0A66C2] flex items-center justify-center flex-shrink-0">
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium">Ernst Eimicke</p>
              <p className="text-muted-foreground text-xs">SAP BTP & Cloud Architecture</p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="mt-0">
            {language === "de" ? "Schließen" : "Close"}
          </AlertDialogCancel>
          <a 
            href="https://www.linkedin.com/in/eeimicke" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <AlertDialogAction className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white">
              <Linkedin className="w-4 h-4 mr-2" />
              {language === "de" ? "Auf LinkedIn kontaktieren" : "Contact on LinkedIn"}
            </AlertDialogAction>
          </a>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
