export type IconCategory =
  | 'category'
  | 'communication'
  | 'documents'
  | 'finance'
  | 'flags'
  | 'location'
  | 'logo'
  | 'redact'
  | 'security'
  | 'service'
  | 'system';

export type IconCategoryConfig = {
  label: string;
  value: IconCategory;
  pixsoFrameName: string;
};

export const ICON_CATEGORY_CONFIG: Array<IconCategoryConfig> = [
  { label: 'Category', value: 'category', pixsoFrameName: 'Category' },
  { label: 'Communication', value: 'communication', pixsoFrameName: 'Communication' },
  { label: 'Documents', value: 'documents', pixsoFrameName: 'Documents' },
  { label: 'Finance', value: 'finance', pixsoFrameName: 'Finance' },
  { label: 'Flags', value: 'flags', pixsoFrameName: 'Flags' },
  { label: 'Location', value: 'location', pixsoFrameName: 'Location' },
  { label: 'Logo Icons', value: 'logo', pixsoFrameName: 'Logo Icons' },
  { label: 'Redact', value: 'redact', pixsoFrameName: 'Redact' },
  { label: 'Security', value: 'security', pixsoFrameName: 'Security' },
  { label: 'Service', value: 'service', pixsoFrameName: 'Service' },
  { label: 'System', value: 'system', pixsoFrameName: 'System' },
];
