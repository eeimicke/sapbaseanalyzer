/**
 * Export Utility for Markdown and Clipboard
 */

interface ExportOptions {
  serviceName: string;
  serviceCategory?: string;
  analysisDate: Date;
  citations?: string[];
  model?: string;
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
