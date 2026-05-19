export type IconCategoryConfig = {
  label: string;
  value:
    | 'bank'
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
};

export const ICON_CATEGORY_CONFIG: Array<IconCategoryConfig> = [
  { label: 'Bank', value: 'bank' },
  { label: 'Category', value: 'category' },
  { label: 'Communication', value: 'communication' },
  { label: 'Documents', value: 'documents' },
  { label: 'Finance', value: 'finance' },
  { label: 'Flags', value: 'flags' },
  { label: 'Location', value: 'location' },
  { label: 'Logo', value: 'logo' },
  { label: 'Redact', value: 'redact' },
  { label: 'Security', value: 'security' },
  { label: 'Service', value: 'service' },
  { label: 'System', value: 'system' },
];
