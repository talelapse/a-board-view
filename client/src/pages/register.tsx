import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { setCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [, setLocation] = useLocation();
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState<"a" | "b" | "">("");
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: async (userData: { birthYear: number; gender: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentUser(data.user);
      setLocation("/feed");
      toast({
        title: "Welcome!",
        description: "Your anonymous profile has been created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthYear || !gender) {
      toast({
        title: "Please fill all fields",
        description: "Birth year and gender are required.",
        variant: "destructive",
      });
      return;
    }
    
    const year = parseInt(birthYear);
    if (year < 1950 || year > 2010) {
      toast({
        title: "Invalid birth year",
        description: "Please enter a valid birth year between 1950 and 2010.",
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
            <h1 className="text-2xl font-bold text-text-primary mb-2">Join Anonymous</h1>
            <p className="text-text-secondary">Connect without revealing who you are</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="birthYear" className="text-text-primary">Birth Year</Label>
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
              <Label className="text-text-primary">Gender</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <Button
                  type="button"
                  variant={gender === "a" ? "default" : "outline"}
                  onClick={() => setGender("a")}
                  className={gender === "a" ? "bg-gender-a hover:bg-gender-a/90" : "hover:bg-gender-a hover:text-white"}
                >
                  Option A
                </Button>
                <Button
                  type="button"
                  variant={gender === "b" ? "default" : "outline"}
                  onClick={() => setGender("b")}
                  className={gender === "b" ? "bg-gender-b hover:bg-gender-b/90" : "hover:bg-gender-b hover:text-white"}
                >
                  Option B
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating..." : "Create Anonymous Profile"}
            </Button>
          </form>

          <p className="text-xs text-text-secondary text-center mt-6">
            Your identity remains completely anonymous. Only birth year and gender are used for matching.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
