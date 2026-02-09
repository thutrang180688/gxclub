
import React, { useState } from 'react';
import { ClassSession, User, Rating } from '../types';

interface Props {
  session: ClassSession;
  user: User;
  onClose: () => void;
  onSave: (rating: Rating) => void;
}

const RatingModal: React.FC<Props> = ({ session, user, onClose, onSave }) => {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!comment.trim()) return alert("Vui lòng để lại lời nhắn!");
    const newRating: Rating = {
      id: Date.now().toString(),
      classId: session.id,
      userEmail: user.email,
      userName: user.name,
      stars,
      comment,
      timestamp: new Date().toISOString()
    };
    onSave(newRating);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-teal-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-fade">
        <div className="text-center mb-6">
          <h3 className="text-lg font-black text-teal-900 uppercase tracking-tight">Đánh giá lớp học</h3>
          <p className="text-[10px] text-teal-600 font-bold uppercase mt-1">Lớp: {session.className}</p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map(s => (
            <button 
              key={s} 
              onClick={() => setStars(s)}
              className={`text-3xl transition-all active:scale-125 ${s <= stars ? 'text-amber-400 drop-shadow-sm' : 'text-gray-200'}`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea 
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] p-4 text-xs font-bold outline-none focus:border-teal-500 h-28 resize-none"
          placeholder="Bạn cảm thấy lớp học và HLV thế nào?..."
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        <div className="mt-8 flex flex-col gap-2">
           <button 
            onClick={handleSubmit}
            className="w-full bg-teal-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-teal-700 transition-all"
           >
             Gửi đánh giá
           </button>
           <button 
            onClick={onClose}
            className="w-full text-gray-400 py-3 font-black uppercase text-[9px] tracking-widest"
           >
             Hủy bỏ
           </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
