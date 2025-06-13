import React from 'react';
import { TopicStats } from '../../FlashcardService';
import { topicBreakdownStyles } from './topic-breakdown-styles';

interface TopicBreakdownViewProps {
  showTopicBreakdown: boolean;
  topicStats: TopicStats[];
  quizTopicStats: TopicStats[];
}

export const TopicBreakdownView: React.FC<TopicBreakdownViewProps> = ({
  showTopicBreakdown,
  topicStats,
  quizTopicStats
}) => {
  if (!showTopicBreakdown) return null;

  return (
    <div style={topicBreakdownStyles.container}>
      <div style={topicBreakdownStyles.sectionTitle}>
        📚 Flashcards by Topic
      </div>
      
      <div style={topicBreakdownStyles.section}>
        <div style={topicBreakdownStyles.subsectionTitle}>
          Flashcards:
        </div>
        {topicStats.map((stat, index) => (
          <div key={index} style={topicBreakdownStyles.topicItem}>
            <span style={topicBreakdownStyles.topicName}>{stat.topicName}:</span>
            <span style={topicBreakdownStyles.topicCount}>{stat.count}</span>
          </div>
        ))}
      </div>

      <div style={topicBreakdownStyles.section}>
        <div style={topicBreakdownStyles.subsectionTitle}>
          Quiz Questions:
        </div>
        {quizTopicStats.map((stat, index) => (
          <div key={index} style={topicBreakdownStyles.topicItem}>
            <span style={topicBreakdownStyles.topicName}>{stat.topicName}:</span>
            <span style={topicBreakdownStyles.topicCount}>{stat.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 