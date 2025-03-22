
import { useState } from "react";
import { MoreHorizontal, MessageCircle, Trash, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChallengeCardProps {
  id: string;
  title: string;
  description: string;
  status: "pending" | "resolved";
  date: string;
  imageUrl?: string;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: "pending" | "resolved") => void;
}

export default function ChallengeCard({
  id,
  title,
  description,
  status,
  date,
  imageUrl,
  onDelete,
  onStatusChange,
}: ChallengeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isStaff = user?.role === "staff";

  const handleStatusChange = () => {
    if (onStatusChange) {
      const newStatus = status === "pending" ? "resolved" : "pending";
      onStatusChange(id, newStatus);
      toast({
        title: `Challenge marked as ${newStatus}`,
        description: `The challenge has been updated successfully.`,
      });
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
      toast({
        title: "Challenge deleted",
        description: "The challenge has been removed successfully.",
      });
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-md",
      status === "resolved" ? "bg-green-50/50 dark:bg-green-950/10" : ""
    )}>
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start">
        <div className="flex flex-col">
          <div className="flex gap-2 items-center">
            <h3 className="font-medium text-lg">{title}</h3>
            <Badge variant={status === "pending" ? "destructive" : "default"}>
              {status === "pending" ? (
                <AlertCircle className="mr-1 h-3 w-3" />
              ) : (
                <CheckCircle className="mr-1 h-3 w-3" />
              )}
              {status === "pending" ? "Pending" : "Resolved"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs mt-1">{date}</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isStaff && (
              <DropdownMenuItem onClick={handleStatusChange}>
                {status === "pending" ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as resolved
                  </>
                ) : (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Mark as pending
                  </>
                )}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <p className={cn(
          "text-sm text-foreground/90 transition-all duration-300",
          isExpanded ? "" : "line-clamp-2"
        )}>
          {description}
        </p>
        
        {imageUrl && (
          <div className="mt-3 overflow-hidden rounded-md">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-auto object-cover transition-transform hover:scale-105 duration-300"
              style={{ maxHeight: "200px" }}
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-muted-foreground hover:text-foreground px-2"
          onClick={toggleExpand}
        >
          {isExpanded ? "Show less" : "Read more"}
        </Button>
        
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground px-2">
          <MessageCircle className="h-4 w-4 mr-1" />
          Reply
        </Button>
      </CardFooter>
    </Card>
  );
}
