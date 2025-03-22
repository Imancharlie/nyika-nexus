
import { useState } from "react";
import { PageTransition } from "@/components/shared/AnimatedWrapper";
import { Motion } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bell, Phone, Mail, MapPin, Shield, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/shared/Navbar";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+254 712 345 678",
    location: "Nairobi, Kenya",
    notifyChallenge: true,
    notifyService: true,
    notifyCommunity: false,
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <PageTransition>
        <div className="pt-24 pb-16">
          {/* Profile Header */}
          <div className="mb-8">
            <Motion fadeInUp>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
            </Motion>
            <Motion fadeIn delay={200}>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </Motion>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Summary Card */}
            <Motion fadeInUp className="md:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24 border-4 border-primary/20">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="text-2xl">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">{user?.name}</CardTitle>
                  <CardDescription>{user?.role === 'farmer' ? 'Farmer' : 'Staff Member'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="destructive" onClick={handleLogout} className="w-full gap-2">
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </Button>
                </CardFooter>
              </Card>
            </Motion>
            
            {/* Profile Settings */}
            <Motion fadeInUp delay={100} className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Account Settings</CardTitle>
                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-base font-medium flex items-center gap-2 mb-4">
                        <User className="h-4 w-4" />
                        Personal Information
                      </h3>
                      <div className="space-y-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            value={profile.name} 
                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={profile.email} 
                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            value={profile.phone} 
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="location">Location</Label>
                          <Input 
                            id="location" 
                            value={profile.location} 
                            onChange={(e) => setProfile({...profile, location: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Notification Settings */}
                    <div>
                      <h3 className="text-base font-medium flex items-center gap-2 mb-4">
                        <Bell className="h-4 w-4" />
                        Notification Preferences
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="notify-challenge">Challenge Updates</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications when your reported challenges get updates
                            </p>
                          </div>
                          <Switch 
                            id="notify-challenge" 
                            checked={profile.notifyChallenge}
                            onCheckedChange={(checked) => setProfile({...profile, notifyChallenge: checked})}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="notify-service">Service Status</Label>
                            <p className="text-sm text-muted-foreground">
                              Get notified about changes to your service orders
                            </p>
                          </div>
                          <Switch 
                            id="notify-service" 
                            checked={profile.notifyService}
                            onCheckedChange={(checked) => setProfile({...profile, notifyService: checked})}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="notify-community">Community Activity</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications about new posts and comments
                            </p>
                          </div>
                          <Switch 
                            id="notify-community" 
                            checked={profile.notifyCommunity}
                            onCheckedChange={(checked) => setProfile({...profile, notifyCommunity: checked})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Security Settings */}
                    <div>
                      <h3 className="text-base font-medium flex items-center gap-2 mb-4">
                        <Shield className="h-4 w-4" />
                        Security
                      </h3>
                      <div className="space-y-4">
                        <Button variant="outline" className="w-full">
                          Change Password
                        </Button>
                        <Button variant="outline" className="w-full">
                          Two-Factor Authentication
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Reset</Button>
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </CardFooter>
              </Card>
            </Motion>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
