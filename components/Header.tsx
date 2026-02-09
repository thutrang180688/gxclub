
import React, { useState, useEffect } from 'react';
import { HeaderConfig, User } from '../types';

interface Props {
  config: HeaderConfig;
  user: User | null;
  onGoogleLogin: (email: string, name: string, photo: string) => void;
  onLogout: () => void;
  onToggleAdmin: () => void;
}

declare global {
  interface Window {
    google: any;
  }
}

// @ts-ignore: import.meta.env handles environmental variables
const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

const Header: React.FC<Props> = ({ config, user, onGoogleLogin, onLogout, onToggleAdmin }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [logoUrl, setLogoUrl] = useState(config.logo);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);

  useEffect(() => {
    setLogoUrl(config.logo);
  }, [config.logo]);

  // Kiểm tra script Google đã sẵn sàng chưa
  useEffect(() => {
    const checkGsi = setInterval(() => {
      if (window.google?.accounts?.id) {
        setIsGsiLoaded(true);
        clearInterval(checkGsi);
      }
    }, 500);
    return () => clearInterval(checkGsi);
  }, []);

  useEffect(() => {
    if (showLoginModal && !user && isGsiLoaded && GOOGLE_CLIENT_ID) {
      const handleCredentialResponse = (response: any) => {
        try {
          const base64Url = response.credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          onGoogleLogin(payload.email, payload.name, payload.picture);
          setShowLoginModal(false);
        } catch (e) {
          console.error("Lỗi xác thực Google:", e);
        }
      };

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
        });

        const renderTimeout = setTimeout(() => {
          const btnElem = document.getElementById("googleBtn");
          if (btnElem) {
            window.google.accounts.id.renderButton(btnElem, {
              theme: "outline",
              size: "large",
              width: 280,
              text: "signin_with",
              shape: "pill"
            });
          }
        }, 300);
        return () => clearTimeout(renderTimeout);
      } catch (err) {
        console.error("Google Auth Init Error:", err);
      }
    }
  }, [showLoginModal, user, isGsiLoaded]);

  return (
    <>
      <header className="bg-teal-900 text-white shadow-xl sticky top-0 z-40 border-b border-teal-800 backdrop-blur-md bg-opacity-95">
        <div className="max-w-[1440px] mx-auto px-4 h-16 lg:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 flex items-center justify-center min-w-[40px]">
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="h-10 lg:h-14 w-auto object-contain transition-all duration-500"
                onError={() => {
                  setLogoUrl("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M10,80 L40,60 Q60,45 85,50 T60,85 Q30,85 25,65 Q25,40 50,25 T90,20 Q60,15 35,40 T30,75' fill='none' stroke='white' stroke-width='8' stroke-linecap='round'/%3E%3C/svg%3E");
                }}
              />
            </div>
            <div className="hidden sm:block border-l border-teal-700/50 pl-3">
              <h1 className="text-sm lg:text-lg font-black leading-none tracking-tighter uppercase">CIPUTRA CLUB</h1>
              <p className="text-[9px] text-teal-400 font-bold uppercase mt-1 tracking-widest">{config.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {!user ? (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 bg-white text-teal-900 px-4 py-2 rounded-full text-[10px] font-black shadow-lg hover:bg-teal-50 transition-all active:scale-95 border-2 border-transparent hover:border-teal-400"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="G" />
                <span>ĐĂNG NHẬP</span>
              </button>
            ) : (
              <>
                {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                  <button 
                    onClick={onToggleAdmin}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-3 py-2 rounded-xl transition-all shadow-lg animate-pulse ring-2 ring-amber-300 ring-offset-2 ring-offset-teal-900"
                  >
                    <svg className="w-5 h-5 text-white animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[10px] font-black uppercase hidden md:inline">CÀI ĐẶT</span>
                  </button>
                )}
                
                <div className="flex items-center gap-3 bg-teal-800/40 pr-1 pl-4 py-1 rounded-full border border-teal-700/50">
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] font-black leading-tight uppercase">{user.name}</p>
                    <p className="text-[8px] text-teal-400 font-bold uppercase">{user.role}</p>
                  </div>
                  <img src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} className="w-8 h-8 rounded-full border-2 border-teal-500 shadow-md" alt="avt" />
                  <button onClick={onLogout} className="p-2 text-red-400 hover:text-red-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-teal-950/80 backdrop-blur-md animate-fade">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-8 h-8" alt="G" />
              </div>
              <h3 className="text-xl font-black text-teal-900 uppercase tracking-tight">Đăng nhập hệ thống</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Dành cho Hội viên & Quản trị</p>
            </div>

            <div className="space-y-4 flex flex-col items-center">
              <div id="googleBtn" className="min-h-[40px] w-full flex justify-center">
                {!GOOGLE_CLIENT_ID && (
                  <div className="text-center p-4 bg-red-50 rounded-2xl border border-red-200 w-full">
                    <p className="text-[10px] font-black text-red-700 uppercase leading-relaxed">
                      LỖI: THIẾU GOOGLE CLIENT ID
                    </p>
                    <p className="text-[8px] text-red-500 mt-2 font-bold leading-normal">
                      Vui lòng thêm biến <span className="underline italic">VITE_GOOGLE_CLIENT_ID</span> vào Vercel với giá trị là mã Client ID lấy từ Google Cloud.
                    </p>
                  </div>
                )}
                {GOOGLE_CLIENT_ID && !isGsiLoaded && (
                  <div className="flex items-center gap-2 text-[10px] font-black text-teal-600 animate-pulse">
                    <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    ĐANG KẾT NỐI GOOGLE...
                  </div>
                )}
              </div>
              
              <div className="relative py-2 w-full">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                <div className="relative flex justify-center text-[8px] uppercase font-black text-gray-300"><span className="bg-white px-2 italic">Hoặc truy cập khẩn cấp</span></div>
              </div>

              <button 
                onClick={() => {
                   onGoogleLogin('thutrang180688@gmail.com', 'Quản Trị Viên', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin');
                   setShowLoginModal(false);
                }}
                className="w-full bg-teal-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black border border-teal-900 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                <span>🔐</span> ĐĂNG NHẬP ADMIN NHANH
              </button>

              <button 
                onClick={() => setShowLoginModal(false)}
                className="w-full text-slate-400 py-2 font-black text-[9px] uppercase tracking-widest hover:text-slate-600"
              >
                Hủy bỏ
              </button>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 text-[8px] text-gray-400 text-center font-bold uppercase italic leading-tight">
               Lưu ý: Nếu nút đăng nhập Google không hiện, hãy kiểm tra mục "Authorized JavaScript origins" trong Google Cloud.
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
