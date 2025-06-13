import React from 'react';

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
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '18px', color: 'var(--text-normal)' }}>
          Quiz Complete!
        </div>
        <div style={{ fontSize: '16px', color: 'var(--text-normal)', marginBottom: '10px' }}>
          You got {quizResults.correct} out of {quizResults.total} correct.
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Score: {quizResults.total > 0 ? Math.round((quizResults.correct / quizResults.total) * 100) : 0}%
        </div>
        <button
          className="mod-cta"
          style={{ fontSize: '15px', padding: '10px 24px', borderRadius: '6px', fontWeight: 500 }}
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

  return (
    <div style={{ padding: '32px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ fontSize: '17px', fontWeight: '600', marginBottom: '24px', color: 'var(--text-normal)' }}>
        {quiz.question}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {allAnswers.map((answer, idx) => {
          let bg = '#111';
          let color = 'white';
          let border = '1.5px solid #222';
          if (quizSelectedAnswer) {
            if (answer === quiz.correctAnswer) {
              bg = '#22c55e';
              color = 'white';
              border = '1.5px solid #16a34a';
            } else if (answer === quizSelectedAnswer) {
              bg = '#ef4444';
              color = 'white';
              border = '1.5px solid #dc2626';
            } else {
              bg = '#222';
              color = '#bbb';
              border = '1.5px solid #222';
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
              style={{
                background: bg,
                color,
                border,
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 500,
                padding: '20px',
                width: '100%',
                textAlign: 'left',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto',
                minHeight: '60px',
                display: 'block',
                transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                cursor: quizSelectedAnswer ? 'not-allowed' : 'pointer',
                outline: 'none',
                userSelect: 'text',
                lineHeight: '1.5',
                maxWidth: '100%',
                boxSizing: 'border-box',
                position: 'relative',
                // Add hover effect for better UX
                ...(quizSelectedAnswer ? {} : {
                  ':hover': {
                    backgroundColor: '#1a1a1a',
                    borderColor: '#333'
                  }
                })
              }}
              onMouseEnter={(e) => {
                if (!quizSelectedAnswer) {
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                  e.currentTarget.style.borderColor = '#333';
                }
              }}
              onMouseLeave={(e) => {
                if (!quizSelectedAnswer) {
                  e.currentTarget.style.backgroundColor = '#111';
                  e.currentTarget.style.borderColor = '#222';
                }
              }}
            >
              {answer}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '32px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
        Question {quizCurrentIndex + 1} of {quizQuestions.length}
      </div>
      {quizSelectedAnswer && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            className="mod-cta"
            style={{ fontSize: '15px', padding: '10px 24px', borderRadius: '6px', fontWeight: 500 }}
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}; 