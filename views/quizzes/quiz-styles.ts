import { CSSProperties } from 'react';

export const quizStyles = {
  // Common container styles
  container: {
    padding: '20px',
    maxWidth: 500,
    margin: '0 auto'
  },

  largeContainer: {
    padding: '20px',
    maxWidth: 800,
    margin: '0 auto'
  },

  // Header styles
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px'
  },

  title: {
    fontSize: '20px',
    fontWeight: '600' as const,
    color: 'var(--text-normal)'
  },

  // History button
  historyButton: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '500' as const,
    backgroundColor: '#ea580c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  // Section titles
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '500' as const,
    marginBottom: '16px',
    color: 'var(--text-normal)',
    textAlign: 'left' as const
  },

  // Topic item styles
  topicItem: {
    marginBottom: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  topicInfo: {
    textAlign: 'left' as const
  },

  topicName: {
    fontSize: '14px',
    fontWeight: '500' as const,
    marginBottom: '4px',
    color: 'var(--text-normal)'
  },

  topicCount: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: 0
  },

  // Start quiz button
  startButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500' as const,
    backgroundColor: '#8b5cf6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  // Empty state
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    color: 'var(--text-muted)'
  },

  emptyStateTitle: {
    fontSize: '16px',
    marginBottom: '8px'
  },

  emptyStateText: {
    fontSize: '14px'
  }
};

// Quiz History specific styles
export const quizHistoryStyles = {
  // Table styles
  tableContainer: {
    overflowX: 'auto' as const,
    marginTop: '20px'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    backgroundColor: 'var(--background-primary)',
    border: '1px solid var(--background-modifier-border)',
    borderRadius: '8px',
    overflow: 'hidden'
  },

  tableHeader: {
    backgroundColor: 'var(--background-secondary)',
    borderBottom: '2px solid var(--background-modifier-border)'
  },

  tableHeaderCell: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontWeight: '600' as const,
    fontSize: '14px',
    color: 'var(--text-normal)',
    borderRight: '1px solid var(--background-modifier-border)'
  },

  tableHeaderCellCenter: {
    textAlign: 'center' as const
  },

  tableRow: {
    borderBottom: '1px solid var(--background-modifier-border)',
    transition: 'background-color 0.2s'
  },

  tableCell: {
    padding: '12px 16px',
    fontSize: '14px',
    color: 'var(--text-normal)',
    borderRight: '1px solid var(--background-modifier-border)',
    verticalAlign: 'top' as const
  },

  // Date and score styles
  dateText: {
    fontFamily: 'monospace'
  },

  scoreContainer: {
    textAlign: 'center' as const
  },

  scoreText: {
    fontWeight: '600' as const,
    fontSize: '16px'
  },

  scoreGood: {
    color: '#22c55e'
  },

  scoreAverage: {
    color: '#f59e0b'
  },

  scorePoor: {
    color: '#ef4444'
  },

  percentageText: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '2px'
  }
};

// Quiz Session specific styles
export const quizSessionStyles = {
  // Session container
  sessionContainer: {
    padding: '24px',
    maxWidth: 550,
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center'
  },

  // Results container
  resultsContainer: {
    padding: '32px',
    textAlign: 'center' as const
  },

  resultsTitle: {
    fontSize: '20px',
    fontWeight: '600' as const,
    marginBottom: '18px',
    color: 'var(--text-normal)'
  },

  resultsScore: {
    fontSize: '16px',
    color: 'var(--text-normal)',
    marginBottom: '10px'
  },

  resultsPercentage: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '24px'
  },

  resultsButton: {
    fontSize: '15px',
    padding: '10px 24px',
    borderRadius: '6px',
    fontWeight: 500 as const
  },

  // Question styles
  questionText: {
    fontSize: '17px',
    fontWeight: '600' as const,
    marginBottom: '16px',
    color: 'var(--text-normal)',
    width: '100%',
    textAlign: 'center' as const
  },

  keyboardHints: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginBottom: '12px',
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
    width: '100%'
  },

  answersContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    width: '100%'
  },

  // Answer button base styles
  answerButton: {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500' as const,
    border: '1.5px solid #222',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left' as const,
    backgroundColor: '#111',
    color: 'white'
  },

  answerButtonCorrect: {
    backgroundColor: '#22c55e',
    borderColor: '#16a34a',
    color: 'white'
  },

  answerButtonIncorrect: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
    color: 'white'
  },

  answerButtonUnselected: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
    color: '#d1d5db'
  },

  // Progress and navigation
  progressContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    width: '100%'
  },

  progressText: {
    fontSize: '12px',
    color: 'var(--text-muted)'
  },

  nextButton: {
    fontSize: '14px',
    padding: '8px 20px',
    borderRadius: '6px',
    fontWeight: 500 as const
  }
};

// Hover effects
export const quizHoverEffects = {
  historyButton: {
    backgroundColor: '#c2410c',
    transform: 'translateY(-1px)'
  },

  historyButtonReset: {
    backgroundColor: '#ea580c',
    transform: 'translateY(0)'
  },

  startButton: {
    backgroundColor: '#7c3aed',
    transform: 'translateY(-1px)'
  },

  startButtonReset: {
    backgroundColor: '#8b5cf6',
    transform: 'translateY(0)'
  },

  tableRow: {
    backgroundColor: 'var(--background-modifier-hover)'
  },

  answerButton: {
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },

  answerButtonReset: {
    transform: 'translateY(0)',
    boxShadow: 'none'
  }
}; 