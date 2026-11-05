import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Navbar from '../components/Navbar';
import ScrollProgressHairline from '../components/ScrollProgressHairline';
import DashboardHero from './DashboardHero';
import StatsSection from './StatsSection';
import MarqueeStrip from '../components/MarqueeStrip';
import AboutSection from './AboutSection';
import TracksSection from './TracksSection';
import TimelineSection from './TimelineSection';
import PrizesSection from './PrizesSection';
import SponsorsSection from './SponsorsSection';
import FaqSection from './FaqSection';
import RegisterCtaSection from './RegisterCtaSection';
import Footer from './Footer';
import useLenisScroll from '../hooks/useLenisScroll';

export const Dashboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Lenis smooth scroll for dashboard
  useLenisScroll();

  useEffect(() => {
    if (!containerRef.current) return;

    // Fade/slide in when dashboard mounts at the end of break sequence
    gsap.fromTo(
      containerRef.current,
      {
        opacity: 0,
        y: 40,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
      }
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className="dashboard-root"
      style={{
        position: 'relative',
        zIndex: 20,
        width: '100%',
        minHeight: '100vh',
        pointerEvents: 'auto',
      }}
    >
      {/* 2px fixed scroll-progress hairline */}
      <ScrollProgressHairline />

      {/* Sticky minimal nav */}
      <Navbar />

      {/* 1. Dashboard Hero Section with Countdown Timer */}
      <DashboardHero />

      {/* 2. Stats Section (Animated number counters) */}
      <StatsSection />

      {/* Kinetic Typography Marquee Strip */}
      <MarqueeStrip />

      {/* 3. About Section (The Codex & Club info) */}
      <AboutSection />

      {/* 4. Tracks Section (4 cards in a grid) */}
      <TracksSection />

      {/* 5. Timeline (Vertical with scroll-scrubbed line) */}
      <TimelineSection />

      {/* 6. Prizes (3 Tiered cards) */}
      <PrizesSection />

      {/* 7. Sponsors (Grayscale logo grid) */}
      <SponsorsSection />

      {/* 8. FAQ (Smooth 6-item accordion) */}
      <FaqSection />

      {/* 9. Final Register CTA (Huge headline & button) */}
      <RegisterCtaSection />

      {/* 10. Footer (Club contact, socials, beacon) */}
      <Footer />
    </div>
  );
};

export default Dashboard;
