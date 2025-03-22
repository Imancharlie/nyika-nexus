
import { useState } from "react";
import { Heart, MessageSquare, Share2, MoreHorizontal, Flag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Motion } from "@/components/ui/motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostCardProps {
  id: string;
  author: {
    name: string;
    avatarUrl?: string;
    role?: string;
  };
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  timestamp: string;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
}

export default function PostCard({
  id,
  author,
  content,
  imageUrl,
  likes,
  comments,
  timestamp,
  onLike,
  onComment,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { toast } = useToast();

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    
    if (onLike) {
      onLike(id);
    }
  };

  const handleComment = () => {
    if (onComment) {
      onComment(id);
    }
  };

  const handleShare = () => {
    toast({
      title: "Share post",
      description: "Sharing functionality will be available soon!",
    });
  };

  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "Thank you for helping keep our community safe.",
    });
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="p-4 pb-3 flex flex-row gap-3 items-start">
        <Avatar className="h-10 w-10 border border-border">
          <AvatarImage src={author.avatarUrl} alt={author.name} />
          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-base leading-tight">{author.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                {author.role && (
                  <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                    {author.role}
                  </span>
                )}
                <span>{timestamp}</span>
              </p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleReport}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <p className="text-sm whitespace-pre-line">{content}</p>
        
        {imageUrl && (
          <div className={cn(
            "mt-3 overflow-hidden rounded-md bg-muted/30",
            !isImageLoaded && "animate-pulse min-h-[200px]"
          )}>
            <Motion fadeIn>
              <img
                src={imageUrl}
                alt="Post image"
                className="w-full h-auto object-cover transition-transform hover:scale-105 duration-500"
                style={{ maxHeight: "350px" }}
                onLoad={() => setIsImageLoaded(true)}
              />
            </Motion>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-2 flex justify-between border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-muted-foreground gap-1.5",
            isLiked && "text-red-500 dark:text-red-400"
          )}
          onClick={handleLike}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          <span>{likeCount}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground gap-1.5"
          onClick={handleComment}
        >
          <MessageSquare className="h-4 w-4" />
          <span>{comments}</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
