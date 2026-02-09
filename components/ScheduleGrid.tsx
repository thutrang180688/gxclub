
import React, { useState } from 'react';
import { ClassSession, User, DAYS_OF_WEEK, CATEGORY_COLORS, Rating } from '../types';
import ClassModal from './ClassModal';

interface Props {
  schedule: ClassSession[];
  user: User | null;
  onUpdate: (newSchedule: ClassSession[]) => void;
  onNotify: (msg: string, type: 'INFO' | 'ALERT') => void;
  onRate: (session: ClassSession) => void;
  ratings: Rating[];
}

const ScheduleGrid: React.FC<Props> = ({ schedule, user, onUpdate, onNotify, onRate, ratings }) => {
  const [editing, setEditing] = useState<ClassSession | null>(null);
  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const getClassRating = (classId: string) => {
    const classRatings = ratings.filter(r => r.classId === classId);
    if (classRatings.length === 0) return null;
    const avg = classRatings.reduce((acc, r) => acc + r.stars, 0) / classRatings.length;
    return avg.toFixed(1);
  };

  const handleSave = (s: ClassSession, notify: boolean) => {
    const updated = schedule.find(x => x.id === s.id) ? schedule.map(x => x.id === s.id ? s : x) : [...schedule, {...s, id: Date.now().toString()}];
    onUpdate(updated);
    if (notify) {
      const statusText = s.status === 'CANCELLED' ? 'đã bị HỦY' : s.status === 'SUBSTITUTE' ? 'có thay đổi giáo viên' : 'đã được cập nhật';
      onNotify(`Thông báo: Lớp ${s.className} lúc ${s.time} ${statusText}. Quý hội viên lưu ý!`, s.status === 'CANCELLED' ? 'ALERT' : 'INFO');
    }
    setEditing(null);
  };

  // Helper to get total minutes from time string (e.g., "08:00 - 09:00" -> 480)
  const getTimeValue = (timeStr: string) => {
    try {
      const startTime = timeStr.split('-')[0].trim();
      const [hours, minutes] = startTime.split(':').map(Number);
      return (hours || 0) * 60 + (minutes || 0);
    } catch (e) {
      return 0;
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-200">
      <div className="grid grid-cols-7 bg-teal-900 text-white border-b-4 border-teal-800">
        {DAYS_OF_WEEK.map((day, idx) => (
          <div key={idx} className="p-4 text-center border-r border-teal-800/50 last:border-0">
            <div className="text-[9px] font-light text-teal-300 uppercase tracking-widest">{day.eng}</div>
            <div className="text-lg font-black tracking-tighter">{day.vn.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x divide-gray-100 bg-slate-50 min-h-[600px]">
        {DAYS_OF_WEEK.map((_, dayIdx) => (
          <div key={dayIdx} className="p-3 space-y-4">
            {schedule
              .filter(s => s.dayIndex === dayIdx)
              .sort((a, b) => getTimeValue(a.time) - getTimeValue(b.time))
              .map(session => {
                const avgStar = getClassRating(session.id);
                return (
                  <div 
                    key={session.id} 
                    className={`p-4 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm transition-all relative group flex flex-col`}
                  >
                    <div className="text-[8px] font-black text-gray-400 text-center mb-2">{session.time}</div>
                    <div className={`text-[10px] font-black text-white text-center py-2 rounded-xl uppercase shadow-sm ${CATEGORY_COLORS[session.category]}`}>{session.className}</div>
                    <div className="text-[10px] font-black text-teal-900 text-center mt-2 uppercase">{session.instructor}</div>
                    
                    <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2">
                      {avgStar ? (
                         <span className="text-[9px] font-black text-amber-500">★ {avgStar}</span>
                      ) : <span className="text-[8px] text-gray-300 font-bold italic uppercase">Chưa đánh giá</span>}
                      {user && (
                        <button onClick={() => onRate(session)} className="text-[8px] font-black text-teal-600 hover:text-teal-900 uppercase">Rate</button>
                      )}
                    </div>

                    {session.status !== 'NORMAL' && (
                       <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">{session.status === 'CANCELLED' ? 'HỦY' : 'THAY'}</span>
                    )}
                    {isManager && (
                      <div onClick={() => setEditing(session)} className="absolute inset-0 bg-teal-900/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem] flex items-center justify-center cursor-pointer">
                        <span className="text-[8px] bg-white px-3 py-1.5 rounded-full font-black text-teal-900 shadow-md">CHỈNH SỬA</span>
                      </div>
                    )}
                  </div>
                );
            })}
          </div>
        ))}
      </div>
      {editing && <ClassModal session={editing} onClose={() => setEditing(null)} onSave={handleSave} onDelete={(id) => { onUpdate(schedule.filter(x => x.id !== id)); setEditing(null); }} />}
    </div>
  );
};

export default ScheduleGrid;
