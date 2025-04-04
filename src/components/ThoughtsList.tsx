
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistance, isAfter, isBefore, parseISO } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SortOption } from "./ThoughtsFilter";

interface Thought {
  thought_id: string;
  content: string;
  created_at: string;
}

interface ThoughtsListProps {
  refreshTrigger: number;
  searchQuery?: string;
  sortOption?: SortOption;
  dateRange?: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

const ThoughtsList = ({ 
  refreshTrigger, 
  searchQuery = "",
  sortOption = "newest",
  dateRange = { startDate: null, endDate: null }
}: ThoughtsListProps) => {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [filteredThoughts, setFilteredThoughts] = useState<Thought[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchThoughts = async () => {
      if (!user) {
        setThoughts([]);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('thoughts')
          .select('thought_id, content, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: sortOption === "oldest" });
          
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
  }, [refreshTrigger, toast, user, sortOption]);
  
  // Apply filters whenever thoughts, searchQuery, or dateRange changes
  useEffect(() => {
    let filtered = [...thoughts];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(thought => 
        thought.content.toLowerCase().includes(query)
      );
    }
    
    // Apply date range filter
    if (dateRange.startDate || dateRange.endDate) {
      filtered = filtered.filter(thought => {
        const thoughtDate = parseISO(thought.created_at);
        let matches = true;
        
        if (dateRange.startDate) {
          matches = matches && isAfter(thoughtDate, dateRange.startDate);
        }
        
        if (dateRange.endDate) {
          // Add one day to make the end date inclusive
          const endDatePlusOne = new Date(dateRange.endDate);
          endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
          matches = matches && isBefore(thoughtDate, endDatePlusOne);
        }
        
        return matches;
      });
    }
    
    setFilteredThoughts(filtered);
  }, [thoughts, searchQuery, dateRange]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-muted-foreground">Loading thoughts...</div>
      </div>
    );
  }
  
  if (filteredThoughts.length === 0) {
    if (thoughts.length === 0) {
      return (
        <div className="bg-muted/40 rounded-lg p-6 text-center">
          <p className="text-muted-foreground">You haven't saved any thoughts yet.</p>
          <p className="text-sm">Your thoughts will appear here once you save them.</p>
        </div>
      );
    } else {
      return (
        <div className="bg-muted/40 rounded-lg p-6 text-center">
          <p className="text-muted-foreground">No thoughts match your search criteria.</p>
          <p className="text-sm">Try adjusting your filters or search query.</p>
        </div>
      );
    }
  }
  
  return (
    <div className="space-y-4">
      {filteredThoughts.map((thought) => (
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
