import React from 'react';
import { ViewProps, TopicStats } from '../types';

interface QuizViewProps extends Pick<ViewProps, 'setViewMode'> {
  totalQuizzes: number;
  quizTopicStats: TopicStats[];
  handleStartQuiz: (topicName: string | null) => Promise<void>;
}

export const QuizView: React.FC<QuizViewProps> = ({
  setViewMode,
  totalQuizzes,
  quizTopicStats,
  handleStartQuiz
}) => {
  return (
    <div style={{ padding: '20px', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-normal)' }}>
          Quizzes
        </div>
        <button
          onClick={() => setViewMode('quizHistory')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: '#ea580c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#c2410c';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ea580c';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          title="View historical quiz results"
        >
          Historical Results
        </button>
      </div>
      <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '16px', color: 'var(--text-normal)', textAlign: 'left' }}>
        Topics
      </div>
      {/* All Topics Row */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: 'var(--text-normal)', textAlign: 'left' }}>All Topics</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 0, textAlign: 'left' }}>{totalQuizzes} quiz question{totalQuizzes === 1 ? '' : 's'} available</div>
        </div>
        <button
          onClick={() => handleStartQuiz(null)}
          disabled={totalQuizzes === 0}
          style={{
            padding: '8px 18px',
            fontSize: '15px',
            borderRadius: '6px',
            border: 'none',
            cursor: totalQuizzes === 0 ? 'not-allowed' : 'pointer',
            backgroundColor: totalQuizzes === 0 ? '#e5e7eb' : 'rgba(147, 51, 234, 0.5)',
            color: 'white',
            fontWeight: '500',
            transition: 'background-color 0.2s',
            opacity: totalQuizzes === 0 ? 0.7 : 1,
            marginLeft: '32px',
            minWidth: '140px'
          }}
        >
          Start Quiz
        </button>
      </div>
      {/* Individual Topics */}
      {quizTopicStats.map(topic => (
        <div key={topic.topicName} style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: 'var(--text-normal)', textAlign: 'left' }}>{topic.topicName}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 0, textAlign: 'left' }}>{topic.count} quiz question{topic.count === 1 ? '' : 's'} available</div>
          </div>
          <button
            onClick={() => handleStartQuiz(topic.topicName)}
            disabled={topic.count === 0}
            style={{
              padding: '8px 18px',
              fontSize: '15px',
              borderRadius: '6px',
              border: 'none',
              cursor: topic.count === 0 ? 'not-allowed' : 'pointer',
              backgroundColor: topic.count === 0 ? '#e5e7eb' : 'rgba(147, 51, 234, 0.5)',
              color: 'white',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              opacity: topic.count === 0 ? 0.7 : 1,
              marginLeft: '32px',
              minWidth: '140px'
            }}
          >
            Start Quiz
          </button>
        </div>
      ))}
    </div>
  );
}; 