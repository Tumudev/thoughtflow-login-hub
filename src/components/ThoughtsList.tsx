
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistance } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface Thought {
  thought_id: string;
  content: string;
  created_at: string;
}

const ThoughtsList = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchThoughts = async () => {
      setIsLoading(true);
      try {
        // Use the Supabase client with type assertions to bypass type checking
        const { data, error } = await supabase
          .from('thoughts')
          .select('thought_id, content, created_at')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setThoughts(data as Thought[] || []);
      } catch (error) {
        console.error("Error fetching thoughts:", error);
        toast({
          title: "Error",
          description: "Failed to load your thoughts. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchThoughts();
  }, [refreshTrigger, toast]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-muted-foreground">Loading thoughts...</div>
      </div>
    );
  }
  
  if (thoughts.length === 0) {
    return (
      <div className="bg-muted/40 rounded-lg p-6 text-center">
        <p className="text-muted-foreground">You haven't saved any thoughts yet.</p>
        <p className="text-sm">Your thoughts will appear here once you save them.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {thoughts.map((thought) => (
        <div key={thought.thought_id} className="bg-card rounded-lg border p-4">
          <p className="whitespace-pre-wrap mb-2">{thought.content}</p>
          <div className="text-xs text-muted-foreground">
            <span title={format(new Date(thought.created_at), "PPpp")}>
              {formatDistance(new Date(thought.created_at), new Date(), { addSuffix: true })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThoughtsList;
