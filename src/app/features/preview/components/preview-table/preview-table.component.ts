import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PreviewRow } from '../../../../core/models/preview-row.model';

export type EditableField = 'fecha' | 'descripcion' | 'debito' | 'credito' | 'saldo';
type ColumnKey = 'fecha' | 'descripcion' | 'debito' | 'credito' | 'saldo' | 'pagina' | 'confianza' | 'acciones';

@Component({
  selector: 'app-preview-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preview-table.component.html',
  styleUrls: ['./preview-table.component.css'],
})
export class PreviewTableComponent {
  @Input() rows: PreviewRow[] = [];
  @Input() maxHeight = '55vh';
  @Output() addRow = new EventEmitter<void>();
  @Output() removeRow = new EventEmitter<string>();
  @Output() editField = new EventEmitter<{ rowId: string; field: EditableField; value: string }>();

  expandedRowIds = new Set<string>();
  readonly columns: ColumnKey[] = [
    'fecha',
    'descripcion',
    'debito',
    'credito',
    'saldo',
    'pagina',
    'confianza',
    'acciones',
  ];

  readonly columnWidths: Record<ColumnKey, number> = {
    fecha: 50,
    descripcion: 200,
    debito: 92,
    credito: 92,
    saldo: 104,
    pagina: 34,
    confianza: 56,
    acciones: 72,
  };

  private readonly minColumnWidths: Record<ColumnKey, number> = {
    fecha: 30,
    descripcion: 160,
    debito: 82,
    credito: 82,
    saldo: 96,
    pagina: 30,
    confianza: 48,
    acciones: 64,
  };

  isResizing = false;
  private resizingColumn: ColumnKey | null = null;
  private resizeStartX = 0;
  private resizeStartWidth = 0;

  trackByRowId(_: number, row: PreviewRow): string {
    return row.row_id;
  }

  toggleDetails(rowId: string): void {
    if (this.expandedRowIds.has(rowId)) {
      this.expandedRowIds.delete(rowId);
      return;
    }
    this.expandedRowIds.add(rowId);
  }

  hasDetails(row: PreviewRow): boolean {
    return Boolean(row.raw_preview) || row.issues.length > 0;
  }

  getColumnWidth(column: ColumnKey): number {
    return this.columnWidths[column];
  }

  startColumnResize(event: MouseEvent, column: ColumnKey): void {
    event.preventDefault();
    event.stopPropagation();
    this.isResizing = true;
    this.resizingColumn = column;
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = this.columnWidths[column];
  }

  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    if (!this.isResizing || !this.resizingColumn) {
      return;
    }

    const deltaX = event.clientX - this.resizeStartX;
    const minWidth = this.minColumnWidths[this.resizingColumn];
    this.columnWidths[this.resizingColumn] = Math.max(minWidth, this.resizeStartWidth + deltaX);
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp(): void {
    this.isResizing = false;
    this.resizingColumn = null;
  }
}
