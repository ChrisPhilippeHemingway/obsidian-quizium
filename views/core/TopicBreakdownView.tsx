import React from 'react';
import { TopicStats } from '../types';

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
    <div style={{
      position: 'absolute',
      top: '35px',
      right: '0px',
      backgroundColor: 'var(--background-primary)',
      border: '1px solid var(--background-modifier-border)',
      borderRadius: '8px',
      padding: '12px',
      minWidth: '250px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 1000
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '13px' }}>
        Per-Topic Breakdown:
      </div>
      
      {/* Flashcards breakdown */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontWeight: '600', fontSize: '12px', color: '#666', marginBottom: '6px' }}>
          📚 Flashcards:
        </div>
        {topicStats.map((stat, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '3px',
            fontSize: '12px',
            paddingLeft: '8px'
          }}>
            <span style={{ color: '#888' }}>{stat.topicName}:</span>
            <span>{stat.count}</span>
          </div>
        ))}
      </div>

      {/* Quizzes breakdown */}
      <div>
        <div style={{ fontWeight: '600', fontSize: '12px', color: '#666', marginBottom: '6px' }}>
          🧠 Quizzes:
        </div>
        {quizTopicStats.map((stat, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '3px',
            fontSize: '12px',
            paddingLeft: '8px'
          }}>
            <span style={{ color: '#888' }}>{stat.topicName}:</span>
            <span>{stat.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 