
import React from 'react';
import { DAYS_OF_WEEK } from '../types';

interface Props {
  selected: number;
  onSelect: (index: number) => void;
}

const DateStrip: React.FC<Props> = ({ selected, onSelect }) => {
  const getWeekDates = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates();

  return (
    <div className="bg-white border-b sticky top-16 z-30 shadow-sm w-full overflow-hidden">
      <div className="flex w-full px-1 py-2 justify-between items-center">
        {DAYS_OF_WEEK.map((day, idx) => {
          const date = weekDates[idx];
          const dateString = `${date.getDate()}/${date.getMonth() + 1}`;
          
          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`flex flex-col items-center justify-center flex-1 h-16 rounded-xl transition-all ${
                selected === idx ? 'bg-teal-700 text-white shadow-md' : 'text-gray-500'
              }`}
            >
              <span className={`text-[11px] font-bold ${selected === idx ? 'text-white' : 'text-teal-900'}`}>{day.vn}</span>
              <span className={`text-[9px] font-black mt-0.5 ${selected === idx ? 'text-teal-100' : 'text-teal-600'}`}>{dateString}</span>
              <span className={`text-[7px] font-light opacity-80 ${selected === idx ? 'text-teal-200' : 'text-gray-400'}`}>{day.eng}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateStrip;
