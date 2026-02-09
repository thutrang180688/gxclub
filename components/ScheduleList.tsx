
import React from 'react';
import { ClassSession, User, CATEGORY_COLORS, Rating } from '../types';

interface Props {
  dayIndex: number;
  schedule: ClassSession[];
  user: User | null;
  onUpdate: (newSchedule: ClassSession[]) => void;
  onRate: (session: ClassSession) => void;
  ratings: Rating[];
}

const ScheduleList: React.FC<Props> = ({ dayIndex, schedule, user, onUpdate, onRate, ratings }) => {
  const classes = schedule.filter(s => s.dayIndex === dayIndex).sort((a, b) => a.time.localeCompare(b.time));

  const getClassRating = (classId: string) => {
    const classRatings = ratings.filter(r => r.classId === classId);
    if (classRatings.length === 0) return null;
    const avg = classRatings.reduce((acc, r) => acc + r.stars, 0) / classRatings.length;
    return { avg: avg.toFixed(1), count: classRatings.length };
  };

  return (
    <div className="px-4 space-y-4 pb-8">
      {classes.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-200 text-gray-400 font-bold uppercase text-xs">Không có lớp học nào</div>
      ) : (
        classes.map(session => {
          const ratingData = getClassRating(session.id);
          return (
            <div key={session.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex overflow-hidden animate-fade">
              <div className={`w-3 ${CATEGORY_COLORS[session.category]}`} />
              <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{session.time}</span>
                   {session.status !== 'NORMAL' && <span className="bg-red-100 text-red-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">{session.status === 'CANCELLED' ? 'HỦY LỚP' : 'DẠY THAY'}</span>}
                </div>
                <h3 className="text-xl font-black text-teal-900 leading-tight uppercase">{session.className}</h3>
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
    </div>
  );
};

export default ScheduleList;
