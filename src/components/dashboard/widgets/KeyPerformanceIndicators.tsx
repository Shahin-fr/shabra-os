'use client';

import { motion } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, Users, Clock, CheckCircle, DollarSign, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const kpiData = [
  {
    title: 'نرخ تکمیل پروژه',
    value: '87%',
    target: '90%',
    trend: '+5%',
    trendType: 'positive',
    icon: Target,
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    description: 'در مقایسه با ماه گذشته'
  },
  {
    title: 'رضایت مشتریان',
    value: '4.6',
    target: '4.5',
    trend: '+0.3',
    trendType: 'positive',
    icon: Users,
    color: 'text-[#ff0a54]',
    bgColor: 'bg-[#ff0a54]/20',
    description: 'از 5 امتیاز'
  },
  {
    title: 'زمان تحویل متوسط',
    value: '12',
    target: '10',
    trend: '-2',
    trendType: 'positive',
    icon: Clock,
    color: 'text-gray-600',
    bgColor: 'bg-gray-500/20',
    description: 'روز (کاهش مطلوب)'
  },
  {
    title: 'درآمد ماهانه',
    value: '2.4M',
    target: '2.0M',
    trend: '+20%',
    trendType: 'positive',
    icon: DollarSign,
    color: 'text-green-500',
    bgColor: 'bg-green-500/20',
    description: 'تومان'
  },
  {
    title: 'نرخ حضور',
    value: '94%',
    target: '95%',
    trend: '-1%',
    trendType: 'negative',
    icon: CheckCircle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/20',
    description: 'نیاز به بهبود'
  },
  {
    title: 'کارایی تیم',
    value: '78%',
    target: '80%',
    trend: '+3%',
    trendType: 'positive',
    icon: BarChart3,
    color: 'text-gray-600',
    bgColor: 'bg-gray-500/20',
    description: 'در حال بهبود'
  }
];

const getTrendIcon = (trendType: string) => {
  return trendType === 'positive' ? TrendingUp : TrendingDown;
};

const getTrendColor = (trendType: string) => {
  return trendType === 'positive' ? 'text-green-500' : 'text-red-500';
};

export function KeyPerformanceIndicators() {
  const achievedTargets = kpiData.filter(kpi => {
    const value = parseFloat(kpi.value.replace(/[^\d.]/g, ''));
    const target = parseFloat(kpi.target.replace(/[^\d.]/g, ''));
    return value >= target;
  }).length;

  const totalKPIs = kpiData.length;
  const achievementRate = Math.round((achievedTargets / totalKPIs) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.9 }}
    >
      <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="w-8 h-8 bg-[#ff0a54]/20 rounded-full flex items-center justify-center">
              <Target className="h-5 w-5 text-[#ff0a54]" />
            </div>
            شاخص‌های کلیدی عملکرد
            <Badge variant="outline" className="ml-auto">
              {achievementRate}% دستیابی به اهداف
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Achievement Overview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 1.0 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#ff0a54]/10 to-green-500/10 border border-[#ff0a54]/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {achievementRate}%
                </h3>
                <p className="text-sm text-muted-foreground">
                  دستیابی به اهداف KPI
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-foreground">
                  {achievedTargets}/{totalKPIs}
                </div>
                <p className="text-sm text-muted-foreground">
                  شاخص‌های محقق شده
                </p>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-[#ff0a54] to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${achievementRate}%` }}
                transition={{ duration: 1, delay: 1.2 }}
              />
            </div>
          </motion.div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpiData.map((kpi, index) => (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.1 + index * 0.05 }}
                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 ${kpi.bgColor} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      kpi.trendType === 'positive' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                    }`}
                  >
                    {kpi.trendType === 'positive' ? 'مثبت' : 'منفی'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground group-hover:text-[#ff0a54] transition-colors">
                    {kpi.title}
                  </h4>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {kpi.value}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      از {kpi.target}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 text-sm ${getTrendColor(kpi.trendType)}`}>
                      {getTrendIcon(kpi.trendType) === TrendingUp ? 
                        <TrendingUp className="h-3 w-3" /> : 
                        <TrendingDown className="h-3 w-3" />
                      }
                      {kpi.trend}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {kpi.description}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Performance Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#ff0a54]/20 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-[#ff0a54]" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">خلاصه عملکرد</h4>
                <p className="text-sm text-muted-foreground">
                  {achievementRate >= 80 ? 
                    'عملکرد عالی! تیم در مسیر درستی قرار دارد و اکثر اهداف محقق شده‌اند.' :
                    achievementRate >= 60 ?
                    'عملکرد خوب است اما نیاز به بهبود در برخی زمینه‌ها وجود دارد.' :
                    'نیاز به تمرکز بیشتر روی اهداف کلیدی و بهبود فرآیندها.'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
