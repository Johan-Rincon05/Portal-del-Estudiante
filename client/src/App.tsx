import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <ProtectedRoute path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
