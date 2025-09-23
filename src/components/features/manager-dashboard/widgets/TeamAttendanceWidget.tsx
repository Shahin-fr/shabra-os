import React from 'react';

const TeamAttendanceWidget = () => {
  const attendanceStats = {
    clockedIn: 8,
    onLeave: 2,
    absent: 1,
  };

  const totalTeam = attendanceStats.clockedIn + attendanceStats.onLeave + attendanceStats.absent;

  const metrics = [
    {
      label: 'حاضر',
      value: attendanceStats.clockedIn,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900',
      icon: '✅',
    },
    {
      label: 'مرخصی',
      value: attendanceStats.onLeave,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      icon: '🏖️',
    },
    {
      label: 'غایب',
      value: attendanceStats.absent,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900',
      icon: '❌',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
      {/* Title */}
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
        وضعیت حضور تیم
      </h3>

      {/* Summary Stats */}
      <div className="mb-4">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {totalTeam}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          کل اعضای تیم
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`${metric.bgColor} rounded-lg p-4 text-center`}
          >
            <div className="text-2xl mb-1">{metric.icon}</div>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {metric.label}
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Rate */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            نرخ حضور
          </span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {Math.round((attendanceStats.clockedIn / totalTeam) * 100)}%
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(attendanceStats.clockedIn / totalTeam) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TeamAttendanceWidget;
