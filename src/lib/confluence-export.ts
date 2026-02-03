/**
 * Confluence XHTML Export Utility
 * Konvertiert Markdown-Analyse zu Confluence Storage Format (XHTML)
 */

interface ExportOptions {
  serviceName: string;
  serviceCategory?: string;
  analysisDate: Date;
  citations?: string[];
  model?: string;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Convert Markdown to Confluence Storage Format (XHTML)
 */
export function markdownToConfluence(markdown: string, options: ExportOptions): string {
  const { serviceName, serviceCategory, analysisDate, citations, model } = options;
  
  let xhtml = markdown;
  
  // Convert headers (### -> h3, ## -> h2, # -> h1)
  xhtml = xhtml.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  xhtml = xhtml.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  xhtml = xhtml.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  xhtml = xhtml.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Convert bold (**text** or __text__)
  xhtml = xhtml.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  xhtml = xhtml.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Convert italic (*text* or _text_)
  xhtml = xhtml.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  xhtml = xhtml.replace(/_([^_]+)_/g, '<em>$1</em>');
  
  // Convert inline code (`code`)
  xhtml = xhtml.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Convert links [text](url)
  xhtml = xhtml.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  
  // Convert unordered lists (- item or * item)
  const listBlocks = xhtml.split(/\n\n+/);
  const processedBlocks = listBlocks.map(block => {
    const lines = block.split('\n');
    const isUnorderedList = lines.every(line => 
      line.trim() === '' || /^[-*]\s/.test(line.trim())
    );
    const isOrderedList = lines.every(line => 
      line.trim() === '' || /^\d+\.\s/.test(line.trim())
    );
    
    if (isUnorderedList && lines.some(line => /^[-*]\s/.test(line.trim()))) {
      const listItems = lines
        .filter(line => /^[-*]\s/.test(line.trim()))
        .map(line => `  <li>${line.replace(/^[-*]\s+/, '').trim()}</li>`)
        .join('\n');
      return `<ul>\n${listItems}\n</ul>`;
    }
    
    if (isOrderedList && lines.some(line => /^\d+\.\s/.test(line.trim()))) {
      const listItems = lines
        .filter(line => /^\d+\.\s/.test(line.trim()))
        .map(line => `  <li>${line.replace(/^\d+\.\s+/, '').trim()}</li>`)
        .join('\n');
      return `<ol>\n${listItems}\n</ol>`;
    }
    
    return block;
  });
  xhtml = processedBlocks.join('\n\n');
  
  // Convert remaining plain text lines to paragraphs (skip if already wrapped)
  const finalLines = xhtml.split('\n');
  const wrappedLines = finalLines.map(line => {
    const trimmed = line.trim();
    if (trimmed === '') return '';
    if (/^<[a-z]/.test(trimmed)) return line; // Already an HTML element
    if (/^[-*]\s/.test(trimmed)) return line; // List item not converted
    if (/^\d+\.\s/.test(trimmed)) return line; // Ordered list item
    return `<p>${trimmed}</p>`;
  });
  xhtml = wrappedLines.filter(line => line !== '').join('\n');
  
  // Build complete Confluence Storage Format document
  const formattedDate = analysisDate.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const confluenceDoc = `<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p><strong>SAP BTP Service:</strong> ${escapeHtml(serviceName)}</p>
    ${serviceCategory ? `<p><strong>Kategorie:</strong> ${escapeHtml(serviceCategory)}</p>` : ''}
    <p><strong>Analyse-Datum:</strong> ${formattedDate}</p>
    ${model ? `<p><strong>KI-Modell:</strong> ${escapeHtml(model)}</p>` : ''}
  </ac:rich-text-body>
</ac:structured-macro>

<ac:structured-macro ac:name="toc">
  <ac:parameter ac:name="printable">true</ac:parameter>
  <ac:parameter ac:name="style">disc</ac:parameter>
  <ac:parameter ac:name="maxLevel">3</ac:parameter>
  <ac:parameter ac:name="minLevel">1</ac:parameter>
</ac:structured-macro>

${xhtml}

${citations && citations.length > 0 ? `
<h2>Quellen</h2>
<ul>
${citations.map(url => `  <li><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></li>`).join('\n')}
</ul>
` : ''}

<ac:structured-macro ac:name="note">
  <ac:rich-text-body>
    <p>Diese Analyse wurde automatisch mit dem SAP Basis Analyzer erstellt.</p>
  </ac:rich-text-body>
</ac:structured-macro>`;

  return confluenceDoc;
}

/**
 * Download content as file
 */
export function downloadAsFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export analysis as Confluence XHTML
 */
export function exportToConfluence(
  markdownContent: string,
  serviceName: string,
  serviceCategory?: string,
  citations?: string[],
  model?: string
): void {
  const xhtml = markdownToConfluence(markdownContent, {
    serviceName,
    serviceCategory,
    analysisDate: new Date(),
    citations,
    model,
  });
  
  const safeFilename = serviceName.replace(/[^a-zA-Z0-9-_]/g, '_');
  downloadAsFile(xhtml, `${safeFilename}_Basis-Analyse.xhtml`, 'application/xhtml+xml');
}

/**
 * Export analysis as Markdown
 */
export function exportToMarkdown(
  markdownContent: string,
  serviceName: string,
  serviceCategory?: string,
  citations?: string[],
  model?: string
): void {
  const formattedDate = new Date().toLocaleDateString('de-DE');
  
  const fullMarkdown = `# SAP Basis-Analyse: ${serviceName}

> **Kategorie:** ${serviceCategory || 'N/A'}  
> **Analyse-Datum:** ${formattedDate}  
${model ? `> **KI-Modell:** ${model}\n` : ''}
---

${markdownContent}

${citations && citations.length > 0 ? `
---

## Quellen

${citations.map(url => `- ${url}`).join('\n')}
` : ''}

---
*Diese Analyse wurde automatisch mit dem SAP Basis Analyzer erstellt.*
`;
  
  const safeFilename = serviceName.replace(/[^a-zA-Z0-9-_]/g, '_');
  downloadAsFile(fullMarkdown, `${safeFilename}_Basis-Analyse.md`, 'text/markdown');
}

/**
 * Copy content to clipboard
 */
export async function copyToClipboard(content: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
