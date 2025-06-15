import React from 'react';
import { ViewProps, QuizHistoryEntry } from '../types';
import QuizHistoryLineChart from './QuizHistoryLineChart';

interface QuizHistoryViewProps extends Pick<ViewProps, 'setViewMode'> {
  quizHistory: QuizHistoryEntry[];
}

export const QuizHistoryView: React.FC<QuizHistoryViewProps> = ({
  setViewMode,
  quizHistory
}) => {
  return (
    <div className="quizium-quiz-history-container">
      <div className="quizium-quiz-history-header">
        <div className="quizium-quiz-history-title">
          Quiz History
        </div>
        <button
          onClick={() => setViewMode('quiz')}
          className="quizium-quiz-history-back-button quizium-quiz-history-back-button-hover-fix"
          title="Back to quiz selection"
        >
          Back to Quizzes
        </button>
      </div>

      {quizHistory.length === 0 ? (
        <div className="quizium-quiz-history-empty">
          <div className="quizium-quiz-history-empty-title">No quiz history found</div>
          <div className="quizium-quiz-history-empty-text">Complete some quizzes to see your results here!</div>
        </div>
      ) : (
        <>
          {/* Line Chart - only shown when there is historical data */}
          <QuizHistoryLineChart quizHistory={quizHistory} />
          
          <div className="quizium-quiz-history-table-container">
          {/* Table Header */}
          <div className="quizium-quiz-history-table-header-grid">
            <div>Date & Time</div>
            <div>Topic</div>
            <div className="quizium-quiz-history-table-score-header">Score</div>
          </div>

          {/* Table Rows */}
          {quizHistory.map((entry, index) => {
            const scoreClass = entry.scorePercentage >= 80 ? 'quizium-quiz-history-table-score-good' :
                              entry.scorePercentage >= 60 ? 'quizium-quiz-history-table-score-average' :
                              'quizium-quiz-history-table-score-poor';
            
            return (
              <div 
                key={`${entry.timestamp}-${entry.topic}`}
                className={`quizium-quiz-history-table-row-grid ${
                  index % 2 === 0 ? 'quizium-quiz-history-table-row-even' : 'quizium-quiz-history-table-row-odd'
                } ${index < quizHistory.length - 1 ? 'quizium-quiz-history-table-row-border' : ''}`}
              >
                <div className="quizium-quiz-history-table-date">{entry.formattedDate}</div>
                <div className="quizium-quiz-history-table-topic">
                  {entry.topic}
                </div>
                <div className={`quizium-quiz-history-table-score ${scoreClass}`}>
                  {entry.scorePercentage}%
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}

      {quizHistory.length > 0 && (
        <div className="quizium-quiz-history-summary">
          Total quiz attempts: {quizHistory.length}
        </div>
      )}
    </div>
  );
}; 