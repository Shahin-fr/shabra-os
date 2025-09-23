import React from 'react';

const TeamActivityWidget = () => {
  const teamActivity = [
    { id: 1, name: 'آریا ستوده', status: 'Active', lastActivity: 'آپدیت وظیفه: نهایی‌سازی گزارش سه ماهه', avatar: 'آس' },
    { id: 2, name: 'سارا حسینی', status: 'Active', lastActivity: 'در حال کار روی: طراحی صفحه فرود جدید', avatar: 'سح' },
    { id: 3, name: 'کیان مهرزاد', status: 'Idle', lastActivity: 'آخرین فعالیت: ۲ ساعت پیش', avatar: 'کم' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500';
      case 'Idle':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
      'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
      'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
      'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300',
      'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
    ];
    return colors[name.length % colors.length];
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
      {/* Title */}
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
        فعالیت امروز تیم
      </h3>

      {/* Team Activity List */}
      <ul className="space-y-4">
        {teamActivity.map((member) => (
          <li
            key={member.id}
            className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            {/* Avatar */}
            <div className="relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${getAvatarColor(member.name)}`}>
                {member.avatar}
              </div>
              {/* Status Indicator Dot */}
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${getStatusColor(member.status)}`}></div>
            </div>

            {/* Member Info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-white truncate">
                {member.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {member.lastActivity}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Empty State */}
      {teamActivity.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">👥</div>
          <p>هیچ فعالیتی ثبت نشده است</p>
        </div>
      )}
    </div>
  );
};

export default TeamActivityWidget;
