import React from 'react';
import { ViewProps, QuizHistoryEntry } from '../types';

interface QuizHistoryViewProps extends Pick<ViewProps, 'setViewMode'> {
  quizHistory: QuizHistoryEntry[];
}

export const QuizHistoryView: React.FC<QuizHistoryViewProps> = ({
  setViewMode,
  quizHistory
}) => {
  return (
    <div style={{ padding: '20px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-normal)' }}>
          Quiz History
        </div>
        <button
          onClick={() => setViewMode('quiz')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#4b5563';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#6b7280';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          title="Back to quiz selection"
        >
          Back to Quizzes
        </button>
      </div>

      {quizHistory.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>No quiz history found</div>
          <div style={{ fontSize: '14px' }}>Complete some quizzes to see your results here!</div>
        </div>
      ) : (
        <div style={{ 
          border: '1px solid var(--background-modifier-border)', 
          borderRadius: '8px', 
          overflow: 'hidden',
          backgroundColor: 'var(--background-primary)'
        }}>
          {/* Table Header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr 1fr', 
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: 'var(--background-secondary)',
            borderBottom: '1px solid var(--background-modifier-border)',
            fontWeight: '600',
            fontSize: '13px',
            color: 'var(--text-normal)'
          }}>
            <div>Date & Time</div>
            <div>Topic</div>
            <div style={{ textAlign: 'center' }}>Score</div>
          </div>

          {/* Table Rows */}
          {quizHistory.map((entry, index) => (
            <div 
              key={`${entry.timestamp}-${entry.topic}`}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr', 
                gap: '12px',
                padding: '12px 16px',
                borderBottom: index < quizHistory.length - 1 ? '1px solid var(--background-modifier-border)' : 'none',
                fontSize: '13px',
                color: 'var(--text-normal)',
                backgroundColor: index % 2 === 0 ? 'var(--background-primary)' : 'var(--background-secondary-alt)'
              }}
            >
              <div style={{ fontFamily: 'monospace' }}>{entry.formattedDate}</div>
              <div style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                fontWeight: '500'
              }}>
                {entry.topic}
              </div>
              <div style={{ 
                textAlign: 'center', 
                fontWeight: '600',
                color: entry.scorePercentage >= 80 ? '#22c55e' : 
                       entry.scorePercentage >= 60 ? '#f59e0b' : '#ef4444'
              }}>
                {entry.scorePercentage}%
              </div>
            </div>
          ))}
        </div>
      )}

      {quizHistory.length > 0 && (
        <div style={{ 
          marginTop: '16px', 
          textAlign: 'center', 
          fontSize: '12px', 
          color: 'var(--text-muted)' 
        }}>
          Total quiz attempts: {quizHistory.length}
        </div>
      )}
    </div>
  );
}; 