
import React, { useState } from 'react';
import { ClassSession, User, CATEGORY_COLORS, Rating } from '../types';
import ClassModal from './ClassModal';

interface Props {
  dayIndex: number;
  schedule: ClassSession[];
  user: User | null;
  onUpdate: (newSchedule: ClassSession[]) => void;
  onNotify: (msg: string, type: 'INFO' | 'ALERT') => void;
  onRate: (session: ClassSession) => void;
  ratings: Rating[];
  weekOffset: number;
}

const ScheduleList: React.FC<Props> = ({ dayIndex, schedule, user, onUpdate, onNotify, onRate, ratings, weekOffset }) => {
  const [editing, setEditing] = useState<ClassSession | null>(null);
  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const getWeekDates = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) + (weekOffset * 7);
    const monday = new Date(now);
    monday.setDate(diff);
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates();
  const selectedDate = weekDates[dayIndex];
  const selectedDateStr = selectedDate.toISOString().split('T')[0];

  const classes = schedule.filter(s => {
    if (s.specificDate) {
      return s.specificDate === selectedDateStr;
    }
    return s.dayIndex === dayIndex;
  }).sort((a, b) => {
    const timeA = a.time.split('-')[0].trim().padStart(5, '0');
    const timeB = b.time.split('-')[0].trim().padStart(5, '0');
    return timeA.localeCompare(timeB);
  });

  const getClassRating = (classId: string) => {
    const classRatings = ratings.filter(r => r.classId === classId);
    if (classRatings.length === 0) return null;
    const avg = classRatings.reduce((acc, r) => acc + r.stars, 0) / classRatings.length;
    return { avg: avg.toFixed(1), count: classRatings.length };
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

  return (
    <div className="px-4 space-y-4 pb-8">
      {classes.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-200 text-gray-400 font-bold uppercase text-xs">Không có lớp học nào</div>
      ) : (
        classes.map(session => {
          const ratingData = getClassRating(session.id);
          return (
            <div key={session.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex overflow-hidden animate-fade relative group">
              <div className={`w-3 ${CATEGORY_COLORS[session.category]}`} />
              <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{session.time}</span>
                   <div className="flex items-center gap-2">
                    {session.status !== 'NORMAL' && <span className="bg-red-100 text-red-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">{session.status === 'CANCELLED' ? 'HỦY LỚP' : 'DẠY THAY'}</span>}
                    {isManager && (
                      <button 
                        onClick={() => setEditing(session)}
                        className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    )}
                   </div>
                </div>
                <h3 className="text-xl font-black text-teal-900 leading-tight uppercase">{session.className}</h3>
                {session.isSpecial && <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest mt-1">Sự kiện đặc biệt</p>}
                <p className="text-gray-500 font-bold text-[10px] uppercase mt-1 tracking-tight">HLV: {session.instructor}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ratingData && (
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        <span className="text-amber-500 text-[10px] font-black">★ {ratingData.avg}</span>
                        <span className="text-gray-400 text-[8px] font-bold">({ratingData.count})</span>
                      </div>
                    )}
                  </div>
                  {user && (
                    <button 
                      onClick={() => onRate(session)}
                      className="bg-teal-50 text-teal-700 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-100"
                    >
                      Đánh giá
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
      {editing && <ClassModal session={editing} onClose={() => setEditing(null)} onSave={handleSave} onDelete={(id) => { onUpdate(schedule.filter(x => x.id !== id)); setEditing(null); }} />}
    </div>
  );
};

export default ScheduleList;
