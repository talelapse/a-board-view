import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/components/i18n-provider";
import NotFound from "@/pages/not-found";
import Register from "@/pages/register";
import Login from "@/pages/login";
import Feed from "@/pages/feed";
import PostPage from "@/pages/post";
import SettingsPage from "@/pages/settings";
import Chat from "@/pages/chat";
import ChatsList from "@/pages/chats-list";
import { getAuthenticatedUser, isBackendAuthenticated } from "@/lib/auth";

function Router() {
  const authenticatedUser = getAuthenticatedUser();
  const hasBackendAuth = isBackendAuthenticated();
  
  // For this app, we now require backend authentication for all features
  // Anonymous users should go through login/register to get backend auth
  const shouldShowAuth = !hasBackendAuth;
  
  return (
    <Switch>
      <Route path="/" component={shouldShowAuth ? Login : Feed} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/feed" component={hasBackendAuth ? Feed : Login} />
      <Route path="/post/:id" component={hasBackendAuth ? PostPage : Login} />
      <Route path="/settings" component={hasBackendAuth ? SettingsPage : Login} />
      <Route path="/chat/:matchId" component={hasBackendAuth ? Chat : Login} />
      <Route path="/chats" component={hasBackendAuth ? ChatsList : Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
