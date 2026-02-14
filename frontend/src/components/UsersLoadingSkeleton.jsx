
import React from 'react';
function UsersLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((item) => (
        <div key={item} className="bg-[rgba(12,12,18,0.7)] p-4 rounded-xl animate-pulse border border-[rgba(212,175,55,0.14)]">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[rgba(212,175,55,0.18)] rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-[rgba(212,175,55,0.18)] rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-[rgba(212,175,55,0.12)] rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
export default UsersLoadingSkeleton;