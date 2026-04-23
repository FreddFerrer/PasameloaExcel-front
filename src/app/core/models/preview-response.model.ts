import { PreviewRow } from './preview-row.model';

export interface PreviewSummary {
  total_rows: number;
  low_confidence_rows: number;
  rows_with_issues: number;
  total_debito: number;
  total_credito: number;
}

export interface PreviewResponse {
  document_id: string;
  filename: string;
  bank_detected: string | null;
  template_detected: string | null;
  template_confidence: number;
  parse_status: string;
  quality_flag: string | null;
  support_recommended: boolean;
  quality_message: string | null;
  low_confidence_ratio: number;
  summary: PreviewSummary;
  rows: PreviewRow[];
}
