import { PreviewRow } from './preview-row.model';

export interface ChangeSetSummary {
  rowsEdited: number;
  rowsAdded: number;
  rowsDeleted: number;
  fieldsCorrected: Record<string, number>;
  errorPatterns: string[];
}

export interface ExportRequest {
  documentId: string;
  filename: string | null;
  downloadFilename: string;
  rows: PreviewRow[];
  changeSet: ChangeSetSummary;
}
