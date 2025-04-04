
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import ThoughtForm from "@/components/ThoughtForm";
import ThoughtsList from "@/components/ThoughtsList";
import SearchBar from "@/components/SearchBar";
import ThoughtsFilter, { SortOption } from "@/components/ThoughtsFilter";
import TagFilter from "@/components/TagFilter";
import UserNav from "@/components/UserNav";

const Dashboard = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const handleThoughtAdded = () => {
    // Increment trigger to refresh the thoughts list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  const handleDateFilterChange = (startDate: Date | null, endDate: Date | null) => {
    setDateRange({ startDate, endDate });
  };

  const handleTagsChange = (tagIds: string[]) => {
    setSelectedTagIds(tagIds);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <UserNav />
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
            
            <div className="space-y-4 mb-6">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Search thoughts..." 
              />
              
              <div className="flex flex-col sm:flex-row gap-4">
                <ThoughtsFilter 
                  onSortChange={handleSortChange}
                  onDateFilterChange={handleDateFilterChange}
                />
                
                <TagFilter
                  selectedTagIds={selectedTagIds}
                  onTagsChange={handleTagsChange}
                />
              </div>
            </div>
            
            <ThoughtsList 
              refreshTrigger={refreshTrigger} 
              searchQuery={searchQuery}
              sortOption={sortOption}
              dateRange={dateRange}
              selectedTagIds={selectedTagIds}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
