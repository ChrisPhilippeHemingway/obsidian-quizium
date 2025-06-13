import React from 'react';
import { ViewProps } from '../types';

interface MenuViewProps extends Pick<ViewProps, 
  'loading' | 'error' | 'monitoredTopics' | 'totalFlashcards' | 'totalQuizzes' | 
  'showTopicBreakdown' | 'setShowTopicBreakdown' | 'setViewMode'
> {
  showTopicSelection: () => void;
  showSpacedRepetition: () => void;
  showQuizView: () => void;
  renderTopicBreakdown: () => React.ReactNode;
}

export const MenuView: React.FC<MenuViewProps> = ({
  loading,
  error,
  monitoredTopics,
  totalFlashcards,
  totalQuizzes,
  showTopicBreakdown,
  setShowTopicBreakdown,
  showTopicSelection,
  showSpacedRepetition,
  showQuizView,
  renderTopicBreakdown
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        Loading flashcards...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ color: '#ff6b6b', marginBottom: '15px' }}>
          {error}
        </div>
        <div style={{ fontSize: '14px', color: '#888' }}>
          To get started:
          <ol style={{ textAlign: 'left', display: 'inline-block', marginTop: '10px' }}>
            <li>Create a markdown note</li>
            <li>Add one of these tags: {monitoredTopics.map(topic => 
              <code key={topic.hashtag} style={{ margin: '0 2px' }}>{topic.hashtag}</code>
            )}</li>
            <li>Add questions in this <strong>exact</strong> format:</li>
          </ol>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Flashcard format:</div>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '5px', 
              marginBottom: '15px',
              fontSize: '12px',
              textAlign: 'left',
              lineHeight: '1.4'
            }}>
{`
What is stargazing?
?
Observing stars and celestial objects

What is radioactivity?
?
The process by which unstable nuclei emit radiation
`}
            </pre>
            
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>Quiz format (1 correct + 3 wrong answers):</div>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '5px', 
              fontSize: '12px',
              textAlign: 'left',
              lineHeight: '1.4'
            }}>
{`
What is 10 cm?
?
0.1 metre.
:
1 metre.
:
10 metres.
:
20 metres.
`}
            </pre>
          </div>
          <div style={{ fontSize: '13px', marginTop: '10px', fontStyle: 'italic' }}>
            <strong>Critical:</strong> Questions and answers must each be on a <strong>single line</strong> only!<br/>
            Empty lines before and after each flashcard are required!<br/>
            <em>Configure topics in plugin settings if needed.</em>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '10px', color: 'var(--text-normal)' }}>Quizium</h1>
      <div className="topic-breakdown-container" style={{ position: 'relative', display: 'inline-block', marginBottom: '30px' }}>
        <div style={{ color: '#666', fontSize: '16px' }}>
          <div style={{ marginBottom: '5px' }}>
            {totalFlashcards} unique flashcards available
          </div>
          <div style={{ marginBottom: '10px' }}>
            {totalQuizzes} unique quizzes available
          </div>
          <button
            onClick={() => setShowTopicBreakdown(!showTopicBreakdown)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#666',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#666';
            }}
            title="Show per-topic breakdown"
          >
            📊 Show breakdown
          </button>
        </div>
        {renderTopicBreakdown()}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        <button
          onClick={showTopicSelection}
          style={{
            padding: '20px',
            fontSize: '16px',
            fontWeight: '600',
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.7)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.5)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          📚 Flashcards
        </button>
        <button
          onClick={showSpacedRepetition}
          style={{
            padding: '20px',
            fontSize: '16px',
            fontWeight: '600',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.7)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.5)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          🔄 Flashcards - Spaced Repetition
        </button>
        <button
          onClick={showQuizView}
          style={{
            padding: '20px',
            fontSize: '16px',
            fontWeight: '600',
            backgroundColor: 'rgba(147, 51, 234, 0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(147, 51, 234, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.7)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.5)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          🧠 Quizzes
        </button>
      </div>
    </div>
  );
}; 