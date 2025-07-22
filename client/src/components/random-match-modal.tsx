import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { getCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Search, Check } from "lucide-react";
import { t } from "@/lib/i18n";

interface RandomMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RandomMatchModal({ isOpen, onClose }: RandomMatchModalProps) {
  const [, setLocation] = useLocation();
  const [matchState, setMatchState] = useState<"searching" | "found" | "none">("none");
  const [foundMatch, setFoundMatch] = useState<any>(null);
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  const findMatchMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/matches/find", {
        userId: currentUser?.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.match) {
        setFoundMatch(data.match);
        setMatchState("found");
      } else {
        toast({
          title: t('noMatchesFound'),
          description: t('tryAgainLater'),
          variant: "destructive",
        });
        setMatchState("none");
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to find match",
        description: error.message,
        variant: "destructive",
      });
      setMatchState("none");
    },
  });

  const findAIMatchMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/matches/find-ai", {
        userId: currentUser?.id,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.match) {
        setFoundMatch(data.match);
        setMatchState("found");
      } else {
        toast({
          title: "AI 매칭에 실패했습니다",
          description: "다시 시도해주세요",
          variant: "destructive",
        });
        setMatchState("none");
      }
    },
    onError: (error) => {
      toast({
        title: "AI 매칭 실패",
        description: error.message,
        variant: "destructive",
      });
      setMatchState("none");
    },
  });

  const handleStartSearch = () => {
    setMatchState("searching");
    setTimeout(() => {
      findMatchMutation.mutate();
    }, 2000); // Simulate search delay
  };

  const handleStartAIMatch = () => {
    setMatchState("searching");
    setTimeout(() => {
      findAIMatchMutation.mutate();
    }, 1000); // AI matching is faster
  };

  const handleStartChat = () => {
    if (foundMatch) {
      setLocation(`/chat/${foundMatch.id}`);
      onClose();
      resetState();
    }
  };

  const handleDecline = () => {
    setMatchState("none");
    setFoundMatch(null);
    handleStartSearch(); // Find another match
  };

  const resetState = () => {
    setMatchState("none");
    setFoundMatch(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        {matchState === "none" && (
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">{t('findMatch')}</h3>
            <p className="text-text-secondary mb-6">{t('connectWithRandom')}</p>
            <div className="space-y-3">
              <Button
                onClick={handleStartSearch}
                className="w-full bg-primary hover:bg-primary-dark"
              >
                {t('startMatching')}
              </Button>
              <Button
                onClick={handleStartAIMatch}
                variant="outline"
                className="w-full"
              >
                AI와 매칭
              </Button>
            </div>
          </div>
        )}

        {matchState === "searching" && (
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">{t('findingMatch')}</h3>
            <p className="text-text-secondary mb-6">{t('lookingForSomeone')}</p>
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full"
            >
              {t('cancel')}
            </Button>
          </div>
        )}

        {matchState === "found" && foundMatch && (
          <div className="text-center py-4">
            <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">{t('matchFound')}</h3>
            <p className="text-text-secondary mb-6">{t('someoneConnected')}</p>
            <div className="space-y-3">
              <Button
                onClick={handleStartChat}
                className="w-full bg-primary hover:bg-primary-dark"
              >
                {t('startChatting')}
              </Button>
              <Button
                onClick={handleDecline}
                variant="outline"
                className="w-full"
              >
                {t('findAnother')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
