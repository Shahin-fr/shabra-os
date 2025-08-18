"use client";

import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings } from "lucide-react";
import { motion } from "framer-motion";

export function Header() {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <motion.header 
      className="sticky top-0 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-end h-16 px-6">
        {/* User menu */}
        {session?.user && (
          <motion.div
            className="ml-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar 
                    className="h-8 w-8 border border-white/30 hover:border-white/50 transition-all duration-300"
                    style={{
                      boxShadow: `
                        0 4px 15px rgba(255, 10, 84, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.8)
                      `
                    }}
                  >
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                    <AvatarFallback 
                      className="bg-[#ff0a54]/20 text-[#ff0a54] font-semibold"
                      style={{
                        background: 'rgba(255, 10, 84, 0.2)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      {session.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-48 ml-4"
                align="end"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(30px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: `
                    0 16px 50px rgba(0, 0, 0, 0.15),
                    0 8px 25px rgba(255, 10, 84, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8)
                  `
                }}
              >
                <DropdownMenuLabel className="font-semibold">
                  {session.user.name || "کاربر"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4 text-[#ff0a54]" />
                  <span>پروفایل</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4 text-[#ff0a54]" />
                  <span>تنظیمات</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4 text-[#ff0a54]" />
                  <span>خروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
