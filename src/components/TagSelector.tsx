import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Tag from "@/components/Tag";
import { useToast } from "@/components/ui/use-toast";
import { TagType } from "@/types/tag";

interface TagSelectorProps {
  selectedTags: TagType[];
  onTagsChange: (tags: TagType[]) => void;
}

const TagSelector = ({ selectedTags, onTagsChange }: TagSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tags, setTags] = useState<TagType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all tags
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

  // Filter tags based on search query
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if a tag is already selected
  const isTagSelected = (tagId: string) => {
    return selectedTags.some((tag) => tag.tag_id === tagId);
  };

  // Add a tag to selected tags
  const addTag = (tag: TagType) => {
    if (!isTagSelected(tag.tag_id)) {
      const newSelectedTags = [...selectedTags, tag];
      onTagsChange(newSelectedTags);
    }
  };

  // Remove a tag from selected tags
  const removeTag = (tagId: string) => {
    const newSelectedTags = selectedTags.filter((tag) => tag.tag_id !== tagId);
    onTagsChange(newSelectedTags);
  };

  // Create a new tag
  const createTag = async () => {
    if (!newTagName.trim()) {
      toast({
        title: "Error",
        description: "Tag name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate a random color for the tag
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
      
      const { data, error } = await supabase
        .from("tags")
        .insert({ name: newTagName.trim(), color: randomColor })
        .select()
        .single();

      if (error) throw error;

      setTags([...tags, data]);
      addTag(data);
      setNewTagName("");
      toast({
        title: "Success",
        description: `Tag "${newTagName}" created successfully`,
      });
    } catch (error: any) {
      console.error("Error creating tag:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create tag",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <Tag
            key={tag.tag_id}
            id={tag.tag_id}
            name={tag.name}
            color={tag.color}
            onRemove={removeTag}
          />
        ))}
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1"
            >
              <Plus size={16} /> Add Tags
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <div className="h-[150px] overflow-y-auto my-2">
                {isLoading ? (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    Loading tags...
                  </div>
                ) : filteredTags.length === 0 ? (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    No tags found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTags.map((tag) => (
                      <div
                        key={tag.tag_id}
                        className={`p-1.5 rounded text-sm cursor-pointer hover:bg-muted ${
                          isTagSelected(tag.tag_id) ? "bg-muted" : ""
                        }`}
                        onClick={() => addTag(tag)}
                      >
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
              
              <div className="pt-2 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="New tag name"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    size="sm"
                    disabled={!newTagName.trim() || isLoading}
                    onClick={createTag}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default TagSelector;
