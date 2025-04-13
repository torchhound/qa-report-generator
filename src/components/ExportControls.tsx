import { useState } from 'react';
import { ReportState, ContentItem } from '../types';

interface ExportControlsProps {
  reportState: ReportState;
  onClearAll: () => void;
}

export function ExportControls({ reportState, onClearAll }: ExportControlsProps) {
  const [exporting, setExporting] = useState(false);

  const exportToHTML = () => {
    try {
      setExporting(true);
      
      // Generate HTML content
      const htmlContent = generateHTML(reportState);
      
      // Create a blob and download it
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportState.reportTitle || 'qa-report'}.html`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExporting(false);
        alert('Report exported successfully!');
      }, 100);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. See console for details.');
      setExporting(false);
    }
  };
  
  const clearAll = () => {
    if (confirm('Are you sure you want to clear all report data? This cannot be undone.')) {
      onClearAll();
    }
  };
  
  return (
    <div className="export-controls">
      <button 
        onClick={exportToHTML} 
        disabled={exporting || reportState.entries.length === 0}
        className="export-btn"
      >
        {exporting ? 'Exporting...' : 'Export to HTML'}
      </button>
      
      <button 
        onClick={clearAll} 
        disabled={exporting}
        className="clear-btn"
      >
        Clear All
      </button>
    </div>
  );
}

function generateHTML(reportState: ReportState): string {
  const entriesHTML = reportState.entries.map((entry, index) => {
    // Generate HTML for each content item
    const contentItemsHTML = entry.contentItems
      .sort((a, b) => a.order - b.order) // Sort by order
      .map(item => {
        if (item.type === 'text') {
          // Text content
          return `<div class="content-text">${item.content.replace(/\n/g, '<br>')}</div>`;
        } else if (item.type === 'image') {
          // Image content
          return `<div class="content-image"><img src="${item.content}" alt="Content Image"></div>`;
        }
        return '';
      }).join('\n');

    return `
    <div id="entry-${entry.id}" class="report-entry">
      <h2>${index + 3}. ${entry.title}</h2>
      <div class="entry-meta">
        <span class="classification classification-${entry.classification}">${entry.classification}</span>
        <span class="timestamp">${new Date(entry.timestamp).toLocaleString()}</span>
      </div>
      <div class="content-items">
        ${contentItemsHTML}
      </div>
    </div>
  `;
  }).join('');
  
  const tocItems = reportState.entries.map((entry, index) => `
    <li><a href="#entry-${entry.id}" class="toc-${entry.classification}">${index + 3}. <span class="toc-tag">[${entry.classification}]</span> ${entry.title}</a></li>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${reportState.reportTitle || 'QA Report'}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }
        .title-page {
          text-align: center;
          margin-bottom: 50px;
          page-break-after: always;
        }
        .title-page h1 {
          font-size: 28px;
          margin-bottom: 30px;
        }
        .author, .date {
          margin: 10px 0;
        }
        .introduction {
          margin-bottom: 30px;
          page-break-after: always;
        }
        .toc {
          margin-bottom: 30px;
          page-break-after: always;
        }
        .toc ul {
          list-style-type: none;
          padding: 0;
        }
        .toc li {
          margin-bottom: 8px;
          font-family: monospace;
        }
        .toc a {
          color: #0066cc;
          text-decoration: none;
          transition: color 0.2s;
        }
        .toc a:hover {
          color: #0099ff;
          text-decoration: underline;
        }
        .report-entry {
          margin-bottom: 40px;
          page-break-after: always;
        }
        .entry-meta {
          margin-bottom: 15px;
          color: #666;
        }
        .classification {
          text-transform: uppercase;
          font-weight: bold;
          margin-right: 15px;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
        }
        
        .classification-bug {
          background-color: rgba(255, 80, 80, 0.2);
          color: #ff5050;
          border: 1px solid #ff5050;
        }
        
        .classification-papercut {
          background-color: rgba(255, 200, 50, 0.2);
          color: #ffc832;
          border: 1px solid #ffc832;
        }
        
        .classification-feature {
          background-color: rgba(80, 200, 120, 0.2);
          color: #50c878;
          border: 1px solid #50c878;
        }
        
        .toc-bug {
          color: #ff5050;
        }
        
        .toc-papercut {
          color: #ffc832;
        }
        
        .toc-feature {
          color: #50c878;
        }
        
        .toc-tag {
          font-size: 0.9em;
          margin-right: 5px;
        }
        
        .entry-tag {
          font-size: 0.8em;
          padding: 2px 6px;
          border-radius: 4px;
          margin-right: 8px;
          font-weight: normal;
        }
        .content-items {
          margin: 20px 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .content-text {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          border: 1px solid #eee;
          line-height: 1.6;
        }
        .content-image {
          margin: 10px 0;
        }
        .content-image img {
          max-width: 100%;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        @media print {
          body {
            font-size: 12pt;
          }
          .page-break {
            page-break-after: always;
          }
        }
      </style>
    </head>
    <body>
      <div id="title-page" class="title-page">
        <h1>${reportState.reportTitle || 'QA Report'}</h1>
        ${reportState.author ? `<div class="author">Author: ${reportState.author}</div>` : ''}
        <div class="date">Date: ${new Date(reportState.date).toLocaleDateString()}</div>
      </div>
      
      <div id="introduction" class="introduction">
        <h2>2. Introduction</h2>
        <div class="system-info">
          <p><strong>Operating System:</strong> ${reportState.operatingSystem || 'Not specified'}</p>
          ${reportState.browser ? `<p><strong>Browser:</strong> ${reportState.browser}</p>` : ''}
          ${reportState.screenResolution ? `<p><strong>Screen Resolution:</strong> ${reportState.screenResolution}</p>` : ''}
          ${reportState.browserPlugins ? `<p><strong>Browser Plugins:</strong> ${reportState.browserPlugins}</p>` : ''}
          ${reportState.appVersion ? `<p><strong>Application Version:</strong> ${reportState.appVersion}</p>` : ''}
          ${reportState.appUrl ? `<p><strong>Application URL:</strong> ${reportState.appUrl}</p>` : ''}
        </div>
        <div class="intro-text">${reportState.introductionText.replace(/\n/g, '<br>')}</div>
      </div>
      
      <div class="toc">
        <h2>Table of Contents</h2>
        <ul>
          <li><a href="#title-page">1. Title Page</a></li>
          <li><a href="#introduction">2. Introduction</a></li>
          ${tocItems}
        </ul>
      </div>
      
      ${entriesHTML}
    </body>
    </html>
  `;
}
