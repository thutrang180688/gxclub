
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
  // Mặc định tab SCHEDULE cho cả 2 quyền
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'USERS' | 'SYSTEM' | 'RATINGS'>('SCHEDULE');
  const [tempHeader, setTempHeader] = useState<HeaderConfig>({ ...headerConfig });
  
  const [newClass, setNewClass] = useState<Partial<ClassSession>>({
    dayIndex: 0, 
    time: '08:00 - 09:00', 
    className: '', 
    instructor: '', 
    category: 'YOGA', 
    status: 'NORMAL'
  });

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER' || isAdmin;

  const toggleUserRole = (email: string, currentRole: Role) => {
    if (!isAdmin) return; // Bảo vệ thêm bằng logic code
    if (email.toLowerCase() === rootEmail.toLowerCase()) return;
    const newRole: Role = currentRole === 'MANAGER' ? 'USER' : 'MANAGER';
    
    let updatedPerms;
    const existingIdx = permissions.findIndex(p => p.email === email);
    if (existingIdx > -1) {
      updatedPerms = permissions.map((p, i) => i === existingIdx ? { ...p, role: newRole } : p);
    } else {
      updatedPerms = [...permissions, { email, role: newRole, addedAt: new Date().toISOString() }];
    }
    onUpdatePermissions(updatedPerms);
    alert(`Đã cập nhật vai trò ${newRole} cho ${email}`);
  };

  // Danh sách các tab dựa trên quyền
  const tabs = [
    { id: 'SCHEDULE', label: 'Lịch Tập', icon: '📅', visible: true },
    { id: 'RATINGS', label: 'Đánh giá', icon: '⭐', visible: true },
    { id: 'USERS', label: 'Hội viên & Nhân sự', icon: '👥', visible: isAdmin },
    { id: 'SYSTEM', label: 'Cấu hình Website', icon: '⚙️', visible: isAdmin }
  ].filter(t => t.visible);

  const categories: {key: ClassSession['category'], label: string, color: string}[] = [
    { key: 'YOGA', label: 'Xanh Dương (Yoga)', color: 'bg-sky-500' },
    { key: 'TAICHI', label: 'Xanh Lá (Tai Chi)', color: 'bg-emerald-600' },
    { key: 'DANCE', label: 'Vàng Cam (Dance)', color: 'bg-orange-500' },
    { key: 'OTHER', label: 'Tím (Khác)', color: 'bg-indigo-500' },
  ];

  return (
    <div className="fixed inset-0 bg-teal-950/80 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8">
      <div className="bg-white w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
        
        <div className="bg-teal-900 px-8 py-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-2xl animate-pulse">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Cài Đặt Hệ Thống</h2>
              <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-0.5">Quyền hạn: {user?.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'QUẢN LÝ LỚP HỌC'}</p>
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
          
          {activeTab === 'USERS' && isAdmin && (
            <div className="space-y-8 animate-fade">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-black text-teal-900 uppercase">Quản lý Hội viên & Phân quyền</h3>
                <span className="bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-[9px] font-black">{registeredUsers.length} TÀI KHOẢN ĐÃ ĐĂNG NHẬP</span>
              </div>
              <div className="grid gap-4">
                {registeredUsers.map(regUser => {
                  const currentPerm = permissions.find(p => p.email.toLowerCase() === regUser.email.toLowerCase());
                  const role = currentPerm?.role || (regUser.email === rootEmail ? 'ADMIN' : 'USER');
                  const isRoot = regUser.email.toLowerCase() === rootEmail.toLowerCase();
                  
                  return (
                    <div key={regUser.id} className="flex items-center justify-between bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:border-teal-200 transition-colors">
                      <div className="flex items-center gap-4">
                        <img src={regUser.avatar} className="w-10 h-10 rounded-full border-2 border-teal-500 p-0.5" alt="avt" />
                        <div>
                          <p className="text-[11px] font-black text-gray-800 uppercase tracking-tight">{regUser.name}</p>
                          <p className="text-[9px] text-gray-400 font-bold">{regUser.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : role === 'MANAGER' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{role}</div>
                        {!isRoot && (
                          <button 
                            onClick={() => toggleUserRole(regUser.email, role)} 
                            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${role === 'MANAGER' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
                          >
                            {role === 'MANAGER' ? 'Hủy quyền Manager' : 'Sét Manager'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'RATINGS' && (
             <div className="space-y-6 animate-fade">
               <h3 className="text-lg font-black text-teal-900 uppercase border-b pb-4">Phản hồi từ Hội viên</h3>
               {ratings.length === 0 ? (
                 <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <p className="text-gray-400 font-bold uppercase text-xs">Chưa có đánh giá nào</p>
                 </div>
               ) : (
                 <div className="grid gap-4">
                    {ratings.map(r => (
                      <div key={r.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center font-black text-teal-600 text-[10px] uppercase">{r.userName.charAt(0)}</div>
                             <div>
                               <p className="text-[11px] font-black text-teal-900 uppercase">{r.userName}</p>
                               <p className="text-[8px] text-gray-400 font-bold">{new Date(r.timestamp).toLocaleString('vi-VN')}</p>
                             </div>
                          </div>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className={`w-3 h-3 ${i < r.stars ? 'fill-current' : 'text-gray-200'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs font-bold text-gray-700 bg-slate-50 p-4 rounded-2xl italic">"{r.comment}"</p>
                      </div>
                    ))}
                 </div>
               )}
             </div>
          )}

          {activeTab === 'SCHEDULE' && (
             <div className="space-y-12 animate-fade">
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
                      // Giữ lại giờ, thứ và category cho lớp tiếp theo để tiện thêm nhanh
                      setNewClass({
                        ...newClass, 
                        className: '', 
                        instructor: ''
                      });
                      alert("Đã thêm thành công!");
                   }} className="mt-8 w-full bg-teal-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Xác nhận Thêm lớp</button>
                </section>
             </div>
          )}

          {activeTab === 'SYSTEM' && isAdmin && (
            <div className="space-y-8 animate-fade max-w-2xl mx-auto">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                <h3 className="text-lg font-black text-teal-900 uppercase mb-6">⚙️ Cấu hình hệ thống</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Tiêu đề lịch tập</label>
                    <input className="w-full bg-white border rounded-2xl p-4 text-xs font-black" value={tempHeader.scheduleTitle} onChange={e => setTempHeader({...tempHeader, scheduleTitle: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Link Logo (URL)</label>
                    <div className="flex gap-2 items-center">
                      <input 
                        className="flex-1 bg-white border rounded-2xl p-4 text-[10px] font-bold outline-none focus:border-teal-500" 
                        value={tempHeader.logo} 
                        onChange={e => setTempHeader({...tempHeader, logo: e.target.value})} 
                        placeholder="https://..."
                      />
                      {/* Đổi bg-white sang bg-teal-900 để preview logo trong suốt rõ hơn */}
                      <div className="w-12 h-12 bg-teal-900 rounded-xl border-2 border-teal-700 flex items-center justify-center p-1 shadow-inner">
                        <img 
                          src={tempHeader.logo} 
                          alt="Preview" 
                          className="max-h-full object-contain"
                          onError={(e) => (e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='50' x='5' font-size='30' fill='white'%3EERROR%3C/text%3E%3C/svg%3E")}
                        />
                      </div>
                    </div>
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
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
