
import React from 'react';
import { DAYS_OF_WEEK } from '../types';

interface Props {
  selected: number;
  onSelect: (index: number) => void;
}

const DateStrip: React.FC<Props> = ({ selected, onSelect }) => {
  const getWeekDate = (dayIndex: number) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Sun) to 6 (Sat)
    const currentDayMonStart = currentDay === 0 ? 6 : currentDay - 1;
    const diff = dayIndex - currentDayMonStart;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
    
    const day = targetDate.getDate();
    const month = targetDate.getMonth() + 1;
    
    if (targetDate.getMonth() !== now.getMonth()) {
      return day + '/' + month;
    }
    return day.toString();
  };

  return (
    <div className="bg-white border-b sticky top-16 z-30 shadow-sm w-full overflow-hidden">
      <div className="flex w-full px-1 py-2 justify-between items-center">
        {DAYS_OF_WEEK.map((day, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={`flex flex-col items-center justify-center flex-1 h-14 rounded-xl transition-all ${
              selected === idx ? 'bg-teal-700 text-white shadow-md' : 'text-gray-500'
            }`}
          >
            <span className={`text-[11px] font-bold ${selected === idx ? 'text-white' : 'text-teal-900'}`}>{day.vn}</span>
            <span className={`text-[9px] font-black mt-0.5 ${selected === idx ? 'text-teal-200' : 'text-teal-700/50'}`}>{getWeekDate(idx)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateStrip;
