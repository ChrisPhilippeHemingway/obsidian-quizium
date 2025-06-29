import { CSSProperties } from 'react';

export const menuStyles = {
  // Main container
  container: {
    padding: '30px',
    textAlign: 'center' as const
  },

  // Header container with title and logo
  headerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: '20px',
    position: 'relative' as const
  },

  // Title and header
  title: {
    margin: '0',
    color: 'var(--text-normal)',
    textAlign: 'center' as const
  },



  // Topic breakdown container
  topicBreakdownContainer: {
    position: 'relative' as const,
    display: 'inline-block',
    marginBottom: '20px'
  },

  statsText: {
    color: '#666',
    fontSize: '16px'
  },

  statsLine: {
    marginBottom: '5px'
  },

  statsLineWithMargin: {
    marginBottom: '10px'
  },

  // Breakdown button
  breakdownButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#666',
    transition: 'color 0.2s'
  },

  // Action buttons container
  actionsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    maxWidth: '400px',
    margin: '0 auto'
  },

  // Action button base style
  actionButton: {
    padding: '20px',
    fontSize: '16px',
    fontWeight: '600' as const,
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  // Specific action button colors
  flashcardsButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.5)',
    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)'
  },

  spacedRepetitionButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
  },

  quizzesButton: {
    backgroundColor: 'rgba(147, 51, 234, 0.5)',
    boxShadow: '0 2px 8px rgba(147, 51, 234, 0.2)'
  },

  // Loading and error states
  loadingContainer: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#888'
  },

  loadingIcon: {
    fontSize: '48px',
    marginBottom: '15px'
  },

  loadingText: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: 'var(--text-normal)',
    marginBottom: '8px'
  },

  loadingSubtext: {
    fontSize: '14px',
    color: '#888'
  },

  errorContainer: {
    textAlign: 'center' as const,
    padding: '20px'
  },

  errorIcon: {
    color: '#ff6b6b',
    marginBottom: '15px'
  },

  errorText: {
    fontSize: '14px',
    color: '#888'
  },

  // Instructions
  instructionsList: {
    textAlign: 'left' as const,
    display: 'inline-block',
    marginTop: '10px'
  },

  instructionsContainer: {
    marginTop: '10px'
  },

  instructionsTitle: {
    fontWeight: '600' as const,
    marginBottom: '8px'
  },

  codeBlock: {
    backgroundColor: '#f5f5f5',
    padding: '8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#333',
    whiteSpace: 'pre-wrap' as const,
    textAlign: 'left' as const,
    marginBottom: '10px'
  },

  instructionsNote: {
    fontSize: '13px',
    marginTop: '10px',
    fontStyle: 'italic' as const
  },

  // Topic tags in instructions
  topicTag: {
    margin: '0 2px'
  }
};

// Hover effects
export const menuHoverEffects = {
  breakdownButton: {
    color: '#333'
  },

  breakdownButtonReset: {
    color: '#666'
  },

  flashcardsButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.7)',
    transform: 'translateY(-1px)'
  },

  flashcardsButtonReset: {
    backgroundColor: 'rgba(34, 197, 94, 0.5)',
    transform: 'translateY(0)'
  },

  spacedRepetitionButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.7)',
    transform: 'translateY(-1px)'
  },

  spacedRepetitionButtonReset: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    transform: 'translateY(0)'
  },

  quizzesButton: {
    backgroundColor: 'rgba(147, 51, 234, 0.7)',
    transform: 'translateY(-1px)'
  },

  quizzesButtonReset: {
    backgroundColor: 'rgba(147, 51, 234, 0.5)',
    transform: 'translateY(0)'
  }
}; 