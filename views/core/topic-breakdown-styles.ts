import { CSSProperties } from 'react';

export const topicBreakdownStyles = {
  // Main container - positioned as a tooltip
  container: {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'var(--background-primary)',
    border: '1px solid var(--background-modifier-border)',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    zIndex: 10000,
    minWidth: '320px',
    maxWidth: '450px',
    maxHeight: '70vh',
    overflowY: 'auto' as const
  },

  // Header with title and close button
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--background-modifier-border)'
  },

  // Section title
  sectionTitle: {
    fontWeight: 'bold' as const,
    fontSize: '14px',
    color: 'var(--text-normal)',
    margin: '0'
  },

  // Close button
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: '4px',
    borderRadius: '4px',
    lineHeight: '1',
    transition: 'all 0.2s'
  },

  // Section container
  section: {
    marginBottom: '16px'
  },

  // Subsection title
  subsectionTitle: {
    fontWeight: '600' as const,
    fontSize: '13px',
    color: 'var(--text-normal)',
    marginBottom: '8px'
  },

  // Topic item
  topicItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 8px',
    fontSize: '12px',
    borderRadius: '4px',
    marginBottom: '2px',
    backgroundColor: 'var(--background-secondary)',
    border: '1px solid var(--background-modifier-border-hover)'
  },

  // Topic name
  topicName: {
    color: 'var(--text-normal)',
    fontWeight: '500' as const
  },

  // Topic count
  topicCount: {
    fontWeight: '600' as const,
    color: 'var(--text-accent)',
    fontSize: '12px'
  },

  // No data text
  noDataText: {
    color: 'var(--text-muted)',
    fontSize: '12px',
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    padding: '8px'
  }
}; 