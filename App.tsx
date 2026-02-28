
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

// Firebase Imports
import { db, auth, googleProvider } from './firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

const ROOT_ADMIN_EMAIL = 'thutrang180688@gmail.com'; 

const DEFAULT_HEADER: HeaderConfig = {
  logo: 'https://live.staticflickr.com/65535/55088078719_1e5e49e97d_o.jpg',
  address: 'Phú Thượng, Hà Nội',
  hotline: '0243 743 0666',
  website: 'www.ciputraclub.vn',
  scheduleTitle: `Lịch GX - THÁNG ${new Date().getMonth() + 1} NĂM ${new Date().getFullYear()}`
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
  const [toast, setToast] = useState<{msg: string, type: 'INFO' | 'ALERT'} | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  // Firebase Real-time Sync
  useEffect(() => {
    const unsubSchedule = onSnapshot(collection(db, "schedule"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ClassSession));
      setSchedule(data);
    });

    const unsubHeader = onSnapshot(doc(db, "config", "header"), (snapshot) => {
      if (snapshot.exists()) setHeaderConfig(snapshot.data() as HeaderConfig);
      else {
        // Initialize default header if not exists
        setDoc(doc(db, "config", "header"), DEFAULT_HEADER);
      }
    });

    const unsubNotifications = onSnapshot(query(collection(db, "notifications"), orderBy("timestamp", "desc"), limit(20)), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AppNotification));
      
      // Toast for new notifications
      if (data.length > 0 && notifications.length > 0) {
        if (data[0].id !== notifications[0].id) {
          setToast({ msg: data[0].message, type: data[0].type });
          setTimeout(() => setToast(null), 6000);
        }
      }
      setNotifications(data);
    });

    const unsubPermissions = onSnapshot(collection(db, "permissions"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data() } as PermissionRecord));
      setPermissions(data);
    });

    const unsubRatings = onSnapshot(query(collection(db, "ratings"), orderBy("timestamp", "desc")), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Rating));
      setRatings(data);
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data() } as User));
      setUserRegistry(data);
    });

    // Auth State Listener
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const lowerEmail = firebaseUser.email?.toLowerCase() || '';
        let role: Role = 'USER';
        
        // Check permissions from firestore
        const userPerm = permissions.find(p => p.email.toLowerCase() === lowerEmail);
        if (lowerEmail === ROOT_ADMIN_EMAIL) role = 'ADMIN';
        else if (userPerm) role = userPerm.role;

        const newUser: User = { 
          id: firebaseUser.uid, 
          name: firebaseUser.displayName || 'Hội viên', 
          email: lowerEmail, 
          role, 
          avatar: firebaseUser.photoURL || '' 
        };
        setCurrentUser(newUser);

        // Sync user to registry
        setDoc(doc(db, "users", firebaseUser.uid), newUser, { merge: true });
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      unsubSchedule();
      unsubHeader();
      unsubNotifications();
      unsubPermissions();
      unsubRatings();
      unsubUsers();
      unsubAuth();
    };
  }, [permissions.length]); // Re-run if permissions change to update current user role

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUpdateSchedule = async (newSchedule: ClassSession[]) => {
    // In Firestore, we update individual docs or the whole collection
    // For simplicity with existing logic, we'll sync individual docs
    for (const session of newSchedule) {
      await setDoc(doc(db, "schedule", session.id), session);
    }
    // Handle deletions (if any session was removed from array)
    const currentIds = newSchedule.map(s => s.id);
    schedule.forEach(async (s) => {
      if (!currentIds.includes(s.id)) {
        await deleteDoc(doc(db, "schedule", s.id));
      }
    });
  };

  const handleUpdateHeader = async (newHeader: HeaderConfig) => {
    await setDoc(doc(db, "config", "header"), newHeader);
  };

  const handleAddRating = async (r: Rating) => {
    await setDoc(doc(db, "ratings", r.id), r);
    setRatingTarget(null);
  };

  const handleDeleteRating = async (id: string) => {
    await deleteDoc(doc(db, "ratings", id));
  };

  const handleDeleteNotification = async (id: string) => {
    await deleteDoc(doc(db, "notifications", id));
  };

  const addNotification = async (message: string, type: 'INFO' | 'ALERT' = 'INFO') => {
    const id = Date.now().toString();
    const newNotif: AppNotification = { 
      id, 
      message, 
      timestamp: new Date().toISOString(), 
      type, 
      sender: currentUser?.name || 'Hệ thống' 
    };
    await setDoc(doc(db, "notifications", id), newNotif);
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setShowAdmin(false);
  };

  const handleUpdatePermissions = async (newPerms: PermissionRecord[]) => {
    // Sync permissions to Firestore
    for (const p of newPerms) {
      await setDoc(doc(db, "permissions", btoa(p.email)), p);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-teal-900 flex flex-col items-center justify-center text-white p-4">
        <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black uppercase tracking-[0.2em] text-[10px]">Đang tải dữ liệu trực tuyến...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header config={headerConfig} user={currentUser} onGoogleLogin={handleGoogleLogin} onLogout={handleLogout} onToggleAdmin={() => setShowAdmin(!showAdmin)} />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-0 sm:px-4 py-4 lg:py-8 pb-12">
        {toast && (
          <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-md p-4 rounded-2xl shadow-2xl border-2 animate-in slide-in-from-top-4 duration-500 ${
            toast.type === 'ALERT' ? 'bg-red-600 border-red-400 text-white' : 'bg-teal-900 border-teal-700 text-white'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{toast.type === 'ALERT' ? '🚨' : '📩'}</span>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase opacity-70 tracking-widest mb-1">Thông báo mới</p>
                <p className="text-xs font-bold leading-tight">{toast.msg}</p>
              </div>
              <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        )}
        <div className="grid lg:grid-cols-12 gap-8 px-4 lg:px-0">
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="mb-8 text-center lg:text-left flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl lg:text-4xl font-black text-teal-900 uppercase tracking-tight">{headerConfig.scheduleTitle}</h2>
                <div className="flex items-center justify-center lg:justify-start gap-4 mt-4">
                  <button 
                    onClick={() => setWeekOffset(prev => prev - 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-teal-50 text-teal-900 transition-all active:scale-90"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button 
                    onClick={() => setWeekOffset(0)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ${weekOffset === 0 ? 'bg-teal-900 text-white' : 'bg-white text-teal-900 border border-teal-100 hover:bg-teal-50'}`}
                    title="Quay về tuần hiện tại"
                  >
                    Tuần này
                  </button>
                  <button 
                    onClick={() => setWeekOffset(prev => prev + 1)}
                    className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-teal-50 text-teal-900 transition-all active:scale-90"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[9px] font-black text-emerald-700 uppercase">Live Sync</span>
                </div>
              </div>
            </div>

            {isMobile ? (
              <div className="flex flex-col gap-4">
                <DateStrip selected={selectedDayIndex} onSelect={setSelectedDayIndex} weekOffset={weekOffset} />
                <ScheduleList dayIndex={selectedDayIndex} schedule={schedule} user={currentUser} onUpdate={handleUpdateSchedule} onNotify={addNotification} onRate={setRatingTarget} ratings={ratings} weekOffset={weekOffset} />
              </div>
            ) : (
              <ScheduleGrid schedule={schedule} user={currentUser} onUpdate={handleUpdateSchedule} onNotify={addNotification} onRate={setRatingTarget} ratings={ratings} weekOffset={weekOffset} />
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
              user={currentUser} 
              headerConfig={headerConfig} 
              onUpdateHeader={handleUpdateHeader} 
              permissions={permissions}
              onUpdatePermissions={handleUpdatePermissions}
              rootEmail={ROOT_ADMIN_EMAIL}
              onClose={() => setShowAdmin(false)}
              registeredUsers={userRegistry}
              schedule={schedule}
              onUpdateSchedule={handleUpdateSchedule}
              onNotify={addNotification}
              notifications={notifications}
              onDeleteNotification={handleDeleteNotification}
              ratings={ratings}
              onDeleteRating={handleDeleteRating}
            />
          </div>
        )}

        {ratingTarget && currentUser && (
          <RatingModal session={ratingTarget} user={currentUser} onClose={() => setRatingTarget(null)} onSave={handleAddRating} />
        )}

        {/* FOOTER */}
        <footer className="mt-24 px-6 py-12 bg-teal-950 text-white rounded-t-[3rem]">
          <div className="max-w-[1440px] mx-auto text-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <h5 className="text-xl font-black uppercase text-teal-500 tracking-[0.2em]">Liên hệ</h5>
                <p className="text-lg">{headerConfig.hotline}</p>
                <p className="text-lg text-teal-400">{headerConfig.website}</p>
                {isMobile && (
                  <p className="text-xs text-teal-600 uppercase tracking-widest mt-2">{headerConfig.address}</p>
                )}
              </div>
              <div className="pt-8 border-t border-teal-900/50">
                <p className="text-xs text-teal-700 font-black uppercase tracking-widest">
                  © 2026 CIPUTRA CLUB. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
