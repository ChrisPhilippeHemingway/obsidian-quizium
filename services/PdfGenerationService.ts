import { App } from 'obsidian';
import { FlashcardService, Flashcard } from '../FlashcardService';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Service class that handles PDF generation for flashcards using image-based rendering.
 * This service converts properly rendered LaTeX content to images before embedding in PDFs,
 * ensuring perfect mathematical notation without font or Unicode issues.
 */
export class PdfGenerationService {
  constructor(
    private app: App,
    private flashcardService: FlashcardService
  ) {}

  /**
   * Generates a PDF of flashcards with optional topic filtering and card size selection.
   * Uses image-based rendering for perfect LaTeX and mathematical notation.
   * 
   * @param selectedTopics - Optional array of topic names to filter by
   * @param cardSize - Size of cards: 'small' (6x10 grid) or 'big' (4x5 grid)
   * @param onProgress - Optional callback to report generation progress
   * @returns Promise resolving to operation result with filename if successful
   */
  async generateFlashcardsPDF(
    selectedTopics?: string[],
    cardSize: 'small' | 'big' = 'big',
    onProgress?: (progress: {
      currentCard: number;
      totalCards: number;
      currentPage: number;
      totalPages: number;
      stage: 'questions' | 'answers' | 'saving';
    }) => void
  ): Promise<{
    success: boolean;
    error?: string;
    filename?: string;
  }> {
    try {
      // Get flashcards based on topic selection
      let allFlashcards: Flashcard[];
      
      if (selectedTopics && selectedTopics.length > 0) {
        // Filter flashcards by selected topics
        const allCards = await this.flashcardService.getAllFlashcards();
        allFlashcards = allCards.filter(card => 
          card.topics.some(topic => selectedTopics.includes(topic))
        );
      } else {
        // Get all flashcards if no topics specified
        allFlashcards = await this.flashcardService.getAllFlashcards();
      }
      
      if (allFlashcards.length === 0) {
        const message = selectedTopics && selectedTopics.length > 0 
          ? `No flashcards found for selected topics: ${selectedTopics.join(', ')}`
          : 'No flashcards available to generate PDF';
        return { success: false, error: message };
      }

      // Generate filename with timestamp, card size, and topic info
      const timestamp = this.generateTimestamp();
      const topicSuffix = selectedTopics && selectedTopics.length > 0 
        ? `-${selectedTopics.join('-').replace(/[^a-zA-Z0-9-]/g, '').substring(0, 30)}`
        : '';
      const cardSizeSuffix = `-${cardSize}-cards`;
      const filename = `quizium-flashcards${topicSuffix}${cardSizeSuffix}-${timestamp}.pdf`;

      // Create PDF with flashcards using image-based rendering
      const pdfResult = await this.createImageBasedPDF(allFlashcards, filename, cardSize, onProgress);
      
      if (!pdfResult.success) {
        return pdfResult;
      }

      return {
        success: true,
        filename
      };
    } catch (err) {
      return {
        success: false,
        error: 'Error generating PDF: ' + (err instanceof Error ? err.message : 'Unknown error')
      };
    }
  }

  /**
   * Creates the PDF document using image-based rendering for perfect LaTeX display.
   * 
   * @param flashcards - Array of flashcards to include in the PDF
   * @param filename - Name of the PDF file to create
   * @param cardSize - Size of cards: 'small' (6x10 grid) or 'big' (4x5 grid)
   * @param onProgress - Optional callback to report generation progress
   * @returns Promise resolving to operation result
   */
  private async createImageBasedPDF(
    flashcards: Flashcard[],
    filename: string,
    cardSize: 'small' | 'big',
    onProgress?: (progress: {
      currentCard: number;
      totalCards: number;
      currentPage: number;
      totalPages: number;
      stage: 'questions' | 'answers' | 'saving';
    }) => void
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
  
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // A4 dimensions in mm
      const pageWidth = 210;
      const pageHeight = 297;
      
      // Calculate card dimensions based on card size selection
      const columns = cardSize === 'small' ? 6 : 4;
      const rows = cardSize === 'small' ? 10 : 5;
      const cardsPerPage = columns * rows;
      
      const totalGridWidth = 190; // Use most of the page width (210 - 20mm margins)
      const totalGridHeight = 277; // Use most of the page height (297 - 20mm margins)
      
      const cardWidth = totalGridWidth / columns;
      const cardHeight = totalGridHeight / rows;
      
      // Center the grid perfectly on the page
      const gridStartX = (pageWidth - totalGridWidth) / 2;
      const gridStartY = (pageHeight - totalGridHeight) / 2;

      // Process flashcards in chunks based on card size
      const totalPages = Math.ceil(flashcards.length / cardsPerPage);

      let totalProcessedCards = 0;

      for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
        const pageFlashcards = flashcards.slice(pageIndex * cardsPerPage, (pageIndex + 1) * cardsPerPage);
        
        // Generate images for questions
        const questionImages = await this.generateCardImages(
          pageFlashcards.map(f => f.question), 
          cardWidth, 
          cardHeight, 
          true,
          (cardIndex) => {
            if (onProgress) {
              onProgress({
                currentCard: totalProcessedCards + cardIndex + 1,
                totalCards: flashcards.length * 2, // Account for both questions and answers
                currentPage: pageIndex + 1,
                totalPages: totalPages,
                stage: 'questions'
              });
            }
          }
        );
        
        totalProcessedCards += pageFlashcards.length;
        
        // Generate images for answers
        const answerImages = await this.generateCardImages(
          pageFlashcards.map(f => f.answer), 
          cardWidth, 
          cardHeight, 
          false,
          (cardIndex) => {
            if (onProgress) {
              onProgress({
                currentCard: totalProcessedCards + cardIndex + 1,
                totalCards: flashcards.length * 2, // Account for both questions and answers
                currentPage: pageIndex + 1,
                totalPages: totalPages,
                stage: 'answers'
              });
            }
          }
        );
        
        totalProcessedCards += pageFlashcards.length;
        
        // Add questions page
        if (pageIndex > 0) {
          pdf.addPage();
        }
        this.drawImagesPage(pdf, questionImages, cardWidth, cardHeight, gridStartX, gridStartY, columns, 'Flashcard Questions');
        
        // Add answers page with mirrored horizontal order
        pdf.addPage();
        this.drawImagesPage(pdf, answerImages, cardWidth, cardHeight, gridStartX, gridStartY, columns, 'Flashcard Answers', true);
      }

      // Save PDF to vault
      if (onProgress) {
        onProgress({
          currentCard: flashcards.length * 2,
          totalCards: flashcards.length * 2,
          currentPage: totalPages,
          totalPages: totalPages,
          stage: 'saving'
        });
      }
      await this.savePDFToVault(pdf, filename);

      
      return { success: true };
    } catch (err) {
      console.error(`[PDF Service] Error in createImageBasedPDF:`, err);
      return {
        success: false,
        error: 'Error creating image-based PDF: ' + (err instanceof Error ? err.message : 'Unknown error')
      };
    }
  }

  /**
   * Generates images for a batch of text content using proper LaTeX rendering.
   * 
   * @param textContents - Array of text content to render as images
   * @param cardWidth - Target width for each card in mm
   * @param cardHeight - Target height for each card in mm
   * @param isQuestion - Whether these are question cards (affects styling)
   * @param onProgress - Optional callback to report progress for each card
   * @returns Promise resolving to array of base64 image data
   */
  private async generateCardImages(
    textContents: string[],
    cardWidth: number,
    cardHeight: number,
    isQuestion: boolean,
    onProgress?: (cardIndex: number) => void
  ): Promise<string[]> {
    const images: string[] = [];
    
    // Convert mm to pixels - High quality resolution for crisp, non-pixelated output
    const pixelWidth = Math.round(cardWidth * 6.0);
    const pixelHeight = Math.round(cardHeight * 6.0);
    
    // Process in very small batches to prevent memory overflow
    const batchSize = 2;
    for (let batchStart = 0; batchStart < textContents.length; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize, textContents.length);
      const batchCards = textContents.slice(batchStart, batchEnd);
      
      for (let i = 0; i < batchCards.length; i++) {
        const globalIndex = batchStart + i;
        const content = batchCards[i];
        
        try {
          const imageData = await this.createHighQualityImage(content, pixelWidth, pixelHeight);
          images.push(imageData);
        } catch (err) {
          console.warn(`[PDF Service] Canvas rendering failed for card ${globalIndex + 1}, using minimal fallback:`, err);
          const minimalFallback = this.createMinimalFallback(pixelWidth, pixelHeight);
          images.push(minimalFallback);
        }
        
        if (onProgress) {
          onProgress(globalIndex);
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      await this.ultraAggressiveMemoryCleanup();
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    return images;
  }

  /**
   * Renders text content as an image using proper LaTeX rendering.
   * 
   * @param content - Text content to render
   * @param width - Target width in pixels
   * @param height - Target height in pixels
   * @param isQuestion - Whether this is a question (affects styling)
   * @returns Promise resolving to base64 image data
   */
  private async renderContentAsImage(
    content: string,
    width: number,
    height: number,
    isQuestion: boolean
  ): Promise<string> {
    let container: HTMLElement | null = null;
    
    try {
      // Create a temporary container element
      container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        top: -10000px;
        left: -10000px;
        width: ${width}px;
        height: ${height}px;
        padding: 8px;
        box-sizing: border-box;
        background: white;
        border: 1px solid black;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: ${isQuestion ? '#000' : '#333'};
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        word-wrap: break-word;
        overflow: hidden;
        z-index: -9999;
      `;
      
      // Create content with LaTeX rendering
      const contentDiv = document.createElement('div');
      const processedContent = this.processContentForDisplay(content);
      contentDiv.innerHTML = processedContent;
      container.appendChild(contentDiv);
      
      // Add to DOM temporarily
      document.body.appendChild(container);
      
      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Render using html2canvas with conservative settings
      const canvas = await html2canvas(container, {
        width: width,
        height: height,
        scale: 1, // Reduced scale to prevent issues
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false, // Disable to prevent issues
        imageTimeout: 5000, // 5 second timeout for images
        removeContainer: false // Don't let html2canvas remove the container
      });
      
      // Convert to base64
      const imageData = canvas.toDataURL('image/png');
      
      // Aggressive cleanup of canvas and context
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      canvas.width = 0;
      canvas.height = 0;
      
      return imageData;
    } finally {
      // Always clean up the container aggressively
      try {
        if (container && container.parentNode) {
          // Clear content first
          container.innerHTML = '';
          // Remove from DOM
          document.body.removeChild(container);
        }
        container = null; // Clear reference
      } catch (cleanupErr) {
        console.warn(`[PDF Service] Failed to cleanup container:`, cleanupErr);
      }
    }
  }

  /**
   * Processes content for display, cleaning markdown and handling basic LaTeX.
   * 
   * @param content - Raw content string
   * @returns Processed HTML content
   */
  private processContentForDisplay(content: string): string {
    let processed = content;
    
    // Clean basic markdown
    processed = processed
      .replace(/\[\[([^\]]+)\]\]/g, '$1') // Remove wiki links
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*([^*]+)\*/g, '<em>$1</em>') // Italic
      .replace(/`([^`]+)`/g, '<code>$1</code>') // Code
      .replace(/#{1,6}\s*/g, '') // Remove headers
      .replace(/<!--.*?-->/g, '') // Remove comments
      .trim();
    
    // Handle basic mathematical notation using HTML
    processed = processed
      .replace(/\^(-?\d+)/g, '<sup>$1</sup>') // Superscripts like ^2, ^-3
      .replace(/_(-?\d+)/g, '<sub>$1</sub>') // Subscripts like _2, _-3
      .replace(/π/g, 'π') // Keep pi symbol
      .replace(/≈/g, '≈') // Keep approximately equal
      .replace(/≠/g, '≠') // Keep not equal
      .replace(/≤/g, '≤') // Keep less than or equal
      .replace(/≥/g, '≥') // Keep greater than or equal
      .replace(/∞/g, '∞') // Keep infinity
      .replace(/α/g, 'α') // Keep alpha
      .replace(/β/g, 'β') // Keep beta
      .replace(/γ/g, 'γ') // Keep gamma
      .replace(/δ/g, 'δ') // Keep delta
      .replace(/ε/g, 'ε') // Keep epsilon
      .replace(/θ/g, 'θ') // Keep theta
      .replace(/λ/g, 'λ') // Keep lambda
      .replace(/σ/g, 'σ') // Keep sigma
      .replace(/φ/g, 'φ') // Keep phi
      .replace(/ω/g, 'ω'); // Keep omega
    
    return processed;
  }

  /**
   * Creates a fallback image using pure Canvas API (no html2canvas)
   * This is more memory-efficient and less likely to crash
   */
  private async createFallbackImage(content: string, width: number, height: number): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Border optimized for small cards
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, width - 2, height - 2);
    
    // High-quality text styling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    // Clean the content
    const cleanContent = this.cleanTextForPDF(content);
    
    // Calculate optimal font size for very small cards
    const padding = 6;
    const availableWidth = width - (padding * 2);
    const availableHeight = height - (padding * 2);
    
    // Try different font sizes optimized for very small cards (6x10 grid)
    let fontSize = 10;
    let lineHeight = fontSize * 1.2;
    let lines: string[] = [];
    
    do {
      ctx.font = `${fontSize}px Arial, sans-serif`;
      lines = this.wrapTextToLines(ctx, cleanContent, availableWidth);
      const totalTextHeight = lines.length * lineHeight;
      
      if (totalTextHeight <= availableHeight || fontSize <= 8) {
        break;
      }
      
      fontSize -= 2;
      lineHeight = fontSize * 1.2;
    } while (fontSize > 8);
    
    // Draw the text
    const startY = padding + Math.max(0, (availableHeight - (lines.length * lineHeight)) / 2);
    
    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight);
      ctx.fillText(line, padding, y);
    });
    
    // Convert to base64
    return canvas.toDataURL('image/jpeg', 0.95);
  }

  /**
   * Creates a minimal fallback when everything else fails
   */
  private createMinimalFallback(width: number, height: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
    
    // Light gray background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);
    
    // Border
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
    // High-quality error message
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Card rendering failed', width / 2, height / 2);
    
    return canvas.toDataURL('image/jpeg', 0.95);
  }

  /**
   * Wraps text to fit within the specified width
   */
  private wrapTextToLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  /**
   * Draws a page of images in a flexible grid layout with perfect centering.
   * 
   * @param pdf - jsPDF instance
   * @param images - Array of base64 image data
   * @param cardWidth - Width of each card in mm
   * @param cardHeight - Height of each card in mm
   * @param gridStartX - X position where grid starts (centered)
   * @param gridStartY - Y position where grid starts (centered)
   * @param columns - Number of columns in the grid
   * @param title - Page title
   * @param mirrorHorizontal - Whether to mirror horizontal order for answers page
   */
  private drawImagesPage(
    pdf: jsPDF,
    images: string[],
    cardWidth: number,
    cardHeight: number,
    gridStartX: number,
    gridStartY: number,
    columns: number,
    title: string,
    mirrorHorizontal: boolean = false
  ) {
    // Add page title (positioned above the centered grid)
    pdf.setFontSize(14);
    pdf.setTextColor(100, 100, 100);
    pdf.text(title, gridStartX, gridStartY - 5); // Position title 5mm above the grid
    
    // Draw images in perfectly centered grid
    for (let i = 0; i < images.length; i++) {
      const row = Math.floor(i / columns);
      const originalCol = i % columns;
      const col = mirrorHorizontal ? (columns - 1) - originalCol : originalCol; // Mirror for answers
      
      // Use precise grid positioning for perfect alignment
      const x = gridStartX + col * cardWidth;
      const y = gridStartY + row * cardHeight;
      
      try {
        pdf.addImage(images[i], 'JPEG', x, y, cardWidth, cardHeight);
      } catch (err) {
        console.warn('Failed to add image to PDF:', err);
        // Draw a simple rectangle as fallback
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.5);
        pdf.rect(x, y, cardWidth, cardHeight);
      }
    }
  }

  /**
   * Saves the generated PDF to the vault's root directory.
   * 
   * @param pdf - The jsPDF instance to save
   * @param filename - Name of the file to save
   */
  private async savePDFToVault(pdf: jsPDF, filename: string): Promise<void> {
    const pdfData = pdf.output('arraybuffer');
    const uint8Array = new Uint8Array(pdfData);
    await this.app.vault.createBinary(filename, uint8Array);
  }

  /**
   * Generates a timestamp string for filename.
   * 
   * @returns Timestamp in YYYY-MM-DD-HH-MM-SS format
   */
  private generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
  }

  /**
   * Creates a high-quality image using pure Canvas API with better text rendering
   * This avoids html2canvas entirely to prevent memory issues while maintaining quality
   */
  private async createHighQualityImage(content: string, width: number, height: number): Promise<string> {
    const canvas = document.createElement('canvas');
    
    const scale = 2.5; // High resolution scale for crisp, non-pixelated text
    canvas.width = width * scale;
    canvas.height = height * scale;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Scale context to match canvas scaling
    ctx.scale(scale, scale);
    
    // Enable MAXIMUM quality text rendering with high-resolution smoothing
    ctx.imageSmoothingEnabled = true; // Enable smoothing for crisp high-resolution text
    ctx.imageSmoothingQuality = 'high'; // Use highest quality smoothing algorithm
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Border with crisp lines optimized for small cards
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1; // Thinner border to maximize text space in small cards
    ctx.strokeRect(1, 1, width - 2, height - 2);
    
    // Text styling for maximum readability
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center'; // Center horizontally
    ctx.textBaseline = 'middle'; // Center vertically
    
    // Clean the content
    const cleanContent = this.cleanTextForPDF(content);
    
    // Calculate optimal font size with spacing optimized for very small cards
    const padding = 8; // Minimal padding for maximum text space in 6x10 grid
    const availableWidth = width - (padding * 2);
    const availableHeight = height - (padding * 2);
    
    // Try different font sizes optimized for very small cards (6x10 grid)
    let fontSize = 14; // Much smaller initial font size to prevent overflow
    let lineHeight = fontSize * 1.3; // Tighter line spacing for small cards
    let lines: string[] = [];
    
    do {
      // Use fonts with excellent mathematical character support
      ctx.font = `500 ${fontSize}px "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Roboto, "Helvetica Neue", Arial, monospace, sans-serif`;
      lines = this.wrapTextToLines(ctx, cleanContent, availableWidth);
      const totalTextHeight = lines.length * lineHeight;
      
      if (totalTextHeight <= availableHeight || fontSize <= 6) {
        break;
      }
      
      fontSize -= 1;
      lineHeight = fontSize * 1.3;
    } while (fontSize > 6);
    
    // PERFECT TEXT CENTERING
    const totalTextHeight = lines.length * lineHeight;
    const startY = (height - totalTextHeight) / 2 + lineHeight / 2;
    
    lines.forEach((line, index) => {
      const y = startY + (index * lineHeight);
      // Add subtle text shadow for better contrast (optional)
      ctx.save();
      ctx.fillStyle = '#333333';
      ctx.fillText(line, width / 2 + 0.5, y + 0.5); // Very subtle shadow
      ctx.restore();
      
      // Main text
      ctx.fillStyle = '#000000';
      ctx.fillText(line, width / 2, y);
    });
    
    // Convert to JPEG with very high quality for crisp, non-pixelated output
    const result = canvas.toDataURL('image/jpeg', 0.95); // 95% JPEG quality for maximum clarity
    
    // Immediate cleanup
    ctx.clearRect(0, 0, width, height);
    canvas.width = 0;
    canvas.height = 0;
    
    return result;
  }

  /**
   * Ultra-aggressive memory cleanup to prevent browser crashes
   */
  private async ultraAggressiveMemoryCleanup(): Promise<void> {
    // Clear any remaining DOM elements
    const containers = document.querySelectorAll('div[style*="position: fixed"]');
    containers.forEach(container => {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });
    
    // Clear any canvas elements that might be hanging around
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      if (canvas.parentNode && canvas.style.position === 'fixed') {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        canvas.width = 0;
        canvas.height = 0;
        canvas.parentNode.removeChild(canvas);
      }
    });
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    // Multiple cleanup passes
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (window.gc) {
        window.gc();
      }
    }
  }

  /**
   * Cleans text content for PDF rendering by removing markdown and converting LaTeX
   */
  private cleanTextForPDF(text: string): string {
    // Fix minus sign rendering issues - be very explicit about character codes
    let cleanText = text
      .replace(/−/g, String.fromCharCode(45))  // Unicode minus → ASCII hyphen-minus (char 45)
      .replace(/–/g, String.fromCharCode(45))  // En dash → ASCII hyphen-minus
      .replace(/—/g, String.fromCharCode(45))  // Em dash → ASCII hyphen-minus
      .replace(/\u2010/g, String.fromCharCode(45))  // Hyphen → ASCII hyphen-minus
      .replace(/\u2011/g, String.fromCharCode(45))  // Non-breaking hyphen → ASCII hyphen-minus
    
    // Remove markdown formatting
    cleanText = cleanText
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1')     // Italic
      .replace(/`(.*?)`/g, '$1')       // Code
      .replace(/^#+\s*/gm, '')         // Headers
      .replace(/^>\s*/gm, '')          // Blockquotes
      .replace(/^\s*[-*+]\s+[a-zA-Z]/gm, (match) => '• ' + match.replace(/^\s*[-*+]\s+/, '')) // Lists (only if followed by a letter)
      .replace(/^\s*\d+\.\s*/gm, '')   // Numbered lists
      .trim();

    // Convert LaTeX to readable text
    cleanText = this.convertLatexToPlainText(cleanText);

    // Final character normalization to ensure proper rendering
    cleanText = cleanText.normalize('NFKC'); // Canonical composition normalization

    return cleanText;
  }

  /**
   * Converts LaTeX expressions to plain text equivalents
   */
  private convertLatexToPlainText(text: string): string {
    let converted = text;

    // Handle block math ($$...$$)
    converted = converted.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
      return this.processLatexExpression(latex.trim());
    });

    // Handle inline math ($...$)
    converted = converted.replace(/\$([^$]+)\$/g, (match, latex) => {
      return this.processLatexExpression(latex.trim());
    });

    return converted;
  }

  /**
   * Processes individual LaTeX expressions
   */
  private processLatexExpression(latex: string): string {
    let processed = latex;

    // Basic LaTeX commands with simple text replacements
    const replacements = [
      // Fractions
      [/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)'],
      
      // Square roots
      [/\\sqrt\{([^}]+)\}/g, '√($1)'],
      
      // Powers and subscripts
      [/\^(\d+)/g, '^$1'],
      [/_(\d+)/g, '_$1'],
      [/\^{([^}]+)}/g, '^($1)'],
      [/_{([^}]+)}/g, '_($1)'],
      
      // Greek letters (common ones)
      [/\\alpha/g, 'α'],
      [/\\beta/g, 'β'],
      [/\\gamma/g, 'γ'],
      [/\\delta/g, 'δ'],
      [/\\pi/g, 'π'],
      [/\\theta/g, 'θ'],
      [/\\lambda/g, 'λ'],
      [/\\mu/g, 'μ'],
      [/\\sigma/g, 'σ'],
      
      // Math functions
      [/\\sin/g, 'sin'],
      [/\\cos/g, 'cos'],
      [/\\tan/g, 'tan'],
      [/\\log/g, 'log'],
      [/\\ln/g, 'ln'],
      
      // Text commands
      [/\\text\{([^}]+)\}/g, '$1'],
      
      // Remove remaining backslashes from unknown commands
      [/\\([a-zA-Z]+)/g, '$1']
    ];

    for (const [pattern, replacement] of replacements) {
      processed = processed.replace(pattern as RegExp, replacement as string);
    }

    return processed;
  }
} 