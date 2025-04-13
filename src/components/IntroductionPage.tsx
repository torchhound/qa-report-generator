import { ReportState } from '../types';

interface IntroductionPageProps {
  reportState: ReportState;
  onUpdate: (updates: Partial<ReportState>) => void;
}

export function IntroductionPage({ reportState, onUpdate }: IntroductionPageProps) {
  return (
    <div className="introduction-page">
      <div className="intro-fields">
        <div className="field-group">
          <label htmlFor="operating-system">Operating System:</label>
          <input
            id="operating-system"
            type="text"
            value={reportState.operatingSystem || ''}
            onChange={(e) => onUpdate({ operatingSystem: e.target.value })}
            placeholder="e.g., Windows 11, macOS Sonoma, Ubuntu 24.04"
            className="intro-input"
          />
        </div>
        
        <div className="field-group">
          <label htmlFor="screen-resolution">Screen Resolution (optional):</label>
          <input
            id="screen-resolution"
            type="text"
            value={reportState.screenResolution || ''}
            onChange={(e) => onUpdate({ screenResolution: e.target.value })}
            placeholder="e.g., 1920x1080, 2560x1440, 3840x2160"
            className="intro-input"
          />
        </div>
        
        <div className="field-group">
          <label htmlFor="browser">Web Browser (optional):</label>
          <input
            id="browser"
            type="text"
            value={reportState.browser || ''}
            onChange={(e) => onUpdate({ browser: e.target.value })}
            placeholder="e.g., Chrome 123, Firefox 124, Safari 17"
            className="intro-input"
          />
        </div>
        
        <div className="field-group">
          <label htmlFor="browser-plugins">Browser Plugins (optional):</label>
          <input
            id="browser-plugins"
            type="text"
            value={reportState.browserPlugins || ''}
            onChange={(e) => onUpdate({ browserPlugins: e.target.value })}
            placeholder="e.g., AdBlock, LastPass, React DevTools"
            className="intro-input"
          />
        </div>
        
        <div className="field-group">
          <label htmlFor="app-version">Application Version (optional):</label>
          <input
            id="app-version"
            type="text"
            value={reportState.appVersion || ''}
            onChange={(e) => onUpdate({ appVersion: e.target.value })}
            placeholder="e.g., v1.2.3, 2025.04.1, Build 12345"
            className="intro-input"
          />
        </div>
        
        <div className="field-group">
          <label htmlFor="app-url">Application URL (optional):</label>
          <input
            id="app-url"
            type="text"
            value={reportState.appUrl || ''}
            onChange={(e) => onUpdate({ appUrl: e.target.value })}
            placeholder="e.g., https://example.com/app, internal network path"
            className="intro-input"
          />
        </div>
      </div>
      
      <label htmlFor="intro-text">Introduction:</label>
      <textarea
        id="intro-text"
        value={reportState.introductionText || ''}
        onChange={(e) => onUpdate({ introductionText: e.target.value })}
        placeholder="Enter introduction text or project summary..."
        className="intro-textarea"
      />
    </div>
  );
}
