
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const Dashboard = () => {
  const { user, logout } = useAuth();

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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          
          <div className="bg-card rounded-xl border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Welcome to ThoughtFlow</h2>
            <p className="text-muted-foreground mb-4">
              This is your personal dashboard where you can manage your thoughts and ideas.
            </p>
            <div className="bg-accent p-4 rounded-lg">
              <p className="text-sm">
                This is a protected route. You need to be authenticated to view this page.
              </p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border p-6">
                <h3 className="font-medium mb-2">Feature {i + 1}</h3>
                <p className="text-sm text-muted-foreground">
                  This is a placeholder for future features of ThoughtFlow.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
