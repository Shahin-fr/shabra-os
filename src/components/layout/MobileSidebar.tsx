"use client";

import { useState } from "react";
import { Menu, LayoutDashboard, FolderOpen, Users, Settings, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  const navigationItems = [
    { href: "/", label: "داشبورد", icon: LayoutDashboard },
    { href: "/projects", label: "پروژه‌ها", icon: FolderOpen },
    { href: "/users", label: "کاربران", icon: Users },
    { href: "/analytics", label: "تحلیل‌ها", icon: BarChart3 },
    { href: "/settings", label: "تنظیمات", icon: Settings },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64 bg-white border-l shadow-xl">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">منو</h2>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                onClick={() => setOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </a>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
