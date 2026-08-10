import React, { useState } from 'react';
import { Search, Plus, User, ShieldCheck, ShoppingBag, ArrowRightLeft, Heart, Sparkles, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

export interface NavbarProps {
  user?: any;
  onOpenAuth: () => void;
  onOpenCreateListing?: () => void;
}

export function Navbar({ user, onOpenAuth, onOpenCreateListing }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 backdrop-blur-xl bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                CAMPUSMART
              </span>
              <span className="text-[10px] font-semibold text-indigo-400 tracking-wider uppercase -mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Campus
              </span>
            </div>
          </a>
        </div>

        {/* Quick Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md relative items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books, cycles, lab kits, hostel gear..."
            className="w-full glass-input text-xs rounded-xl pl-10 pr-12 py-2.5 placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/60 rounded border border-slate-700">
            ⌘K
          </kbd>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onOpenCreateListing}
            className="hidden sm:inline-flex"
          >
            Post Listing
          </Button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <Avatar name={user.name} src={user.avatar} isVerified={true} size="sm" />
              <span className="hidden lg:inline text-xs font-semibold text-slate-200">{user.name}</span>
            </div>
          ) : (
            <Button variant="glass" size="sm" leftIcon={<User className="w-4 h-4" />} onClick={onOpenAuth}>
              Student Sign In
            </Button>
          )}
        </div>

      </div>
    </header>
  );
}
