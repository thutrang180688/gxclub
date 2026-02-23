
import React from 'react';

const PWAInstaller: React.FC = () => {
  return (
    <div className="px-4 mt-6 mb-8 lg:mb-0">
      <button 
        onClick={() => alert("Nhấn 'Chia sẻ' và 'Thêm vào MH chính'")}
        className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
      >
        ✨ Cài đặt ứng dụng vào điện thoại
      </button>
    </div>
  );
};

export default PWAInstaller;
