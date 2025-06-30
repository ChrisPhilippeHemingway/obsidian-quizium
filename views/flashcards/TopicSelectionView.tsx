import React, { useState } from 'react';
import { TopicDifficultyStats } from '../../FlashcardService';
import { MonitoredTopic } from '../../main';
import { topicSelectionStyles, topicSelectionHoverEffects, getDifficultyButtonStyle, getUnclassifiedButtonStyle, getSecondaryButtonStyle } from './topic-selection-styles';
import { commonStyles } from '../shared-styles';
import { PdfGenerationService } from '../../services/PdfGenerationService';
import { TopicSelectionModal } from '../components/TopicSelectionModal';

interface TopicSelectionViewProps {
  loading: boolean;
  totalFlashcards: number;
  topicDifficultyStats: TopicDifficultyStats[];
  monitoredTopics: MonitoredTopic[];
  startFlashcards: (topic: string | null, difficulty: 'easy' | 'moderate' | 'challenging' | 'unrated' | 'all') => void;
  pdfGenerationService?: PdfGenerationService;
}

export const TopicSelectionView: React.FC<TopicSelectionViewProps> = ({
  loading,
  totalFlashcards,
  topicDifficultyStats,
  monitoredTopics,
  startFlashcards,
  pdfGenerationService
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfMessage, setPdfMessage] = useState<string>('');
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{
    currentCard: number;
    totalCards: number;
    currentPage: number;
    totalPages: number;
    stage: 'questions' | 'answers' | 'saving';
  } | undefined>(undefined);

  const handlePrintClick = () => {
    setShowTopicModal(true);
  };

  const handleModalClose = () => {
    setShowTopicModal(false);
  };

  const handleGeneratePDF = async (selectedTopics: string[], cardSize: 'small' | 'big') => {
    if (!pdfGenerationService) {
      setPdfMessage('PDF generation service not available');
      setTimeout(() => setPdfMessage(''), 3000);
      return;
    }

    setIsGeneratingPDF(true);
    setPdfMessage('');
    setGenerationProgress(undefined);

    // Throttle progress updates to prevent overwhelming React
    let lastProgressUpdate = 0;
    const progressThrottleMs = 200; // Update at most every 200ms

    try {
      const result = await pdfGenerationService.generateFlashcardsPDF(
        selectedTopics,
        cardSize,
        (progress) => {
          const now = Date.now();
          if (now - lastProgressUpdate >= progressThrottleMs) {
            setGenerationProgress(progress);
            lastProgressUpdate = now;
          }
        }
      );
      
      if (result.success) {
        const topicText = selectedTopics.length === topicDifficultyStats.length 
          ? 'all topics' 
          : selectedTopics.length === 1 
            ? `topic "${selectedTopics[0]}"` 
            : `${selectedTopics.length} selected topics`;
        setPdfMessage(`Printable PDF document has been created for ${topicText}: ${result.filename}`);
        setShowTopicModal(false);
      } else {
        setPdfMessage(`Error: ${result.error}`);
      }
    } catch (err) {
      setPdfMessage('Error generating PDF: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsGeneratingPDF(false);
      setGenerationProgress(undefined);
      setTimeout(() => setPdfMessage(''), 5000);
    }
  };

  if (loading) {
    return (
      <div style={commonStyles.loadingState}>
        Loading flashcards...
      </div>
    );
  }

  if (totalFlashcards === 0) {
    return (
      <div style={topicSelectionStyles.emptyState}>
        No flashcards available
      </div>
    );
  }

  const totalUnrated = topicDifficultyStats.reduce((sum, stat) => sum + stat.unrated, 0);

  return (
    <>
      <div style={topicSelectionStyles.container}>
        <div style={topicSelectionStyles.header}>
          <h2 style={topicSelectionStyles.title}>Select Topic & Difficulty</h2>
          <button
            onClick={handlePrintClick}
            disabled={isGeneratingPDF}
            style={topicSelectionStyles.printButton}
            className="quizium-print-button-hover"
            title="Generate PDF for printing"
          >
            {isGeneratingPDF ? '⏳' : '🖨️'}
          </button>
        </div>

        {pdfMessage && (
          <div style={topicSelectionStyles.pdfMessage}>
            {pdfMessage}
          </div>
        )}
        
        <p style={topicSelectionStyles.description}>
          Choose a topic and difficulty level to start your flashcard session.
        </p>

        {/* All Topics Section */}
        <div style={topicSelectionStyles.allTopicsContainer}>
          <div style={topicSelectionStyles.topicHeader}>
            <div style={topicSelectionStyles.topicTitle}>
              All Topics
            </div>
            <div style={topicSelectionStyles.topicCount}>
              {totalFlashcards} flashcard{totalFlashcards === 1 ? '' : 's'} available
            </div>
          </div>

          <div style={topicSelectionStyles.difficultySection}>
            <div style={topicSelectionStyles.difficultyButtonsContainer}>
              <button
                onClick={() => startFlashcards('all', 'easy')}
                disabled={topicDifficultyStats.reduce((sum, stat) => sum + stat.easy, 0) === 0}
                style={getDifficultyButtonStyle(topicDifficultyStats.reduce((sum, stat) => sum + stat.easy, 0), '#22c55e', '#16a34a')}
                className="quizium-difficulty-easy-hover"
              >
                Easy ({topicDifficultyStats.reduce((sum, stat) => sum + stat.easy, 0)})
              </button>
              <button
                onClick={() => startFlashcards('all', 'moderate')}
                disabled={topicDifficultyStats.reduce((sum, stat) => sum + stat.moderate, 0) === 0}
                style={getDifficultyButtonStyle(topicDifficultyStats.reduce((sum, stat) => sum + stat.moderate, 0), '#3b82f6', '#1d4ed8')}
                className="quizium-difficulty-moderate-hover"
              >
                Moderate ({topicDifficultyStats.reduce((sum, stat) => sum + stat.moderate, 0)})
              </button>
              <button
                onClick={() => startFlashcards('all', 'challenging')}
                disabled={topicDifficultyStats.reduce((sum, stat) => sum + stat.challenging, 0) === 0}
                style={getDifficultyButtonStyle(topicDifficultyStats.reduce((sum, stat) => sum + stat.challenging, 0), '#ef4444', '#dc2626')}
                className="quizium-difficulty-challenging-hover"
              >
                Challenging ({topicDifficultyStats.reduce((sum, stat) => sum + stat.challenging, 0)})
              </button>
            </div>
          </div>

          <div style={topicSelectionStyles.otherButtonsContainer}>
            <button
              onClick={() => startFlashcards('all', 'unrated')}
              disabled={totalUnrated === 0}
              style={getUnclassifiedButtonStyle(totalUnrated)}
              className={(() => {
                const totalClassified = topicDifficultyStats.reduce((sum, stat) => sum + stat.easy + stat.moderate + stat.challenging, 0);
                const shouldBeBlue = totalClassified === 0;
                return shouldBeBlue ? 'quizium-unrated-button-blue-hover' : 'quizium-unrated-button-gray-hover';
              })()}
            >
              Not reviewed ({totalUnrated})
            </button>
            <button
              onClick={() => startFlashcards('all', 'all')}
              style={getSecondaryButtonStyle(totalFlashcards)}
              className="quizium-secondary-button-hover"
            >
              All ({totalFlashcards})
            </button>
          </div>
        </div>

        {/* Individual Topics */}
        {topicDifficultyStats.map((stat, index) => (
          <div key={index} style={topicSelectionStyles.topicContainer}>
            <div style={topicSelectionStyles.topicHeader}>
              <div style={topicSelectionStyles.topicTitle}>
                {stat.topicName}
              </div>
              <div style={topicSelectionStyles.topicCount}>
                {stat.total} flashcard{stat.total === 1 ? '' : 's'} available
              </div>
            </div>

            <div style={topicSelectionStyles.difficultySection}>
              <div style={topicSelectionStyles.difficultyButtonsContainer}>
                <button
                  onClick={() => startFlashcards(stat.topicName, 'easy')}
                  disabled={stat.easy === 0}
                  style={getDifficultyButtonStyle(stat.easy, '#22c55e', '#16a34a')}
                  className="quizium-difficulty-easy-hover"
                >
                  Easy ({stat.easy})
                </button>
                <button
                  onClick={() => startFlashcards(stat.topicName, 'moderate')}
                  disabled={stat.moderate === 0}
                  style={getDifficultyButtonStyle(stat.moderate, '#3b82f6', '#1d4ed8')}
                  className="quizium-difficulty-moderate-hover"
                >
                  Moderate ({stat.moderate})
                </button>
                <button
                  onClick={() => startFlashcards(stat.topicName, 'challenging')}
                  disabled={stat.challenging === 0}
                  style={getDifficultyButtonStyle(stat.challenging, '#ef4444', '#dc2626')}
                  className="quizium-difficulty-challenging-hover"
                >
                  Challenging ({stat.challenging})
                </button>
              </div>
            </div>

            <div style={topicSelectionStyles.otherButtonsContainer}>
              <button
                onClick={() => startFlashcards(stat.topicName, 'unrated')}
                disabled={stat.unrated === 0}
                style={getUnclassifiedButtonStyle(stat.unrated)}
                className={(() => {
                  const totalClassified = stat.easy + stat.moderate + stat.challenging;
                  const shouldBeBlue = totalClassified === 0;
                  return shouldBeBlue ? 'quizium-unrated-button-blue-hover' : 'quizium-unrated-button-gray-hover';
                })()}
              >
                Not reviewed ({stat.unrated})
              </button>
              <button
                onClick={() => startFlashcards(stat.topicName, 'all')}
                style={getSecondaryButtonStyle(stat.total)}
                className="quizium-secondary-button-hover"
              >
                All ({stat.total})
              </button>
            </div>
          </div>
        ))}
      </div>

      <TopicSelectionModal
        isOpen={showTopicModal}
        onClose={handleModalClose}
        onGenerate={handleGeneratePDF}
        monitoredTopics={monitoredTopics}
        topicDifficultyStats={topicDifficultyStats}
        isGenerating={isGeneratingPDF}
        generationProgress={generationProgress}
      />
    </>
  );
}; 