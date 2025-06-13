import { CSSProperties } from 'react';

// Common layout styles
export const commonStyles = {
  // Container styles
  centeredContainer: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#888'
  },

  paddedContainer: {
    padding: '20px'
  },

  maxWidthContainer: (maxWidth: number) => ({
    maxWidth,
    margin: '0 auto'
  }),

  // Loading and empty states
  loadingState: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#888'
  },

  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    color: 'var(--text-muted)'
  },

  // Text styles
  title: {
    fontSize: '20px',
    fontWeight: '600' as const,
    color: 'var(--text-normal)'
  },

  subtitle: {
    fontSize: '16px',
    fontWeight: '500' as const,
    color: 'var(--text-normal)'
  },

  mutedText: {
    color: 'var(--text-muted)',
    fontSize: '14px'
  },

  // Layout utilities
  flexRow: {
    display: 'flex',
    alignItems: 'center'
  },

  flexColumn: {
    display: 'flex',
    flexDirection: 'column' as const
  },

  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Spacing utilities
  marginBottom: (size: number) => ({
    marginBottom: `${size}px`
  }),

  marginTop: (size: number) => ({
    marginTop: `${size}px`
  }),

  gap: (size: number) => ({
    gap: `${size}px`
  })
};

// Button styles
export const buttonStyles = {
  // Base button styles
  base: {
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500' as const
  },

  // Size variants
  small: {
    padding: '4px 8px',
    fontSize: '11px'
  },

  medium: {
    padding: '8px 16px',
    fontSize: '14px'
  },

  large: {
    padding: '12px 24px',
    fontSize: '16px'
  },

  // Color variants
  primary: {
    backgroundColor: 'var(--interactive-accent)',
    color: 'var(--text-on-accent)'
  },

  secondary: {
    backgroundColor: 'var(--interactive-normal)',
    color: 'var(--text-normal)',
    border: '1px solid var(--background-modifier-border)'
  },

  danger: {
    backgroundColor: '#dc2626',
    color: 'white'
  },

  // Difficulty button colors
  easy: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '2px solid #bbf7d0'
  },

  moderate: {
    backgroundColor: '#fef9c3',
    color: '#854d0e',
    border: '2px solid #fef08a'
  },

  challenging: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '2px solid #fecaca'
  },

  // State variants
  disabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },

  loading: {
    opacity: 0.7,
    cursor: 'wait'
  }
};

// Card and panel styles
export const cardStyles = {
  base: {
    backgroundColor: 'var(--background-secondary)',
    border: '1px solid var(--background-modifier-border)',
    borderRadius: '8px',
    padding: '16px'
  },

  elevated: {
    backgroundColor: 'var(--background-secondary)',
    border: '1px solid var(--background-modifier-border)',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },

  highlighted: (color: string) => ({
    backgroundColor: 'var(--background-secondary)',
    border: `2px solid ${color}`,
    borderRadius: '12px',
    padding: '20px'
  })
};

// Form styles
export const formStyles = {
  input: {
    padding: '8px 12px',
    border: '1px solid var(--background-modifier-border)',
    borderRadius: '4px',
    backgroundColor: 'var(--background-primary)',
    color: 'var(--text-normal)',
    fontSize: '14px'
  },

  label: {
    fontSize: '14px',
    fontWeight: '500' as const,
    color: 'var(--text-normal)',
    marginBottom: '4px'
  }
};

// Animation styles
export const animationStyles = {
  fadeIn: {
    animation: 'fadeIn 0.3s ease-in-out'
  },

  slideIn: {
    animation: 'slideIn 0.3s ease-out'
  },

  bounce: {
    animation: 'bounce 0.5s ease-in-out'
  }
};

// Utility functions for combining styles
export const combineStyles = (...styles: CSSProperties[]): CSSProperties => {
  return styles.reduce((combined, style) => ({ ...combined, ...style }), {});
};

export const createButtonStyle = (
  size: 'small' | 'medium' | 'large',
  variant: 'primary' | 'secondary' | 'danger' | 'easy' | 'moderate' | 'challenging',
  state?: 'disabled' | 'loading'
): CSSProperties => {
  let combined = combineStyles(
    buttonStyles.base,
    buttonStyles[size],
    buttonStyles[variant]
  );

  if (state) {
    combined = combineStyles(combined, buttonStyles[state]);
  }

  return combined;
}; 