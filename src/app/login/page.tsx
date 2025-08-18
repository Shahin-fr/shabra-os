"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("ایمیل یا رمز عبور اشتباه است");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("خطا در ورود به سیستم");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-pink-50/50 to-purple-50/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card 
          className="w-full max-w-md"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.15),
              0 8px 25px rgba(255, 10, 84, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.8)
            `
          }}
        >
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-3xl font-bold text-foreground mb-3">
              ورود به شبرا OS
            </CardTitle>
            <p className="text-muted-foreground">
              برای دسترسی به پنل مدیریت وارد شوید
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div 
                  className="p-4 rounded-lg text-sm font-medium bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  ایمیل
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-border/50 focus:border-[#ff0a54]/50 focus:ring-[#ff0a54]/20 bg-white/80 backdrop-blur-sm"
                  placeholder="example@email.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  رمز عبور
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-border/50 focus:border-[#ff0a54]/50 focus:ring-[#ff0a54]/20 bg-white/80 backdrop-blur-sm"
                  placeholder="رمز عبور خود را وارد کنید"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#ff0a54] hover:bg-[#ff0a54]/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                style={{
                  boxShadow: `
                    0 8px 25px rgba(255, 10, 84, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.6)
                  `
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    در حال ورود...
                  </>
                ) : (
                  "ورود"
                )}
              </Button>
            </form>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                حساب کاربری ندارید؟{" "}
                <Button variant="link" className="text-[#ff0a54] hover:text-[#ff0a54]/80 p-0 h-auto">
                  ثبت نام کنید
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
