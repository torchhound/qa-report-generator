export type ReportEntry = {
  id: string;
  timestamp: string; // iso8601
  classification: 'bug' | 'papercut' | 'feature';
  title: string;
  description: string;
  screenshotPath: string;
};

export type ReportState = {
  reportTitle: string;
  author?: string;
  date: string;
  operatingSystem: string;
  browser?: string;
  appVersion?: string;
  appUrl?: string;
  introductionText: string;
  entries: ReportEntry[];
};
