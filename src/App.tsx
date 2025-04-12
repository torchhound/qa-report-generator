import { useState, useEffect } from 'react';
import './App.css';
import { ReportState, ReportEntry } from './types';
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
        return JSON.parse(savedState);
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
      description: '',
      screenshotPath: ''
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
