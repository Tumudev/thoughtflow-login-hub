
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialQuery?: string;
  className?: string;
  autoSubmit?: boolean;
  debounceTime?: number;
}

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search...", 
  initialQuery = "", 
  className = "",
  autoSubmit = false,
  debounceTime = 300
}: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Set up debounce for search query
  useEffect(() => {
    if (!autoSubmit) return;
    
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceTime);
    
    return () => clearTimeout(timer);
  }, [query, debounceTime, autoSubmit]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (autoSubmit) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch, autoSubmit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoSubmit) {
      onSearch(query);
    }
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSearch} className={`relative w-full ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
