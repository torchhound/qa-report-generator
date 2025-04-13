export type ContentItemType = 'text' | 'image';

export type ContentItem = {
  id: string;
  type: ContentItemType;
  content: string; // text content or image data URL
  order: number;
};

export type ReportEntry = {
  id: string;
  timestamp: string; // iso8601
  classification: 'bug' | 'papercut' | 'feature';
  title: string;
  contentItems: ContentItem[];
};

export type ReportState = {
  reportTitle: string;
  author?: string;
  date: string;
  operatingSystem: string;
  browser?: string;
  appVersion?: string;
  appUrl?: string;
  screenResolution?: string;
  browserPlugins?: string;
  introductionText: string;
  entries: ReportEntry[];
};
