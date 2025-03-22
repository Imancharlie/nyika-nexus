
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const InstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if the app is already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    await installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // Clear the saved prompt
    setInstallPrompt(null);
    setIsVisible(false);
  };

  const dismissPrompt = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed left-0 right-0 bottom-0 p-4 z-50">
      <Alert className="bg-primary/10 border-primary/20 relative">
        <AlertTitle className="text-primary-foreground font-semibold">
          Install Nyika Nexus
        </AlertTitle>
        <AlertDescription className="text-sm mt-2">
          Install our app on your device for a better experience and offline access.
        </AlertDescription>
        <div className="flex gap-3 mt-3">
          <Button 
            size="sm" 
            onClick={handleInstallClick}
            className="bg-primary hover:bg-primary/90"
          >
            Install
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={dismissPrompt}
          >
            Not now
          </Button>
        </div>
        <button
          onClick={dismissPrompt}
          className="absolute top-2 right-2 text-foreground/60 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </Alert>
    </div>
  );
};

export default InstallPrompt;
