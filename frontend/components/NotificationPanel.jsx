import React from 'react';
import { HiCheckCircle, HiInformationCircle, HiXCircle } from 'react-icons/hi2';

export default function NotificationPanel({ notifications }) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-2 md:right-4 z-50 space-y-2 max-w-xs md:max-w-sm">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`
            flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform
            ${notification.type === 'success' ? 'bg-green-600 text-white' :
              notification.type === 'error' ? 'bg-red-600 text-white' :
              'bg-blue-600 text-white'}
          `}
          style={{
            animation: `slideInRight 0.3s ease-out ${index * 0.1}s both`
          }}
        >
          {notification.type === 'success' && <HiCheckCircle className="w-[18px] h-[18px]" />}
          {notification.type === 'error' && <HiXCircle className="w-[18px] h-[18px]" />}
          {notification.type === 'info' && <HiInformationCircle className="w-[18px] h-[18px]" />}

          <span className="text-xs md:text-sm font-medium">{notification.message}</span>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
