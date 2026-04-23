import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { PreviewResponse } from '../../../../core/models/preview-response.model';
import { PreviewRow } from '../../../../core/models/preview-row.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { EditableField, PreviewTableComponent } from '../preview-table/preview-table.component';

@Component({
  selector: 'app-preview-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, PreviewTableComponent, LoadingSpinnerComponent],
  templateUrl: './preview-modal.component.html',
  styleUrls: ['./preview-modal.component.css'],
})
export class PreviewModalComponent {
  @Input() visible = false;
  @Input() previewData: PreviewResponse | null = null;
  @Input() sourcePdfUrl: string | null = null;
  @Input() editableRows: PreviewRow[] = [];
  @Input() exporting = false;
  @Input() sendingSupport = false;
  @Input() errorMessage: string | null = null;
  @Input() supportMessage: string | null = null;
  @Input() downloadFilename = '';
  @Input() downloadFilenameMaxLength = 80;

  @Output() close = new EventEmitter<void>();
  @Output() addRow = new EventEmitter<void>();
  @Output() removeRow = new EventEmitter<string>();
  @Output() editField = new EventEmitter<{ rowId: string; field: EditableField; value: string }>();
  @Output() downloadFilenameChange = new EventEmitter<string>();
  @Output() downloadExcel = new EventEmitter<void>();
  @Output() sendSupport = new EventEmitter<void>();

  @ViewChild('pdfPane') private pdfPaneRef?: ElementRef<HTMLDivElement>;
  @ViewChild('tablePane') private tablePaneRef?: ElementRef<HTMLDivElement>;

  syncScroll = true;
  private syncingPane: 'pdf' | 'table' | null = null;

  constructor(private readonly sanitizer: DomSanitizer) {}

  get pdfEmbedUrl(): SafeResourceUrl | null {
    if (!this.sourcePdfUrl) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${this.sourcePdfUrl}#toolbar=1&navpanes=0`);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  onDownloadFilenameInput(value: string): void {
    this.downloadFilenameChange.emit(value.slice(0, this.downloadFilenameMaxLength));
  }

  onPaneScroll(source: 'pdf' | 'table'): void {
    if (!this.syncScroll) {
      return;
    }

    const sourcePane = source === 'pdf' ? this.pdfPaneRef?.nativeElement : this.tablePaneRef?.nativeElement;
    const targetPane = source === 'pdf' ? this.tablePaneRef?.nativeElement : this.pdfPaneRef?.nativeElement;
    if (!sourcePane || !targetPane) {
      return;
    }

    if (this.syncingPane && this.syncingPane !== source) {
      return;
    }

    const sourceMax = sourcePane.scrollHeight - sourcePane.clientHeight;
    const targetMax = targetPane.scrollHeight - targetPane.clientHeight;
    if (sourceMax <= 0 || targetMax <= 0) {
      return;
    }

    this.syncingPane = source;
    const ratio = sourcePane.scrollTop / sourceMax;
    targetPane.scrollTop = ratio * targetMax;
    requestAnimationFrame(() => {
      this.syncingPane = null;
    });
  }
}
