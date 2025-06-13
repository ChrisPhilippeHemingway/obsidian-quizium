import { CSSProperties } from 'react';

export const modalButtonStyles = {
  // Container styles
  container: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px'
  },

  menuContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    position: 'relative' as const
  },

  // Button styles
  primaryButton: {
    flex: '0 0 auto'
  },

  centerButton: {
    flex: '0 0 auto',
    margin: '0 auto'
  },

  // Reset button styles
  resetButton: (isResetting: boolean) => ({
    padding: '3px 8px',
    fontSize: '10px',
    fontWeight: '400' as const,
    backgroundColor: isResetting ? '#9ca3af' : '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: isResetting ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: isResetting ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    position: 'absolute' as const
  }),

  leftResetButton: {
    left: '0'
  },

  rightResetButton: {
    right: '0'
  },

  // Secondary button (Cancel Quiz)
  secondaryButton: {
    flex: '0 0 auto',
    backgroundColor: 'var(--interactive-normal)',
    color: 'var(--text-normal)',
    border: '1px solid var(--background-modifier-border)',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer'
  }
};

// Hover effects
export const modalButtonHoverEffects = {
  resetButton: {
    backgroundColor: '#b91c1c',
    transform: 'translateY(-1px)'
  },

  resetButtonReset: {
    backgroundColor: '#dc2626',
    transform: 'translateY(0)'
  }
}; 