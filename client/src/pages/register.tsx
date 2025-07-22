import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { setCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

export default function Register() {
  const [, setLocation] = useLocation();
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState<"a" | "b" | "">("");
  const { toast } = useToast();
  const { t } = useI18n();

  const registerMutation = useMutation({
    mutationFn: async (userData: { birthYear: number; gender: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentUser(data.user);
      setLocation("/feed");
      toast({
        title: t('welcome'),
        description: t('profileCreated'),
      });
    },
    onError: (error) => {
      toast({
        title: t('registrationFailed'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthYear || !gender) {
      toast({
        title: t('pleaseFillFields'),
        description: t('birthYearGenderRequired'),
        variant: "destructive",
      });
      return;
    }
    
    const year = parseInt(birthYear);
    if (year < 1950 || year > 2010) {
      toast({
        title: t('invalidBirthYear'),
        description: t('validBirthYear'),
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({ birthYear: year, gender });
  };

  return (
    <div className="min-h-screen bg-bg-soft flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
              <i className="fas fa-user-secret text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">{t('joinAnonymous')}</h1>
            <p className="text-text-secondary">{t('connectWithoutRevealing')}</p>
          </div>

          <div className="space-y-4 mb-6">
            <Button
              className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 flex items-center justify-center space-x-2"
              onClick={() => {/* TODO: Implement Google login */}}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google로 계속하기</span>
            </Button>
            
            <Button
              className="w-full bg-black hover:bg-gray-900 text-white flex items-center justify-center space-x-2"
              onClick={() => {/* TODO: Implement Apple login */}}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C6.624 0 2.246 4.377 2.246 9.771s4.378 9.771 9.771 9.771 9.771-4.377 9.771-9.771S17.41 0 12.017 0zm3.357 7.5c-.914 0-1.663-.749-1.663-1.663S14.46 4.174 15.374 4.174s1.663.749 1.663 1.663-.749 1.663-1.663 1.663zm-6.714 0c-.914 0-1.663-.749-1.663-1.663S7.746 4.174 8.66 4.174s1.663.749 1.663 1.663-.749 1.663-1.663 1.663z"/>
              </svg>
              <span>Apple로 계속하기</span>
            </Button>
            
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2"
              onClick={() => {/* TODO: Implement Facebook login */}}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook으로 계속하기</span>
            </Button>
          </div>

          <Separator className="my-6" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="birthYear" className="text-text-primary">{t('birthYear')}</Label>
              <Input
                id="birthYear"
                type="number"
                placeholder="1990"
                min="1950"
                max="2010"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-text-primary">{t('gender')}</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Button
                  type="button"
                  variant={gender === "a" ? "default" : "outline"}
                  onClick={() => setGender("a")}
                  className={gender === "a" ? "bg-gender-a hover:bg-gender-a/90" : "hover:bg-gender-a hover:text-white"}
                >
                  {t('optionA')}
                </Button>
                <Button
                  type="button"
                  variant={gender === "b" ? "default" : "outline"}
                  onClick={() => setGender("b")}
                  className={gender === "b" ? "bg-gender-b hover:bg-gender-b/90" : "hover:bg-gender-b hover:text-white"}
                >
                  {t('optionB')}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? t('creating') : t('createAnonymousProfile')}
            </Button>
          </form>

          <p className="text-xs text-text-secondary text-center mt-6">
            {t('identityRemains')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
