
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import TagSelector from "@/components/TagSelector";
import { SaveIcon } from "lucide-react";

interface TagType {
  tag_id: string;
  name: string;
  color: string;
}

const ThoughtForm = ({ onThoughtAdded }: { onThoughtAdded: () => void }) => {
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load any existing draft when component mounts
  useEffect(() => {
    const loadDraft = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('thoughts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_draft', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
          throw error;
        }
        
        if (data) {
          setContent(data.content);
          setDraftId(data.thought_id);
          setIsDraft(true);
          
          // Fetch tags for this draft
          const { data: tagData, error: tagError } = await supabase
            .from('thought_tags')
            .select('tags(tag_id, name, color)')
            .eq('thought_id', data.thought_id);
            
          if (tagError) throw tagError;
          
          if (tagData && tagData.length > 0) {
            const formattedTags = tagData.map((item: any) => item.tags);
            setSelectedTags(formattedTags);
          }
          
          toast({
            title: "Draft loaded",
            description: "Your previous draft has been loaded.",
          });
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    };
    
    loadDraft();
  }, [user, toast]);

  // Set up autosave whenever content or tags change
  useEffect(() => {
    if (!user || !content.trim()) return;
    
    // Clear previous timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    // Set new timer for autosave
    const timer = setTimeout(() => {
      autoSave();
    }, 5000); // Autosave after 5 seconds of inactivity
    
    setAutoSaveTimer(timer);
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [content, selectedTags, user]);

  const autoSave = async () => {
    if (!user || !content.trim()) return;
    
    try {
      let thoughtId = draftId;
      
      // Insert or update the thought as a draft
      if (!thoughtId) {
        // Create new draft
        const { data, error } = await supabase
          .from('thoughts')
          .insert({
            content,
            user_id: user.id,
            is_draft: true
          })
          .select()
          .single();
          
        if (error) throw error;
        
        thoughtId = data.thought_id;
        setDraftId(thoughtId);
      } else {
        // Update existing draft
        const { error } = await supabase
          .from('thoughts')
          .update({
            content,
            updated_at: new Date().toISOString()
          })
          .eq('thought_id', thoughtId);
          
        if (error) throw error;
      }
      
      // Handle tags for the draft
      if (thoughtId) {
        // First delete existing tags
        await supabase
          .from('thought_tags')
          .delete()
          .eq('thought_id', thoughtId);
          
        // Then insert new ones if any
        if (selectedTags.length > 0) {
          const tagMappings = selectedTags.map(tag => ({
            thought_id: thoughtId,
            tag_id: tag.tag_id
          }));
          
          const { error } = await supabase
            .from('thought_tags')
            .insert(tagMappings);
            
          if (error) throw error;
        }
      }
      
      setIsDraft(true);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error auto-saving draft:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();
    
    if (!content.trim() && !saveAsDraft) {
      toast({
        title: "Error",
        description: "Please enter some content for your thought",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save thoughts",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let operation;
      
      if (draftId) {
        // Update existing draft or publish it
        operation = supabase
          .from('thoughts')
          .update({
            content,
            is_draft: saveAsDraft,
            updated_at: new Date().toISOString()
          })
          .eq('thought_id', draftId);
      } else {
        // Create new thought
        operation = supabase
          .from('thoughts')
          .insert({
            content,
            user_id: user.id,
            is_draft: saveAsDraft
          })
          .select();
      }
      
      const { data, error } = await operation;
      
      if (error) throw error;
      
      let thoughtId = draftId;
      
      if (!draftId && data) {
        thoughtId = data[0].thought_id;
        setDraftId(saveAsDraft ? thoughtId : null);
      }
      
      // Handle tags
      if (thoughtId) {
        // First delete existing tags
        await supabase
          .from('thought_tags')
          .delete()
          .eq('thought_id', thoughtId);
          
        // Then insert new ones if any
        if (selectedTags.length > 0) {
          const tagMappings = selectedTags.map(tag => ({
            thought_id: thoughtId,
            tag_id: tag.tag_id
          }));
          
          const { error: tagError } = await supabase
            .from('thought_tags')
            .insert(tagMappings);
            
          if (tagError) throw tagError;
        }
      }
      
      toast({
        title: "Success",
        description: saveAsDraft 
          ? "Your draft has been saved" 
          : "Your thought has been published",
      });
      
      if (!saveAsDraft) {
        setContent("");
        setSelectedTags([]);
        setDraftId(null);
        setIsDraft(false);
        onThoughtAdded();
      } else {
        setIsDraft(true);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error("Error saving thought:", error);
      toast({
        title: "Error",
        description: "Failed to save your thought. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsChange = (tags: TagType[]) => {
    setSelectedTags(tags);
  };
  
  return (
    <form className="space-y-4">
      <div>
        <Textarea
          ref={textareaRef}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px] resize-none"
          disabled={isSubmitting}
        />
      </div>
      
      <TagSelector
        selectedTags={selectedTags}
        onTagsChange={handleTagsChange}
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            type="submit" 
            onClick={(e) => handleSubmit(e, false)}
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? "Saving..." : isDraft ? "Publish Thought" : "Save Thought"}
          </Button>
          
          <Button 
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting || !content.trim()}
          >
            <SaveIcon size={16} className="mr-1" />
            Save as Draft
          </Button>
        </div>
        
        {lastSaved && (
          <span className="text-xs text-muted-foreground">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>
    </form>
  );
};

export default ThoughtForm;
