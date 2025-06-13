import { CSSProperties } from 'react';

export const modalStyles = {
  // Main modal container
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'var(--background-primary)',
    color: 'var(--text-normal)',
    position: 'relative' as const
  },

  // Content area
  content: {
    minHeight: '300px',
    marginBottom: '20px'
  }
}; 