
import React, { useState } from 'react';
import { User, HeaderConfig, Role, PermissionRecord, ClassSession, DAYS_OF_WEEK, Rating, CATEGORY_COLORS } from '../types';

interface Props {
  user: User | null;
  headerConfig: HeaderConfig;
  onUpdateHeader: (c: HeaderConfig) => void;
  permissions: PermissionRecord[];
  onUpdatePermissions: (p: PermissionRecord[]) => void;
  rootEmail: string;
  onClose: () => void;
  registeredUsers: User[];
  schedule: ClassSession[];
  onUpdateSchedule: (s: ClassSession[]) => void;
  onNotify: (msg: string, type: 'INFO' | 'ALERT') => void;
  ratings: Rating[];
}

const AdminPanel: React.FC<Props> = ({ 
  user, headerConfig, onUpdateHeader, permissions, 
  onUpdatePermissions, rootEmail, onClose, registeredUsers,
  schedule, onUpdateSchedule, onNotify, ratings
}) => {
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'USERS' | 'SYSTEM' | 'RATINGS'>('SCHEDULE');
  const [tempHeader, setTempHeader] = useState<HeaderConfig>({ ...headerConfig });
  const [broadcastMsg, setBroadcastMsg] = useState('');
  
  const [newClass, setNewClass] = useState<Partial<ClassSession>>({
    dayIndex: 0, 
    time: '08:00 - 09:00', 
    className: '', 
    instructor: '', 
    category: 'YOGA', 
    status: 'NORMAL'
  });

  const isRootAdmin = user?.email.toLowerCase() === rootEmail.toLowerCase();
  const isAdmin = user?.role === 'ADMIN';

  const handleUpdateUserRole = (email: string, targetRole: Role) => {
    if (!isAdmin) return;
    if (email.toLowerCase() === rootEmail.toLowerCase()) return;
    
    let updatedPerms;
    const existingIdx = permissions.findIndex(p => p.email.toLowerCase() === email.toLowerCase());
    
    if (targetRole === 'USER') {
      updatedPerms = permissions.filter(p => p.email.toLowerCase() !== email.toLowerCase());
    } else {
      if (existingIdx > -1) {
        updatedPerms = permissions.map((p, i) => i === existingIdx ? { ...p, role: targetRole } : p);
      } else {
        updatedPerms = [...permissions, { email: email.toLowerCase(), role: targetRole, addedAt: new Date().toISOString() }];
      }
    }
    onUpdatePermissions(updatedPerms);
  };

  const handleSendBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    onNotify(broadcastMsg, 'ALERT');
    setBroadcastMsg('');
    alert("Đã gửi thông báo thành công!");
  };

  const tabs = [
    { id: 'SCHEDULE', label: 'Lịch Tập', icon: '📅', visible: true },
    { id: 'RATINGS', label: 'Đánh giá', icon: '⭐', visible: true },
    { id: 'USERS', label: 'Phân quyền', icon: '👥', visible: isAdmin },
    { id: 'SYSTEM', label: 'Website', icon: '⚙️', visible: isAdmin }
  ].filter(t => t.visible);

  const categories: {key: ClassSession['category'], label: string, color: string}[] = [
    { key: 'YOGA', label: 'Xanh Dương', color: 'bg-sky-500' },
    { key: 'TAICHI', label: 'Xanh Lá', color: 'bg-emerald-600' },
    { key: 'DANCE', label: 'Vàng Cam', color: 'bg-orange-500' },
    { key: 'OTHER', label: 'Tím', color: 'bg-indigo-500' },
  ];

  // Sắp xếp đánh giá mới nhất lên trên
  const sortedRatings = [...ratings].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="fixed inset-0 bg-teal-950/80 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8">
      <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
        
        <div className="bg-teal-900 px-8 py-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-2xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Cài Đặt Hệ Thống</h2>
              <p className="text-[10px] text-teal-400 font-bold uppercase mt-0.5">ADMIN PANEL</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="flex bg-slate-100 p-2 gap-2 border-b overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`flex-1 min-w-[120px] py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white text-teal-900 shadow-md' : 'text-gray-400 hover:text-teal-700'}`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scroll">
          
          {activeTab === 'SCHEDULE' && (
             <div className="space-y-12 animate-fade">
                <section className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-200 shadow-sm">
                   <h3 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <span>📢</span> Gửi thông báo khẩn (Sẽ hiện trên màn hình điện thoại hội viên)
                   </h3>
                   <div className="space-y-4">
                     <textarea 
                        className="w-full bg-white border border-amber-200 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500 h-24 resize-none"
                        placeholder="Vd: Lớp Zumba tối nay dời sang phòng tập số 2 quý vị nhé!"
                        value={broadcastMsg}
                        onChange={e => setBroadcastMsg(e.target.value)}
                     />
                     <button 
                        onClick={handleSendBroadcast}
                        className="w-full bg-amber-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg active:scale-95 transition-all"
                     >
                       Gửi Thông Báo Ngay
                     </button>
                   </div>
                </section>

                <section className="bg-teal-50 rounded-[2.5rem] p-8 border border-teal-100 shadow-sm">
                   <h3 className="text-sm font-black text-teal-900 uppercase tracking-widest mb-8">➕ Thêm lớp học mới</h3>
                   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Giờ học</label>
                        <input className="w-full bg-white border rounded-2xl p-4 text-xs font-bold outline-none" value={newClass.time} onChange={e => setNewClass({...newClass, time: e.target.value})} placeholder="Vd: 08:00 - 09:00" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Tên Lớp</label>
                        <input className="w-full bg-white border rounded-2xl p-4 text-xs font-bold outline-none uppercase" value={newClass.className} onChange={e => setNewClass({...newClass, className: e.target.value.toUpperCase()})} placeholder="ZUMBA..." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase ml-2">HLV</label>
                        <input className="w-full bg-white border rounded-2xl p-4 text-xs font-bold outline-none uppercase" value={newClass.instructor} onChange={e => setNewClass({...newClass, instructor: e.target.value.toUpperCase()})} placeholder="HLV..." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Thứ</label>
                        <select className="w-full bg-white border rounded-2xl p-4 text-xs font-bold outline-none" value={newClass.dayIndex} onChange={e => setNewClass({...newClass, dayIndex: parseInt(e.target.value)})}>
                          {DAYS_OF_WEEK.map((d, i) => <option key={i} value={i}>{d.vn}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1 lg:col-span-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Màu sắc / Phân loại</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {categories.map((cat) => (
                            <button
                              key={cat.key}
                              onClick={() => setNewClass({...newClass, category: cat.key})}
                              className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${
                                newClass.category === cat.key 
                                ? 'border-teal-600 bg-teal-50' 
                                : 'border-transparent bg-white'
                              }`}
                            >
                              <div className={`w-6 h-6 rounded-full ${cat.color} shadow-sm`} />
                              <span className="text-[8px] font-black uppercase text-gray-500 text-center">{cat.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                   </div>
                   <button onClick={() => {
                      if (!newClass.className || !newClass.instructor || !newClass.time) return alert("Vui lòng nhập đủ thông tin lớp!");
                      onUpdateSchedule([...schedule, {...newClass as ClassSession, id: Date.now().toString()}]);
                      setNewClass({...newClass, className: '', instructor: ''});
                      alert("Đã thêm thành công!");
                   }} className="mt-8 w-full bg-teal-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Xác nhận Thêm lớp</button>
                </section>
             </div>
          )}

          {activeTab === 'SYSTEM' && isAdmin && (
            <div className="space-y-8 animate-fade max-w-2xl mx-auto">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                <h3 className="text-lg font-black text-teal-900 uppercase mb-6">⚙️ Cấu hình website</h3>
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <label className="text-[9px] font-black text-red-600 uppercase ml-2 tracking-widest">Thông báo nghỉ lễ (Màu đỏ trên trang chủ)</label>
                    <input 
                      className="w-full bg-white border-2 border-red-100 rounded-2xl p-4 text-xs font-bold text-red-700 mt-2 outline-none focus:border-red-400" 
                      value={tempHeader.holidayNotice} 
                      onChange={e => setTempHeader({...tempHeader, holidayNotice: e.target.value})} 
                      placeholder="VD: Nghỉ Tết Nguyên Đán từ 28/1 đến 05/2..."
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Tiêu đề lịch tập</label>
                    <input className="w-full bg-white border rounded-2xl p-4 text-xs font-black" value={tempHeader.scheduleTitle} onChange={e => setTempHeader({...tempHeader, scheduleTitle: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Hotline</label>
                      <input className="w-full bg-white border rounded-2xl p-4 text-xs font-bold" value={tempHeader.hotline} onChange={e => setTempHeader({...tempHeader, hotline: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Website</label>
                      <input className="w-full bg-white border rounded-2xl p-4 text-xs font-bold" value={tempHeader.website} onChange={e => setTempHeader({...tempHeader, website: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Địa chỉ</label>
                    <input className="w-full bg-white border rounded-2xl p-4 text-xs font-bold" value={tempHeader.address} onChange={e => setTempHeader({...tempHeader, address: e.target.value})} />
                  </div>
                  <button onClick={() => { onUpdateHeader(tempHeader); alert("Đã lưu cấu hình!"); }} className="w-full bg-teal-900 text-white py-5 rounded-2xl font-black text-xs uppercase shadow-xl mt-4 active:scale-95 transition-all">Lưu Cấu Hình</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'USERS' && isAdmin && (
            <div className="space-y-8 animate-fade">
              <h3 className="text-lg font-black text-teal-900 uppercase border-b pb-4">Quản lý Phân quyền</h3>
              <div className="grid gap-4">
                {registeredUsers
                  .filter(regUser => isRootAdmin || regUser.email.toLowerCase() !== rootEmail.toLowerCase())
                  .map(regUser => {
                    const currentPerm = permissions.find(p => p.email.toLowerCase() === regUser.email.toLowerCase());
                    const role = currentPerm?.role || (regUser.email.toLowerCase() === rootEmail.toLowerCase() ? 'ADMIN' : 'USER');
                    const isRoot = regUser.email.toLowerCase() === rootEmail.toLowerCase();
                    
                    return (
                      <div key={regUser.id} className="flex items-center justify-between bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4">
                          <img src={regUser.avatar} className="w-10 h-10 rounded-full border-2 border-teal-500 p-0.5" alt="avt" />
                          <div>
                            <p className="text-[11px] font-black text-gray-800 uppercase">{regUser.name}</p>
                            <p className="text-[9px] text-gray-400 font-bold">{regUser.email}</p>
                          </div>
                        </div>
                        
                        {!isRoot && (
                          <div className="flex gap-2">
                             {isRootAdmin && (
                               <button 
                                 onClick={() => handleUpdateUserRole(regUser.email, role === 'ADMIN' ? 'USER' : 'ADMIN')} 
                                 className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all ${role === 'ADMIN' ? 'bg-black text-white' : 'bg-amber-500 text-white shadow-lg shadow-amber-200'}`}
                               >
                                 {role === 'ADMIN' ? 'Hạ quyền Admin' : 'Cấp quyền Admin'}
                               </button>
                             )}

                             <button 
                              onClick={() => handleUpdateUserRole(regUser.email, role === 'MANAGER' ? 'USER' : 'MANAGER')} 
                              className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all ${role === 'MANAGER' ? 'bg-red-50 text-red-600' : 'bg-teal-600 text-white'}`}
                             >
                              {role === 'MANAGER' ? 'Hủy Manager' : 'Cấp Manager'}
                             </button>
                          </div>
                        )}
                        
                        {isRoot && (
                          <span className="bg-teal-100 text-teal-800 px-4 py-2 rounded-xl text-[8px] font-black uppercase">Root Admin</span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {activeTab === 'RATINGS' && (
             <div className="space-y-6 animate-fade">
               <h3 className="text-lg font-black text-teal-900 uppercase border-b pb-4">Phản hồi Hội viên (Mới nhất ở trên)</h3>
               <div className="grid gap-4">
                  {sortedRatings.length === 0 ? (
                    <p className="text-center py-12 text-gray-400 font-bold uppercase text-xs">Chưa có đánh giá nào</p>
                  ) : (
                    sortedRatings.map(r => {
                      const sessionInfo = schedule.find(s => s.id === r.classId);
                      return (
                        <div key={r.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 px-4 py-2 bg-teal-900 text-white rounded-bl-2xl">
                             <p className="text-[8px] font-black uppercase tracking-widest">
                               Lớp: {sessionInfo?.className || 'Lớp đã xóa'}
                             </p>
                             <p className="text-[7px] opacity-70 font-bold uppercase">
                               HLV: {sessionInfo?.instructor || '---'}
                             </p>
                          </div>

                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-[11px] font-black text-teal-900 uppercase">{r.userName}</p>
                              <p className="text-[8px] text-gray-400 font-bold">{new Date(r.timestamp).toLocaleString('vi-VN')}</p>
                            </div>
                            <div className="text-amber-400 text-xs mt-8">{'★'.repeat(r.stars)}</div>
                          </div>
                          <p className="text-xs font-bold text-gray-700 bg-slate-50 p-4 rounded-2xl italic">"{r.comment}"</p>
                        </div>
                      );
                    })
                  )}
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
