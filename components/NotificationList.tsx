
import React from 'react';
import { AppNotification } from '../types';

interface Props {
  notifications: AppNotification[];
}

const NotificationList: React.FC<Props> = ({ notifications }) => {
  // Sắp xếp thông báo mới nhất lên trên cùng
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl p-6 border border-teal-50 border-t-8 border-t-teal-700 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-sm font-black text-teal-900 uppercase tracking-widest flex items-center gap-2">
          <span>🔔</span> Thông báo ({notifications.length})
        </h4>
        {notifications.length > 0 && <span className="animate-pulse w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar max-h-[500px]">
        {sortedNotifications.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl opacity-20 grayscale">🔕</span>
            <p className="text-[11px] text-gray-400 mt-4 font-bold uppercase tracking-widest">Không có thông báo mới</p>
          </div>
        ) : (
          sortedNotifications.map((n) => (
            <div key={n.id} className={`p-4 rounded-[1.5rem] border-l-4 animate-in slide-in-from-right-2 duration-300 shadow-sm ${
              n.type === 'ALERT' ? 'bg-red-50 border-l-red-500' : 'bg-teal-50/50 border-l-teal-500'
            }`}>
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                  n.type === 'ALERT' ? 'bg-red-200 text-red-700' : 'bg-teal-200 text-teal-700'
                }`}>
                  {n.type === 'ALERT' ? 'Khẩn cấp' : 'Cập nhật'}
                </span>
                <span className="text-[8px] text-gray-400 font-bold">
                  {new Date(n.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(n.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
              <p className="text-[11px] font-bold text-gray-800 leading-tight">{n.message}</p>
              <p className="text-[8px] text-gray-400 mt-2 italic">Người gửi: {n.sender}</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <button 
          onClick={() => {
            if ("Notification" in window) {
               Notification.requestPermission().then(permission => {
                 if (permission === "granted") {
                   alert("Hệ thống đã sẵn sàng gửi thông báo màn hình cho bạn!");
                 } else {
                   alert("Bạn cần cấp quyền thông báo trong cài đặt trình duyệt để tính năng này hoạt động.");
                 }
               });
            } else {
              alert("Trình duyệt của bạn không hỗ trợ thông báo màn hình.");
            }
          }}
          className="w-full bg-teal-900 text-white text-[10px] font-black py-4 rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg"
        >
          ⏰ Nhận thông báo màn hình
        </button>
      </div>
    </div>
  );
};

export default NotificationList;
