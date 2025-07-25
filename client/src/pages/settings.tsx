import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNavigation from "@/components/bottom-navigation";
import { getCurrentUser, logoutUser, isBackendAuthenticated } from "@/lib/auth";
import { backendAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  LogOut, 
  Trash2, 
  HelpCircle, 
  Mail,
  ChevronRight 
} from "lucide-react";

export default function SettingsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, language, setLanguage } = useI18n();
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);

  // Fetch current user data from backend
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      return await backendAPI.getCurrentUser();
    },
    enabled: isBackendAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logoutUser();
    },
    onSuccess: () => {
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
      setLocation("/login");
    },
    onError: (error) => {
      toast({
        title: "로그아웃 오류",
        description: "로그아웃 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error("Logout error:", error);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    toast({
      title: "계정 삭제",
      description: "계정 삭제 기능은 준비 중입니다.",
      variant: "destructive",
    });
  };

  const settingsItems = [
    {
      title: "계정 정보",
      icon: User,
      items: [
        {
          label: "이메일",
          value: currentUser?.email || "미확인",
          type: "info" as const,
        },
        {
          label: "이름",
          value: currentUser?.name || "미설정",
          type: "info" as const,
        },
        {
          label: "가입일",
          value: currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('ko-KR') : "미확인",
          type: "info" as const,
        },
      ],
    },
    {
      title: "알림 설정",
      icon: Bell,
      items: [
        {
          label: "푸시 알림",
          description: "새로운 댓글과 좋아요 알림을 받습니다",
          type: "toggle" as const,
          value: notifications,
          onChange: setNotifications,
        },
        {
          label: "이메일 알림",
          description: "중요한 업데이트를 이메일로 받습니다",
          type: "toggle" as const,
          value: false,
          onChange: () => {},
        },
      ],
    },
    {
      title: "개인정보 및 보안",
      icon: Shield,
      items: [
        {
          label: "비공개 프로필",
          description: "다른 사용자가 내 정보를 볼 수 없습니다",
          type: "toggle" as const,
          value: privateProfile,
          onChange: setPrivateProfile,
        },
        {
          label: "비밀번호 변경",
          type: "button" as const,
          action: () => {
            toast({
              title: "비밀번호 변경",
              description: "비밀번호 변경 기능은 준비 중입니다.",
            });
          },
        },
      ],
    },
    {
      title: "앱 설정",
      icon: Globe,
      items: [
        {
          label: "언어",
          description: "앱에서 사용할 언어를 선택하세요",
          type: "select" as const,
          value: language,
          options: [
            { value: "ko", label: "한국어" },
            { value: "en", label: "English" },
          ],
          onChange: setLanguage,
        },
        {
          label: "다크 모드",
          description: "어두운 테마로 앱을 사용합니다",
          type: "toggle" as const,
          value: darkMode,
          onChange: setDarkMode,
        },
      ],
    },
    {
      title: "지원 및 정보",
      icon: HelpCircle,
      items: [
        {
          label: "도움말",
          type: "button" as const,
          action: () => {
            toast({
              title: "도움말",
              description: "도움말 페이지는 준비 중입니다.",
            });
          },
        },
        {
          label: "문의하기",
          type: "button" as const,
          action: () => {
            toast({
              title: "문의하기",
              description: "문의 기능은 준비 중입니다.",
            });
          },
        },
        {
          label: "앱 버전",
          value: "1.0.0",
          type: "info" as const,
        },
      ],
    },
  ];

  if (userLoading) {
    return (
      <div className="min-h-screen bg-bg-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-soft max-w-md mx-auto bg-white shadow-xl relative">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-text-primary">설정</h1>
          <div className="flex items-center gap-2">
            {/* 설정 페이지에서는 별도 액션 버튼 없음 */}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          <div className="p-4 space-y-6">
        {/* User Info Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">{currentUser?.name || "사용자"}</CardTitle>
                <p className="text-sm text-text-secondary">{currentUser?.email || "이메일 없음"}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Settings Sections */}
        {settingsItems.map((section) => (
          <Card key={section.title}>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <section.icon className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.label}</div>
                    {item.description && (
                      <div className="text-xs text-text-secondary mt-1">
                        {item.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.type === "info" && (
                      <span className="text-sm text-text-secondary">{item.value}</span>
                    )}
                    
                    {item.type === "toggle" && (
                      <Switch
                        checked={item.value}
                        onCheckedChange={item.onChange}
                      />
                    )}
                    
                    {item.type === "select" && (
                      <Select value={item.value} onValueChange={item.onChange}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {item.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {item.type === "button" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={item.action}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-red-600">위험 구역</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              계정 삭제
            </Button>
          </CardContent>
        </Card>
          </div>
        </div>

        <BottomNavigation currentPage="settings" />
      </div>
    </div>
  );
}