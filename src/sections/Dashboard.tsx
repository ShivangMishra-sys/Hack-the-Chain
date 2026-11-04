import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Navbar from '../components/Navbar';
import DashboardHero from './DashboardHero';
import useLenisScroll from '../hooks/useLenisScroll';

export const Dashboard: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Lenis smooth scroll for dashboard
  useLenisScroll();

  useEffect(() => {
    if (!containerRef.current) return;

    // Fade/slide in when the dashboard mounts at the end of the break sequence
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
        minHeight: '220vh', // Extends down so smooth scrolling and debris parallax can be tested
        pointerEvents: 'auto',
      }}
    >
      {/* Sticky minimal nav */}
      <Navbar />

      {/* Dashboard hero */}
      <DashboardHero />

      {/* Scroll indicator to test smooth scroll */}
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '2rem clamp(1.5rem, 5vw, 4rem) 10rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            padding: '2.5rem',
            borderRadius: '16px',
            backgroundColor: 'rgba(22, 22, 22, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(8px)',
            maxWidth: '640px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              letterSpacing: '0.15em',
              color: 'var(--muted)',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
            }}
          >
            // SCROLL DOWN TO TEST PARALLAX & LENIS
          </p>
          <p
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.6,
              color: 'var(--fg)',
            }}
          >
            The severed chain fragments and shards drift through the dark volume in the background, subtly responding to your mouse position and scrolling depth.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

