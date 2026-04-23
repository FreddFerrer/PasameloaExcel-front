import { HttpClient, HttpResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_CONFIG, ApiConfig, buildApiV1Url } from '../config/api.config';
import { ExportRequest } from '../models/export-request.model';
import { PreviewResponse } from '../models/preview-response.model';
import { SupportSubmissionResponse } from '../models/support-submission.model';

@Injectable({
  providedIn: 'root',
})
export class ExtractionApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_CONFIG) private readonly apiConfig: ApiConfig
  ) {}

  extractPreview(file: File): Observable<PreviewResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<PreviewResponse>(buildApiV1Url(this.apiConfig, 'extract-preview'), formData, {
      withCredentials: false,
    });
  }

  exportExcel(payload: ExportRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(buildApiV1Url(this.apiConfig, 'export-excel'), payload, {
      observe: 'response',
      responseType: 'blob',
      withCredentials: false,
    });
  }

  submitSupportCase(file: File, preview: PreviewResponse, sessionId: string | null, userNote: string | null): Observable<SupportSubmissionResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('preview_json', JSON.stringify(preview));
    if (sessionId) {
      formData.append('session_id', sessionId);
    }
    if (userNote) {
      formData.append('user_note', userNote);
    }
    return this.http.post<SupportSubmissionResponse>(buildApiV1Url(this.apiConfig, 'support/submit-extract'), formData, {
      withCredentials: false,
    });
  }
}
