import React from 'react';
import { ShieldCheck, Heart, Leaf, BookOpen, Layers } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full glass-panel border-t border-white/10 mt-20 bg-slate-950/90 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-slate-100 tracking-tight">CAMPUSMART</span>
            <span className="bg-indigo-950 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-800">
              v1.0
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            The trusted peer-to-peer campus marketplace for verified college students, faculty, and alumni.
          </p>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Leaf className="w-4 h-4" /> Eco Campus Impact Score: 98/100
          </div>
        </div>

        {/* Col 2 */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">Transaction Modes</h4>
          <ul className="space-y-1.5">
            <li><a href="#" className="hover:text-indigo-400 transition-colors">Direct Purchase & Sale</a></li>
            <li><a href="#" className="hover:text-purple-400 transition-colors">Semester Equipment Rentals</a></li>
            <li><a href="#" className="hover:text-sky-400 transition-colors">Short-term Peer Borrowing</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Textbook & Device Exchange</a></li>
            <li><a href="#" className="hover:text-rose-400 transition-colors">Free Senior Donations</a></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">Campus Safety</h4>
          <ul className="space-y-1.5">
            <li><a href="#" className="hover:text-white transition-colors">University Email Verification</a></li>
            <li><a href="#" className="hover:text-white transition-colors">AI Scam Moderation Engine</a></li>
            <li><a href="#" className="hover:text-white transition-colors">On-Campus Safe Meeting Zones</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Community Trust Guidelines</a></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">Supported Universities</h4>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            COEP Technological University, VJTI Mumbai, IIT Bombay, MIT Pune, BITS Pilani & expanding nationwide.
          </p>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
        <span>© 2026 CampusMart Inc. All rights reserved. Built for verified university students.</span>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-slate-300">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300">Terms of Service</a>
          <a href="#" className="hover:text-slate-300">Security</a>
        </div>
      </div>
    </footer>
  );
}
