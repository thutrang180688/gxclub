
import React, { useState } from 'react';
import { ClassSession, CATEGORY_COLORS, DAYS_OF_WEEK } from '../types';

interface Props {
  session: ClassSession;
  onClose: () => void;
  onSave: (session: ClassSession, notify: boolean) => void;
  onDelete: (id: string) => void;
}

const ClassModal: React.FC<Props> = ({ session, onClose, onSave, onDelete }) => {
  const [form, setForm] = useState(session);
  const [shouldNotify, setShouldNotify] = useState(false);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-teal-950/60 backdrop-blur-lg p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden animate-fade p-8 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-black uppercase text-teal-900 mb-6 flex items-center gap-3">
          <span>📝</span> Sửa Lớp Học
        </h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Thứ (Dời lớp)</label>
            <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-teal-500 outline-none" value={form.dayIndex} onChange={e => setForm({...form, dayIndex: parseInt(e.target.value)})}>
              {DAYS_OF_WEEK.map((d, i) => <option key={i} value={i}>{d.vn} ({d.eng})</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Giờ Học</label>
            <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-teal-500 outline-none" value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Tên Lớp</label>
            <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-teal-500 outline-none uppercase" value={form.className} onChange={e => setForm({...form, className: e.target.value.toUpperCase()})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">HLV</label>
            <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-teal-500 outline-none uppercase" value={form.instructor} onChange={e => setForm({...form, instructor: e.target.value.toUpperCase()})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Trạng Thái / Thông Báo Lớp</label>
            <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:border-teal-500 outline-none" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
              <option value="NORMAL">Bình Thường</option>
              <option value="CANCELLED">Hủy Lớp</option>
              <option value="SUBSTITUTE">Thay Giáo Viên</option>
            </select>
          </div>
          <div className="pt-2 flex items-center gap-3">
            <input type="checkbox" id="notify" className="w-5 h-5 rounded-lg border-teal-500 text-teal-600 focus:ring-teal-500" checked={shouldNotify} onChange={e => setShouldNotify(e.target.checked)} />
            <label htmlFor="notify" className="text-xs font-black text-teal-700 uppercase cursor-pointer">Gửi thông báo cho hội viên</label>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col gap-3">
          <button onClick={() => onSave(form, shouldNotify)} className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg active:scale-95 transition-all">Lưu & Áp Dụng</button>
          <div className="flex gap-3">
            <button onClick={() => onDelete(form.id)} className="flex-1 bg-red-50 text-red-600 py-4 rounded-2xl font-black uppercase text-[10px]">Xóa Lớp</button>
            <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black uppercase text-[10px]">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassModal;
