import { CSSProperties } from 'react';

export const spacedRepetitionStyles = {
  // Main container
  container: {
    padding: '20px',
    maxWidth: 500,
    margin: '0 auto'
  } as CSSProperties,

  // Header
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  } as CSSProperties,

  // Header container with title and help button
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  } as CSSProperties,

  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text-normal)',
    margin: '0',
    textAlign: 'left'
  } as CSSProperties,

  // Help button
  helpButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: 'var(--text-muted)',
    transition: 'color 0.2s',
    padding: '4px 8px',
    borderRadius: '4px'
  } as CSSProperties,

  subtitle: {
    fontSize: '16px',
    color: 'var(--text-muted)',
    marginBottom: '20px'
  },

  // Help section
  helpSection: {
    marginBottom: '30px',
    padding: '15px',
    backgroundColor: 'var(--background-secondary)',
    borderRadius: '8px',
    border: '1px solid var(--background-modifier-border)'
  } as CSSProperties,

  helpTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-normal)',
    marginBottom: '8px'
  } as CSSProperties,

  helpText: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.5'
  } as CSSProperties,

  topicContainer: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: 'var(--background-secondary)',
    borderRadius: '8px',
    border: '1px solid var(--background-modifier-border)'
  } as CSSProperties,

  // Topics section
  topicsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  } as CSSProperties,

  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: 'var(--text-normal)',
    marginBottom: '20px',
    textAlign: 'center' as const
  },

  // Topic item
  topicItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: 'var(--background-primary)',
    borderRadius: '6px',
    border: '1px solid var(--background-modifier-border)'
  } as CSSProperties,

  topicHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  } as CSSProperties,

  topicTitle: {
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--text-normal)'
  } as CSSProperties,

  topicStats: {
    display: 'flex',
    gap: '8px',
    fontSize: '12px'
  } as CSSProperties,

  challengingStat: {
    color: '#ef4444',
    fontWeight: '500'
  } as CSSProperties,

  moderateStat: {
    color: '#f59e0b',
    fontWeight: '500'
  } as CSSProperties,

  easyStat: {
    color: '#22c55e',
    fontWeight: '500'
  } as CSSProperties,

  unratedStat: {
    color: '#6b7280',
    fontWeight: '500'
  } as CSSProperties,

  // Start button
  startButton: (enabled: boolean) => ({
    padding: '8px 18px',
    fontSize: '15px',
    borderRadius: '6px',
    border: 'none',
    cursor: enabled ? 'pointer' : 'not-allowed',
    backgroundColor: enabled ? '#3b82f6' : '#e5e7eb',
    color: 'white',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    opacity: enabled ? 1 : 0.7,
    minWidth: '140px'
  } as CSSProperties),

  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'var(--text-muted)'
  } as CSSProperties,

  emptyStateIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  } as CSSProperties,

  emptyStateTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-normal)',
    marginBottom: '8px'
  } as CSSProperties,

  emptyStateText: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: '1.5'
  } as CSSProperties
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
    backgroundColor: '#2563eb',
    transform: 'translateY(-1px)'
  } as CSSProperties,

  startButtonReset: {
    backgroundColor: '#3b82f6',
    transform: 'translateY(0)'
  } as CSSProperties,

  helpButton: {
    color: 'var(--text-normal)',
    backgroundColor: 'var(--background-modifier-hover)'
  } as CSSProperties,

  helpButtonReset: {
    color: 'var(--text-muted)',
    backgroundColor: 'transparent'
  } as CSSProperties
}; 