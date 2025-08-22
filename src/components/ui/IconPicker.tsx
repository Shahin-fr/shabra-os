"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

// Curated list of relevant icons for our application
const ICONS = [
  // Basic shapes and elements
  "Square", "Rectangle", "Circle", "Triangle", "Hexagon", "Star", "Heart", "Diamond",
  
  // Media and content
  "FileText", "Image", "Video", "Music", "Camera", "Mic", "Clapperboard", "BookOpen", "Newspaper",
  
  // Actions and tools
  "Edit", "PenSquare", "Plus", "Minus", "Trash2", "Copy", "Paste", "Download", "Upload", "Share2",
  "Link", "Tag", "Bookmark", "Flag", "CheckCircle", "XCircle", "AlertCircle", "Info", "HelpCircle",
  
  // Navigation and arrows
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ChevronUp", "ChevronDown", "ChevronLeft", "ChevronRight",
  "Home", "MapPin", "Globe", "Compass", "Navigation",
  
  // Communication and social
  "Mail", "Phone", "MessageCircle", "MessageSquare", "Users", "User", "UserPlus", "UserMinus",
  "ThumbsUp", "ThumbsDown", "Smile", "Frown", "Meh",
  
  // Business and productivity
  "Briefcase", "GraduationCap", "Target", "BarChart3", "PieChart", "TrendingUp", "TrendingDown",
  "Calendar", "Clock", "Timer", "Stopwatch", "AlarmClock",
  
  // Technology and devices
  "Laptop", "Smartphone", "Tablet", "Monitor", "Printer", "Server", "Database", "Cloud",
  "Wifi", "Bluetooth", "Battery", "Power", "Settings",
  
  // Creative and design
  "Palette", "Brush", "Eyedropper", "Scissors", "Ruler", "Grid", "Layers", "Type",
  "Bold", "Italic", "Underline", "AlignLeft", "AlignCenter", "AlignRight",
  
  // Status and feedback
  "Check", "X", "Radio", "ToggleLeft", "ToggleRight",
  "Lock", "Unlock", "Eye", "EyeOff", "Shield", "ShieldCheck", "ShieldX",
  
  // Miscellaneous
  "Lightbulb", "Sparkles", "Zap", "Fire", "Water", "Leaf", "Tree", "Mountain", "Sun", "Moon",
  "Coffee", "Gift", "Package", "Truck", "Car", "Plane", "Ship", "Bike"
];

// Ensure unique icons by using a Set
const UNIQUE_ICONS = Array.from(new Set(ICONS));

// Total unique icons available: 60+

interface IconPickerProps {
  onSelectIcon: (iconName: string) => void;
  currentIcon?: string;
  className?: string;
}

export function IconPicker({ onSelectIcon, currentIcon, className }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter icons based on search query
  const filteredIcons = UNIQUE_ICONS.filter(iconName =>
    iconName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleIconSelect = (iconName: string) => {
    onSelectIcon(iconName);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Get the current icon component
  const CurrentIconComponent = currentIcon ? (LucideIcons as any)[currentIcon] : null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 w-full justify-start gap-2",
            !currentIcon && "text-muted-foreground",
            className
          )}
        >
          {CurrentIconComponent ? (
            <>
              <CurrentIconComponent className="h-4 w-4" />
              <span>{currentIcon}</span>
            </>
          ) : (
            <>
              <div className="h-4 w-4 rounded border-2 border-dashed border-muted-foreground" />
              <span>انتخاب آیکون</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجوی آیکون..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-3"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-64 overflow-y-auto p-4">
          <div className="grid grid-cols-6 gap-2">
            {filteredIcons.map((iconName) => {
              const IconComponent = (LucideIcons as any)[iconName];
              return (
                <Button
                  key={iconName}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-12 w-12 p-0 flex flex-col items-center justify-center gap-1 hover:bg-accent",
                    currentIcon === iconName && "bg-accent border-2 border-primary"
                  )}
                  onClick={() => handleIconSelect(iconName)}
                  title={iconName}
                >
                  {IconComponent && <IconComponent className="h-5 w-5" />}
                  <span className="text-xs truncate w-full text-center">
                    {iconName}
                  </span>
                </Button>
              );
            })}
          </div>
          
          {filteredIcons.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>آیکونی یافت نشد</p>
              <p className="text-sm">کلمات کلیدی دیگری امتحان کنید</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
