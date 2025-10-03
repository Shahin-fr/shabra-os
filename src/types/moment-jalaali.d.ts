declare module 'moment-jalaali' {
  import moment from 'moment';
  
  interface MomentJalaali extends moment.Moment {
    jYear(): number;
    jMonth(): number;
    jDate(): number;
    jDayOfYear(): number;
    jWeek(): number;
    jWeekYear(): number;
    jDaysInMonth(): number;
    jIsLeapYear(): boolean;
    jIsValid(): boolean;
    jStartOf(unit: string): MomentJalaali;
    jEndOf(unit: string): MomentJalaali;
    jAdd(amount: number, unit: string): MomentJalaali;
    jSubtract(amount: number, unit: string): MomentJalaali;
    jDiff(other: moment.MomentInput, unit?: string, precise?: boolean): number;
    jFormat(format?: string): string;
    jFromNow(withoutSuffix?: boolean): string;
    jToNow(withoutSuffix?: boolean): string;
    jToArray(): number[];
    jToObject(): {
      years: number;
      months: number;
      date: number;
      hours: number;
      minutes: number;
      seconds: number;
      milliseconds: number;
    };
  }
  
  interface MomentJalaaliStatic {
    (input?: moment.MomentInput, format?: string | string[], language?: string, strict?: boolean): MomentJalaali;
    (input?: moment.MomentInput, format?: string | string[], strict?: boolean): MomentJalaali;
    (input?: moment.MomentInput, language?: string, strict?: boolean): MomentJalaali;
    (input?: moment.MomentInput, strict?: boolean): MomentJalaali;
    
    jIsLeapYear(year: number): boolean;
    jDaysInMonth(year: number, month: number): number;
    jIsValid(year: number, month: number, date: number): boolean;
    jToMoment(jYear: number, jMonth: number, jDate: number): moment.Moment;
    jFromMoment(moment: moment.Moment): { jYear: number; jMonth: number; jDate: number };
  }
  
  const momentJalaali: MomentJalaaliStatic;
  export = momentJalaali;
}

