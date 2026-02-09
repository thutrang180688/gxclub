
import React from 'react';
import { DAYS_OF_WEEK } from '../types';

interface Props {
  selected: number;
  onSelect: (index: number) => void;
}

const DateStrip: React.FC<Props> = ({ selected, onSelect }) => {
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
            <span className={`text-[8px] font-light mt-0.5 opacity-80 ${selected === idx ? 'text-teal-100' : 'text-gray-400'}`}>{day.eng}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateStrip;
