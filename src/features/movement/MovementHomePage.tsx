import { Link } from 'react-router-dom';
import { ROUTES } from '../../app/config/routes';
import { HomepageFooter } from '../footer';
import { ArrowRight } from 'lucide-react';

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
        <section className="px-4 sm:px-12 lg:px-24 py-16 sm:py-24 bg-[#0A0A0A] relative z-20">
          <div className="mb-12">
            <h2 className="text-sm font-semibold tracking-[0.2em] text-neutral-400 uppercase mb-3">One Mission</h2>
            <p className="text-3xl sm:text-4xl font-bold uppercase tracking-tight">Join The Mission</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Card 01 - Vote Now */}
            <Link to={ROUTES.MISSION} className="group relative block aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-900">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-80" />
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-20">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold tracking-widest text-neutral-300">01</span>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-white group-hover:text-black">
                     <ArrowRight size={18} strokeWidth={2} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight mb-2">Vote Now</h3>
                  <p className="text-sm text-neutral-300">What should we do next?</p>
                </div>
              </div>
            </Link>

            {/* Card 02 - Real Impact */}
            <Link to={ROUTES.MISSION} className="group relative block aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-900">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-80" />
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-20">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold tracking-widest text-neutral-300">02</span>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-white group-hover:text-black">
                     <ArrowRight size={18} strokeWidth={2} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight mb-2">Real Impact</h3>
                  <p className="text-sm text-neutral-300">See what we're building together.</p>
                </div>
              </div>
            </Link>

            {/* Card 03 - Performance */}
            <Link to={ROUTES.SHOP} className="group relative block aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-900">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-80" />
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-20">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold tracking-widest text-neutral-300">03</span>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-white group-hover:text-black">
                     <ArrowRight size={18} strokeWidth={2} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight mb-2">Performance</h3>
                  <p className="text-sm text-neutral-300">Gear that moves with you.</p>
                </div>
              </div>
            </Link>

            {/* Card 04 - Donate Now */}
            <Link to={ROUTES.DONATE} className="group relative block aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-900">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-80" />
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-20">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold tracking-widest text-neutral-300">04</span>
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-white group-hover:text-black">
                     <ArrowRight size={18} strokeWidth={2} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight mb-2">Donate Now</h3>
                  <p className="text-sm text-neutral-300">Help someone move forward.</p>
                </div>
              </div>
            </Link>

          </div>
        </section>
      </main>

      {/* Adjust footer padding on mobile so it doesn't get hidden behind bottom nav */}
      <div className="pb-[72px] lg:pb-0">
        <HomepageFooter />
      </div>
    </div>
  );
}
