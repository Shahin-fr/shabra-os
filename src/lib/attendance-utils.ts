import { prisma } from './prisma';
import { isWorkingDay, getWorkingDaysInRange } from './work-schedule-utils';

export interface AttendanceStats {
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  attendanceRate: number;
  totalHoursWorked: number;
  averageHoursPerDay: number;
  holidays: number;
  daysOff: number;
}

export interface UserAttendanceSummary {
  userId: string;
  userName: string;
  stats: AttendanceStats;
  recentAttendance: {
    date: Date;
    checkIn: Date | null;
    checkOut: Date | null;
    isPresent: boolean;
    isWorkingDay: boolean;
    isHoliday: boolean;
  }[];
}

/**
 * Calculate attendance statistics for a user in a date range
 */
export async function calculateUserAttendanceStats(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<AttendanceStats> {
  // Get all working days in the range
  const workingDays = await getWorkingDaysInRange(userId, startDate, endDate);
  
  // Get holidays in the range
  const holidays = await prisma.holiday.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Get attendance records in the range
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      userId,
      checkIn: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { checkIn: 'asc' }
  });

  // Group attendance by date
  const attendanceByDate = new Map<string, typeof attendanceRecords[0]>();
  attendanceRecords.forEach(record => {
    const dateKey = record.checkIn.toISOString().split('T')[0];
    attendanceByDate.set(dateKey, record);
  });

  // Calculate statistics
  const totalWorkingDays = workingDays.length;
  const holidaysCount = holidays.length;
  
  let presentDays = 0;
  let totalHoursWorked = 0;
  let daysOff = 0;

  // Check each working day
  for (const workingDay of workingDays) {
    const dateKey = workingDay.toISOString().split('T')[0];
    const attendance = attendanceByDate.get(dateKey);
    
    if (attendance) {
      presentDays++;
      
      // Calculate hours worked if checked out
      if (attendance.checkOut) {
        const checkIn = new Date(attendance.checkIn);
        const checkOut = new Date(attendance.checkOut);
        const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
        totalHoursWorked += hours;
      }
    }
  }

  // Count days off (non-working days that are not holidays)
  const allDaysInRange: Date[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    allDaysInRange.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  for (const day of allDaysInRange) {
    const isWorking = await isWorkingDay(userId, day);
    const isHoliday = holidays.some(h => 
      h.date.toDateString() === day.toDateString()
    );
    
    if (!isWorking && !isHoliday) {
      daysOff++;
    }
  }

  const absentDays = totalWorkingDays - presentDays;
  const attendanceRate = totalWorkingDays > 0 ? (presentDays / totalWorkingDays) * 100 : 0;
  const averageHoursPerDay = presentDays > 0 ? totalHoursWorked / presentDays : 0;

  return {
    totalWorkingDays,
    presentDays,
    absentDays,
    attendanceRate: Math.round(attendanceRate * 100) / 100,
    totalHoursWorked: Math.round(totalHoursWorked * 100) / 100,
    averageHoursPerDay: Math.round(averageHoursPerDay * 100) / 100,
    holidays: holidaysCount,
    daysOff
  };
}

/**
 * Get detailed attendance summary for a user
 */
export async function getUserAttendanceSummary(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<UserAttendanceSummary> {
  // Get user info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get holidays in the range
  const holidays = await prisma.holiday.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Get attendance records
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      userId,
      checkIn: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { checkIn: 'desc' }
  });

  // Group attendance by date
  const attendanceByDate = new Map<string, typeof attendanceRecords[0]>();
  attendanceRecords.forEach(record => {
    const dateKey = record.checkIn.toISOString().split('T')[0];
    attendanceByDate.set(dateKey, record);
  });

  // Create daily summary
  const recentAttendance = [];
  const currentDate = new Date(endDate);
  const daysToShow = 14; // Show last 14 days

  for (let i = 0; i < daysToShow; i++) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const attendance = attendanceByDate.get(dateKey);
    const isWorking = await isWorkingDay(userId, currentDate);
    const isHoliday = holidays.some(h => 
      h.date.toDateString() === currentDate.toDateString()
    );

    recentAttendance.push({
      date: new Date(currentDate),
      checkIn: attendance?.checkIn || null,
      checkOut: attendance?.checkOut || null,
      isPresent: !!attendance,
      isWorkingDay: isWorking,
      isHoliday
    });

    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Calculate stats
  const stats = await calculateUserAttendanceStats(userId, startDate, endDate);

  return {
    userId: user.id,
    userName: `${user.firstName} ${user.lastName}`,
    stats,
    recentAttendance
  };
}

/**
 * Get attendance summary for all users (admin view)
 */
export async function getAllUsersAttendanceSummary(
  startDate: Date,
  endDate: Date
): Promise<UserAttendanceSummary[]> {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true }
  });

  const summaries = await Promise.all(
    users.map(user => 
      getUserAttendanceSummary(user.id, startDate, endDate)
    )
  );

  return summaries;
}
