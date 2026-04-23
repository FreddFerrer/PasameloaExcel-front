import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-upload-zone',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-zone.component.html',
  styleUrls: ['./upload-zone.component.css'],
})
export class UploadZoneComponent {
  @Input() fileName: string | null = null;
  @Input() disabled = false;
  @Input() errorMessage: string | null = null;
  @Output() fileSelected = new EventEmitter<File>();

  dragging = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled) {
      this.dragging = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
    if (this.disabled || !event.dataTransfer?.files?.length) {
      return;
    }

    const droppedFile = event.dataTransfer.files[0];
    this.emitIfPdf(droppedFile);
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    this.emitIfPdf(input.files[0]);
    input.value = '';
  }

  private emitIfPdf(file: File): void {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      this.fileSelected.emit(file);
    }
  }
}
