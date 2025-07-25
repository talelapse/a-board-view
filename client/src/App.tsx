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
import Chat from "@/pages/chat";
import ChatsList from "@/pages/chats-list";
import { getAuthenticatedUser, isBackendAuthenticated } from "@/lib/auth";

function Router() {
  const authenticatedUser = getAuthenticatedUser();
  const hasBackendAuth = isBackendAuthenticated();
  
  return (
    <Switch>
      <Route path="/" component={authenticatedUser ? Feed : Register} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/feed" component={Feed} />
      <Route path="/chat/:matchId" component={Chat} />
      <Route path="/chats" component={ChatsList} />
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
