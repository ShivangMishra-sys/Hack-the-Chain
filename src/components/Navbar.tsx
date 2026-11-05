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
      className="dashboard-nav"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        zIndex: 50,
        transform: isHidden ? 'translateY(-100%)' : 'translateY(0%)',
        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        backgroundColor: 'rgba(10, 10, 10, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '1.1rem clamp(1.5rem, 4vw, 3rem)',
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

        {/* Register CTA Button with Accent */}
        <a
          href="#register"
          className="nav-register-btn"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            color: 'var(--accent)',
            padding: '0.6rem 1.4rem',
            border: '1px solid var(--accent)',
            borderRadius: '9999px',
            backgroundColor: 'transparent',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent)';
            e.currentTarget.style.color = '#0a0a0a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--accent)';
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
