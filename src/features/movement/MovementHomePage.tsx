import { Link } from 'react-router-dom';
import { ROUTES } from '../../app/config/routes';
import { HomepageFooter } from '../footer';
import { ArrowRight } from 'lucide-react';
import { PRODUCT_STORY_ITEMS } from '../story/productStoryData';

export function MovementHomePage() {
  return (
    <div
      className="bg-[#0A0A0A] min-h-screen text-white flex flex-col font-['SF-Pro-Display',_sans-serif]"
    >
      <main className="flex-grow flex flex-col">
        {/* HERO SECTION */}
        <section className="relative w-full min-h-[85vh] sm:min-h-screen flex flex-col justify-end pb-24 sm:pb-32 px-6 sm:px-12 lg:px-24">
          <div className="absolute inset-0 z-0">
             {/* Using a placeholder gradient for the image to mimic the dark aesthetic, since we don't have the specific hero image from the reference in the repo yet. */}
             <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/60 via-neutral-900/80 to-[#0A0A0A] z-10" />
             <div className="w-full h-full bg-[#1A1A1A] object-cover" />
          </div>

          <div className="relative z-20 max-w-4xl">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight uppercase leading-[0.95] mb-6">
              <span className="block">We Build.</span>
              <span className="block text-neutral-400">We Move.</span>
              <span className="block">We Serve.</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-neutral-300 max-w-md mb-10 leading-relaxed">
              A movement of Muslims who train their body, strengthen their faith, and build a better ummah.
            </p>

            <Link
              to={ROUTES.MISSION}
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold text-sm tracking-wide uppercase transition-transform hover:scale-105"
            >
              Join The Mission
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>

            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-neutral-800" />
                <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-neutral-700" />
                <div className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-neutral-600" />
              </div>
              <div>
                <p className="font-bold text-lg leading-none">12K+</p>
                <p className="text-xs text-neutral-400">Muslims are moving together</p>
              </div>
            </div>
          </div>
        </section>

        {/* JOIN THE MISSION CARDS */}
        <section className="px-4 sm:px-12 lg:px-24 py-12 sm:py-24 bg-white relative z-20 text-neutral-900">
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xs sm:text-sm font-semibold tracking-[0.2em] text-neutral-500 uppercase mb-2 sm:mb-3">One Mission</h2>
            <p className="text-2xl sm:text-4xl font-bold uppercase tracking-tight">Join The Mission</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Card 01 - Vote Now */}
            <Link to={ROUTES.MISSION} className="group relative block aspect-[2/1] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${PRODUCT_STORY_ITEMS[1].mediaUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10" />
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 text-[120px] sm:text-[180px] leading-none font-bold text-white opacity-[0.12] select-none z-10 pointer-events-none tracking-tighter">
                01
              </div>
              <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end sm:justify-between z-20 text-white">
                <div className="hidden sm:flex justify-between items-start">
                  <span className="text-xs font-semibold tracking-widest text-white/80">01</span>
                </div>
                <div className="flex justify-between items-end gap-4">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-tight mb-1 sm:mb-2 leading-tight">Vote Now</h3>
                    <p className="text-xs sm:text-sm text-white/80 leading-snug">What should we do next?</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 transition-all group-hover:bg-white group-hover:text-black">
                     <ArrowRight size={18} strokeWidth={2} />
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 02 - Real Impact */}
            <Link to={ROUTES.MISSION} className="group relative block aspect-[2/1] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${PRODUCT_STORY_ITEMS[0].mediaUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10" />
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 text-[120px] sm:text-[180px] leading-none font-bold text-white opacity-[0.12] select-none z-10 pointer-events-none tracking-tighter">
                02
              </div>
              <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end sm:justify-between z-20 text-white">
                <div className="hidden sm:flex justify-between items-start">
                  <span className="text-xs font-semibold tracking-widest text-white/80">02</span>
                </div>
                <div className="flex justify-between items-end gap-4">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-tight mb-1 sm:mb-2 leading-tight">Real Impact</h3>
                    <p className="text-xs sm:text-sm text-white/80 leading-snug">See what we're building together.</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 transition-all group-hover:bg-white group-hover:text-black">
                     <ArrowRight size={18} strokeWidth={2} />
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 03 - Performance */}
            <Link to={ROUTES.SHOP} className="group relative block aspect-[2/1] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${PRODUCT_STORY_ITEMS[2].mediaUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10" />
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 text-[120px] sm:text-[180px] leading-none font-bold text-white opacity-[0.12] select-none z-10 pointer-events-none tracking-tighter">
                03
              </div>
              <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end sm:justify-between z-20 text-white">
                <div className="hidden sm:flex justify-between items-start">
                  <span className="text-xs font-semibold tracking-widest text-white/80">03</span>
                </div>
                <div className="flex justify-between items-end gap-4">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-tight mb-1 sm:mb-2 leading-tight">Performance</h3>
                    <p className="text-xs sm:text-sm text-white/80 leading-snug">Gear that moves with you.</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 transition-all group-hover:bg-white group-hover:text-black">
                     <ArrowRight size={18} strokeWidth={2} />
                  </div>
                </div>
              </div>
            </Link>

            {/* Card 04 - Donate Now */}
            <Link to={ROUTES.DONATE} className="group relative block aspect-[2/1] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-100">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${PRODUCT_STORY_ITEMS[3].mediaUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 z-10" />
              <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 text-[120px] sm:text-[180px] leading-none font-bold text-white opacity-[0.12] select-none z-10 pointer-events-none tracking-tighter">
                04
              </div>
              <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end sm:justify-between z-20 text-white">
                <div className="hidden sm:flex justify-between items-start">
                  <span className="text-xs font-semibold tracking-widest text-white/80">04</span>
                </div>
                <div className="flex justify-between items-end gap-4">
                  <div>
                    <h3 className="text-lg sm:text-2xl font-bold uppercase tracking-tight mb-1 sm:mb-2 leading-tight">Donate Now</h3>
                    <p className="text-xs sm:text-sm text-white/80 leading-snug">Help someone move forward.</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 transition-all group-hover:bg-white group-hover:text-black">
                     <ArrowRight size={18} strokeWidth={2} />
                  </div>
                </div>
              </div>
            </Link>

          </div>
        </section>
      </main>

      {/* Adjust footer padding on mobile so it doesn't get hidden behind bottom nav */}
      <div className="pb-[72px] lg:pb-0 bg-white">
        <HomepageFooter />
      </div>
    </div>
  );
}
