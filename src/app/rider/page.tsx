'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { 
  TrendingUp, Star, Leaf, IndianRupee, ShieldCheck, 
  ChevronLeft, Search, PlusCircle, Compass
} from 'lucide-react';
import Link from 'next/link';

interface Profile {
  full_name: string;
  trust_score: number;
  rides_completed: number;
}

export default function RiderDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    trust_score: 0,
    rides_completed: 0,
  });
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile({
              full_name: data.full_name || '',
              trust_score: data.trust_score || 0,
              rides_completed: data.rides_completed || 0,
            });
          }
        });

      // Fetch active bookings (rides you booked)
      supabase
        .from('ride_bookings')
        .select('*, ride:rides(*, driver:profiles(full_name))')
        .eq('rider_id', user.id)
        .in('booking_status', ['pending', 'confirmed'])
        .then(({ data }) => {
          setActiveBookings(data || []);
        });

      // Fetch active passenger requests (requests you posted that are accepted)
      supabase
        .from('passenger_requests')
        .select('*, driver:profiles(full_name)')
        .eq('passenger_id', user.id)
        .in('status', ['pending', 'accepted'])
        .then(({ data }) => {
          setActiveRequests(data || []);
          setLoadingBookings(false);
        });
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-primary"><div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen pb-24 bg-primary overflow-x-hidden">
      <Navbar />
      
      {/* Background Decorative Elements */}
      <div className="fixed top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="max-w-md mx-auto px-4 pt-16 space-y-8 relative z-10">
        <header className="flex flex-col gap-4">
          <Link href="/profile" className="flex items-center gap-2 text-textSecondary hover:text-accent transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Back to Matrix</span>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-textPrimary tracking-tighter">Rider Dashboard</h1>
            <p className="text-textSecondary text-[10px] font-black uppercase tracking-widest mt-2 leading-relaxed opacity-60">Impact & Performance Tracking</p>
          </div>
        </header>

        {/* Action Center */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/rides" className="glass-card p-6 flex flex-col items-center gap-3 transition-all border-divider hover:border-accent/40 active:scale-95 group">
            <div className="p-3 bg-surface-elevated text-accent rounded-xl group-hover:bg-accent group-hover:text-white transition-all scale-110">
              <Search className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-textPrimary text-center">Find Ride</span>
          </Link>

          <Link href="/request-ride" className="glass-card p-6 flex flex-col items-center gap-3 transition-all border-divider hover:border-accent/40 active:scale-95 group">
            <div className="p-3 bg-surface-elevated text-accent rounded-xl group-hover:bg-accent group-hover:text-white transition-all scale-110">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-textPrimary text-center">Need Ride</span>
          </Link>
        </div>

        {/* Performance Matrix */}
        <section className="space-y-6">
          <h2 className="text-[10px] font-black text-textPrimary uppercase tracking-[0.3em] flex items-center gap-2 ml-1">
             <TrendingUp className="w-3.5 h-3.5 text-accent" /> Achievement Matrix
          </h2>
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-surface-elevated p-6 rounded-3xl border border-divider transition-all hover:border-accent/30 group/stat shadow-sm">
              <Star className="w-6 h-6 text-accent mb-4 transition-transform group-hover/stat:rotate-12" />
              <p className="text-3xl font-black text-textPrimary tracking-tighter">{profile.rides_completed || 0}</p>
              <p className="text-[10px] font-black text-textSecondary uppercase tracking-widest mt-1 opacity-60">Missions Completed</p>
            </div>
            <div className="bg-surface-elevated p-6 rounded-3xl border border-divider transition-all hover:border-success/30 group/stat shadow-sm">
              <Leaf className="w-6 h-6 text-success mb-4 transition-transform group-hover/stat:rotate-12" />
              <p className="text-3xl font-black text-textPrimary tracking-tighter">0.0kg</p>
              <p className="text-[10px] font-black text-textSecondary uppercase tracking-widest mt-1 opacity-60">Carbon Offset</p>
            </div>
            <div className="bg-surface-elevated p-6 rounded-3xl border border-divider transition-all hover:border-warning/30 group/stat shadow-sm">
              <IndianRupee className="w-6 h-6 text-warning mb-4 transition-transform group-hover/stat:rotate-12" />
              <p className="text-3xl font-black text-textPrimary tracking-tighter">₹0</p>
              <p className="text-[10px] font-black text-textSecondary uppercase tracking-widest mt-1 opacity-60">Currency Saved</p>
            </div>
            <div className="bg-surface-elevated p-6 rounded-3xl border border-divider transition-all hover:border-info/30 group/stat shadow-sm">
              <ShieldCheck className="w-6 h-6 text-info mb-4 transition-transform group-hover/stat:rotate-12" />
              <p className="text-3xl font-black text-textPrimary tracking-tighter">{profile.trust_score || 0}%</p>
              <p className="text-[10px] font-black text-textSecondary uppercase tracking-widest mt-1 opacity-60">Trust Index</p>
            </div>
          </div>
        </section>
        
        {/* Active Missions (OTP Section) */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-textPrimary uppercase tracking-[0.3em] flex items-center gap-2 ml-1">
             <ShieldCheck className="w-3.5 h-3.5 text-info" /> Confirmation Matrix
          </h2>
          
          <div className="space-y-4">
            {[...activeBookings, ...activeRequests].length === 0 ? (
              <div className="glass-card p-6 bg-surface-elevated/30 border-divider text-center">
                <p className="text-[9px] font-black text-textSecondary uppercase tracking-widest opacity-40">No active extraction codes</p>
              </div>
            ) : (
              [...activeBookings, ...activeRequests].map((item, idx) => (
                <div key={idx} className="glass-card p-6 bg-surface-elevated border-info/30 border-2 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck className="w-12 h-12 text-info" />
                  </div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <p className="text-[9px] font-black text-info uppercase tracking-[0.2em] mb-1">Rider Verification Required</p>
                      <h3 className="text-sm font-black text-textPrimary uppercase tracking-tight">
                        {item.ride?.driver?.full_name || item.driver?.full_name || 'Awaiting Driver'}
                      </h3>
                      <p className="text-[9px] font-bold text-textSecondary uppercase tracking-widest mt-1">Share this code with your pilot</p>
                    </div>
                    <div className="bg-info/10 border border-info/30 px-4 py-2 rounded-xl text-center">
                      <p className="text-[8px] font-black text-info uppercase tracking-widest mb-1">OTP</p>
                      <p className="text-xl font-black text-info tracking-[0.2em]">{item.confirmation_otp || '----'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quest Section - Hidden until implemented */}
        <section className="space-y-4 opacity-50">
          <h2 className="text-[10px] font-black text-textPrimary uppercase tracking-[0.3em] flex items-center gap-2 ml-1">
             <Compass className="w-3.5 h-3.5 text-accent" /> Active Quests
          </h2>
          <div className="glass-card p-6 bg-surface-elevated border-divider flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-surface rounded-lg text-textSecondary font-black text-[10px]">I</div>
                <span className="text-xs font-black uppercase text-textSecondary tracking-widest">ECO-WARRIOR LEVEL 1</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-divider rounded-full overflow-hidden">
              <div className="w-[0%] h-full bg-accent rounded-full" />
            </div>
            <p className="text-[9px] font-bold text-textSecondary uppercase tracking-widest">Complete your first mission to begin your progress.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
