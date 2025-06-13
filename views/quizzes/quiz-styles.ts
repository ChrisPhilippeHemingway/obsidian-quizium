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
    padding: '32px',
    maxWidth: 600,
    margin: '0 auto'
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

  // Question container
  questionContainer: {
    fontSize: '17px',
    fontWeight: '600' as const,
    marginBottom: '24px',
    color: 'var(--text-normal)'
  },

  // Answers container
  answersContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '18px'
  },

  // Answer button
  answerButton: (isSelected: boolean, isCorrect: boolean, isRevealed: boolean) => {
    let backgroundColor = 'var(--background-secondary)';
    let borderColor = 'var(--background-modifier-border)';
    let color = 'var(--text-normal)';

    if (isRevealed) {
      if (isCorrect) {
        backgroundColor = '#dcfce7';
        borderColor = '#22c55e';
        color = '#166534';
      } else if (isSelected && !isCorrect) {
        backgroundColor = '#fee2e2';
        borderColor = '#ef4444';
        color = '#991b1b';
      }
    } else if (isSelected) {
      backgroundColor = 'var(--interactive-accent)';
      borderColor = 'var(--interactive-accent)';
      color = 'var(--text-on-accent)';
    }

    return {
      padding: '16px 20px',
      fontSize: '15px',
      fontWeight: '500' as const,
      backgroundColor,
      color,
      border: `2px solid ${borderColor}`,
      borderRadius: '8px',
      cursor: isRevealed ? 'default' : 'pointer',
      transition: 'all 0.2s',
      textAlign: 'left' as const,
      lineHeight: '1.4',
      minHeight: '60px',
      display: 'flex',
      alignItems: 'center'
    };
  },

  // Progress and navigation
  progressText: {
    marginTop: '32px',
    color: 'var(--text-muted)',
    fontSize: '13px',
    textAlign: 'center' as const
  },

  navigationContainer: {
    textAlign: 'center' as const,
    marginTop: '24px'
  },

  nextButton: {
    fontSize: '15px',
    padding: '10px 24px',
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