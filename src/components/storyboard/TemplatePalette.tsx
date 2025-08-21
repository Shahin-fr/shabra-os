"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StoryType {
  id: string;
  name: string;
}

interface TemplatePaletteProps {
  storyTypes: StoryType[];
  selectedSlotIndex: number | null;
  onTemplateClick: (_id: string) => void;
  isLoading?: boolean;
}

export function TemplatePalette({ 
  storyTypes, 
  selectedSlotIndex, 
  onTemplateClick,
  isLoading = false
}: TemplatePaletteProps) {
  const isSlotSelected = selectedSlotIndex !== null;

  const handleTemplateClick = (id: string) => {
    // Use the id parameter to validate before calling the parent function
    if (id && id.trim()) {
      onTemplateClick(id);
    }
  };

  return (
    <div className="space-y-6">
      {isSlotSelected && (
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Badge 
            className="bg-white/90 backdrop-blur-sm text-[#ff0a54] border border-[#ff0a54]/40 font-medium shadow-lg"
            style={{
              boxShadow: `
                0 4px 15px rgba(255, 10, 84, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.6)
              `
            }}
          >
            اسلات {selectedSlotIndex + 1} انتخاب شده
          </Badge>
        </motion.div>
      )}
      
      {!isSlotSelected && (
        <motion.div 
          className="rounded-xl p-4 shadow-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: `
              0 12px 35px rgba(0, 0, 0, 0.1),
              0 6px 20px rgba(255, 10, 84, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.3)
            `
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm text-gray-800">
            💡 <strong>نکته:</strong> روی یک اسلات استوری در بالا کلیک کنید تا آن را انتخاب کنید، سپس قالب را انتخاب کنید.
          </p>
        </motion.div>
      )}

      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.1
            }
          }
        }}
      >
        {storyTypes.map((storyType) => (
          <motion.div
            key={storyType.id}
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 }
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            whileHover={isSlotSelected ? { scale: 1.05, y: -2 } : {}}
            whileTap={isSlotSelected ? { scale: 0.95 } : {}}
          >
            <Card
              className={cn(
                "cursor-pointer transition-all duration-300",
                "border-2 border-white/30 hover:border-white/50",
                "bg-white/90 backdrop-blur-md hover:bg-white/95",
                "shadow-lg hover:shadow-xl",
                isSlotSelected && "hover:scale-105 hover:shadow-xl",
                !isSlotSelected && "opacity-50 cursor-not-allowed"
              )}
              style={{
                background: isSlotSelected 
                  ? 'rgba(255, 255, 255, 0.9)' 
                  : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(15px)',
                boxShadow: isSlotSelected 
                  ? `
                    0 8px 25px rgba(0, 0, 0, 0.1),
                    0 4px 15px rgba(255, 10, 84, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.6)
                  `
                  : `
                    0 4px 15px rgba(0, 0, 0, 0.05),
                    0 2px 8px rgba(255, 10, 84, 0.05),
                    inset 0 1px 0 rgba(255, 255, 255, 0.4)
                  `
              }}
              onClick={() => isSlotSelected && !isLoading && handleTemplateClick(storyType.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <div 
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      "bg-gradient-to-br from-[#ff0a54]/40 to-[#ff0a54]/60",
                      isSlotSelected && "from-[#ff0a54]/60 to-[#ff0a54]/80"
                    )}
                    style={{
                      boxShadow: `
                        0 4px 15px rgba(255, 10, 84, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.6)
                      `
                    }}
                  >
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate w-full">
                      {storyType.name}
                    </h3>
                    {isSlotSelected && (
                      <p className="text-xs text-[#ff0a54] font-medium">
                        {isLoading ? "در حال اعمال..." : "کلیک برای اعمال"}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {storyTypes.length === 0 && (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div 
            className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: `
                0 12px 35px rgba(255, 10, 84, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.3)
              `
            }}
          >
            <FileText className="h-8 w-8 text-[#ff0a54]" />
          </motion.div>
          <p className="text-gray-800 text-lg mb-2">هیچ قالب استوری موجود نیست</p>
          <p className="text-sm text-gray-600">
            چند نوع استوری ایجاد کنید تا شروع کنید
          </p>
        </motion.div>
      )}
    </div>
  );
}
