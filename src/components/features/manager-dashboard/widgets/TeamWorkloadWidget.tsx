import React from 'react';

const TeamWorkloadWidget = () => {
  const workloadData = [
    { id: 1, name: 'آریا ستوده', activeTasks: 5 },
    { id: 2, name: 'سارا حسینی', activeTasks: 8 },
    { id: 3, name: 'کیان مهرزاد', activeTasks: 2 },
  ];

  const getWorkloadColor = (taskCount: number) => {
    if (taskCount >= 7) {
      return 'text-red-600 dark:text-red-400';
    } else if (taskCount >= 4) {
      return 'text-orange-600 dark:text-orange-400';
    } else {
      return 'text-green-600 dark:text-green-400';
    }
  };

  // const getWorkloadLabel = (taskCount: number) => {
  //   if (taskCount >= 7) {
  //     return 'بار کاری بالا';
  //   } else if (taskCount >= 4) {
  //     return 'بار کاری متوسط';
  //   } else {
  //     return 'بار کاری کم';
  //   }
  // };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
      {/* Title */}
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
        بار کاری تیم
      </h3>

      {/* Workload List */}
      <ul className="space-y-3">
        {workloadData.map((member) => (
          <li
            key={member.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            {/* Member Name */}
            <div className="font-semibold text-gray-900 dark:text-white">
              {member.name}
            </div>

            {/* Task Count and Status */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className={`text-sm font-medium ${getWorkloadColor(member.activeTasks)}`}>
                {member.activeTasks} وظیفه فعال
              </span>
              <div className={`w-2 h-2 rounded-full ${
                member.activeTasks >= 7 ? 'bg-red-500' : 
                member.activeTasks >= 4 ? 'bg-orange-500' : 'bg-green-500'
              }`}></div>
            </div>
          </li>
        ))}
      </ul>

      {/* Summary Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            میانگین بار کاری
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {Math.round(workloadData.reduce((sum, member) => sum + member.activeTasks, 0) / workloadData.length)} وظیفه
          </span>
        </div>
        
        {/* Workload Distribution */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between">
            <span>کم: {workloadData.filter(m => m.activeTasks < 4).length}</span>
            <span>متوسط: {workloadData.filter(m => m.activeTasks >= 4 && m.activeTasks < 7).length}</span>
            <span>بالا: {workloadData.filter(m => m.activeTasks >= 7).length}</span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {workloadData.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">📊</div>
          <p>هیچ داده‌ای موجود نیست</p>
        </div>
      )}
    </div>
  );
};

export default TeamWorkloadWidget;
