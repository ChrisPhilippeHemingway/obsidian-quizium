import React from 'react';
import { ViewProps, TopicDifficultyStats } from '../types';

interface TopicSelectionViewProps extends Pick<ViewProps, 'loading' | 'startFlashcards'> {
  totalFlashcards: number;
  topicDifficultyStats: TopicDifficultyStats[];
}

export const TopicSelectionView: React.FC<TopicSelectionViewProps> = ({
  loading,
  totalFlashcards,
  topicDifficultyStats,
  startFlashcards
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
        Loading topics...
      </div>
    );
  }

  const getDifficultyButtonStyle = (count: number, baseColor: string, hoverColor: string) => ({
    padding: '5px 6px',
    fontSize: '10px',
    borderRadius: '4px',
    border: 'none',
    cursor: count > 0 ? 'pointer' : 'not-allowed',
    backgroundColor: count > 0 ? baseColor : '#e5e5e5',
    color: count > 0 ? 'white' : '#999',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    opacity: count > 0 ? 1 : 0.6,
    minWidth: '55px',
    textAlign: 'center' as const,
    whiteSpace: 'nowrap' as const,
    flex: '0 0 auto'
  });

  const getSecondaryButtonStyle = (count: number) => ({
    padding: '4px 6px',
    fontSize: '9px',
    borderRadius: '4px',
    border: 'none',
    cursor: count > 0 ? 'pointer' : 'not-allowed',
    backgroundColor: count > 0 ? '#6b7280' : '#e5e5e5',
    color: count > 0 ? 'white' : '#999',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    opacity: count > 0 ? 1 : 0.6,
    minWidth: '65px',
    textAlign: 'center' as const,
    whiteSpace: 'nowrap' as const,
    flex: '0 0 auto'
  });

  const getUnclassifiedButtonStyle = (count: number) => {
    // Check if there are no classified flashcards (only unclassified ones available)
    const totalClassified = topicDifficultyStats.reduce((sum, stat) => sum + stat.easy + stat.moderate + stat.challenging, 0);
    const shouldBeBlue = count > 0 && totalClassified === 0;
    
    return {
      padding: '4px 6px',
      fontSize: '9px',
      borderRadius: '4px',
      border: 'none',
      cursor: count > 0 ? 'pointer' : 'not-allowed',
      backgroundColor: count > 0 ? (shouldBeBlue ? '#3b82f6' : '#6b7280') : '#e5e5e5',
      color: count > 0 ? 'white' : '#999',
      fontWeight: '500',
      transition: 'background-color 0.2s',
      opacity: count > 0 ? 1 : 0.6,
      minWidth: '65px',
      textAlign: 'center' as const,
      whiteSpace: 'nowrap' as const,
      flex: '0 0 auto'
    };
  };

  // Calculate total unrated count across all topics
  const totalUnrated = topicDifficultyStats.reduce((sum, stat) => sum + stat.unrated, 0);

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px', color: 'var(--text-normal)', textAlign: 'center' }}>Select Topic & Difficulty</h2>
      
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '30px', textAlign: 'center' }}>
        Choose which flashcards to study by topic and difficulty level:
      </p>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '12px', 
        marginBottom: '30px',
        maxWidth: '100%',
        margin: '0 auto'
      }}>
        {/* All Topics Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(120px, 1fr) 1fr',
          alignItems: 'start',
          padding: '15px',
          backgroundColor: 'var(--background-secondary)',
          borderRadius: '8px',
          border: '2px solid var(--background-modifier-border)',
          gap: '12px',
          minHeight: '50px'
        }}>
          {/* Topic info */}
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-normal)' }}>
              All Topics
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
              {totalFlashcards} total questions
            </div>
          </div>
          
          {/* Button area with two rows */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {/* First row - Difficulty buttons */}
            <div style={{ 
              display: 'flex',
              flexWrap: 'nowrap',
              gap: '3px',
              justifyContent: 'flex-start',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => startFlashcards('all', 'easy')}
                disabled={topicDifficultyStats.reduce((sum, stat) => sum + stat.easy, 0) === 0}
                style={getDifficultyButtonStyle(topicDifficultyStats.reduce((sum, stat) => sum + stat.easy, 0), '#22c55e', '#16a34a')}
                onMouseEnter={(e) => {
                  const totalEasy = topicDifficultyStats.reduce((sum, stat) => sum + stat.easy, 0);
                  if (totalEasy > 0) {
                    e.currentTarget.style.backgroundColor = '#16a34a';
                  }
                }}
                onMouseLeave={(e) => {
                  const totalEasy = topicDifficultyStats.reduce((sum, stat) => sum + stat.easy, 0);
                  if (totalEasy > 0) {
                    e.currentTarget.style.backgroundColor = '#22c55e';
                  }
                }}
              >
                Easy ({topicDifficultyStats.reduce((sum, stat) => sum + stat.easy, 0)})
              </button>
              
              <button
                onClick={() => startFlashcards('all', 'moderate')}
                disabled={topicDifficultyStats.reduce((sum, stat) => sum + stat.moderate, 0) === 0}
                style={getDifficultyButtonStyle(topicDifficultyStats.reduce((sum, stat) => sum + stat.moderate, 0), '#3b82f6', '#1d4ed8')}
                onMouseEnter={(e) => {
                  const totalModerate = topicDifficultyStats.reduce((sum, stat) => sum + stat.moderate, 0);
                  if (totalModerate > 0) {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  const totalModerate = topicDifficultyStats.reduce((sum, stat) => sum + stat.moderate, 0);
                  if (totalModerate > 0) {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                Moderate ({topicDifficultyStats.reduce((sum, stat) => sum + stat.moderate, 0)})
              </button>
              
              <button
                onClick={() => startFlashcards('all', 'challenging')}
                disabled={topicDifficultyStats.reduce((sum, stat) => sum + stat.challenging, 0) === 0}
                style={getDifficultyButtonStyle(topicDifficultyStats.reduce((sum, stat) => sum + stat.challenging, 0), '#ef4444', '#dc2626')}
                onMouseEnter={(e) => {
                  const totalChallenging = topicDifficultyStats.reduce((sum, stat) => sum + stat.challenging, 0);
                  if (totalChallenging > 0) {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }
                }}
                onMouseLeave={(e) => {
                  const totalChallenging = topicDifficultyStats.reduce((sum, stat) => sum + stat.challenging, 0);
                  if (totalChallenging > 0) {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                  }
                }}
              >
                Challenging ({topicDifficultyStats.reduce((sum, stat) => sum + stat.challenging, 0)})
              </button>
            </div>
            
            {/* Second row - Secondary buttons */}
            <div style={{ 
              display: 'flex',
              flexWrap: 'nowrap',
              gap: '3px',
              justifyContent: 'flex-start',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => startFlashcards('all', 'unrated')}
                disabled={totalUnrated === 0}
                style={getUnclassifiedButtonStyle(totalUnrated)}
                onMouseEnter={(e) => {
                  if (totalUnrated > 0) {
                    const totalClassified = topicDifficultyStats.reduce((sum, stat) => sum + stat.easy + stat.moderate + stat.challenging, 0);
                    const shouldBeBlue = totalClassified === 0;
                    e.currentTarget.style.backgroundColor = shouldBeBlue ? '#1d4ed8' : '#4b5563';
                  }
                }}
                onMouseLeave={(e) => {
                  if (totalUnrated > 0) {
                    const totalClassified = topicDifficultyStats.reduce((sum, stat) => sum + stat.easy + stat.moderate + stat.challenging, 0);
                    const shouldBeBlue = totalClassified === 0;
                    e.currentTarget.style.backgroundColor = shouldBeBlue ? '#3b82f6' : '#6b7280';
                  }
                }}
              >
                Not reviewed ({totalUnrated})
              </button>
              <button
                onClick={() => startFlashcards('all', 'all')}
                style={getSecondaryButtonStyle(totalFlashcards)}
                onMouseEnter={(e) => {
                  if (totalFlashcards > 0) {
                    e.currentTarget.style.backgroundColor = '#4b5563';
                  }
                }}
                onMouseLeave={(e) => {
                  if (totalFlashcards > 0) {
                    e.currentTarget.style.backgroundColor = '#6b7280';
                  }
                }}
              >
                All ({totalFlashcards})
              </button>
            </div>
          </div>
        </div>

        {/* Individual Topic Rows */}
        {topicDifficultyStats.map((stat, index) => (
          <div key={index} style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(120px, 1fr) 1fr',
            alignItems: 'start',
            padding: '15px',
            backgroundColor: 'var(--background-secondary)',
            borderRadius: '8px',
            gap: '12px',
            minHeight: '50px'
          }}>
            {/* Topic info */}
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-normal)' }}>
                {stat.topicName}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {stat.total} total questions
              </div>
            </div>
            
            {/* Button area with two rows */}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {/* First row - Difficulty buttons */}
              <div style={{ 
                display: 'flex',
                flexWrap: 'nowrap',
                gap: '3px',
                justifyContent: 'flex-start',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => startFlashcards(stat.topicName, 'easy')}
                  disabled={stat.easy === 0}
                  style={getDifficultyButtonStyle(stat.easy, '#22c55e', '#16a34a')}
                  onMouseEnter={(e) => {
                    if (stat.easy > 0) {
                      e.currentTarget.style.backgroundColor = '#16a34a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (stat.easy > 0) {
                      e.currentTarget.style.backgroundColor = '#22c55e';
                    }
                  }}
                >
                  Easy ({stat.easy})
                </button>
                
                <button
                  onClick={() => startFlashcards(stat.topicName, 'moderate')}
                  disabled={stat.moderate === 0}
                  style={getDifficultyButtonStyle(stat.moderate, '#3b82f6', '#1d4ed8')}
                  onMouseEnter={(e) => {
                    if (stat.moderate > 0) {
                      e.currentTarget.style.backgroundColor = '#1d4ed8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (stat.moderate > 0) {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                    }
                  }}
                >
                  Moderate ({stat.moderate})
                </button>
                
                <button
                  onClick={() => startFlashcards(stat.topicName, 'challenging')}
                  disabled={stat.challenging === 0}
                  style={getDifficultyButtonStyle(stat.challenging, '#ef4444', '#dc2626')}
                  onMouseEnter={(e) => {
                    if (stat.challenging > 0) {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (stat.challenging > 0) {
                      e.currentTarget.style.backgroundColor = '#ef4444';
                    }
                  }}
                >
                  Challenging ({stat.challenging})
                </button>
              </div>
              
              {/* Second row - Secondary buttons */}
              <div style={{ 
                display: 'flex',
                flexWrap: 'nowrap',
                gap: '3px',
                justifyContent: 'flex-start',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => startFlashcards(stat.topicName, 'unrated')}
                  disabled={stat.unrated === 0}
                  style={getUnclassifiedButtonStyle(stat.unrated)}
                  onMouseEnter={(e) => {
                    if (stat.unrated > 0) {
                      const totalClassified = stat.easy + stat.moderate + stat.challenging;
                      const shouldBeBlue = totalClassified === 0;
                      e.currentTarget.style.backgroundColor = shouldBeBlue ? '#1d4ed8' : '#4b5563';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (stat.unrated > 0) {
                      const totalClassified = stat.easy + stat.moderate + stat.challenging;
                      const shouldBeBlue = totalClassified === 0;
                      e.currentTarget.style.backgroundColor = shouldBeBlue ? '#3b82f6' : '#6b7280';
                    }
                  }}
                >
                  Not reviewed ({stat.unrated})
                </button>
                <button
                  onClick={() => startFlashcards(stat.topicName, 'all')}
                  style={getSecondaryButtonStyle(stat.total)}
                  onMouseEnter={(e) => {
                    if (stat.total > 0) {
                      e.currentTarget.style.backgroundColor = '#4b5563';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (stat.total > 0) {
                      e.currentTarget.style.backgroundColor = '#6b7280';
                    }
                  }}
                >
                  All ({stat.total})
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 