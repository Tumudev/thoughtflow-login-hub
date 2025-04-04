
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import ThoughtForm from "@/components/ThoughtForm";
import ThoughtsList from "@/components/ThoughtsList";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleThoughtAdded = () => {
    // Increment trigger to refresh the thoughts list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button variant="outline" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Thoughts</h1>
          
          <div className="bg-card rounded-xl border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Add a New Thought</h2>
            <ThoughtForm onThoughtAdded={handleThoughtAdded} />
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">My Thought Stream</h2>
            <ThoughtsList refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
