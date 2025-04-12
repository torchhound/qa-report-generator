import { ReportState } from '../types';

interface TitlePageProps {
  reportState: ReportState;
  onUpdate: (updates: Partial<ReportState>) => void;
}

export function TitlePage({ reportState, onUpdate }: TitlePageProps) {
  return (
    <div className="title-page">
      <input
        type="text"
        value={reportState.reportTitle}
        onChange={(e) => onUpdate({ reportTitle: e.target.value })}
        placeholder="Report Title"
        className="title-input"
      />
      <input
        type="text"
        value={reportState.author || ''}
        onChange={(e) => onUpdate({ author: e.target.value })}
        placeholder="Author Name / Team / Project (Optional)"
        className="author-input"
      />
      <input
        type="date"
        value={new Date(reportState.date).toISOString().split('T')[0]}
        onChange={(e) => onUpdate({ date: new Date(e.target.value).toISOString() })}
        className="date-input"
      />
    </div>
  );
}
