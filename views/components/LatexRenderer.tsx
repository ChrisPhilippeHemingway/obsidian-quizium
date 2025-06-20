import React from 'react';
import katex from 'katex';

interface LatexRendererProps {
  children: string;
  className?: string;
}

/**
 * Component that renders LaTeX formulas using KaTeX.
 * Supports both inline math ($...$) and display math ($$...$$) syntax.
 * 
 * @param props - Component props
 * @param props.children - The text content that may contain LaTeX formulas
 * @param props.className - Optional CSS class name to apply to the container
 * @returns JSX element with LaTeX formulas rendered
 */
export const LatexRenderer: React.FC<LatexRendererProps> = ({ children, className = '' }) => {
  const renderLatex = (text: string): React.ReactNode[] => {
    if (!text) return [text];

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let key = 0;

    // Regular expression to match LaTeX formulas
    // Matches $$...$$, $...$ but avoids matching $ in the middle of words
    const latexRegex = /(\$\$[^$]*?\$\$|\$[^$\s](?:[^$]*?[^$\s])?\$)/g;
    
    let match;
    while ((match = latexRegex.exec(text)) !== null) {
      const [fullMatch] = match;
      const matchStart = match.index;
      
      // Add text before the match
      if (matchStart > lastIndex) {
        const beforeText = text.slice(lastIndex, matchStart);
        if (beforeText) {
          elements.push(beforeText);
        }
      }
      
      // Process the LaTeX match
      const isDisplayMode = fullMatch.startsWith('$$');
      const latexContent = isDisplayMode 
        ? fullMatch.slice(2, -2).trim() // Remove $$ from both ends
        : fullMatch.slice(1, -1).trim(); // Remove $ from both ends
      
      if (latexContent) {
        try {
          const html = katex.renderToString(latexContent, {
            displayMode: isDisplayMode,
            throwOnError: false,
            errorColor: '#cc0000',
            strict: false,
            trust: false,
            macros: {
              "\\RR": "\\mathbb{R}",
              "\\NN": "\\mathbb{N}",
              "\\ZZ": "\\mathbb{Z}",
              "\\QQ": "\\mathbb{Q}",
              "\\CC": "\\mathbb{C}",
            }
          });
          
          elements.push(
            <span
              key={key++}
              dangerouslySetInnerHTML={{ __html: html }}
              className={isDisplayMode ? 'katex-display-block' : 'katex-inline'}
            />
          );
        } catch (error) {
          // If rendering fails, show the original LaTeX code with error styling
          elements.push(
            <span key={key++} className="katex-error" title={`LaTeX Error: ${error}`}>
              {fullMatch}
            </span>
          );
        }
      } else {
        // Empty LaTeX block, just add the original text
        elements.push(fullMatch);
      }
      
      lastIndex = matchStart + fullMatch.length;
    }
    
    // Add remaining text after last match
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText) {
        elements.push(remainingText);
      }
    }
    
    // If no matches were found, return the original text
    if (elements.length === 0) {
      return [text];
    }
    
    return elements;
  };

  const renderedContent = renderLatex(children);
  
  return (
    <span className={`latex-renderer ${className}`.trim()}>
      {renderedContent.map((element, index) => (
        <React.Fragment key={index}>{element}</React.Fragment>
      ))}
    </span>
  );
}; 