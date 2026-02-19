
import React, { useState } from 'react';
import { BuildingIcon } from './Icons';

interface LoginProps {
    onLogin: (username: string, password) => void;
    error: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(username, password);
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md">
                <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-2xl px-8 pt-10 pb-8 mb-4 border border-slate-200">
                    <div className="text-center mb-8">
                         <div className="inline-flex items-center justify-center bg-indigo-600 p-3 rounded-xl shadow-lg mb-4">
                            <BuildingIcon />
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">WDI Control Tower</h1>
                        <p className="text-slate-500">Please sign in to continue</p>
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
                            <strong className="font-bold">Error:</strong>
                            <span className="block sm:inline ml-2">{error}</span>
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g., admin"
                            className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="e.g., admin123"
                            className="shadow-sm appearance-none border border-slate-300 rounded-lg w-full py-3 px-4 text-slate-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full transition-all duration-300"
                        >
                            Sign In
                        </button>
                    </div>
                     <p className="text-center text-slate-500 text-xs mt-6">
                        Use <strong>admin/admin123</strong> for administrator access.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
