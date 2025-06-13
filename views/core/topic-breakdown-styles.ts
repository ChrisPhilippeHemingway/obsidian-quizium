import { CSSProperties } from 'react';

export const topicBreakdownStyles = {
  // Main container
  container: {
    position: 'absolute' as const,
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'var(--background-primary)',
    border: '1px solid var(--background-modifier-border)',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    minWidth: '300px',
    maxWidth: '400px'
  },

  // Section title
  sectionTitle: {
    fontWeight: 'bold' as const,
    marginBottom: '12px',
    fontSize: '13px'
  },

  // Section container
  section: {
    marginBottom: '12px'
  },

  // Subsection title
  subsectionTitle: {
    fontWeight: '600' as const,
    fontSize: '12px',
    color: '#666',
    marginBottom: '6px'
  },

  // Topic item
  topicItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0',
    fontSize: '12px'
  },

  // Topic name
  topicName: {
    color: '#888'
  },

  // Topic count
  topicCount: {
    fontWeight: '500' as const
  }
}; 