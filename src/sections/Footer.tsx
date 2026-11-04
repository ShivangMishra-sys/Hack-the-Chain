import React from 'react';
import { siteContent } from '../content';

export const Footer: React.FC = () => {
  return (
    <footer
      className="site-footer"
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'relative',
        zIndex: 10,
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '5rem clamp(1.5rem, 5vw, 4rem) 3.5rem',
        }}
      >
        {/* Top Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3rem',
            marginBottom: '4.5rem',
          }}
        >
          {/* Col 1: Brand & Club */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  backgroundColor: '#f2f2f2',
                  borderRadius: '50%',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#f2f2f2',
                }}
              >
                {siteContent.meta.title}
              </span>
            </div>

            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.12em',
                color: 'var(--muted)',
                marginBottom: '0.75rem',
              }}
            >
              ORGANIZED BY {siteContent.footer.club}
            </p>

            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--muted)',
                lineHeight: 1.6,
              }}
            >
              {siteContent.footer.college}
              <br />
              {siteContent.footer.address}
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.22em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '1.25rem',
              }}
            >
              NAVIGATION
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {siteContent.nav.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    letterSpacing: '0.1em',
                    color: 'var(--fg)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--fg)')}
                  data-cursor-hover="true"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Col 3: Social Links */}
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.22em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '1.25rem',
              }}
            >
              DISPATCH & SOCIALS
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {siteContent.footer.socials.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8125rem',
                    letterSpacing: '0.1em',
                    color: 'var(--fg)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--fg)')}
                  data-cursor-hover="true"
                >
                  <span>↗</span>
                  <span>{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Col 4: Contact & System Health */}
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.22em',
                color: 'var(--muted)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '1.25rem',
              }}
            >
              DIRECT CONTACT
            </span>

            <a
              href={`mailto:${siteContent.footer.email}`}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.875rem',
                letterSpacing: '0.08em',
                color: '#f2f2f2',
                textDecoration: 'none',
                display: 'block',
                marginBottom: '1.5rem',
              }}
              data-cursor-hover="true"
            >
              {siteContent.footer.email}
            </a>

            {/* Status Beacon */}
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                letterSpacing: '0.1em',
                color: 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 8px #ffffff',
                }}
              />
              {siteContent.footer.status}
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            color: 'var(--muted)',
          }}
        >
          <span>{siteContent.footer.copy}</span>
          <span>EST. 2026 // MONOCHROME crucible</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

