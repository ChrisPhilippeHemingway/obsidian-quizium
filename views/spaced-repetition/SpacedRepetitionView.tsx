import React from 'react';
import { SpacedRepetitionStats } from '../types';

interface SpacedRepetitionViewProps {
  spacedRepetitionStats: SpacedRepetitionStats | null;
  showSpacedRepetitionHelp: boolean;
  setShowSpacedRepetitionHelp: (show: boolean) => void;
  handleStartRepetition: (topic?: string) => void;
  formatStatsText: (topicStats: SpacedRepetitionStats) => string | { main: string; distribution?: string };
  plugin: any; // QuiziumPlugin type
}

export const SpacedRepetitionView: React.FC<SpacedRepetitionViewProps> = ({
  spacedRepetitionStats,
  showSpacedRepetitionHelp,
  setShowSpacedRepetitionHelp,
  handleStartRepetition,
  formatStatsText,
  plugin
}) => {
  if (!spacedRepetitionStats) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        Loading spaced repetition stats...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '28px'
      }}>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: '600',
          color: 'var(--text-normal)'
        }}>
          Spaced Repetition
        </div>
        <button
          onClick={() => setShowSpacedRepetitionHelp(true)}
          style={{
            padding: '6px',
            fontSize: '14px',
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid var(--background-modifier-border)',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'all 0.2s',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--background-modifier-hover)';
            e.currentTarget.style.color = 'var(--text-normal)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          title="How does Spaced Repetition work?"
        >
          ?
        </button>
      </div>

      {/* All Topics Section */}
      <div style={{ marginBottom: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ 
            fontSize: '15px', 
            fontWeight: '500', 
            marginBottom: '4px',
            color: 'var(--text-normal)',
            textAlign: 'left'
          }}>
            All Topics
          </div>
          {(() => {
            const statsText = formatStatsText(spacedRepetitionStats);
            if (typeof statsText === 'string') {
              return (
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  marginBottom: 0,
                  textAlign: 'left',
                }}>{statsText}</div>
              );
            }
            return (
              <>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  marginBottom: 0,
                  textAlign: 'left',
                }}>
                  {statsText.main}
                </div>
                {statsText.distribution && (
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-faint, #aaa)',
                    marginTop: '2px',
                    marginBottom: 0,
                    textAlign: 'left',
                  }}>
                    ({statsText.distribution})
                  </div>
                )}
              </>
            );
          })()}
        </div>
        <button
          onClick={() => handleStartRepetition()}
          disabled={spacedRepetitionStats.total === 0}
          style={{
            padding: '8px 18px',
            fontSize: '15px',
            borderRadius: '6px',
            border: 'none',
            cursor: spacedRepetitionStats.total === 0 ? 'not-allowed' : 'pointer',
            backgroundColor: spacedRepetitionStats.total === 0 ? '#e5e7eb' : '#3b82f6',
            color: 'white',
            fontWeight: '500',
            transition: 'background-color 0.2s',
            opacity: spacedRepetitionStats.total === 0 ? 0.7 : 1,
            marginLeft: '32px',
            minWidth: '140px'
          }}
          onMouseEnter={(e) => {
            if (spacedRepetitionStats.total > 0) {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }
          }}
          onMouseLeave={(e) => {
            if (spacedRepetitionStats.total > 0) {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }
          }}
        >
          Start Repetition
        </button>
      </div>

      {/* Individual Topics */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ 
          fontSize: '15px', 
          fontWeight: '500', 
          marginBottom: '16px',
          color: 'var(--text-normal)',
          textAlign: 'left'
        }}>
          Topics
        </div>
        {spacedRepetitionStats.topics?.map((topicStats) => (
          <div key={topicStats.topic} style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '4px',
                color: 'var(--text-normal)',
                textAlign: 'left'
              }}>
                {topicStats.topic}
              </div>
              {(() => {
                const statsText = formatStatsText(topicStats);
                if (typeof statsText === 'string') {
                  return (
                    <div style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      marginBottom: 0,
                      textAlign: 'left',
                    }}>{statsText}</div>
                  );
                }
                return (
                  <>
                    <div style={{
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                      marginBottom: 0,
                      textAlign: 'left',
                    }}>
                      {statsText.main}
                    </div>
                    {statsText.distribution && (
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--text-faint, #aaa)',
                        marginTop: '2px',
                        marginBottom: 0,
                        textAlign: 'left',
                      }}>
                        ({statsText.distribution})
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            <button
              onClick={() => handleStartRepetition(topicStats.topic)}
              disabled={topicStats.total === 0}
              style={{
                padding: '8px 18px',
                fontSize: '15px',
                borderRadius: '6px',
                border: 'none',
                cursor: topicStats.total === 0 ? 'not-allowed' : 'pointer',
                backgroundColor: topicStats.total === 0 ? '#e5e7eb' : '#3b82f6',
                color: 'white',
                fontWeight: '500',
                transition: 'background-color 0.2s',
                opacity: topicStats.total === 0 ? 0.7 : 1,
                marginLeft: '32px',
                minWidth: '140px'
              }}
              onMouseEnter={(e) => {
                if (topicStats.total > 0) {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }
              }}
              onMouseLeave={(e) => {
                if (topicStats.total > 0) {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }
              }}
            >
              Start Repetition
            </button>
          </div>
        ))}
      </div>

      {/* Help Modal */}
      {showSpacedRepetitionHelp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--background-primary)',
            border: '1px solid var(--background-modifier-border)',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
            margin: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-normal)'
              }}>
                How Spaced Repetition Works
              </h3>
              <button
                onClick={() => setShowSpacedRepetitionHelp(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              color: 'var(--text-normal)',
              lineHeight: '1.6',
              fontSize: '14px'
            }}>
              <p style={{ marginBottom: '16px' }}>
                <strong>Spaced Repetition</strong> is a learning technique that shows you flashcards at increasing intervals based on how well you know them.
              </p>

              <div style={{ marginBottom: '16px' }}>
                <strong>How it works:</strong>
                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '4px' }}>Rate each flashcard as <strong style={{ color: '#22c55e' }}>Easy</strong>, <strong style={{ color: '#f59e0b' }}>Moderate</strong>, or <strong style={{ color: '#ef4444' }}>Challenging</strong></li>
                  <li style={{ marginBottom: '4px' }}>Cards you find easy appear less frequently</li>
                  <li style={{ marginBottom: '4px' }}>Challenging cards appear more often</li>
                  <li>This optimizes your study time on what you need most</li>
                </ul>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong>Review intervals:</strong>
                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                  <li style={{ marginBottom: '4px' }}><strong style={{ color: '#ef4444' }}>Challenging:</strong> {plugin?.settings?.spacedRepetition?.challengingDays || 0} days</li>
                  <li style={{ marginBottom: '4px' }}><strong style={{ color: '#f59e0b' }}>Moderate:</strong> {plugin?.settings?.spacedRepetition?.moderateDays || 1} days</li>
                  <li><strong style={{ color: '#22c55e' }}>Easy:</strong> {plugin?.settings?.spacedRepetition?.easyDays || 3} days</li>
                </ul>
              </div>

              <p style={{ 
                fontSize: '13px', 
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                marginBottom: 0
              }}>
                💡 You can customize these intervals in the plugin settings.
              </p>
            </div>

            <div style={{
              marginTop: '20px',
              textAlign: 'center'
            }}>
              <button
                onClick={() => setShowSpacedRepetitionHelp(false)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: 'var(--interactive-accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 