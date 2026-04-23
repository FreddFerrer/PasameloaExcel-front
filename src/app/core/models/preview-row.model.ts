export interface PreviewRow {
  row_id: string;
  fecha: string | null;
  descripcion: string;
  debito: number | null;
  credito: number | null;
  saldo: number | null;
  pagina: number | null;
  confianza: number | null;
  raw_preview: string | null;
  issues: string[];
}
