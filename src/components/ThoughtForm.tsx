
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const ThoughtForm = ({ onThoughtAdded }: { onThoughtAdded: () => void }) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your thought",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the Supabase client with type assertions to bypass type checking
      const { error } = await supabase
        .from('thoughts')
        .insert([{ content }]);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Your thought has been saved",
      });
      
      setContent("");
      onThoughtAdded();
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
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[120px] resize-none"
          disabled={isSubmitting}
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting || !content.trim()}
      >
        {isSubmitting ? "Saving..." : "Save Thought"}
      </Button>
    </form>
  );
};

export default ThoughtForm;
