import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { siteContent } from '../content';

export const Navbar: React.FC = () => {
  const scrollY = useAppStore((state) => state.scrollY);
  const lastScrollY = useRef(0);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    // Hide nav when scrolling down past 80px, show when scrolling up
    if (scrollY > lastScrollY.current && scrollY > 80) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
    lastScrollY.current = scrollY;
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
              display: 'inline-block',
              width: 7,
              height: 7,
              backgroundColor: '#f2f2f2',
              borderRadius: '50%',
            }}
          />
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

        {/* Section Links (hidden on mobile, visible on desktop) */}
        <nav
          className="nav-links-desktop"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
          }}
        >
          {siteContent.nav.links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                letterSpacing: '0.12em',
                color: 'var(--muted)',
                textDecoration: 'none',
                textTransform: 'uppercase',
                transition: 'color 0.25s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#f2f2f2')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
              data-cursor-hover="true"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Register CTA */}
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
            color: '#f2f2f2',
            padding: '0.6rem 1.4rem',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '9999px',
            backgroundColor: 'transparent',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f2f2f2';
            e.currentTarget.style.color = '#0a0a0a';
            e.currentTarget.style.borderColor = '#f2f2f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#f2f2f2';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
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

