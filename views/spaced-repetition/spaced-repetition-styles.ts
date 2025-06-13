import { CSSProperties } from 'react';

export const spacedRepetitionStyles = {
  // Main container
  container: {
    padding: '20px',
    maxWidth: 600,
    margin: '0 auto'
  },

  // Header
  header: {
    textAlign: 'center' as const,
    marginBottom: '30px'
  },

  title: {
    fontSize: '24px',
    fontWeight: '700' as const,
    color: 'var(--text-normal)',
    marginBottom: '10px'
  },

  subtitle: {
    fontSize: '16px',
    color: 'var(--text-muted)',
    marginBottom: '20px'
  },

  // Help section
  helpContainer: {
    marginBottom: '30px'
  },

  helpButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-accent)',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline',
    padding: '0'
  },

  helpContent: {
    marginTop: '15px',
    padding: '15px',
    backgroundColor: 'var(--background-secondary)',
    borderRadius: '8px',
    border: '1px solid var(--background-modifier-border)',
    fontSize: '14px',
    lineHeight: '1.5',
    color: 'var(--text-normal)'
  },

  // Topics section
  topicsContainer: {
    marginBottom: '30px'
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: 'var(--text-normal)',
    marginBottom: '20px',
    textAlign: 'center' as const
  },

  // Topic item
  topicItem: {
    marginBottom: '20px',
    padding: '20px',
    backgroundColor: 'var(--background-secondary)',
    borderRadius: '12px',
    border: '2px solid var(--background-modifier-border)',
    transition: 'all 0.2s'
  },

  topicHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },

  topicName: {
    fontSize: '16px',
    fontWeight: '600' as const,
    color: 'var(--text-normal)',
    marginBottom: '4px'
  },

  topicStats: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  },

  topicStatsMain: {
    fontWeight: '500' as const,
    marginBottom: '4px'
  },

  topicStatsDistribution: {
    fontSize: '13px'
  },

  // Start button
  startButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500' as const,
    backgroundColor: 'var(--interactive-accent)',
    color: 'var(--text-on-accent)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minWidth: '120px'
  },

  startButtonDisabled: {
    backgroundColor: 'var(--background-modifier-border)',
    color: 'var(--text-muted)',
    cursor: 'not-allowed'
  },

  // Empty state
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    color: 'var(--text-muted)'
  },

  emptyStateTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    marginBottom: '10px'
  },

  emptyStateText: {
    fontSize: '14px',
    lineHeight: '1.5'
  }
};

// Hover effects
export const spacedRepetitionHoverEffects = {
  topicItem: {
    borderColor: 'var(--interactive-accent)',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },

  topicItemReset: {
    borderColor: 'var(--background-modifier-border)',
    transform: 'translateY(0)',
    boxShadow: 'none'
  },

  startButton: {
    backgroundColor: 'var(--interactive-accent-hover)',
    transform: 'translateY(-1px)'
  },

  startButtonReset: {
    backgroundColor: 'var(--interactive-accent)',
    transform: 'translateY(0)'
  }
}; 