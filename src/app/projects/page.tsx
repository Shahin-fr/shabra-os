"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchProjects, projectsKeys } from "@/lib/queries";
import { Project } from "@/types/project";

export default function ProjectsPage() {
  const { data: session, status } = useSession();

  // Use TanStack Query to fetch projects
  const { data: projects = [], isLoading, isError } = useQuery({
    queryKey: projectsKeys.all,
    queryFn: fetchProjects,
    enabled: status === "authenticated",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  if (status === "loading" || isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto max-w-7xl">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-3 text-muted-foreground">در حال بارگذاری پروژه‌ها...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="container mx-auto max-w-7xl">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">خطا در بارگذاری پروژه‌ها</h3>
            <p className="text-muted-foreground mb-6">
              مشکلی در بارگذاری پروژه‌ها پیش آمده است
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white"
            >
              تلاش مجدد
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <MainLayout>
      <motion.div 
        className="container mx-auto max-w-7xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Enhanced Page Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl font-bold text-foreground mb-3">
            پروژه‌ها
          </h1>
          <p className="text-lg text-muted-foreground">مدیریت پروژه‌ها و محتوای دیجیتال</p>
        </motion.div>

        {/* Projects Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
              }
            }
          }}
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Link href={`/projects/${project.id}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Card className="group h-full cursor-pointer"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: `
                        0 8px 25px rgba(0, 0, 0, 0.1),
                        0 4px 15px rgba(253, 214, 232, 0.1),
                        inset 0 1px 0 rgba(255, 255, 255, 0.8)
                      `
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-foreground group-hover:text-[#ff0a54] transition-colors duration-300">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-muted-foreground">
                        {project.description || "توضیحات پروژه"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "px-3 py-1 rounded-full font-medium text-xs",
                            project.status === "ACTIVE" ? "bg-[#ff0a54]/20 text-[#ff0a54] border border-[#ff0a54]/30" : "",
                            project.status === "COMPLETED" ? "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800" : "",
                            project.status === "PAUSED" ? "bg-yellow-100 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-200 dark:border-yellow-800" : ""
                          )}>
                            {project.status === "ACTIVE" && "فعال"}
                            {project.status === "COMPLETED" && "تکمیل شده"}
                            {project.status === "PAUSED" && "متوقف"}
                          </span>
                        </div>

                        {/* Project Stats */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{project._count.stories} استوری</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{project._count.tasks} وظیفه</span>
                          </div>
                        </div>

                        {/* Last Updated */}
                        <div className="text-xs text-muted-foreground/70">
                          آخرین بروزرسانی: {new Date(project.updatedAt).toLocaleDateString("fa-IR")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: `
                  0 12px 40px rgba(0, 0, 0, 0.1),
                  0 6px 20px rgba(253, 214, 232, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `
              }}
            >
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#fdd6e8]/20 to-[#fdd6e8]/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-[#fdd6e8]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">هیچ پروژه‌ای یافت نشد</h3>
                <p className="text-muted-foreground mb-6">
                  اولین پروژه خود را ایجاد کنید تا شروع کنید
                </p>
                <Button className="bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  ایجاد پروژه جدید
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
