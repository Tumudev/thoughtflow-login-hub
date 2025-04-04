
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import Logo from "@/components/Logo";
import { Link } from "react-router-dom";
import UserNav from "@/components/UserNav";

interface UserProfile {
  display_name: string | null;
  avatar_url: string | null;
  email_notifications: boolean;
}

const Settings = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setDisplayName(data.display_name || "");
          setAvatarUrl(data.avatar_url);
          setEmailNotifications(data.email_notifications);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsProfileLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user, toast]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setAvatar(file);
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async () => {
    if (!user || !avatar) return null;
    
    const fileExt = avatar.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('thought_attachments')
        .upload(fileName, avatar);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('thought_attachments')
        .getPublicUrl(fileName);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      let newAvatarUrl = avatarUrl;
      
      if (avatar) {
        newAvatarUrl = await uploadAvatar();
      }
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName,
          avatar_url: newAvatarUrl,
          email_notifications: emailNotifications,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Success",
        description: "Your password has been updated",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: "Failed to update your password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <UserNav />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
          
          <div className="bg-card rounded-xl border p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatar">Profile Picture</Label>
                <div className="flex items-center gap-4">
                  {avatarUrl && (
                    <div className="h-16 w-16 rounded-full overflow-hidden">
                      <img 
                        src={avatarUrl} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <Input
                    id="avatar"
                    type="file"
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
                <Label htmlFor="notifications">
                  Receive email notifications
                </Label>
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </div>
          
          <div className="bg-card rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={changePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
