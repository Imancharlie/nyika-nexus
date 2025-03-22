
import { useState } from "react";
import { PageTransition } from "@/components/shared/AnimatedWrapper";
import { Motion } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter, Plus, Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "@/components/community/PostCard";
import Navbar from "@/components/shared/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock user posts
const mockPosts = [
  {
    id: "p1",
    author: {
      name: "Sarah Johnson",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      role: "Farmer",
    },
    content: "Just finished implementing a new irrigation system that uses soil moisture sensors to automatically water crops. It's already saving water and my plants are looking healthier! Has anyone else tried smart irrigation systems?",
    imageUrl: "https://images.unsplash.com/photo-1601655157823-9b0a16ed09e2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
    likes: 24,
    comments: 8,
    timestamp: "2 hours ago",
  },
  {
    id: "p2",
    author: {
      name: "Dr. Michael Chen",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      role: "Soil Expert",
    },
    content: "Good morning farmers! Here's a quick tip: If you're noticing yellowing leaves on your crops, it might be a sign of nitrogen deficiency. Before applying fertilizer though, I'd recommend getting a soil test to confirm. Applying too much nitrogen can lead to other problems and potential runoff issues.",
    likes: 42,
    comments: 12,
    timestamp: "Yesterday",
  },
  {
    id: "p3",
    author: {
      name: "James Mwangi",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
      role: "Farmer",
    },
    content: "Harvested our first batch of organic tomatoes this season! The natural pest management techniques we learned from the Nyika Nexus workshop last month worked wonderfully. Happy to share more details with anyone interested.",
    imageUrl: "https://images.unsplash.com/photo-1592743263126-bb241ee76ac7?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3",
    likes: 36,
    comments: 15,
    timestamp: "2 days ago",
  },
  {
    id: "p4",
    author: {
      name: "Linda Ochieng",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Linda",
      role: "Farmer",
    },
    content: "Has anyone been dealing with the unusual weather patterns this season? My crops are experiencing stress from the unexpected dry spell. Looking for advice on short-term water conservation techniques that won't break the bank.",
    likes: 18,
    comments: 22,
    timestamp: "3 days ago",
  },
];

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState(mockPosts);
  const [activeTab, setActiveTab] = useState("all");
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [newPost, setNewPost] = useState({
    content: "",
    image: null as File | null,
  });

  // Simulate refresh
  const refreshData = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Feed refreshed",
        description: "Your community feed has been updated with the latest posts.",
      });
    }, 1500);
  };

  // Handle post like
  const handleLike = (id: string) => {
    // In a real app, this would call an API
    console.log(`Post ${id} liked/unliked`);
  };

  // Handle post comment
  const handleComment = (id: string) => {
    toast({
      title: "Comments",
      description: "Comment functionality coming soon!",
    });
  };

  // Filter posts based on search query
  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle new post submission
  const handleSubmitPost = () => {
    if (!newPost.content.trim()) {
      toast({
        title: "Empty post",
        description: "Please add some content to your post.",
        variant: "destructive",
      });
      return;
    }

    const newPostEntry = {
      id: `p${posts.length + 1}`,
      author: {
        name: user?.name || "Anonymous",
        avatarUrl: user?.avatarUrl,
        role: "Farmer",
      },
      content: newPost.content,
      imageUrl: newPost.image ? URL.createObjectURL(newPost.image) : undefined,
      likes: 0,
      comments: 0,
      timestamp: "Just now",
    };

    setPosts([newPostEntry, ...posts]);
    setNewPost({
      content: "",
      image: null,
    });
    setIsNewPostOpen(false);

    toast({
      title: "Post created",
      description: "Your post has been shared with the community.",
    });
  };

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />
      
      <PageTransition>
        <div className="pt-24 pb-16">
          {/* Community Header */}
          <div className="mb-8">
            <Motion fadeInUp>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Community</h1>
            </Motion>
            <Motion fadeIn delay={200}>
              <p className="text-muted-foreground">
                Connect with other farmers and agricultural experts to share knowledge and experiences.
              </p>
            </Motion>
          </div>
          
          {/* Community Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <Motion fadeInUp delay={100} className="lg:col-span-1">
              <div className="space-y-6">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Filter Tabs */}
                <div>
                  <Tabs 
                    defaultValue="all" 
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="w-full grid grid-cols-3">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="experts">Experts</TabsTrigger>
                      <TabsTrigger value="popular">Popular</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {/* Create Post Card */}
                <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Create Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Create a Post</DialogTitle>
                      <DialogDescription>
                        Share your knowledge, ask questions, or post updates about your farm.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label htmlFor="post-content" className="mb-2 block">
                          Post Content
                        </Label>
                        <Textarea
                          id="post-content"
                          placeholder="What would you like to share with the community?"
                          rows={5}
                          value={newPost.content}
                          onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="post-image" className="mb-2 block">
                          Add Image (optional)
                        </Label>
                        <Input
                          id="post-image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setNewPost({
                            ...newPost, 
                            image: e.target.files ? e.target.files[0] : null
                          })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsNewPostOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmitPost}>
                        Post to Community
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Topics */}
                <div className="bg-background rounded-lg border p-4">
                  <h3 className="font-medium mb-3">Popular Topics</h3>
                  <div className="space-y-2">
                    {["Pest Management", "Irrigation", "Organic Farming", "Soil Health", "Seasonal Planning"].map((topic) => (
                      <Button 
                        key={topic} 
                        variant="ghost" 
                        className="w-full justify-start hover:bg-muted"
                      >
                        # {topic}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Motion>
            
            {/* Main Feed */}
            <Motion fadeIn delay={200} className="lg:col-span-3">
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Latest Updates</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshData}
                  disabled={refreshing}
                  className="gap-1"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              <div className="space-y-6">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post, index) => (
                    <Motion key={post.id} fadeInUp delay={index * 50}>
                      <PostCard
                        {...post}
                        onLike={handleLike}
                        onComment={handleComment}
                      />
                    </Motion>
                  ))
                ) : (
                  <div className="text-center py-12 bg-background rounded-lg border">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No posts found</h3>
                    {searchQuery ? (
                      <p className="text-muted-foreground mb-4">
                        No posts match your search for "{searchQuery}"
                      </p>
                    ) : (
                      <p className="text-muted-foreground mb-4">
                        There are no posts in this category yet
                      </p>
                    )}
                    <Button 
                      onClick={() => {
                        setSearchQuery("");
                        setActiveTab("all");
                      }}
                    >
                      View All Posts
                    </Button>
                  </div>
                )}
              </div>
            </Motion>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
