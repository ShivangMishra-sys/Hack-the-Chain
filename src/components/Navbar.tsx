import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { siteContent } from '../content';
import ScrambleText from './ScrambleText';

export const Navbar: React.FC = () => {
  const scrollY = useAppStore((state) => state.scrollY);
  const lastScrollY = useRef(0);
  const [isHidden, setIsHidden] = useState(false);
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    // Hide nav when scrolling down past 80px, show when scrolling up
    if (scrollY > lastScrollY.current && scrollY > 80) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
    lastScrollY.current = scrollY;

    // Detect active section based on scroll position
    const sections = siteContent.nav.links.map((l) => l.href.substring(1));
    for (const sec of sections) {
      const el = document.getElementById(sec);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 200 && rect.bottom >= 200) {
          setActiveSection(sec);
          break;
        }
      }
    }
  }, [scrollY]);

  return (
    <header
      className="dashboard-nav header-veil"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        zIndex: 50,
        transform: isHidden ? 'translateY(-100%)' : 'translateY(0%)',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.94) 0%, rgba(10, 10, 10, 0.82) 65%, rgba(10, 10, 10, 0) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '1rem clamp(1.25rem, 4vw, 3rem) 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Wordmark */}
        <a
          href="#dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: '#f2f2f2',
          }}
          data-cursor-hover="true"
        >
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
            }}
          >
            {siteContent.meta.title}
          </span>
          <span
            className="nav-wordmark-sub"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--muted)',
              letterSpacing: '0.15em',
            }}
          >
            // {siteContent.nav.brand}
          </span>
        </a>

        {/* Section Links with Active Indicator */}
        <nav
          className="nav-links-desktop"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
          }}
        >
          {siteContent.nav.links.map((link, idx) => {
            const isActive = activeSection === link.href.substring(1);

            return (
              <a
                key={idx}
                href={link.href}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  letterSpacing: '0.12em',
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'color 0.25s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#f2f2f2')}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = isActive ? 'var(--accent)' : 'var(--muted)')
                }
                data-cursor-hover="true"
              >
                <ScrambleText text={link.label} triggerOnHover={true} triggerOnScroll={false} />
              </a>
            );
          })}
        </nav>

        {/* Register CTA Button with Accent (Phase S4 Pill Spec) */}
        <a
          href="#register"
          className="nav-register-btn pill-btn"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            color: 'var(--accent)',
            WebkitTextFillColor: 'var(--accent)',
            height: '40px',
            minHeight: '40px',
            maxHeight: '40px',
            padding: '0 1.5rem',
            border: '1px solid var(--accent)',
            borderRadius: '999px',
            backgroundColor: 'transparent',
            boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.10)',
            transition: 'transform 0.4s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.4s cubic-bezier(0.22, 0.61, 0.36, 1), background-color 0.4s cubic-bezier(0.22, 0.61, 0.36, 1), color 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent)';
            e.currentTarget.style.color = '#0a0a0a';
            (e.currentTarget.style as any).WebkitTextFillColor = '#0a0a0a';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--accent)';
            (e.currentTarget.style as any).WebkitTextFillColor = 'var(--accent)';
            e.currentTarget.style.transform = 'translateY(0px)';
          }}
          data-cursor-hover="true"
        >
          {siteContent.nav.registerCta}
        </a>
      </div>
    </header>
  );
};

export default Navbar;
