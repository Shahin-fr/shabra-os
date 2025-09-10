'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Users, CheckCircle, AlertCircle, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const attendanceData = [
  {
    department: 'توسعه',
    location: 'دفتر مرکزی',
    present: 8,
    total: 10,
    percentage: 80,
    status: 'excellent',
    lastUpdate: '2 دقیقه پیش'
  },
  {
    department: 'طراحی',
    location: 'دفتر مرکزی',
    present: 5,
    total: 6,
    percentage: 83,
    status: 'excellent',
    lastUpdate: '1 دقیقه پیش'
  },
  {
    department: 'فروش',
    location: 'شعبه شمال',
    present: 3,
    total: 5,
    percentage: 60,
    status: 'warning',
    lastUpdate: '3 دقیقه پیش'
  },
  {
    department: 'بازاریابی',
    location: 'دفتر مرکزی',
    present: 2,
    total: 3,
    percentage: 67,
    status: 'good',
    lastUpdate: '1 دقیقه پیش'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent':
      return 'text-green-500 bg-green-500/20';
    case 'good':
      return 'text-[#ff0a54] bg-[#ff0a54]/20';
    case 'warning':
      return 'text-yellow-500 bg-yellow-500/20';
    case 'critical':
      return 'text-red-500 bg-red-500/20';
    default:
      return 'text-gray-500 bg-gray-500/20';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'excellent':
      return <CheckCircle className="h-4 w-4" />;
    case 'good':
      return <UserCheck className="h-4 w-4" />;
    case 'warning':
      return <AlertCircle className="h-4 w-4" />;
    case 'critical':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Users className="h-4 w-4" />;
  }
};

export function LiveAttendanceMap() {
  const totalPresent = attendanceData.reduce((sum, dept) => sum + dept.present, 0);
  const totalEmployees = attendanceData.reduce((sum, dept) => sum + dept.total, 0);
  const overallPercentage = Math.round((totalPresent / totalEmployees) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="w-8 h-8 bg-[#ff0a54]/20 rounded-full flex items-center justify-center">
              <MapPin className="h-5 w-5 text-[#ff0a54]" />
            </div>
            نقشه حضور زنده
            <Badge variant="outline" className="ml-auto">
              {totalPresent}/{totalEmployees}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Overall Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#ff0a54]/10 to-purple-500/10 border border-[#ff0a54]/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-foreground">
                  {overallPercentage}%
                </h3>
                <p className="text-sm text-muted-foreground">
                  حضور کلی امروز
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-foreground">
                  {totalPresent} نفر
                </div>
                <p className="text-sm text-muted-foreground">
                  از {totalEmployees} کارمند
                </p>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-[#ff0a54] to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${overallPercentage}%` }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </div>
          </motion.div>

          {/* Department List */}
          <div className="space-y-3">
            {attendanceData.map((dept, index) => (
              <motion.div
                key={dept.department}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${getStatusColor(dept.status)} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      {getStatusIcon(dept.status)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-[#ff0a54] transition-colors">
                        {dept.department}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {dept.location}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-foreground">
                      {dept.present}/{dept.total}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {dept.lastUpdate}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        dept.status === 'excellent' ? 'bg-green-500' :
                        dept.status === 'good' ? 'bg-[#ff0a54]' :
                        dept.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.percentage}%` }}
                      transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {dept.percentage}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <Button 
              variant="outline" 
              className="w-full bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30"
            >
              <Users className="h-4 w-4 mr-2" />
              مشاهده جزئیات حضور
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
