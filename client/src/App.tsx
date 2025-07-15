import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Register from "@/pages/register";
import Feed from "@/pages/feed";
import Chat from "@/pages/chat";
import ChatsList from "@/pages/chats-list";
import { getCurrentUser } from "@/lib/auth";

function Router() {
  const currentUser = getCurrentUser();
  
  return (
    <Switch>
      <Route path="/" component={currentUser ? Feed : Register} />
      <Route path="/register" component={Register} />
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
