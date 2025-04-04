
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistance, isAfter, isBefore, parseISO } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SortOption } from "./ThoughtsFilter";
import Tag from "./Tag";
import { Draft, PanelLeftOpen } from "lucide-react";

interface TagType {
  tag_id: string;
  name: string;
  color: string;
}

interface Thought {
  thought_id: string;
  content: string;
  created_at: string;
  is_draft: boolean;
  tags?: TagType[];
}

interface ThoughtsListProps {
  refreshTrigger: number;
  searchQuery?: string;
  sortOption?: SortOption;
  dateRange?: {
    startDate: Date | null;
    endDate: Date | null;
  };
  selectedTagIds?: string[];
}

const ThoughtsList = ({ 
  refreshTrigger, 
  searchQuery = "",
  sortOption = "newest",
  dateRange = { startDate: null, endDate: null },
  selectedTagIds = []
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
        // Fetch all thoughts for the user
        const { data: thoughtsData, error: thoughtsError } = await supabase
          .from('thoughts')
          .select('thought_id, content, created_at, is_draft')
          .eq('user_id', user.id)
          .order('created_at', { ascending: sortOption === "oldest" });
          
        if (thoughtsError) throw thoughtsError;
        
        const thoughts = thoughtsData || [];
        
        // Fetch tag data for all thoughts
        const thoughtIds = thoughts.map(t => t.thought_id);
        
        if (thoughtIds.length) {
          const { data: tagsData, error: tagsError } = await supabase
            .from('thought_tags')
            .select('thought_id, tags (tag_id, name, color)')
            .in('thought_id', thoughtIds);
            
          if (tagsError) throw tagsError;
          
          // Create a map of thought_id to array of tags
          const tagsByThoughtId: Record<string, TagType[]> = {};
          
          tagsData?.forEach((item: any) => {
            const thoughtId = item.thought_id;
            const tag = item.tags;
            
            if (!tagsByThoughtId[thoughtId]) {
              tagsByThoughtId[thoughtId] = [];
            }
            
            tagsByThoughtId[thoughtId].push(tag);
          });
          
          // Add tags to each thought
          thoughts.forEach(thought => {
            thought.tags = tagsByThoughtId[thought.thought_id] || [];
          });
        }
        
        setThoughts(thoughts);
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
  
  // Apply filters whenever thoughts, searchQuery, dateRange, or selectedTagIds changes
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
    
    // Apply tag filter
    if (selectedTagIds.length > 0) {
      filtered = filtered.filter(thought => {
        if (!thought.tags || thought.tags.length === 0) return false;
        
        // Check if thought has any of the selected tags
        return thought.tags.some(tag => selectedTagIds.includes(tag.tag_id));
      });
    }
    
    setFilteredThoughts(filtered);
  }, [thoughts, searchQuery, dateRange, selectedTagIds]);
  
  const handleTagClick = (tagId: string) => {
    console.log(`Clicked on tag: ${tagId}`);
    // Handle tag click if needed
  };
  
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
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="whitespace-pre-wrap">{thought.content}</p>
            </div>
            {thought.is_draft && (
              <div className="ml-2 flex items-center text-amber-500">
                <Draft size={16} className="mr-1" />
                <span className="text-xs font-medium">Draft</span>
              </div>
            )}
          </div>
          
          {thought.tags && thought.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3 mb-2">
              {thought.tags.map(tag => (
                <Tag
                  key={tag.tag_id}
                  id={tag.tag_id}
                  name={tag.name}
                  color={tag.color}
                  size="sm"
                  onClick={handleTagClick}
                />
              ))}
            </div>
          )}
          
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
