"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { ChevronUp, ChevronDown, Trash2, ExternalLink, FileText, Image } from "lucide-react";

import { Story } from "@/types/story";

interface StoryCardProps {
  story: Story;
  index: number;
  totalStories: number;
  onDelete: (_id: string) => void;
  onReorder: (_id: string, _dir: "up" | "down") => void;
}



export function StoryCard({ story, index, totalStories, onDelete, onReorder }: StoryCardProps) {

  const handleDelete = (id: string) => {
    // Use the id parameter to validate before calling the parent function
    if (id && id.trim()) {
      onDelete(id);
    }
  };

  const handleReorder = (id: string, dir: "up" | "down") => {
    // Use the parameters to validate before calling the parent function
    if (id && id.trim() && (dir === "up" || dir === "down")) {
      onReorder(id, dir);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg truncate">{story.title}</CardTitle>
            </div>
            
            {story.storyType && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <FileText className="h-3 w-3" />
                <span>{story.storyType.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReorder(story.id, "up")}
              disabled={index === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReorder(story.id, "down")}
              disabled={index === totalStories - 1}
              className="h-8 w-8 p-0"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(story.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">

        
        {story.visualNotes && (
          <div>
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <Image className="h-3 w-3" />
              یادداشت‌های بصری
            </div>
            <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded-md whitespace-pre-wrap">
              {story.visualNotes}
            </p>
          </div>
        )}
        
        {story.link && (
          <div>
            <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <ExternalLink className="h-3 w-3" />
              لینک
            </div>
            <a
              href={story.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-pink-600 hover:text-pink-700 break-all"
            >
              {story.link}
            </a>
          </div>
        )}
        
        {story.notes && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">
              یادداشت‌های اضافی
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {story.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
