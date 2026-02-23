
import React from 'react';
import { Role, User } from '../types';

interface Props {
  currentUser: User | null;
  onLogin: (user: User | null) => void;
}

const LoginSimulator: React.FC<Props> = ({ currentUser, onLogin }) => {
  if (currentUser) return <button onClick={() => onLogin(null)} className="text-[10px] font-black uppercase text-red-500">Đăng xuất</button>;
  return (
    <div className="flex justify-center gap-2">
      <button onClick={() => onLogin({id: '1', name: 'Member', email: '', role: 'USER', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'})} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-[10px] font-black">USER</button>
      <button onClick={() => onLogin({id: '2', name: 'Manager Duy', email: '', role: 'MANAGER', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager'})} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black">MANAGER</button>
      <button onClick={() => onLogin({id: '3', name: 'Admin', email: '', role: 'ADMIN', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'})} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black">ADMIN</button>
    </div>
  );
};

export default LoginSimulator;
