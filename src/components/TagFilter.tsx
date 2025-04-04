import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CheckIcon, Tag as TagIcon, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Tag from "@/components/Tag";
import { TagType } from "@/types/tag";

interface TagFilterProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
}

const TagFilter = ({ selectedTagIds, onTagsChange }: TagFilterProps) => {
  const [tags, setTags] = useState<TagType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("tags")
          .select("*")
          .order("name");

        if (error) throw error;
        setTags(data || []);
      } catch (error) {
        console.error("Error fetching tags:", error);
        toast({
          title: "Error",
          description: "Failed to load tags. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [toast]);

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const clearFilters = () => {
    onTagsChange([]);
    setIsOpen(false);
  };

  // Get selected tags with their full info
  const selectedTags = tags.filter(tag => selectedTagIds.includes(tag.tag_id));

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline" 
            size="sm"
            className={`flex h-8 items-center gap-1 ${selectedTagIds.length > 0 ? 'border-primary' : ''}`}
          >
            <TagIcon size={16} />
            <span>Tags</span>
            {selectedTagIds.length > 0 && (
              <span className="ml-1 rounded-full bg-primary text-xs text-primary-foreground px-1.5">
                {selectedTagIds.length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Filter by tags</h4>
              {selectedTagIds.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={clearFilters}
                >
                  Clear all
                </Button>
              )}
            </div>
            
            <div className="h-[200px] overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-2 text-sm text-muted-foreground">
                  Loading tags...
                </div>
              ) : tags.length === 0 ? (
                <div className="text-center py-2 text-sm text-muted-foreground">
                  No tags found
                </div>
              ) : (
                <div className="space-y-1">
                  {tags.map((tag) => (
                    <div
                      key={tag.tag_id}
                      className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-muted"
                      onClick={() => toggleTag(tag.tag_id)}
                    >
                      <div className="w-5 flex justify-center">
                        {selectedTagIds.includes(tag.tag_id) && (
                          <CheckIcon size={16} className="text-primary" />
                        )}
                      </div>
                      <Tag
                        id={tag.tag_id}
                        name={tag.name}
                        color={tag.color}
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {selectedTagIds.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTags.map(tag => (
            <Tag
              key={tag.tag_id}
              id={tag.tag_id}
              name={tag.name}
              color={tag.color}
              size="sm"
              onRemove={() => toggleTag(tag.tag_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TagFilter;
