import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { backendAPI } from "@/lib/api";
import { setCurrentBackendUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useI18n();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    birthYear: ""
  });

  // Verification state
  const [verificationEmail, setVerificationEmail] = useState("");
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await backendAPI.login(data);
      return response;
    },
    onSuccess: async () => {
      // Get user data after successful login
      try {
        const users = await backendAPI.getUsers();
        const user = users.find(u => u.email === loginData.email);
        if (user) {
          setCurrentBackendUser(user);
          setLocation("/feed");
          toast({
            title: "로그인 성공",
            description: "환영합니다!",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast({
          title: "로그인 성공",
          description: "사용자 정보를 가져오는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "로그인 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      gender: string;
      birthYear: number;
    }) => {
      const response = await backendAPI.signup(data);
      return response;
    },
    onSuccess: (user) => {
      setVerificationEmail(user.email);
      setShowVerification(true);
      toast({
        title: "회원가입 성공",
        description: "이메일 인증을 위한 코드가 발송되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "회원가입 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      await backendAPI.verifyEmail(data.email, data.code);
    },
    onSuccess: () => {
      toast({
        title: "인증 완료",
        description: "이제 로그인하실 수 있습니다.",
      });
      setShowVerification(false);
    },
    onError: (error) => {
      toast({
        title: "인증 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (email: string) => {
      await backendAPI.resendVerification(email);
    },
    onSuccess: () => {
      toast({
        title: "인증 코드 재발송",
        description: "새로운 인증 코드가 발송되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "재발송 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginData);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.gender || !signupData.birthYear) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    const year = parseInt(signupData.birthYear);
    if (year < 1950 || year > 2010) {
      toast({
        title: "출생년도 오류",
        description: "올바른 출생년도를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    signupMutation.mutate({
      name: signupData.name,
      email: signupData.email,
      password: signupData.password,
      gender: signupData.gender,
      birthYear: year,
    });
  };

  const handleVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      toast({
        title: "인증 코드 오류",
        description: "인증 코드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    verifyMutation.mutate({ email: verificationEmail, code: verificationCode });
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">이메일 인증</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <Label htmlFor="verification-code">인증 코드</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="6자리 인증 코드를 입력하세요"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? "인증 중..." : "인증하기"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => resendMutation.mutate(verificationEmail)}
                disabled={resendMutation.isPending}
              >
                {resendMutation.isPending ? "재발송 중..." : "인증 코드 재발송"}
              </Button>
            </form>
            
            <p className="text-sm text-text-secondary text-center mt-4">
              {verificationEmail}로 인증 코드가 발송되었습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">A Board View</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">이메일</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="login-password">비밀번호</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "로그인 중..." : "로그인"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="signup-name">이름</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={signupData.name}
                    onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="signup-email">이메일</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="signup-confirm-password">비밀번호 확인</Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="signup-birth-year">출생년도</Label>
                  <Input
                    id="signup-birth-year"
                    type="number"
                    min="1950"
                    max="2010"
                    value={signupData.birthYear}
                    onChange={(e) => setSignupData(prev => ({ ...prev, birthYear: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label>성별</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Button
                      type="button"
                      variant={signupData.gender === "male" ? "default" : "outline"}
                      onClick={() => setSignupData(prev => ({ ...prev, gender: "male" }))}
                    >
                      남성
                    </Button>
                    <Button
                      type="button"
                      variant={signupData.gender === "female" ? "default" : "outline"}
                      onClick={() => setSignupData(prev => ({ ...prev, gender: "female" }))}
                    >
                      여성
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? "가입 중..." : "회원가입"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLocation("/")}
            >
              익명으로 계속하기 (기존 방식)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}