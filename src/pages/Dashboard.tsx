
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/shared/AnimatedWrapper";
import { Motion } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileTextIcon, 
  LayoutDashboardIcon, 
  AlertCircle, 
  Filter, 
  Plus, 
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ChallengeCard from "@/components/dashboard/ChallengeCard";
import ServiceCard from "@/components/dashboard/ServiceCard";
import Navbar from "@/components/shared/Navbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock challenges data
const mockChallenges = [
  {
    id: "c1",
    title: "Aphid infestation in maize field",
    description: "I've noticed a significant number of aphids on my maize plants, particularly on the new growth. The leaves are curling and showing signs of stress. The infestation seems to be spreading to neighboring plants as well.",
    status: "pending" as const,
    date: "May 10, 2023",
    imageUrl: "https://images.unsplash.com/photo-1615639164213-aab04da93c7c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
  {
    id: "c2",
    title: "Soil moisture issues in section B",
    description: "The soil in section B of my farm is not retaining moisture well despite regular irrigation. Plants are showing signs of water stress even though I've increased watering frequency.",
    status: "resolved" as const,
    date: "April 28, 2023",
  },
  {
    id: "c3",
    title: "Unknown fungus on tomato plants",
    description: "There's a white powdery substance appearing on my tomato plants' leaves. It started on a few plants but is now affecting about 30% of my crop. Need urgent advice.",
    status: "pending" as const,
    date: "May 5, 2023",
    imageUrl: "https://images.unsplash.com/photo-1596465482893-2dbd38069ccd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
  },
];

// Mock services data
const mockServices = [
  {
    id: "s1",
    title: "Comprehensive Soil Analysis",
    description: "Complete nutrient profile, pH level, organic matter content, and recommendations for soil improvement.",
    type: "soil_analysis" as const,
    status: "completed" as const,
    date: "April 15, 2023",
    location: "North Field, Plot 3",
  },
  {
    id: "s2",
    title: "Pest Control Fumigation",
    description: "Targeted fumigation to address the recent pest outbreak in the eastern section of the farm.",
    type: "fumigation" as const,
    status: "in_progress" as const,
    date: "May 8, 2023",
    location: "East Field, Plots 7-9",
  },
  {
    id: "s3",
    title: "Seasonal Soil Health Check",
    description: "Pre-planting soil analysis to determine optimal fertilizer needs for the upcoming season.",
    type: "soil_analysis" as const,
    status: "requested" as const,
    date: "May 12, 2023",
    location: "South Field, All Plots",
  },
];

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState(mockChallenges);
  const [services, setServices] = useState(mockServices);
  const [activeTab, setActiveTab] = useState("overview");
  const [isNewChallengeOpen, setIsNewChallengeOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: "",
    description: "",
    image: null as File | null,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Simulate data refresh
  const refreshData = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Data refreshed",
        description: "Your dashboard has been updated with the latest information.",
      });
    }, 1500);
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  // Handle deleting a challenge
  const handleDeleteChallenge = (id: string) => {
    setChallenges(challenges.filter(challenge => challenge.id !== id));
  };

  // Handle changing a challenge status
  const handleChallengeStatusChange = (id: string, newStatus: "pending" | "resolved") => {
    setChallenges(challenges.map(challenge => 
      challenge.id === id ? { ...challenge, status: newStatus } : challenge
    ));
  };

  // Handle submitting a new challenge
  const handleSubmitChallenge = () => {
    if (!newChallenge.title || !newChallenge.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newChallengeEntry = {
      id: `c${challenges.length + 1}`,
      title: newChallenge.title,
      description: newChallenge.description,
      status: "pending" as const,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      imageUrl: newChallenge.image 
        ? URL.createObjectURL(newChallenge.image) 
        : undefined,
    };

    setChallenges([newChallengeEntry, ...challenges]);
    setNewChallenge({
      title: "",
      description: "",
      image: null,
    });
    setIsNewChallengeOpen(false);

    toast({
      title: "Challenge reported",
      description: "Your challenge has been successfully submitted.",
    });
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <PageTransition>
        <div className="pt-24 pb-16">
          {/* Dashboard Header */}
          <div className="mb-8">
            <Motion fadeInUp>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
            </Motion>
            <Motion fadeIn delay={200}>
              <p className="text-muted-foreground">
                Welcome back, {user?.name || "Farmer"}! Here's an overview of your farm activity.
              </p>
            </Motion>
          </div>
          
          {/* Dashboard Tabs */}
          <Tabs 
            defaultValue="overview" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="overview" className="gap-2">
                  <LayoutDashboardIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="challenges" className="gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Challenges</span>
                </TabsTrigger>
                <TabsTrigger value="services" className="gap-2">
                  <FileTextIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Services</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshData}
                  disabled={refreshing}
                  className="gap-1"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                
                {activeTab === "challenges" && (
                  <Dialog open={isNewChallengeOpen} onOpenChange={setIsNewChallengeOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">New Challenge</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      <DialogHeader>
                        <DialogTitle>Report a Challenge</DialogTitle>
                        <DialogDescription>
                          Describe the issue you're facing on your farm. Our experts will review and respond quickly.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="title" className="text-right">
                            Title
                          </Label>
                          <Input
                            id="title"
                            placeholder="Brief description of the issue"
                            className="col-span-3"
                            value={newChallenge.title}
                            onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            Details
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="Provide more information about the challenge"
                            className="col-span-3"
                            rows={5}
                            value={newChallenge.description}
                            onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="image" className="text-right">
                            Image
                          </Label>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            className="col-span-3"
                            onChange={(e) => setNewChallenge({
                              ...newChallenge, 
                              image: e.target.files ? e.target.files[0] : null
                            })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewChallengeOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSubmitChallenge}>
                          Submit Challenge
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Filter</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Show all</DropdownMenuItem>
                    {activeTab === "challenges" && (
                      <>
                        <DropdownMenuItem>Pending only</DropdownMenuItem>
                        <DropdownMenuItem>Resolved only</DropdownMenuItem>
                      </>
                    )}
                    {activeTab === "services" && (
                      <>
                        <DropdownMenuItem>Requested only</DropdownMenuItem>
                        <DropdownMenuItem>In progress only</DropdownMenuItem>
                        <DropdownMenuItem>Completed only</DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem>Most recent</DropdownMenuItem>
                    <DropdownMenuItem>Oldest first</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <TabsContent value="overview" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Quick Stats */}
                <Motion fadeInUp className="col-span-full">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Quick Overview</CardTitle>
                      <CardDescription>
                        Summary of your recent activity
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                        <div className="bg-primary/10 rounded-lg p-4">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Active Challenges</p>
                          <p className="text-3xl font-bold text-primary">
                            {challenges.filter(c => c.status === "pending").length}
                          </p>
                        </div>
                        <div className="bg-secondary/10 rounded-lg p-4">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Service Orders</p>
                          <p className="text-3xl font-bold text-secondary">
                            {services.length}
                          </p>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-sm font-medium text-muted-foreground mb-1">Resolved Issues</p>
                          <p className="text-3xl font-bold">
                            {challenges.filter(c => c.status === "resolved").length}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Motion>
                
                {/* Recent Challenges */}
                <Motion fadeInUp delay={100} className="md:col-span-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Recent Challenges</CardTitle>
                      <CardDescription>
                        Your most recently reported issues
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {challenges.length > 0 ? (
                        <div className="space-y-4">
                          {challenges.slice(0, 2).map((challenge, index) => (
                            <ChallengeCard
                              key={challenge.id}
                              {...challenge}
                              onDelete={handleDeleteChallenge}
                              onStatusChange={handleChallengeStatusChange}
                            />
                          ))}
                          {challenges.length > 2 && (
                            <Button
                              variant="ghost"
                              onClick={() => setActiveTab("challenges")}
                              className="w-full text-muted-foreground hover:text-foreground"
                            >
                              View all {challenges.length} challenges
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No challenges reported yet</p>
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => setIsNewChallengeOpen(true)}
                          >
                            Report your first challenge
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Motion>
                
                {/* Recent Services */}
                <Motion fadeInUp delay={200}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Recent Services</CardTitle>
                      <CardDescription>
                        Your latest service orders
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {services.length > 0 ? (
                        <div className="space-y-4">
                          {services.slice(0, 1).map((service) => (
                            <ServiceCard
                              key={service.id}
                              {...service}
                            />
                          ))}
                          {services.length > 1 && (
                            <Button
                              variant="ghost"
                              onClick={() => setActiveTab("services")}
                              className="w-full text-muted-foreground hover:text-foreground"
                            >
                              View all {services.length} services
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No services ordered yet</p>
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => navigate("/services")}
                          >
                            Explore available services
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Motion>
                
                {/* Tips & Alerts Section */}
                <Motion fadeInUp delay={300} className="col-span-full">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Weather Advisory</AlertTitle>
                    <AlertDescription>
                      Heavy rainfall expected in the next 48 hours. Consider postponing any scheduled fumigation services.
                    </AlertDescription>
                  </Alert>
                </Motion>
              </div>
            </TabsContent>
            
            <TabsContent value="challenges" className="mt-0">
              <Motion fadeIn>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {challenges.map((challenge, index) => (
                      <Motion key={challenge.id} fadeInUp delay={index * 50}>
                        <ChallengeCard
                          {...challenge}
                          onDelete={handleDeleteChallenge}
                          onStatusChange={handleChallengeStatusChange}
                        />
                      </Motion>
                    ))}
                    
                    {challenges.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No challenges reported</h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't reported any farm challenges yet.
                        </p>
                        <Button onClick={() => setIsNewChallengeOpen(true)}>
                          Report Your First Challenge
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Motion>
            </TabsContent>
            
            <TabsContent value="services" className="mt-0">
              <Motion fadeIn>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((service, index) => (
                      <Motion key={service.id} fadeInUp delay={index * 50}>
                        <ServiceCard
                          {...service}
                        />
                      </Motion>
                    ))}
                    
                    {services.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <FileTextIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No services ordered</h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't ordered any soil analysis or fumigation services yet.
                        </p>
                        <Button onClick={() => navigate("/services")}>
                          Explore Available Services
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Motion>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </div>
  );
}
