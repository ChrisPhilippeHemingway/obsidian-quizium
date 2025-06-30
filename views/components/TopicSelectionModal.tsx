import React, { useState, useEffect } from 'react';
import { MonitoredTopic } from '../../main';
import { TopicDifficultyStats } from '../../FlashcardService';

interface TopicSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (selectedTopics: string[], cardSize: 'small' | 'big') => void;
  monitoredTopics: MonitoredTopic[];
  topicDifficultyStats: TopicDifficultyStats[];
  isGenerating: boolean;
  generationProgress?: {
    currentCard: number;
    totalCards: number;
    currentPage: number;
    totalPages: number;
    stage: 'questions' | 'answers' | 'saving';
  };
}

export const TopicSelectionModal: React.FC<TopicSelectionModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  monitoredTopics,
  topicDifficultyStats,
  isGenerating,
  generationProgress
}) => {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [cardSize, setCardSize] = useState<'small' | 'big'>('big'); // Default to big cards

  // Initialize with all topics selected
  useEffect(() => {
    if (isOpen && topicDifficultyStats.length > 0) {
      setSelectedTopics(topicDifficultyStats.map(stat => stat.topicName));
    }
  }, [isOpen, topicDifficultyStats]);

  const handleTopicToggle = (topicName: string) => {
    setSelectedTopics(prev => 
      prev.includes(topicName)
        ? prev.filter(name => name !== topicName)
        : [...prev, topicName]
    );
  };

  const handleSelectAll = () => {
    setSelectedTopics(topicDifficultyStats.map(stat => stat.topicName));
  };

  const handleSelectNone = () => {
    setSelectedTopics([]);
  };

  const handleGenerate = () => {
    onGenerate(selectedTopics, cardSize);
  };

  const getTotalFlashcards = () => {
    return topicDifficultyStats
      .filter(stat => selectedTopics.includes(stat.topicName))
      .reduce((sum, stat) => sum + stat.total, 0);
  };

  const getEstimatedTime = (cardCount: number) => {
    // Estimate ~2-3 seconds per image (2 images per card: question + answer)
    const totalImages = cardCount * 2;
    const estimatedSeconds = totalImages * 2.5;
    const minutes = Math.ceil(estimatedSeconds / 60);
    
    if (minutes < 2) return "under 2 minutes";
    if (minutes <= 5) return `${minutes} minutes`;
    
    // For longer estimates, show a range
    const lowerBound = Math.floor(minutes / 5) * 5;
    const upperBound = Math.ceil(minutes / 5) * 5;
    
    if (lowerBound === upperBound) {
      return `${minutes} minutes`;
    } else {
      return `${minutes} minutes (${lowerBound}-${upperBound} minutes)`;
    }
  };

  const renderProgressBar = () => {
    if (!isGenerating || !generationProgress) return null;

    const { currentCard, totalCards, currentPage, totalPages, stage } = generationProgress;
    const overallProgress = ((currentCard) / totalCards) * 100;
    
    let stageText = '';
    switch (stage) {
      case 'questions':
        stageText = `Generating question images (Page ${currentPage}/${totalPages})`;
        break;
      case 'answers':
        stageText = `Generating answer images (Page ${currentPage}/${totalPages})`;
        break;
      case 'saving':
        stageText = 'Saving PDF to vault...';
        break;
    }

    return (
      <div className="quizium-topic-selection-modal-progress">
        <div className="quizium-topic-selection-modal-progress-header">
          <span className="quizium-topic-selection-modal-progress-stage">{stageText}</span>
          <span className="quizium-topic-selection-modal-progress-counter">
            {currentCard}/{totalCards} images
          </span>
        </div>
        <div className="quizium-topic-selection-modal-progress-bar">
          <div 
            className="quizium-topic-selection-modal-progress-fill"
            style={{ '--progress-width': `${Math.min(100, Math.max(0, overallProgress))}%` } as React.CSSProperties}
          />
        </div>
        <div className="quizium-topic-selection-modal-progress-text">
          {Math.round(overallProgress)}% complete
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  const totalCards = getTotalFlashcards();
  const estimatedTime = getEstimatedTime(totalCards);

  return (
    <div className="quizium-topic-selection-modal-overlay">
      <div className="quizium-topic-selection-modal">
        <div className="quizium-topic-selection-modal-header">
          <h3 className="quizium-topic-selection-modal-title">
            Select Topics for PDF Generation
          </h3>
          <button
            onClick={onClose}
            className="quizium-topic-selection-modal-close"
            disabled={isGenerating}
          >
            ×
          </button>
        </div>

        <div className="quizium-topic-selection-modal-content">
          <p className="quizium-topic-selection-modal-description">
            Choose which topics you want to include in your printable flashcard PDF.
            Selected topics will include all difficulty levels.
          </p>

          {totalCards > 0 && !isGenerating && (
            <div className="quizium-topic-selection-modal-time-estimate">
              <div className="quizium-topic-selection-modal-time-estimate-header">
                ⏱️ Estimated generation time: <strong>{estimatedTime}</strong>
              </div>
              <div className="quizium-topic-selection-modal-time-estimate-note">
                PDF generation creates 2 high-quality images per flashcard (question + answer) with perfect LaTeX rendering.
                {totalCards > 50 && ' This may take several minutes - please be patient!'}
              </div>
            </div>
          )}

          {isGenerating && renderProgressBar()}

          <div className="quizium-topic-selection-modal-card-size">
            <h4 className="quizium-topic-selection-modal-card-size-title">Card Size</h4>
            <div className="quizium-topic-selection-modal-card-size-options">
              <label className="quizium-topic-selection-modal-card-size-option">
                <input
                  type="radio"
                  name="cardSize"
                  value="big"
                  checked={cardSize === 'big'}
                  onChange={(e) => setCardSize(e.target.value as 'small' | 'big')}
                  disabled={isGenerating}
                  className="quizium-topic-selection-modal-radio"
                />
                <div className="quizium-topic-selection-modal-card-size-info">
                  <div className="quizium-topic-selection-modal-card-size-name">Big Cards (Recommended)</div>
                  <div className="quizium-topic-selection-modal-card-size-desc">4 columns × 5 rows (20 cards per page)</div>
                </div>
              </label>
              <label className="quizium-topic-selection-modal-card-size-option">
                <input
                  type="radio"
                  name="cardSize"
                  value="small"
                  checked={cardSize === 'small'}
                  onChange={(e) => setCardSize(e.target.value as 'small' | 'big')}
                  disabled={isGenerating}
                  className="quizium-topic-selection-modal-radio"
                />
                <div className="quizium-topic-selection-modal-card-size-info">
                  <div className="quizium-topic-selection-modal-card-size-name">Small Cards</div>
                  <div className="quizium-topic-selection-modal-card-size-desc">6 columns × 10 rows (60 cards per page)</div>
                </div>
              </label>
            </div>
          </div>

          <div className="quizium-topic-selection-modal-controls">
            <button
              onClick={handleSelectAll}
              className="quizium-topic-selection-control-button"
              disabled={isGenerating}
            >
              Select All
            </button>
            <button
              onClick={handleSelectNone}
              className="quizium-topic-selection-control-button"
              disabled={isGenerating}
            >
              Select None
            </button>
          </div>

          <div className="quizium-topic-selection-modal-list">
            {topicDifficultyStats.map((stat, index) => (
              <label key={index} className="quizium-topic-selection-modal-item">
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(stat.topicName)}
                  onChange={() => handleTopicToggle(stat.topicName)}
                  disabled={isGenerating}
                  className="quizium-topic-selection-modal-checkbox"
                />
                <div className="quizium-topic-selection-modal-item-info">
                  <div className="quizium-topic-selection-modal-item-name">
                    {stat.topicName}
                  </div>
                  <div className="quizium-topic-selection-modal-item-count">
                    {stat.total} flashcard{stat.total === 1 ? '' : 's'}
                    {stat.total > 0 && (
                      <span className="quizium-topic-selection-modal-item-breakdown">
                        ({stat.easy} easy, {stat.moderate} moderate, {stat.challenging} challenging, {stat.unrated} unrated)
                      </span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {selectedTopics.length === 0 && (
            <div className="quizium-topic-selection-modal-warning">
              Please select at least one topic to generate a PDF.
            </div>
          )}

          <div className="quizium-topic-selection-modal-summary">
            <strong>Selected: {selectedTopics.length} topic{selectedTopics.length === 1 ? '' : 's'}</strong>
            <br />
            <strong>Total flashcards: {getTotalFlashcards()}</strong>
          </div>
        </div>

        <div className="quizium-topic-selection-modal-footer">
          <button
            onClick={onClose}
            className="quizium-topic-selection-modal-button quizium-topic-selection-modal-button-cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="quizium-topic-selection-modal-button quizium-topic-selection-modal-button-generate"
            disabled={isGenerating || selectedTopics.length === 0}
          >
            {isGenerating 
              ? generationProgress 
                ? `Generating... (${Math.round(((generationProgress.currentCard) / generationProgress.totalCards) * 100)}%)`
                : 'Generating...'
              : `Generate ${cardSize === 'big' ? 'Big' : 'Small'} Cards PDF (${getTotalFlashcards()} cards)`
            }
          </button>
        </div>
      </div>
    </div>
  );
}; 