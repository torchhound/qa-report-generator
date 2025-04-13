import { useState, useEffect } from 'react';
import './App.css';
import { ReportState, ReportEntry, ContentItem } from './types';
import { TitlePage } from './components/TitlePage';
import { IntroductionPage } from './components/IntroductionPage';
import { ReportEntries } from './components/ReportEntries';
import { ExportControls } from './components/ExportControls';

function App() {
  const [activeSection, setActiveSection] = useState<'title' | 'intro' | 'entries'>('title');
  const [reportState, setReportState] = useState<ReportState>(() => {
    // Try to load saved state from localStorage
    const savedState = localStorage.getItem('qaReportState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Migrate existing entries to the new data model if needed
        const migratedEntries = parsedState.entries.map((entry: any) => {
          // Check if the entry already has contentItems
          if (entry.contentItems) {
            return entry;
          }
          
          // Migrate old format to new format
          const contentItems: ContentItem[] = [];
          
          // Add description as text item if it exists
          if (entry.description && entry.description.trim() !== '') {
            contentItems.push({
              id: crypto.randomUUID(),
              type: 'text',
              content: entry.description,
              order: 0
            });
          }
          
          // Add screenshot as image item if it exists
          if (entry.screenshotPath && entry.screenshotPath.trim() !== '') {
            contentItems.push({
              id: crypto.randomUUID(),
              type: 'image',
              content: entry.screenshotPath,
              order: contentItems.length
            });
          }
          
          // If no content items were created, add an empty text item
          if (contentItems.length === 0) {
            contentItems.push({
              id: crypto.randomUUID(),
              type: 'text',
              content: '',
              order: 0
            });
          }
          
          // Return the migrated entry
          return {
            id: entry.id,
            timestamp: entry.timestamp,
            classification: entry.classification,
            title: entry.title,
            contentItems: contentItems
          };
        });
        
        return {
          ...parsedState,
          entries: migratedEntries
        };
      } catch (e) {
        console.error('Failed to parse saved state:', e);
      }
    }
    
    // Default state
    return {
      reportTitle: '',
      date: new Date().toISOString(),
      operatingSystem: '',
      browser: '',
      appVersion: '',
      appUrl: '',
      screenResolution: '',
      browserPlugins: '',
      introductionText: '',
      entries: []
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('qaReportState', JSON.stringify(reportState));
  }, [reportState]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Shift+S
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        // Create a new entry and switch to entries section
        addNewEntryFromScreenshot();
        setActiveSection('entries');
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const updateReportState = (updates: Partial<ReportState>) => {
    setReportState(current => ({
      ...current,
      ...updates
    }));
  };
  
  const clearAllData = () => {
    // Reset to default state
    setReportState({
      reportTitle: '',
      date: new Date().toISOString(),
      operatingSystem: '',
      browser: '',
      appVersion: '',
      appUrl: '',
      screenResolution: '',
      browserPlugins: '',
      introductionText: '',
      entries: []
    });
    
    // Also clear from localStorage
    localStorage.removeItem('qaReportState');
  };

  const addNewEntryFromScreenshot = () => {
    const newEntry: ReportEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      classification: 'bug',
      title: '',
      contentItems: [
        {
          id: crypto.randomUUID(),
          type: 'text',
          content: '',
          order: 0
        }
      ]
    };
    
    setReportState(current => ({
      ...current,
      entries: [...current.entries, newEntry]
    }));
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <nav>
          <ul>
            <li 
              className={activeSection === 'title' ? 'active' : ''}
              onClick={() => setActiveSection('title')}
            >
              Title Page
            </li>
            <li 
              className={activeSection === 'intro' ? 'active' : ''}
              onClick={() => setActiveSection('intro')}
            >
              Introduction
            </li>
            <li 
              className={activeSection === 'entries' ? 'active' : ''}
              onClick={() => setActiveSection('entries')}
            >
              Report Entries
            </li>
          </ul>
        </nav>
        
        <div className="export-section">
          <ExportControls 
            reportState={reportState} 
            onClearAll={clearAllData} 
          />
        </div>
      </aside>
      <main className="main-content">
        {activeSection === 'title' && (
          <TitlePage 
            reportState={reportState}
            onUpdate={updateReportState}
          />
        )}
        {activeSection === 'intro' && (
          <IntroductionPage 
            reportState={reportState}
            onUpdate={updateReportState}
          />
        )}
        {activeSection === 'entries' && (
          <ReportEntries 
            reportState={reportState}
            onUpdate={updateReportState}
          />
        )}
      </main>
    </div>
  );
}

export default App;
