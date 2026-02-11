
import React, { useState, useEffect } from 'react';
import { Role, User, ClassSession, HeaderConfig, PermissionRecord, AppNotification, Rating } from './types';
import Header from './components/Header';
import ScheduleGrid from './components/ScheduleGrid';
import ScheduleList from './components/ScheduleList';
import DateStrip from './components/DateStrip';
import AdminPanel from './components/AdminPanel';
import PWAInstaller from './components/PWAInstaller';
import NotificationList from './components/NotificationList';
import RatingModal from './components/RatingModal';

const ROOT_ADMIN_EMAIL = 'thutrang180688@gmail.com'; 
const GAS_WEBAPP_URL = (import.meta as any).env?.VITE_GAS_URL || '';

const NEW_BRAND_LOGO = "https://live.staticflickr.com/65535/55088078719_1e5e49e97d_o.jpg";

const DEFAULT_HEADER: HeaderConfig = {
  logo: NEW_BRAND_LOGO,
  address: 'Ciputra Club, Bắc Từ Liêm, Hà Nội',
  hotline: '0243 743 0666',
  website: 'www.ciputraclub.vn',
  scheduleTitle: `Lịch GX - THÁNG ${new Date().getMonth() + 1} NĂM ${new Date().getFullYear()}`,
  holidayNotice: ''
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('gx_user_v7');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [schedule, setSchedule] = useState<ClassSession[]>([]);
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(DEFAULT_HEADER);
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [ratingTarget, setRatingTarget] = useState<ClassSession | null>(null);
  const [userRegistry, setUserRegistry] = useState<User[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isLoading, setIsLoading] = useState(true);

  const isOldLogo = (url: string) => !url || url.startsWith('data:image/svg+xml') || url.includes('placeholder');

  // Hàm kích hoạt thông báo trên màn hình điện thoại
  const triggerNativeNotification = (title: string, body: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: NEW_BRAND_LOGO });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body, icon: NEW_BRAND_LOGO });
        }
      });
    }
  };

  useEffect(() => {
    if (currentUser) {
      const lowerEmail = currentUser.email.toLowerCase();
      let newRole: Role = 'USER';
      const userPerm = permissions.find(p => p.email.toLowerCase() === lowerEmail);
      
      if (lowerEmail === ROOT_ADMIN_EMAIL) newRole = 'ADMIN';
      else if (userPerm) newRole = userPerm.role;

      if (newRole !== currentUser.role) {
        const updatedUser = { ...currentUser, role: newRole };
        setCurrentUser(updatedUser);
        localStorage.setItem('gx_user_v7', JSON.stringify(updatedUser));
        if (newRole === 'USER') setShowAdmin(false);
      }
    }
  }, [permissions, currentUser?.email]);

  const syncFromCloud = async () => {
    if (!GAS_WEBAPP_URL) {
      loadFromLocalStorage();
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`${GAS_WEBAPP_URL}?action=getData`);
      const data = await response.json();
      
      if (data.schedule) setSchedule(data.schedule);
      
      if (data.header) {
        const finalLogo = isOldLogo(data.header.logo) ? NEW_BRAND_LOGO : data.header.logo;
        setHeaderConfig({ ...data.header, logo: finalLogo });
      } else {
        setHeaderConfig(DEFAULT_HEADER);
      }
      
      if (data.users) setUserRegistry(data.users);
      
      if (data.notifications) {
        if (notifications.length > 0 && data.notifications.length > notifications.length) {
          const latest = data.notifications[0];
          triggerNativeNotification("THÔNG BÁO GX MỚI", latest.message);
        }
        setNotifications(data.notifications);
      }
      
      if (data.permissions) setPermissions(data.permissions);
      if (data.ratings) setRatings(data.ratings);
      setIsLoading(false);
    } catch (error) {
      console.error("Cloud Error:", error);
      loadFromLocalStorage();
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const sS = localStorage.getItem('gx_schedule_v7');
    const sH = localStorage.getItem('gx_header_v7');
    const sP = localStorage.getItem('gx_permissions_v7');
    const sR = localStorage.getItem('gx_ratings_v7');
    if (sS) setSchedule(JSON.parse(sS));
    if (sH) {
      const localHeader = JSON.parse(sH);
      const finalLogo = isOldLogo(localHeader.logo) ? NEW_BRAND_LOGO : localHeader.logo;
      setHeaderConfig({ ...localHeader, logo: finalLogo });
    } else {
      setHeaderConfig(DEFAULT_HEADER);
    }
    if (sP) setPermissions(JSON.parse(sP));
    if (sR) setRatings(JSON.parse(sR));
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    syncFromCloud();
    const interval = setInterval(syncFromCloud, 60000); 
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(interval);
    };
  }, []);

  const postToCloud = async (action: string, payload: any) => {
    if (!GAS_WEBAPP_URL) return;
    try {
      await fetch(GAS_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data: payload })
      });
    } catch (e) { console.warn("Sync warning:", e); }
  };

  const handleUpdateSchedule = (newSchedule: ClassSession[]) => {
    setSchedule(newSchedule);
    localStorage.setItem('gx_schedule_v7', JSON.stringify(newSchedule));
    postToCloud('updateSchedule', newSchedule);
  };

  const handleUpdateHeader = (newHeader: HeaderConfig) => {
    setHeaderConfig(newHeader);
    localStorage.setItem('gx_header_v7', JSON.stringify(newHeader));
    postToCloud('updateHeader', newHeader);
  };

  const handleAddRating = (r: Rating) => {
    const updated = [r, ...ratings];
    setRatings(updated);
    localStorage.setItem('gx_ratings_v7', JSON.stringify(updated));
    postToCloud('addRating', r);
    setRatingTarget(null);
  };

  const addNotification = (message: string, type: 'INFO' | 'ALERT' = 'INFO') => {
    const newNotif: AppNotification = { 
      id: Date.now().toString(), 
      message, 
      timestamp: new Date().toISOString(), 
      type, 
      sender: currentUser?.name || 'Hệ thống' 
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    postToCloud('addNotification', newNotif);
    triggerNativeNotification(type === 'ALERT' ? "THÔNG BÁO KHẨN" : "CẬP NHẬT LỊCH", message);
  };

  const handleGoogleLogin = (email: string, name: string, photo: string) => {
    const lowerEmail = email.toLowerCase();
    let role: Role = 'USER';
    const userPerm = permissions.find(p => p.email.toLowerCase() === lowerEmail);
    if (lowerEmail === ROOT_ADMIN_EMAIL) role = 'ADMIN';
    else if (userPerm) role = userPerm.role;

    const newUser: User = { id: btoa(lowerEmail), name, email: lowerEmail, role, avatar: photo };
    setCurrentUser(newUser);
    localStorage.setItem('gx_user_v7', JSON.stringify(newUser));

    if (!userRegistry.find(u => u.email === lowerEmail)) {
      const updatedRegistry = [...userRegistry, newUser];
      setUserRegistry(updatedRegistry);
      postToCloud('loginUser', newUser);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowAdmin(false);
    localStorage.removeItem('gx_user_v7');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-teal-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black uppercase tracking-[0.2em] text-[10px]">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header config={headerConfig} user={currentUser} onGoogleLogin={handleGoogleLogin} onLogout={handleLogout} onToggleAdmin={() => setShowAdmin(!showAdmin)} />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-0 sm:px-4 py-4 lg:py-8 pb-12">
        <div className="grid lg:grid-cols-12 gap-8 px-4 lg:px-0">
          <div className="lg:col-span-8 xl:col-span-9">
            {headerConfig.holidayNotice && (
              <div className="mb-6 animate-bounce">
                <div className="bg-red-600 text-white p-4 lg:p-6 rounded-[2rem] shadow-xl flex items-center gap-4 border-2 border-red-400">
                  <span className="text-3xl">⚠️</span>
                  <div className="flex-1">
                    <h4 className="text-xs lg:text-sm font-black uppercase tracking-widest">THÔNG BÁO NGHỈ LỄ</h4>
                    <p className="text-sm lg:text-lg font-bold leading-tight mt-1">{headerConfig.holidayNotice}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8 text-center lg:text-left flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl lg:text-4xl font-black text-teal-900 uppercase tracking-tight">{headerConfig.scheduleTitle}</h2>
                <p className="text-gray-500 text-sm mt-1 uppercase font-bold tracking-widest opacity-60">Fitness Department</p>
              </div>
              <button onClick={syncFromCloud} className="bg-white border p-3 rounded-2xl shadow-sm flex items-center gap-2 transition-all active:scale-95">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="text-[10px] font-black uppercase text-slate-500">Đồng bộ</span>
              </button>
            </div>

            {isMobile ? (
              <div className="flex flex-col gap-4">
                <DateStrip selected={selectedDayIndex} onSelect={setSelectedDayIndex} />
                <ScheduleList dayIndex={selectedDayIndex} schedule={schedule} user={currentUser} onUpdate={handleUpdateSchedule} onRate={setRatingTarget} ratings={ratings} />
              </div>
            ) : (
              <ScheduleGrid schedule={schedule} user={currentUser} onUpdate={handleUpdateSchedule} onNotify={addNotification} onRate={setRatingTarget} ratings={ratings} />
            )}
          </div>

          <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <NotificationList notifications={notifications} />
            {isMobile && !showAdmin && <PWAInstaller />}
          </aside>
        </div>

        {showAdmin && (currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') && (
          <div className="fixed inset-0 z-[100] animate-fade">
             <AdminPanel 
              user={currentUser} headerConfig={headerConfig} onUpdateHeader={handleUpdateHeader} 
              permissions={permissions} onUpdatePermissions={(p) => { setPermissions(p); postToCloud('updatePermissions', p); }}
              rootEmail={ROOT_ADMIN_EMAIL} onClose={() => setShowAdmin(false)} registeredUsers={userRegistry}
              schedule={schedule} onUpdateSchedule={handleUpdateSchedule} onNotify={addNotification} ratings={ratings}
            />
          </div>
        )}

        {ratingTarget && currentUser && (
          <RatingModal session={ratingTarget} user={currentUser} onClose={() => setRatingTarget(null)} onSave={handleAddRating} />
        )}

        <footer className="mt-24 px-6 py-12 bg-teal-950 text-white rounded-t-[3rem]">
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center space-y-8">
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase text-teal-600 tracking-[0.3em]">Liên hệ</h5>
              <div className="space-y-2 text-sm font-bold">
                <p>Hotline: <span className="text-teal-300">{headerConfig.hotline}</span></p>
                <p>Website: <span className="text-teal-300">{headerConfig.website}</span></p>
              </div>
            </div>
            <div className="pt-6 border-t border-teal-900 w-full">
              <p className="text-[9px] text-teal-700 font-black uppercase leading-relaxed tracking-widest">
                © 2026 CIPUTRA CLUB. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
