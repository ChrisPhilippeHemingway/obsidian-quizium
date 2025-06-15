import React, { useMemo } from 'react';
import { QuizHistoryEntry } from '../types';

interface QuizHistoryLineChartProps {
  quizHistory: QuizHistoryEntry[];
}

interface ChartDataPoint {
  date: string;
  topic: string;
  scorePercentage: number;
  timestamp: string;
}

interface TopicLineData {
  topic: string;
  points: ChartDataPoint[];
  color: string;
}

const QuizHistoryLineChart: React.FC<QuizHistoryLineChartProps> = ({ quizHistory }) => {
  // Generate a deterministic color based on topic name
  const generateTopicColor = (topic: string): string => {
    let hash = 0;
    for (let i = 0; i < topic.length; i++) {
      hash = topic.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate HSL color with good saturation and lightness for visibility
    const hue = Math.abs(hash) % 360;
    const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
    const lightness = 45 + (Math.abs(hash) % 15); // 45-60%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Process quiz history data for the chart
  const chartData = useMemo(() => {
    if (quizHistory.length === 0) return [];

    // Group by topic and date, keeping only the latest result for each day
    const groupedData: { [topicDate: string]: ChartDataPoint } = {};
    
    quizHistory.forEach(entry => {
      // Extract date from formatted date (format: "DD MMM YYYY, HH:MM:SS")
      const dateParts = entry.formattedDate.split(', ')[0]; // Get "DD MMM YYYY"
      const date = dateParts; // Use the full date string for grouping
      const key = `${entry.topic}-${date}`;
      
      const dataPoint: ChartDataPoint = {
        date,
        topic: entry.topic,
        scorePercentage: entry.scorePercentage,
        timestamp: entry.timestamp
      };
      
      // Keep the latest timestamp for this topic-date combination
      if (!groupedData[key] || entry.timestamp > groupedData[key].timestamp) {
        groupedData[key] = dataPoint;
      }
    });

    // Group by topic
    const topicGroups: { [topic: string]: ChartDataPoint[] } = {};
    Object.values(groupedData).forEach(point => {
      if (!topicGroups[point.topic]) {
        topicGroups[point.topic] = [];
      }
      topicGroups[point.topic].push(point);
    });

    // Sort points within each topic by date
    Object.keys(topicGroups).forEach(topic => {
      topicGroups[topic].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    // Convert to TopicLineData array
    return Object.keys(topicGroups).map(topic => ({
      topic,
      points: topicGroups[topic],
      color: generateTopicColor(topic)
    })).sort((a, b) => a.topic.localeCompare(b.topic));
  }, [quizHistory]);

  // Helper function to parse date strings like "14 Jun 2025"
  const parseDate = (dateStr: string): Date => {
    // Convert "DD MMM YYYY" format to a proper date
    const parts = dateStr.split(' ');
    if (parts.length !== 3) {
      console.warn('Unexpected date format:', dateStr);
      return new Date(dateStr); // Fallback
    }
    
    const [day, month, year] = parts;
    const monthMap: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    return new Date(parseInt(year), monthMap[month] || 0, parseInt(day));
  };

  // Get date range for X-axis
  const dateRange = useMemo(() => {
    if (chartData.length === 0) return { min: new Date(), max: new Date(), dates: [] };

    const allDates = chartData.flatMap(line => line.points.map(p => parseDate(p.date)));
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDateFromData = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Extend max date by one day for better visual spacing
    const maxDate = new Date(maxDateFromData);
    maxDate.setDate(maxDate.getDate() + 1);
    
    // Generate array of unique dates for X-axis labels
    const uniqueDates = Array.from(new Set(chartData.flatMap(line => line.points.map(p => p.date))))
      .sort((a, b) => parseDate(a).getTime() - parseDate(b).getTime());

    return { min: minDate, max: maxDate, dates: uniqueDates };
  }, [chartData]);

  // Chart dimensions and scaling
  const chartWidth = 450; // Even more compact width for modal/mobile
  const chartHeight = 150; // Reduced height to half
  const padding = { top: 20, right: 30, bottom: 35, left: 40 }; // Very compact padding
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Scale functions
  const scaleX = (date: string) => {
    const dateTime = parseDate(date).getTime();
    const minTime = dateRange.min.getTime();
    const maxTime = dateRange.max.getTime();
    const range = maxTime - minTime;
    
    if (range === 0) return plotWidth / 2; // Center if only one date
    
    // Add 10% margin on each side so points don't appear at edges
    const marginPercent = 0.1;
    const availableWidth = plotWidth * (1 - 2 * marginPercent);
    const leftMargin = plotWidth * marginPercent;
    
    return leftMargin + ((dateTime - minTime) / range) * availableWidth;
  };

  const scaleY = (percentage: number) => {
    return plotHeight - (percentage / 100) * plotHeight;
  };

  // Generate path string for a line
  const generatePath = (points: ChartDataPoint[]) => {
    if (points.length === 0) return '';
    
    const pathCommands = points.map((point, index) => {
      const x = padding.left + scaleX(point.date); // Add padding.left to match circle positioning
      const y = padding.top + scaleY(point.scorePercentage); // Add padding.top to match circle positioning
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    
    return pathCommands.join(' ');
  };

  // Don't render chart if no data
  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="quizium-qhist-linechart-container">
      <div className="quizium-qhist-linechart-title">Quiz Performance Over Time</div>
      
      <div className="quizium-qhist-linechart-wrapper">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="quizium-qhist-linechart-svg"
        >
          {/* Background grid lines */}
          <g className="quizium-qhist-linechart-grid">
            {/* Horizontal grid lines for percentages */}
            {[0, 25, 50, 75, 100].map(percentage => (
              <g key={percentage}>
                <line
                  x1={padding.left}
                  y1={padding.top + scaleY(percentage)}
                  x2={padding.left + plotWidth}
                  y2={padding.top + scaleY(percentage)}
                  className="quizium-qhist-linechart-grid-line"
                />
                <text
                  x={padding.left - 5}
                  y={padding.top + scaleY(percentage)}
                  className="quizium-qhist-linechart-y-label"
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {percentage}%
                </text>
              </g>
            ))}
            
            {/* Vertical grid lines for dates */}
            {dateRange.dates.map((date, index) => (
              <g key={date}>
                <line
                  x1={padding.left + scaleX(date)}
                  y1={padding.top}
                  x2={padding.left + scaleX(date)}
                  y2={padding.top + plotHeight}
                  className="quizium-qhist-linechart-grid-line"
                />
                                                 <text
                  x={padding.left + scaleX(date)}
                  y={padding.top + plotHeight + 20}
                  className="quizium-qhist-linechart-x-label"
                  textAnchor="middle"
                  transform={`rotate(-15, ${padding.left + scaleX(date)}, ${padding.top + plotHeight + 20})`}
                >
                  {parseDate(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </text>
              </g>
            ))}
          </g>

          {/* Data lines and points */}
          <g className="quizium-qhist-linechart-data">
            {chartData.map(lineData => (
              <g key={lineData.topic}>
                {/* Draw line if more than one point */}
                {lineData.points.length > 1 && (
                  <path
                    d={generatePath(lineData.points)}
                    fill="none"
                    stroke={lineData.color}
                    strokeWidth="2"
                    className="quizium-qhist-linechart-line"
                  />
                )}
                
                {/* Draw points */}
                {lineData.points.map((point, pointIndex) => (
                  <circle
                    key={pointIndex}
                    cx={padding.left + scaleX(point.date)}
                    cy={padding.top + scaleY(point.scorePercentage)}
                    r={lineData.points.length === 1 ? 6 : 4} // Larger for single points
                    fill={lineData.color}
                    stroke={lineData.points.length === 1 ? '#ffffff' : 'none'}
                    strokeWidth={lineData.points.length === 1 ? 2 : 0}
                    className="quizium-qhist-linechart-point"
                  >
                                         <title>{`${lineData.topic}: ${point.scorePercentage}% on ${parseDate(point.date).toLocaleDateString()}`}</title>
                  </circle>
                ))}
              </g>
            ))}
          </g>

          {/* Chart border */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="none"
            stroke="var(--background-modifier-border)"
            strokeWidth="1"
            className="quizium-qhist-linechart-border"
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="quizium-qhist-linechart-legend">
        {chartData.map(lineData => (
          <div key={lineData.topic} className="quizium-qhist-linechart-legend-item">
            <div
              className="quizium-qhist-linechart-legend-color"
              style={{ '--legend-color': lineData.color } as React.CSSProperties}
            ></div>
            <span className="quizium-qhist-linechart-legend-label">{lineData.topic}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizHistoryLineChart; 