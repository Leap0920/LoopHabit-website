'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function ScrollReveal({ children, className = '', style = {} }: ScrollRevealProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          // Once it reveals, we disconnect observer for performance
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: 0.05, // Trigger as soon as 5% of the element is visible
        rootMargin: '0px 0px -40px 0px', // Trigger slightly before it enters the viewport
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const revealStyle: React.CSSProperties = {
    opacity: isIntersecting ? 1 : 0,
    transform: isIntersecting ? 'translateY(0)' : 'translateY(24px)',
    transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: 'transform, opacity',
    ...style,
  };

  return (
    <div ref={ref} className={className} style={revealStyle}>
      {children}
    </div>
  );
}
