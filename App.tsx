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
const NEW_BRAND_LOGO = "https://live.staticflickr.com/65535/55086442379_195b472edc_o.png";

const DEFAULT_HEADER: HeaderConfig = {
  logo: NEW_BRAND_LOGO,
  address: 'Ciputra Club, Phú Thượng, Hà Nội',
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

  // ... (Các hàm syncFromCloud, handleGoogleLogin giữ nguyên như cũ) ...
  const isOldLogo = (url: string) => !url || url.startsWith('data:image/svg+xml') || url.includes('placeholder');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    syncFromCloud();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const syncFromCloud = async () => {
    if (!GAS_WEBAPP_URL) { setIsLoading(false); return; }
    try {
      const response = await fetch(`${GAS_WEBAPP_URL}?action=getData`);
      const data = await response.json();
      if (data.schedule) setSchedule(data.schedule);
      if (data.header) {
        const finalLogo = isOldLogo(data.header.logo) ? NEW_BRAND_LOGO : data.header.logo;
        setHeaderConfig({ ...data.header, logo: finalLogo });
      }
      if (data.permissions) setPermissions(data.permissions);
      if (data.ratings) setRatings(data.ratings);
      setIsLoading(false);
    } catch (error) {
      console.error("Cloud Error:", error);
      setIsLoading(false);
    }
  };

  const handleUpdateSchedule = (newSchedule: ClassSession[]) => { setSchedule(newSchedule); };
  const handleUpdateHeader = (newHeader: HeaderConfig) => { setHeaderConfig(newHeader); };
  const handleGoogleLogin = (email: string, name: string, photo: string) => { /* login logic */ };
  const handleLogout = () => { setCurrentUser(null); };

  if (isLoading) return <div className="min-h-screen bg-teal-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header config={headerConfig} user={currentUser} onGoogleLogin={handleGoogleLogin} onLogout={handleLogout} onToggleAdmin={() => setShowAdmin(!showAdmin)} />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 py-8">
        {/* Phần nội dung chính */}
        <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
                {isMobile ? (
                    <ScheduleList dayIndex={selectedDayIndex} schedule={schedule} user={currentUser} onUpdate={handleUpdateSchedule} onRate={setRatingTarget} ratings={ratings} />
                ) : (
                    <ScheduleGrid schedule={schedule} user={currentUser} onUpdate={handleUpdateSchedule} onNotify={() => {}} onRate={setRatingTarget} ratings={ratings} />
                )}
            </div>
            <aside className="lg:col-span-4">
                <NotificationList notifications={notifications} />
            </aside>
        </div>

        {/* --- PHẦN FOOTER ĐÃ FIX: SỬ DỤNG LỚP RENDER RIÊNG --- */}
        <footer className="mt-24 px-6 py-12 bg-teal-950 text-white rounded-t-[3rem] relative z-10">
          <div className="max-w-[1440px] mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <div className="inline-flex items-center justify-center md:justify-start">
                <img 
                  src={headerConfig.logo} 
                  alt="Ciputra Logo Footer" 
                  className="h-10 lg:h-14 w-auto block" 
                  style={{ 
                    /* ÉP TRÌNH DUYỆT RENDER LOGO TRÊN MỘT LAYER RIÊNG (GIỐNG HEADER) */
                    transform: 'translateZ(0)',
                    willChange: 'transform',
                    backfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'antialiased',
                    /* LOẠI BỎ TẤT CẢ FILTER GÂY MỜ */
                    filter: 'none',
                    imageRendering: 'auto' 
                  }}
                />
              </div>
              <p className="text-[10px] text-teal-400 font-bold uppercase mt-4 tracking-widest">{headerConfig.address}</p>
            </div>
            
            <div className="space-y-4">
              <h5 className="text-[10px] font-black uppercase text-teal-600 tracking-[0.3em]">Liên hệ</h5>
              <div className="space-y-2 text-sm font-bold">
                <p>Hotline: <span className="text-teal-300">{headerConfig.hotline}</span></p>
                <p>Website: <span className="text-teal-300">{headerConfig.website}</span></p>
              </div>
            </div>

            <div>
              <p className="text-[9px] text-teal-700 font-black uppercase leading-relaxed">
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