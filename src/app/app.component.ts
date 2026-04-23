import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { finalize } from 'rxjs';

import { ExportRequest } from './core/models/export-request.model';
import { PreviewResponse } from './core/models/preview-response.model';
import { PreviewRow } from './core/models/preview-row.model';
import { ExtractionApiService } from './core/services/extraction-api.service';
import { PreviewModalComponent } from './features/preview/components/preview-modal/preview-modal.component';
import { EditableField } from './features/preview/components/preview-table/preview-table.component';
import { UploadZoneComponent } from './features/upload/components/upload-zone/upload-zone.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from './shared/components/modal/modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, UploadZoneComponent, PreviewModalComponent, LoadingSpinnerComponent, ModalComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  readonly maxDownloadFilenameLength = 80;

  selectedFile: File | null = null;
  selectedFileError: string | null = null;
  globalError: string | null = null;

  loadingPreview = false;
  exportingExcel = false;
  sendingSupport = false;

  previewData: PreviewResponse | null = null;
  editableRows: PreviewRow[] = [];
  isPreviewModalOpen = false;
  showSupportRecommendationModal = false;
  supportMessage: string | null = null;
  sourcePdfUrl: string | null = null;
  downloadFilename = '';

  private originalRows: ReadonlyArray<PreviewRow> = [];
  private newRowSequence = 1;

  constructor(private readonly extractionApi: ExtractionApiService) {}

  onFileSelected(file: File): void {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.selectedFile = null;
      this.selectedFileError = 'El archivo debe ser un PDF valido.';
      this.revokeSourcePdfUrl();
      return;
    }

    this.selectedFile = file;
    this.selectedFileError = null;
    this.globalError = null;
    this.updateSourcePdfUrl(file);
  }

  onGeneratePreview(): void {
    if (!this.selectedFile || this.loadingPreview) {
      return;
    }

    this.loadingPreview = true;
    this.globalError = null;
    this.supportMessage = null;

    this.extractionApi
      .extractPreview(this.selectedFile)
      .pipe(finalize(() => (this.loadingPreview = false)))
      .subscribe({
        next: (response) => {
          this.previewData = response;
          const originalSnapshot = this.cloneRows(response.rows);
          this.originalRows = originalSnapshot;
          this.editableRows = this.cloneRows(originalSnapshot);
          this.downloadFilename = this.getInitialDownloadFilename(response.filename);
          this.newRowSequence = 1;
          this.isPreviewModalOpen = true;
          this.showSupportRecommendationModal = Boolean(response.support_recommended);
        },
        error: (errorResponse) => {
          const message = errorResponse?.error?.detail || 'No se pudo generar la preview. Intenta nuevamente.';
          this.globalError = String(message);
        },
      });
  }

  onEditField(change: { rowId: string; field: EditableField; value: string }): void {
    const row = this.editableRows.find((item) => item.row_id === change.rowId);
    if (!row) {
      return;
    }

    switch (change.field) {
      case 'fecha':
        row.fecha = change.value || null;
        return;
      case 'descripcion':
        row.descripcion = change.value;
        return;
      case 'debito':
        row.debito = this.parseNumeric(change.value);
        return;
      case 'credito':
        row.credito = this.parseNumeric(change.value);
        return;
      case 'saldo':
        row.saldo = this.parseNumeric(change.value);
        return;
      default:
        return;
    }
  }

  onAddRow(): void {
    const newRow: PreviewRow = {
      row_id: `new-${this.newRowSequence++}`,
      fecha: null,
      descripcion: '',
      debito: null,
      credito: null,
      saldo: null,
      pagina: null,
      confianza: null,
      raw_preview: null,
      issues: [],
    };
    this.editableRows = [newRow, ...this.editableRows];
  }

  onRemoveRow(rowId: string): void {
    this.editableRows = this.editableRows.filter((row) => row.row_id !== rowId);
  }

  onCloseModal(): void {
    this.isPreviewModalOpen = false;
    this.globalError = null;
    this.supportMessage = null;
    this.showSupportRecommendationModal = false;
    this.downloadFilename = '';
  }

  onDownloadFilenameChange(value: string): void {
    this.downloadFilename = this.sanitizeDownloadFilename(value);
  }

  onDownloadExcel(): void {
    if (!this.previewData || this.exportingExcel) {
      return;
    }

    this.exportingExcel = true;
    this.globalError = null;

    const payload = this.buildExportPayload();
    this.extractionApi
      .exportExcel(payload)
      .pipe(finalize(() => (this.exportingExcel = false)))
      .subscribe({
        next: (response) => {
          const requestedName = this.resolveDownloadFilename();
          const fileName = this.ensureXlsxExtension(requestedName);
          const blob = response.body;
          if (!blob) {
            this.globalError = 'El backend no devolvio contenido para descargar.';
            return;
          }
          this.downloadBlob(blob, fileName);
        },
        error: (errorResponse) => {
          const message = errorResponse?.error?.detail || 'No se pudo descargar el Excel.';
          this.globalError = String(message);
        },
      });
  }

  onSendSupport(): void {
    if (!this.previewData || !this.selectedFile || this.sendingSupport) {
      return;
    }

    this.sendingSupport = true;
    this.supportMessage = null;
    this.globalError = null;

    this.extractionApi
      .submitSupportCase(
        this.selectedFile,
        this.previewData,
        null,
        'Reporte automático por baja calidad en preview (template generic_auto).',
      )
      .pipe(finalize(() => (this.sendingSupport = false)))
      .subscribe({
        next: (response) => {
          this.supportMessage = `Gracias. Ticket generado: ${response.ticket_id}.`;
          this.showSupportRecommendationModal = false;
        },
        error: (errorResponse) => {
          const message = errorResponse?.error?.detail || 'No se pudo enviar el extracto a soporte.';
          this.globalError = String(message);
        },
      });
  }

  onDismissSupportRecommendationModal(): void {
    this.showSupportRecommendationModal = false;
  }

  private buildExportPayload(): ExportRequest {
    if (!this.previewData) {
      throw new Error('No hay preview cargada.');
    }

    const originalById = new Map(this.originalRows.map((row) => [row.row_id, row]));
    const currentById = new Map(this.editableRows.map((row) => [row.row_id, row]));
    const editableFields: EditableField[] = ['fecha', 'descripcion', 'debito', 'credito', 'saldo'];
    const fieldsCorrected: Record<string, number> = {};

    let rowsEdited = 0;
    for (const row of this.editableRows) {
      const originalRow = originalById.get(row.row_id);
      if (!originalRow) {
        continue;
      }
      let rowEdited = false;
      for (const field of editableFields) {
        if (!this.areEqual(originalRow[field], row[field])) {
          rowEdited = true;
          fieldsCorrected[field] = (fieldsCorrected[field] || 0) + 1;
        }
      }
      if (rowEdited) {
        rowsEdited += 1;
      }
    }

    const rowsAdded = this.editableRows.filter((row) => !originalById.has(row.row_id)).length;
    const rowsDeleted = this.originalRows.filter((row) => !currentById.has(row.row_id)).length;

    const errorPatterns: string[] = [];
    if (rowsEdited > 0) {
      errorPatterns.push('manual_edit');
    }
    if (rowsAdded > 0) {
      errorPatterns.push('manual_row_add');
    }
    if (rowsDeleted > 0) {
      errorPatterns.push('manual_row_delete');
    }

    const downloadFilename = this.resolveDownloadFilename();

    return {
      documentId: this.previewData.document_id,
      filename: this.previewData.filename ?? null,
      downloadFilename,
      rows: this.cloneRows(this.editableRows),
      changeSet: {
        rowsEdited,
        rowsAdded,
        rowsDeleted,
        fieldsCorrected: fieldsCorrected,
        errorPatterns,
      },
    };
  }

  private areEqual(left: string | number | null, right: string | number | null): boolean {
    return (left ?? null) === (right ?? null);
  }

  private parseNumeric(value: string): number | null {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const normalized = trimmed.replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private cloneRow(row: PreviewRow): PreviewRow {
    return {
      ...row,
      issues: [...row.issues],
    };
  }

  private cloneRows(rows: ReadonlyArray<PreviewRow>): PreviewRow[] {
    return rows.map((row) => this.cloneRow(row));
  }

  private getInitialDownloadFilename(filename: string | null): string {
    const rawName = filename || 'movimientos';
    return this.sanitizeDownloadFilename(this.removeFileExtension(rawName));
  }

  private sanitizeDownloadFilename(rawValue: string): string {
    return rawValue.slice(0, this.maxDownloadFilenameLength);
  }

  private resolveDownloadFilename(): string {
    const candidate = this.sanitizeDownloadFilename(this.downloadFilename).trim();
    if (candidate) {
      return candidate;
    }

    return this.getInitialDownloadFilename(this.previewData?.filename ?? null);
  }

  private removeFileExtension(filename: string): string {
    const trimmed = filename.trim();
    if (!trimmed) {
      return '';
    }
    const lastDot = trimmed.lastIndexOf('.');
    if (lastDot <= 0) {
      return trimmed;
    }
    return trimmed.slice(0, lastDot);
  }

  private ensureXlsxExtension(filename: string): string {
    const trimmed = filename.trim();
    if (!trimmed) {
      return 'movimientos.xlsx';
    }
    if (trimmed.toLowerCase().endsWith('.xlsx')) {
      return trimmed;
    }
    return `${trimmed}.xlsx`;
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }

  ngOnDestroy(): void {
    this.revokeSourcePdfUrl();
  }

  private updateSourcePdfUrl(file: File): void {
    this.revokeSourcePdfUrl();
    this.sourcePdfUrl = URL.createObjectURL(file);
  }

  private revokeSourcePdfUrl(): void {
    if (!this.sourcePdfUrl) {
      return;
    }
    URL.revokeObjectURL(this.sourcePdfUrl);
    this.sourcePdfUrl = null;
  }
}
