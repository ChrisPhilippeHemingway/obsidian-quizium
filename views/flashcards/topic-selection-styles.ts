import { CSSProperties } from 'react';

export const topicSelectionStyles = {
  // Main container
  container: {
    padding: '20px'
  },

  // Header
  title: {
    marginBottom: '20px',
    color: 'var(--text-normal)',
    textAlign: 'center' as const
  },

  description: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    marginBottom: '30px',
    textAlign: 'center' as const
  },

  // All topics section
  allTopicsContainer: {
    marginBottom: '12px',
    padding: '12px',
    backgroundColor: 'var(--background-secondary)',
    borderRadius: '6px',
    border: '1px solid var(--background-modifier-border)'
  },

  // Topic item container
  topicContainer: {
    marginBottom: '8px',
    padding: '12px',
    backgroundColor: 'var(--background-secondary)',
    borderRadius: '6px',
    border: '1px solid var(--background-modifier-border)'
  },

  // Topic header
  topicHeader: {
    marginBottom: '8px'
  },

  topicTitle: {
    fontSize: '16px',
    fontWeight: 'bold' as const,
    color: 'var(--text-normal)'
  },

  topicCount: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontWeight: 'normal' as const
  },

  // Difficulty buttons section
  difficultySection: {
    marginBottom: '8px'
  },

  difficultyTitle: {
    fontSize: '13px',
    fontWeight: '600' as const,
    color: 'var(--text-muted)',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },

  difficultyButtonsContainer: {
    display: 'flex',
    flexWrap: 'nowrap' as const,
    gap: '8px',
    justifyContent: 'flex-start',
    overflow: 'hidden'
  },

  // Difficulty button styles
  difficultyButton: (count: number, bgColor: string, hoverColor: string) => ({
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '500' as const,
    backgroundColor: count > 0 ? bgColor : '#e5e5e5',
    color: count > 0 ? 'white' : '#999',
    border: 'none',
    borderRadius: '4px',
    cursor: count > 0 ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s',
    opacity: count > 0 ? 1 : 0.6,
    whiteSpace: 'nowrap' as const,
    flex: '0 0 auto'
  }),

  // Other buttons section
  otherButtonsContainer: {
    display: 'flex',
    flexWrap: 'nowrap' as const,
    gap: '3px',
    justifyContent: 'flex-start',
    overflow: 'hidden'
  },

  // Unclassified button
  unclassifiedButton: (count: number) => {
    const totalClassified = 0; // This would be calculated in the component
    const shouldBeBlue = totalClassified === 0;
    
    return {
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: '500' as const,
      backgroundColor: count > 0 ? (shouldBeBlue ? '#3b82f6' : '#6b7280') : '#e5e5e5',
      color: count > 0 ? 'white' : '#999',
      border: 'none',
      borderRadius: '4px',
      cursor: count > 0 ? 'pointer' : 'not-allowed',
      transition: 'all 0.2s',
      opacity: count > 0 ? 1 : 0.6,
      whiteSpace: 'nowrap' as const,
      flex: '0 0 auto'
    };
  },

  // Secondary button (All)
  secondaryButton: (count: number) => ({
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '500' as const,
    backgroundColor: count > 0 ? '#6b7280' : '#e5e5e5',
    color: count > 0 ? 'white' : '#999',
    border: 'none',
    borderRadius: '4px',
    cursor: count > 0 ? 'pointer' : 'not-allowed',
    transition: 'all 0.2s',
    opacity: count > 0 ? 1 : 0.6,
    whiteSpace: 'nowrap' as const,
    flex: '0 0 auto'
  }),

  // Empty state
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#888'
  }
};

// Hover effects
export const topicSelectionHoverEffects = {
  difficultyButton: (hoverColor: string) => ({
    backgroundColor: hoverColor
  }),

  unclassifiedButtonBlue: {
    backgroundColor: '#1d4ed8'
  },

  unclassifiedButtonGray: {
    backgroundColor: '#4b5563'
  },

  unclassifiedButtonReset: (shouldBeBlue: boolean) => ({
    backgroundColor: shouldBeBlue ? '#3b82f6' : '#6b7280'
  }),

  secondaryButton: {
    backgroundColor: '#4b5563'
  },

  secondaryButtonReset: {
    backgroundColor: '#6b7280'
  }
};

// Utility functions for button styles
export const getDifficultyButtonStyle = (count: number, bgColor: string, hoverColor: string) => 
  topicSelectionStyles.difficultyButton(count, bgColor, hoverColor);

export const getUnclassifiedButtonStyle = (count: number) => 
  topicSelectionStyles.unclassifiedButton(count);

export const getSecondaryButtonStyle = (count: number) => 
  topicSelectionStyles.secondaryButton(count); 