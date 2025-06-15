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
    <div className="quizium-quiz-container">
      <div className="quizium-quiz-header">
        <div className="quizium-quiz-title">
          Quizzes
        </div>
        <button
          onClick={() => setViewMode('quizHistory')}
          className="quizium-quiz-history-button quizium-quiz-history-button-hover"
          title="View historical quiz results"
        >
          Historical Results
        </button>
      </div>
      <div className="quizium-quiz-section-title">
        Topics
      </div>
      {/* All Topics Row */}
      <div className="quizium-quiz-topic-item">
        <div className="quizium-quiz-topic-info">
          <div className="quizium-quiz-topic-name">All Topics</div>
          <div className="quizium-quiz-topic-count">{totalQuizzes} quiz question{totalQuizzes === 1 ? '' : 's'} available</div>
        </div>
        <button
          onClick={() => handleStartQuiz(null)}
          disabled={totalQuizzes === 0}
          className="quizium-quiz-start-button"
        >
          Start Quiz
        </button>
      </div>
      {/* Individual Topics */}
      {quizTopicStats.map(topic => (
        <div key={topic.topicName} className="quizium-quiz-topic-item">
          <div className="quizium-quiz-topic-info">
            <div className="quizium-quiz-topic-name">{topic.topicName}</div>
            <div className="quizium-quiz-topic-count">{topic.count} quiz question{topic.count === 1 ? '' : 's'} available</div>
          </div>
          <button
            onClick={() => handleStartQuiz(topic.topicName)}
            disabled={topic.count === 0}
            className="quizium-quiz-start-button"
          >
            Start Quiz
          </button>
        </div>
      ))}
    </div>
  );
}; 