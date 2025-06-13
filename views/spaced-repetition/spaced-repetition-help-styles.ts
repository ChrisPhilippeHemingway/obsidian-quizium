import { CSSProperties } from 'react';

export const spacedRepetitionHelpStyles = {
  // Main container - positioned as a tooltip modal
  container: {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'var(--background-primary)',
    border: '1px solid var(--background-modifier-border)',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    zIndex: 10000,
    minWidth: '400px',
    maxWidth: '500px',
    maxHeight: '70vh',
    overflowY: 'auto' as const
  },

  // Header with title and close button
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--background-modifier-border)'
  },

  // Main title
  title: {
    fontWeight: 'bold' as const,
    fontSize: '16px',
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

  // Content area
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px'
  },

  // Section container
  section: {
    marginBottom: '4px'
  },

  // Section title
  sectionTitle: {
    fontWeight: '600' as const,
    fontSize: '14px',
    color: 'var(--text-normal)',
    marginBottom: '8px'
  },

  // General explanation text
  explanation: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
    marginBottom: '4px'
  },

  // Difficulty list container
  difficultyList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },

  // Individual difficulty item
  difficultyItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '8px',
    backgroundColor: 'var(--background-secondary)',
    borderRadius: '4px',
    border: '1px solid var(--background-modifier-border-hover)'
  },

  // Difficulty icon (emoji)
  difficultyIcon: {
    fontSize: '16px',
    lineHeight: '1',
    marginTop: '1px'
  },

  // Details container for each difficulty
  difficultyDetails: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px'
  },

  // Difficulty name
  difficultyName: {
    fontWeight: '600' as const,
    fontSize: '13px',
    color: 'var(--text-normal)'
  },

  // Difficulty description
  difficultyDescription: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: '1.3'
  }
}; 