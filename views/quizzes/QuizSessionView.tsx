import React, { useEffect } from 'react';

interface Quiz {
  question: string;
  correctAnswer: string;
  wrongAnswers: string[];
  file: any; // TFile
  topics: string[];
}

interface QuizResults {
  correct: number;
  total: number;
}

interface QuizSessionViewProps {
  quizQuestions: Quiz[];
  quizSessionDone: boolean;
  quizCurrentIndex: number;
  quizResults: QuizResults;
  quizSelectedAnswer: string | null;
  quizShuffledAnswers: string[];
  setQuizInProgress: (inProgress: boolean) => void;
  setQuizSessionDone: (done: boolean) => void;
  setQuizQuestions: (questions: Quiz[]) => void;
  setQuizCurrentIndex: (index: number) => void;
  setQuizSelectedAnswer: (answer: string | null) => void;
  setQuizResults: (results: QuizResults | ((prev: QuizResults) => QuizResults)) => void;
  setQuizTopic: (topic: string | null) => void;
  setQuizShuffledAnswers: (answers: string[]) => void;
  onBackToQuizTopics?: () => void; // Add callback to go back to quiz topic selection
}

export const QuizSessionView: React.FC<QuizSessionViewProps> = ({
  quizQuestions,
  quizSessionDone,
  quizCurrentIndex,
  quizResults,
  quizSelectedAnswer,
  quizShuffledAnswers,
  setQuizInProgress,
  setQuizSessionDone,
  setQuizQuestions,
  setQuizCurrentIndex,
  setQuizSelectedAnswer,
  setQuizResults,
  setQuizTopic,
  setQuizShuffledAnswers,
  onBackToQuizTopics
}) => {
  if (!quizQuestions.length || quizSessionDone || quizCurrentIndex >= quizQuestions.length) {
    // Show summary
    return (
      <div className="quizium-quiz-results-container">
        <div className="quizium-quiz-results-title">
          Quiz Complete!
        </div>
        <div className="quizium-quiz-results-score">
          You got {quizResults.correct} out of {quizResults.total} correct.
        </div>
        <div className="quizium-quiz-results-percentage">
          Score: {quizResults.total > 0 ? Math.round((quizResults.correct / quizResults.total) * 100) : 0}%
        </div>
        <button
          className="mod-cta quizium-quiz-results-button"
          onClick={() => {
            // Clear quiz state
            setQuizInProgress(false);
            setQuizSessionDone(false);
            setQuizQuestions([]);
            setQuizCurrentIndex(0);
            setQuizSelectedAnswer(null);
            setQuizResults({ correct: 0, total: 0 });
            setQuizTopic(null);
            setQuizShuffledAnswers([]);
            
            // Navigate back to quiz topic selection
            if (onBackToQuizTopics) {
              onBackToQuizTopics();
            }
          }}
        >
          Back to Quiz Topics
        </button>
      </div>
    );
  }

  const quiz = quizQuestions[quizCurrentIndex];
  
  // Generate shuffled answers only once per question
  if (quizShuffledAnswers.length === 0) {
    const answers = [quiz.correctAnswer, ...quiz.wrongAnswers];
    // Fisher-Yates shuffle for truly random order
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    setQuizShuffledAnswers(answers);
  }
  
  const allAnswers = quizShuffledAnswers;

  const handleAnswer = (answer: string) => {
    if (quizSelectedAnswer) return; // Prevent double answer
    setQuizSelectedAnswer(answer);
    setQuizResults(r => ({
      correct: r.correct + (answer === quiz.correctAnswer ? 1 : 0),
      total: r.total + 1
    }));
  };

  const handleNext = () => {
    setQuizSelectedAnswer(null);
    setQuizShuffledAnswers([]); // Clear shuffled answers for next question
    if (quizCurrentIndex + 1 < quizQuestions.length) {
      setQuizCurrentIndex(quizCurrentIndex + 1);
    } else {
      setQuizSessionDone(true);
    }
  };

  // Handle keyboard shortcuts for quiz interaction
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle keyboard shortcuts when we're in an active quiz (not on completion screen)
      if (quizSessionDone || !quizQuestions.length || quizCurrentIndex >= quizQuestions.length) {
        return;
      }

      // Handle Enter key to advance to next question when answer is selected
      if (event.key === 'Enter' && quizSelectedAnswer) {
        event.preventDefault();
        handleNext();
        return;
      }

      // Handle number keys (1-4) to select answers when no answer is selected yet
      if (!quizSelectedAnswer && ['1', '2', '3', '4'].includes(event.key)) {
        event.preventDefault();
        const answerIndex = parseInt(event.key) - 1;
        
        // Make sure we have enough answers for this index
        if (answerIndex < allAnswers.length) {
          handleAnswer(allAnswers[answerIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [quizSessionDone, quizQuestions.length, quizCurrentIndex, quizSelectedAnswer, allAnswers, quiz.correctAnswer]);

  return (
    <div className="quizium-quiz-session-container">
      <div className="quizium-quiz-question-text">
        {quiz.question}
      </div>
      
      {/* Add keyboard shortcut hints */}
      <div className="quizium-quiz-keyboard-hints">
        Use number keys (1-4) to select answers{quizSelectedAnswer ? ', then Enter to continue' : ''}
      </div>
      
      <div className="quizium-quiz-answers-container">
        {allAnswers.map((answer, idx) => {
          let buttonClass = 'quizium-quiz-answer-button';
          
          if (quizSelectedAnswer) {
            if (answer === quiz.correctAnswer) {
              buttonClass += ' quizium-quiz-answer-button-correct';
            } else if (answer === quizSelectedAnswer) {
              buttonClass += ' quizium-quiz-answer-button-incorrect';
            } else {
              buttonClass += ' quizium-quiz-answer-button-unselected';
            }
          }
          
          return (
            <div
              key={idx}
              onClick={() => handleAnswer(answer)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleAnswer(answer);
                }
              }}
              className={buttonClass}
              style={{
                cursor: quizSelectedAnswer ? 'not-allowed' : 'pointer',
                whiteSpace: 'pre-wrap' as const,
                wordWrap: 'break-word' as const,
                wordBreak: 'break-word' as const,
                overflowWrap: 'break-word' as const,
                hyphens: 'auto' as const,
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                outline: 'none',
                userSelect: 'text' as const,
                lineHeight: '1.4',
                maxWidth: '100%',
                boxSizing: 'border-box' as const,
                position: 'relative' as const,
                width: '100%'
              }}
            >
              <span style={{ 
                marginRight: '10px', 
                fontSize: '12px', 
                fontWeight: '600',
                color: quizSelectedAnswer ? (answer === quiz.correctAnswer ? 'white' : answer === quizSelectedAnswer ? 'white' : '#888') : '#666',
                minWidth: '14px'
              }}>
                {idx + 1}.
              </span>
              {answer}
            </div>
          );
        })}
      </div>
      <div className="quizium-quiz-progress-container">
        <div className="quizium-quiz-progress-text">
          Question {quizCurrentIndex + 1} of {quizQuestions.length}
        </div>
        {quizSelectedAnswer && (
          <button
            className="mod-cta quizium-quiz-next-button"
            onClick={handleNext}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}; 