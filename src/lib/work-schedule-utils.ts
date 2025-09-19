import { prisma } from './prisma';

export interface WorkScheduleValidation {
  isValid: boolean;
  conflicts: {
    type: 'work_schedule' | 'holiday';
    date: Date;
    reason: string;
  }[];
}

/**
 * Validates if a leave request period conflicts with work schedule or holidays
 */
export async function validateLeaveRequestPeriod(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<WorkScheduleValidation> {
  const conflicts: WorkScheduleValidation['conflicts'] = [];

  // Get user's work schedule
  const workSchedule = await prisma.workSchedule.findUnique({
    where: { userId }
  });

  // Get holidays in the date range
  const holidays = await prisma.holiday.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  // Check each day in the leave period
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayName = getDayName(dayOfWeek);

    // Check if it's a holiday
    const isHoliday = holidays.some(holiday => 
      holiday.date.toDateString() === currentDate.toDateString()
    );

    if (isHoliday) {
      const holiday = holidays.find(h => 
        h.date.toDateString() === currentDate.toDateString()
      );
      conflicts.push({
        type: 'holiday',
        date: new Date(currentDate),
        reason: `Cannot request leave on holiday: ${holiday?.name}`
      });
    }

    // Check work schedule (only if not a holiday)
    if (!isHoliday && workSchedule) {
      const isWorkingDay = getWorkingDayStatus(workSchedule, dayOfWeek);
      
      if (!isWorkingDay) {
        conflicts.push({
          type: 'work_schedule',
          date: new Date(currentDate),
          reason: `Cannot request leave on your weekly day off (${dayName})`
        });
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    isValid: conflicts.length === 0,
    conflicts
  };
}

/**
 * Gets the working day status for a specific day of the week
 */
function getWorkingDayStatus(workSchedule: any, dayOfWeek: number): boolean {
  switch (dayOfWeek) {
    case 0: return workSchedule.sunday;
    case 1: return workSchedule.monday;
    case 2: return workSchedule.tuesday;
    case 3: return workSchedule.wednesday;
    case 4: return workSchedule.thursday;
    case 5: return workSchedule.friday;
    case 6: return workSchedule.saturday;
    default: return true;
  }
}

/**
 * Gets the day name from day of week number
 */
function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || 'Unknown';
}

/**
 * Checks if a specific date is a working day for a user
 */
export async function isWorkingDay(userId: string, date: Date): Promise<boolean> {
  // Check if it's a holiday first
  const holiday = await prisma.holiday.findFirst({
    where: {
      date: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      }
    }
  });

  if (holiday) {
    return false; // Holiday is not a working day
  }

  // Check work schedule
  const workSchedule = await prisma.workSchedule.findUnique({
    where: { userId }
  });

  if (!workSchedule) {
    return true; // Default to working day if no schedule is set
  }

  const dayOfWeek = date.getDay();
  return getWorkingDayStatus(workSchedule, dayOfWeek);
}

/**
 * Gets all working days for a user in a date range
 */
export async function getWorkingDaysInRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Date[]> {
  const workingDays: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const isWorking = await isWorkingDay(userId, currentDate);
    if (isWorking) {
      workingDays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return workingDays;
}
