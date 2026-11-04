import React, { useRef } from 'react';
import gsap from 'gsap';

interface MagneticButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  label,
  onClick,
  disabled = false,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || disabled) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * 0.35;
    const deltaY = (e.clientY - centerY) * 0.35;

    gsap.to(buttonRef.current, {
      x: deltaX,
      y: deltaY,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (!buttonRef.current) return;
    gsap.to(buttonRef.current, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className="magnetic-btn"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      aria-label={label}
      data-cursor-hover="true"
    >
      <span className="magnetic-btn-bg" aria-hidden="true" />
      <span className="magnetic-btn-text">{label}</span>
      <span className="magnetic-btn-sub" aria-hidden="true">
        <span>[ BREAK PARADIGM ]</span>
      </span>
    </button>
  );
};

export default MagneticButton;

