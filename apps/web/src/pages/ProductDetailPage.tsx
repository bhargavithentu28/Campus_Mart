import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ProductGallery } from '../components/marketplace/ProductGallery';
import { SellerCard } from '../components/marketplace/SellerCard';
import { ReportModal } from '../components/marketplace/ReportModal';
import { ChatDrawer } from '../components/chat/ChatDrawer';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AuthModal } from '../features/auth/AuthModal';
import { useProductDetails, useWishlist, useToggleWishlist } from '../hooks/useMarketplace';
import { ArrowLeft, Heart, ShieldAlert, MapPin, Eye, Flag, Share2, Sparkles, CheckCircle2 } from 'lucide-react';

export interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
  onNavigateMarketplace: () => void;
}

export function ProductDetailPage({ productId, onBack, onNavigateMarketplace }: ProductDetailPageProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { data: product, isLoading, isError } = useProductDetails(productId);
  const { data: wishlist = [] } = useWishlist();
  const toggleWishlistMutation = useToggleWishlist();

  const isWishlisted = wishlist.some((p: any) => p.id === productId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar user={currentUser} onOpenAuth={() => setIsAuthOpen(true)} />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto" />
          <div className="h-6 w-48 bg-slate-800 mx-auto rounded-md" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar user={currentUser} onOpenAuth={() => setIsAuthOpen(true)} />
        <div className="max-w-md mx-auto my-20 p-8 glass-card rounded-2xl text-center space-y-4">
          <h3 className="text-xl font-bold">Product Listing Not Found</h3>
          <p className="text-xs text-slate-400">This listing may have been sold, archived, or removed by campus moderators.</p>
          <Button variant="primary" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const formattedPrice =
    product.transactionType === 'DONATE'
      ? 'FREE'
      : `₹${product.price.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCreateListing={() => setIsAuthOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </button>

          <button
            onClick={() => setIsReportOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold"
          >
            <Flag className="w-3.5 h-3.5" /> Report Listing
          </button>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Col: Gallery (7 Cols) */}
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} title={product.title} />
          </div>

          {/* Right Col: Info & Seller Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Header Badges & Title */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge transactionType={product.transactionType} />
                <Badge condition={product.condition} />
                {product.category?.name && (
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium">
                    {product.category.name}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 leading-tight">
                {product.title}
              </h1>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-3xl font-black text-slate-100 tracking-tight">{formattedPrice}</span>
                  {product.rentalPrice && product.transactionType === 'RENT' && (
                    <span className="text-sm text-slate-400 font-normal"> / month</span>
                  )}
                  {product.isNegotiable && (
                    <span className="ml-3 text-xs text-indigo-400 font-semibold uppercase tracking-wider bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-800/40">
                      Price Negotiable
                    </span>
                  )}
                </div>

                <Button
                  variant={isWishlisted ? 'danger' : 'outline'}
                  size="sm"
                  leftIcon={<Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />}
                  onClick={() => {
                    if (!currentUser) setIsAuthOpen(true);
                    else toggleWishlistMutation.mutate(product.id);
                  }}
                >
                  {isWishlisted ? 'Saved' : 'Wishlist'}
                </Button>
              </div>
            </div>

            {/* AI Safety Assessment Card if available */}
            {product.aiAnalysis && (
              <div className="glass-card rounded-2xl p-4 border border-indigo-500/20 bg-indigo-950/20 space-y-2">
                <div className="flex items-center justify-between text-xs text-indigo-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> AI Pricing & Safety Score
                  </span>
                  <span className="bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-800 text-[10px]">
                    Risk Score: {product.aiAnalysis.scamScore}/100
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {product.aiAnalysis.aiSummary || 'Listing price matches campus historical averages.'}
                </p>
              </div>
            )}

            {/* Campus & Pickup Location */}
            <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> On-Campus Pickup Location
              </div>
              <p className="text-sm font-semibold text-slate-100">{product.pickupLocation || 'Main Campus'}</p>
              {product.pickupTime && <p className="text-slate-400">Preferred Hours: {product.pickupTime}</p>}
            </div>

            {/* Description */}
            <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Item Description</h3>
              <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{product.description}</p>
            </div>

            {/* Seller Reputation Card */}
            <SellerCard
              seller={product.seller}
              onContactSeller={() => {
                if (!currentUser) setIsAuthOpen(true);
                else setIsChatOpen(true);
              }}
            />

          </div>

        </div>

      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => setCurrentUser(user)}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        productId={product.id}
        productTitle={product.title}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={currentUser}
        recipientUser={product.seller}
        productContext={{
          title: product.title,
          price: product.price,
          image: product.images?.[0]?.url
        }}
      />
    </div>
  );
}
