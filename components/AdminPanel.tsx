
import React, { useState } from 'react';
import { User, HeaderConfig, Role, PermissionRecord, ClassSession, DAYS_OF_WEEK, Rating, CATEGORY_LABELS, CATEGORY_COLORS } from '../types';

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
  onDeleteRating: (id: string) => void;
}

const AdminPanel: React.FC<Props> = ({ 
  user, headerConfig, onUpdateHeader, permissions, 
  onUpdatePermissions, rootEmail, onClose, registeredUsers,
  schedule, onUpdateSchedule, onNotify, ratings, onDeleteRating
}) => {
  const isRoot = user?.email.toLowerCase() === rootEmail.toLowerCase();
  const isAdmin = user?.role === 'ADMIN' || isRoot;
  const isManager = user?.role === 'MANAGER' || isAdmin;

  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'PERMISSIONS' | 'STAFF' | 'SYSTEM' | 'RATINGS' | 'NOTIFICATIONS'>('SCHEDULE');
  const [tempHeader, setTempHeader] = useState<HeaderConfig>({ ...headerConfig });
  const [notifMsg, setNotifMsg] = useState('');
  const [notifType, setNotifType] = useState<'INFO' | 'ALERT'>('INFO');
  
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const [newClass, setNewClass] = useState<Partial<ClassSession>>({
    dayIndex: 0, 
    time: '08:00 - 09:00', 
    className: '', 
    instructor: '', 
    category: 'YOGA', 
    status: 'NORMAL',
    specificDate: ''
  });

  const toggleUserRole = (email: string, currentRole: Role, targetRole: Role) => {
    if (email.toLowerCase() === rootEmail.toLowerCase()) return;
    
    // Root can set anything. Admin can only set Manager.
    if (!isRoot && targetRole === 'ADMIN') return;

    const newRole: Role = currentRole === targetRole ? 'USER' : targetRole;
    
    setIsSubmitting(`role-${email}`);
    setTimeout(() => {
      let updatedPerms;
      const existingIdx = permissions.findIndex(p => p.email.toLowerCase() === email.toLowerCase());
      if (existingIdx > -1) {
        updatedPerms = permissions.map((p, i) => i === existingIdx ? { ...p, role: newRole } : p);
      } else {
        updatedPerms = [...permissions, { email, role: newRole, addedAt: new Date().toISOString() }];
      }
      onUpdatePermissions(updatedPerms);
      setIsSubmitting(null);
    }, 500);
  };

  const tabs = [
    { id: 'SCHEDULE', label: 'Lịch Tập', icon: '📅', visible: true },
    { id: 'RATINGS', label: 'Đánh giá', icon: '⭐', visible: true },
    { id: 'NOTIFICATIONS', label: 'Thông báo', icon: '🔔', visible: true },
    { id: 'STAFF', label: 'Quản lý Manager', icon: '👔', visible: isAdmin && !isRoot },
    { id: 'PERMISSIONS', label: 'Phân quyền', icon: '🔐', visible: isRoot },
    { id: 'SYSTEM', label: 'Cấu hình', icon: '⚙️', visible: isRoot }
  ].filter(t => t.visible);

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
          
          {(activeTab === 'PERMISSIONS' || activeTab === 'STAFF') && (
            <div className="space-y-8 animate-fade">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-lg font-black text-teal-900 uppercase">{activeTab === 'PERMISSIONS' ? 'Phân quyền hệ thống' : 'Quản lý Manager'}</h3>
                <span className="bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-[9px] font-black">{registeredUsers.length} TÀI KHOẢN</span>
              </div>
              <div className="grid gap-4">
                {registeredUsers.map(regUser => {
                  const currentPerm = permissions.find(p => p.email.toLowerCase() === regUser.email.toLowerCase());
                  const role = currentPerm?.role || (regUser.email === rootEmail ? 'ADMIN' : 'USER');
                  const isRootUser = regUser.email.toLowerCase() === rootEmail.toLowerCase();
                  
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
                        {!isRootUser && (
                          <div className="flex gap-2">
                            {isRoot && activeTab === 'PERMISSIONS' && (
                              <button 
                                onClick={() => toggleUserRole(regUser.email, role, 'ADMIN')} 
                                disabled={isSubmitting === `role-${regUser.email}`}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${role === 'ADMIN' ? 'bg-red-50 text-red-600' : 'bg-purple-600 text-white'} ${isSubmitting === `role-${regUser.email}` ? 'opacity-50 cursor-wait' : ''}`}
                              >
                                {isSubmitting === `role-${regUser.email}` ? 'Đang xử lý...' : (role === 'ADMIN' ? 'Hủy Admin' : 'Sét Admin')}
                              </button>
                            )}
                            {(isRoot || isAdmin) && (
                              <button 
                                onClick={() => toggleUserRole(regUser.email, role, 'MANAGER')} 
                                disabled={isSubmitting === `role-${regUser.email}`}
                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${role === 'MANAGER' ? 'bg-red-50 text-red-600' : 'bg-teal-600 text-white'} ${isSubmitting === `role-${regUser.email}` ? 'opacity-50 cursor-wait' : ''}`}
                              >
                                {isSubmitting === `role-${regUser.email}` ? 'Đang xử lý...' : (role === 'MANAGER' ? 'Hủy Manager' : 'Sét Manager')}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'NOTIFICATIONS' && (
            <div className="space-y-8 animate-fade max-w-2xl mx-auto">
              <div className="bg-teal-50 p-8 rounded-[2.5rem] border border-teal-100">
                <h3 className="text-lg font-black text-teal-900 uppercase mb-6">📢 Gửi thông báo mới</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Nội dung thông báo</label>
                    <textarea 
                      className="w-full bg-white border rounded-2xl p-4 text-xs font-bold outline-none h-32 resize-none" 
                      value={notifMsg} 
                      onChange={e => setNotifMsg(e.target.value)} 
                      placeholder="Nhập nội dung thông báo đến tất cả hội viên..."
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Loại thông báo</label>
                    <div className="flex gap-4 mt-2">
                      <button onClick={() => setNotifType('INFO')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${notifType === 'INFO' ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-400 border'}`}>Thông tin</button>
                      <button onClick={() => setNotifType('ALERT')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${notifType === 'ALERT' ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-400 border'}`}>Khẩn cấp</button>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (!notifMsg) return alert("Vui lòng nhập nội dung!");
                      setIsSubmitting('notif');
                      setTimeout(() => {
                        onNotify(notifMsg, notifType);
                        setNotifMsg('');
                        setIsSubmitting(null);
                        alert("Đã gửi thông báo thành công!");
                      }, 800);
                    }} 
                    disabled={isSubmitting === 'notif'}
                    className={`w-full bg-teal-900 text-white py-5 rounded-2xl font-black text-xs uppercase shadow-xl mt-4 transition-all ${isSubmitting === 'notif' ? 'opacity-50 scale-95' : 'active:scale-95'}`}
                  >
                    {isSubmitting === 'notif' ? 'Đang gửi thông báo...' : 'Gửi Thông Báo Ngay'}
                  </button>
                </div>
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
                          {isAdmin && (
                            <button 
                              onClick={() => {
                                if (confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
                                  onDeleteRating(r.id);
                                }
                              }}
                              className="ml-4 p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                              title="Xóa đánh giá"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </button>
                          )}
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
                        <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Thứ trong tuần</label>
                        <select className="w-full bg-white border rounded-2xl p-4 text-xs font-bold outline-none" value={newClass.dayIndex} onChange={e => setNewClass({...newClass, dayIndex: parseInt(e.target.value)})}>
                          {DAYS_OF_WEEK.map((d, i) => <option key={i} value={i}>{d.vn}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Ngày cụ thể (Tùy chọn)</label>
                        <input 
                          type="date" 
                          className="w-full bg-white border rounded-2xl p-4 text-xs font-bold outline-none" 
                          value={newClass.specificDate} 
                          onChange={e => {
                            const dateStr = e.target.value;
                            let newDayIdx = newClass.dayIndex;
                            if (dateStr) {
                              const date = new Date(dateStr);
                              const jsDay = date.getDay(); // 0=Sun, 1=Mon...
                              newDayIdx = jsDay === 0 ? 6 : jsDay - 1;
                            }
                            setNewClass({...newClass, specificDate: dateStr, dayIndex: newDayIdx});
                          }} 
                        />
                      </div>
                      <div className="space-y-1 lg:col-span-3">
                        <label className="text-[9px] font-black text-gray-400 uppercase ml-2">Màu sắc (Thể loại)</label>
                        <div className="flex flex-wrap gap-2 p-2 bg-white border rounded-2xl">
                          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                            <button
                              key={val}
                              onClick={() => setNewClass({...newClass, category: val as any})}
                              title={label}
                              className={`w-8 h-8 rounded-full transition-all ${CATEGORY_COLORS[val as keyof typeof CATEGORY_COLORS]} ${
                                newClass.category === val ? 'ring-4 ring-teal-900/20 scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                   </div>
                    <button 
                      onClick={() => {
                        if (!newClass.className || !newClass.instructor || !newClass.time) return alert("Vui lòng nhập đủ thông tin lớp!");
                        setIsSubmitting('add-class');
                        setTimeout(() => {
                          onUpdateSchedule([...schedule, {...newClass as ClassSession, id: Date.now().toString()}]);
                          setNewClass({...newClass, className: '', instructor: '', specificDate: ''}); 
                          setIsSubmitting(null);
                          alert("Đã thêm lớp học thành công!");
                        }, 800);
                      }} 
                      disabled={isSubmitting === 'add-class'}
                      className={`mt-8 w-full bg-teal-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl transition-all ${isSubmitting === 'add-class' ? 'opacity-50 scale-95' : 'active:scale-95'}`}
                    >
                      {isSubmitting === 'add-class' ? 'Đang xử lý thêm lớp...' : 'Xác nhận Thêm lớp'}
                    </button>
                </section>
             </div>
          )}

          {activeTab === 'SYSTEM' && isRoot && (
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
                    <input className="w-full bg-white border rounded-2xl p-4 text-xs font-bold" value={tempHeader.logo} onChange={e => setTempHeader({...tempHeader, logo: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase ml-2 tracking-widest">Địa chỉ hiển thị</label>
                    <input className="w-full bg-white border rounded-2xl p-4 text-xs font-bold" value={tempHeader.address} onChange={e => setTempHeader({...tempHeader, address: e.target.value})} />
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
                  <button onClick={() => { onUpdateHeader(tempHeader); alert("Đã lưu!"); }} className="w-full bg-teal-900 text-white py-5 rounded-2xl font-black text-xs uppercase shadow-xl mt-4">Lưu Cấu Hình</button>
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
