import React from 'react';

const ActionCenterWidget = () => {
  const pendingRequests = [
    { id: 1, user: { name: 'آریا ستوده' }, type: 'درخواست مرخصی', time: '۲ ساعت پیش' },
    { id: 2, user: { name: 'سارا حسینی' }, type: 'گزارش هزینه', time: 'دیروز' },
    { id: 3, user: { name: 'کیان مهرزاد' }, type: 'درخواست مرخصی', time: '۳ روز پیش' },
  ];

  const getIconColor = (type: string) => {
    switch (type) {
      case 'درخواست مرخصی':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300';
      case 'گزارش هزینه':
        return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getIconSymbol = (type: string) => {
    switch (type) {
      case 'درخواست مرخصی':
        return '🏖️';
      case 'گزارش هزینه':
        return '💰';
      default:
        return '📋';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
      {/* Title */}
      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
        مرکز اقدام
      </h3>

      {/* Pending Requests List */}
      <ul className="space-y-3">
        {pendingRequests.map((request) => (
          <li
            key={request.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
          >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${getIconColor(request.type)}`}>
              {getIconSymbol(request.type)}
            </div>

            {/* Request Details */}
            <div className="flex-1 mx-3 text-right">
              <div className="font-semibold text-gray-900 dark:text-white">
                {request.user.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {request.type}
              </div>
            </div>

            {/* Time & Action Indicator */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {request.time}
              </span>
              <svg
                className="w-4 h-4 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </li>
        ))}
      </ul>

      {/* Empty State (if no requests) */}
      {pendingRequests.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">✅</div>
          <p>هیچ درخواست در انتظاری وجود ندارد</p>
        </div>
      )}
    </div>
  );
};

export default ActionCenterWidget;
