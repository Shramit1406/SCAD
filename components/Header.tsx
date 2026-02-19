
import React from 'react';
import { BuildingIcon, UserIcon } from './Icons';
import type { CurrentUser } from '../App';

interface HeaderProps {
    currentUser: CurrentUser;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  return (
    <header className="bg-white shadow-sm p-4 sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
                    <BuildingIcon />
                </div>
                <div>
                    <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                        WAREHOUSE DECISION INTELLIGENCE
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm font-semibold tracking-wider uppercase">Real-time Supply Chain Control Tower</p>
                </div>
            </div>
             {currentUser && (
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-white pl-3 pr-2 py-1.5 rounded-full border border-slate-200 shadow-sm">
                        <div className="bg-slate-100 p-1.5 rounded-full">
                            <UserIcon />
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-slate-700">{currentUser.name}</span>
                            <span className="text-xs text-slate-500 block capitalize">{currentUser.role}</span>
                        </div>
                    </div>
                    <button onClick={onLogout} className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
                        Logout
                    </button>
                </div>
             )}
        </div>
    </header>
  );
};

export default Header;
