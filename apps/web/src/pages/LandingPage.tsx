import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ProductCard } from '../components/marketplace/ProductCard';
import { Button } from '../components/ui/Button';
import { AuthModal } from '../features/auth/AuthModal';
import { Sparkles, ArrowRight } from 'lucide-react';
import { TransactionType, ProductCondition } from '@campusmart/shared-types';

const MOCK_FEATURED_PRODUCTS: Array<{
  id: string;
  title: string;
  description: string;
  price: number;
  rentalPrice?: number;
  condition: ProductCondition;
  transactionType: TransactionType;
  pickupLocation: string;
  viewsCount: number;
  images: Array<{ url: string; isPrimary: boolean }>;
  seller: { name: string; isVerified: boolean };
  category: { name: string };
}> = [
  {
    id: 'p1',
    title: 'Engineering Mathematics (HK Dass) - 4th Sem',
    description: 'Pristine condition textbook, zero markings, covers all COEP & VJTI syllabus units.',
    price: 350,
    condition: 'LIKE_NEW',
    transactionType: 'BUY',
    pickupLocation: 'Hostel Block 3, COEP',
    viewsCount: 42,
    images: [{ url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', isPrimary: true }],
    seller: { name: 'Ananya Deshmukh', isVerified: true },
    category: { name: 'Books' }
  },
  {
    id: 'p2',
    title: 'Hero Sprint 21-Speed Gear Cycle',
    description: 'Perfect for campus commuting. Includes helmet, heavy cable lock, and dual mudguards.',
    price: 3200,
    rentalPrice: 400,
    condition: 'GOOD',
    transactionType: 'RENT',
    pickupLocation: 'Main Gate, VJTI',
    viewsCount: 118,
    images: [{ url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80', isPrimary: true }],
    seller: { name: 'Rohan Mehta', isVerified: true },
    category: { name: 'Cycles' }
  },
  {
    id: 'p3',
    title: 'Arduino Uno Ultimate Project Starter Kit',
    description: 'Complete with breadboard, ultrasonic sensors, motors, cables, and OLED display.',
    price: 850,
    condition: 'NEW',
    transactionType: 'BUY',
    pickupLocation: 'Robotics Lab, IIT Bombay',
    viewsCount: 89,
    images: [{ url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=600&q=80', isPrimary: true }],
    seller: { name: 'Vikram Joshi', isVerified: true },
    category: { name: 'Project Kits' }
  },
  {
    id: 'p4',
    title: 'Casio FX-991EX Scientific Calculator',
    description: 'Original solar scientific calculator. Essential for Semester 1 to 8 engineering exams.',
    price: 0,
    condition: 'GOOD',
    transactionType: 'DONATE',
    pickupLocation: 'Library Courtyard',
    viewsCount: 210,
    images: [{ url: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48a?auto=format&fit=crop&w=600&q=80', isPrimary: true }],
    seller: { name: 'Priya Kulkarni (Senior)', isVerified: true },
    category: { name: 'Electronics' }
  }
];

export function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<string>('ALL');

  const filteredProducts = MOCK_FEATURED_PRODUCTS.filter(p => {
    if (selectedTab === 'ALL') return true;
    return p.transactionType === selectedTab;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCreateListing={() => setIsAuthOpen(true)}
      />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-pink-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>The Trusted Peer-to-Peer Marketplace for College Students</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            Buy, Rent, Exchange & Donate <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Inside Verified Campuses
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-400 text-base sm:text-lg mb-8 leading-relaxed">
            Eliminate scam risks and overpriced textbooks. Trade directly with verified students, seniors, and campus clubs using AI pricing suggestions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => setIsAuthOpen(true)}
            >
              Explore Campus Listings
            </Button>
            <Button variant="outline" size="lg" onClick={() => setIsAuthOpen(true)}>
              Verify Student Account
            </Button>
          </div>
        </div>
      </section>

      {/* Transaction Modes Selector */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-100">Featured Campus Listings</h2>
            <p className="text-xs text-slate-400">Hand-picked items verified by AI scam moderation engine</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 glass-panel rounded-xl text-xs">
            {['ALL', 'BUY', 'RENT', 'DONATE'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedTab === tab
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setIsAuthOpen(true)}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}
