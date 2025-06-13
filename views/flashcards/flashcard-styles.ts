import { CSSProperties } from 'react';

export const flashcardStyles = {
  // Main container styles
  container: {
    padding: '20px'
  },

  // Completion message styles
  completionContainer: {
    textAlign: 'center' as const,
    padding: '50px 40px'
  },

  celebrationEmojis: {
    fontSize: '48px',
    marginBottom: '20px',
    lineHeight: '1'
  },

  completionTitle: {
    color: 'var(--text-normal)',
    marginBottom: '25px',
    fontSize: '28px',
    fontWeight: 'bold' as const
  },

  achievementSummary: (color: string) => ({
    backgroundColor: 'var(--background-secondary)',
    border: `2px solid ${color}`,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '25px',
    display: 'inline-block',
    minWidth: '300px'
  }),

  motivationalMessage: {
    fontSize: '16px',
    color: 'var(--text-muted)',
    marginBottom: '30px',
    lineHeight: '1.5'
  },

  returnButton: {
    fontSize: '15px',
    padding: '10px 24px',
    borderRadius: '6px',
    fontWeight: 500 as const
  },

  // Question section styles
  questionContainer: {
    marginBottom: '30px'
  },

  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },

  questionText: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: 'var(--text-normal)',
    lineHeight: '1.4',
    marginBottom: '15px'
  },

  copyButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: 'var(--text-muted)',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s'
  },

  // Hint section styles
  hintContainer: {
    marginBottom: '20px'
  },

  hintButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: 'var(--text-accent)',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px',
    borderRadius: '4px',
    transition: 'all 0.2s'
  },

  hintText: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    fontStyle: 'italic' as const,
    backgroundColor: 'var(--background-secondary)',
    padding: '10px',
    borderRadius: '6px',
    marginTop: '10px',
    border: '1px solid var(--background-modifier-border)'
  },

  // Answer section styles
  answerContainer: {
    marginBottom: '30px'
  },

  revealButton: {
    backgroundColor: 'var(--interactive-accent)',
    color: 'var(--text-on-accent)',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'block',
    margin: '0 auto'
  },

  answerText: {
    fontSize: '16px',
    color: 'var(--text-normal)',
    lineHeight: '1.5',
    backgroundColor: 'var(--background-secondary)',
    padding: '15px',
    borderRadius: '8px',
    border: '2px solid var(--interactive-accent)',
    marginBottom: '20px'
  },

  // Difficulty rating styles
  difficultyContainer: {
    marginTop: '20px',
    marginBottom: '40px'
  },

  difficultyLabel: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '10px',
    textAlign: 'center' as const
  },

  difficultyButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '8px'
  },

  difficultyButton: (bgColor: string, textColor: string, hoverColor: string) => ({
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500' as const,
    backgroundColor: bgColor,
    color: textColor,
    border: `2px solid ${hoverColor}`,
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  }),

  difficultyShortcut: {
    textAlign: 'center' as const,
    fontSize: '12px',
    color: 'var(--text-muted)',
    fontStyle: 'italic' as const,
    marginTop: '8px',
    marginBottom: '30px'
  },

  // Source info styles
  sourceContainer: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: 'var(--background-secondary)',
    borderRadius: '8px',
    border: '1px solid var(--background-modifier-border)'
  },

  sourceTitle: {
    fontSize: '12px',
    fontWeight: '600' as const,
    color: 'var(--text-muted)',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },

  sourcePath: {
    fontSize: '13px',
    color: 'var(--text-normal)',
    fontFamily: 'var(--font-monospace)',
    marginBottom: '8px'
  },

  // Topic tags styles
  topicTagsContainer: {
    marginTop: '8px'
  },

  topicTagsLabel: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginBottom: '4px'
  },

  topicTag: (index: number) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return {
      display: 'inline-block',
      backgroundColor: colors[index % colors.length],
      color: 'white',
      padding: '2px 6px',
      borderRadius: '3px',
      fontSize: '10px',
      fontWeight: '500' as const,
      marginRight: '4px'
    };
  },

  // Navigation info styles
  navigationInfo: {
    textAlign: 'center' as const,
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '20px',
    fontStyle: 'italic' as const
  },

  // Summary styles
  summaryTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: 'var(--text-normal)',
    marginBottom: '15px'
  },

  summaryStats: {
    marginBottom: '15px'
  },

  summaryStatItem: {
    marginBottom: '4px'
  },

  // Spaced repetition breakdown styles
  spacedBreakdownContainer: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid var(--background-modifier-border)'
  },

  spacedBreakdownTitle: {
    fontSize: '14px',
    fontWeight: '600' as const,
    color: 'var(--text-muted)',
    marginBottom: '8px'
  },

  spacedBreakdownStats: {
    fontSize: '13px',
    color: 'var(--text-normal)',
    lineHeight: '1.4'
  },

  spacedBreakdownItem: (index: number) => {
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#6b7280'];
    return {
      color: colors[index % colors.length],
      fontWeight: '500' as const,
      marginRight: '4px'
    };
  }
};

// Hover effects (to be applied via onMouseEnter/onMouseLeave)
export const hoverEffects = {
  copyButton: {
    backgroundColor: 'var(--background-modifier-hover)',
    transform: 'scale(1.1)'
  },

  hintButton: {
    backgroundColor: 'var(--background-modifier-hover)',
    transform: 'translateY(-1px)'
  },

  revealButton: {
    backgroundColor: 'var(--interactive-accent-hover)',
    transform: 'translateY(-1px)'
  },

  difficultyButton: (hoverColor: string) => ({
    backgroundColor: hoverColor,
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  }),

  returnButton: {
    backgroundColor: 'var(--interactive-accent-hover)',
    transform: 'translateY(-1px)'
  }
}; 