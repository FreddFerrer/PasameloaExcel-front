import { HttpClient, HttpErrorResponse, HttpHeaders, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_CONFIG, ApiConfig, createApiConfig } from '../config/api.config';
import { backendErrorInterceptor } from './backend-error.interceptor';

describe('backendErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  const apiConfig: ApiConfig = createApiConfig();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([backendErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: API_CONFIG, useValue: apiConfig },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('no agrega Authorization a endpoints del backend', () => {
    httpClient.post(`${apiConfig.apiV1BaseUrl}/extract-preview`, {}, {}).subscribe();

    const request = httpMock.expectOne(`${apiConfig.apiV1BaseUrl}/extract-preview`);
    expect(request.request.headers.has('Authorization')).toBeFalse();
    expect(request.request.withCredentials).toBeFalse();
    request.flush({});
  });

  it('adjunta mensaje amigable en 429 usando Retry-After', () => {
    let capturedError: unknown = null;

    httpClient.post(`${apiConfig.apiV1BaseUrl}/export-excel`, {}).subscribe({
      next: () => fail('La request deberia fallar con 429'),
      error: (error: unknown) => {
        capturedError = error;
      },
    });

    const request = httpMock.expectOne(`${apiConfig.apiV1BaseUrl}/export-excel`);
    request.flush(
      { detail: 'rate limited' },
      {
        status: 429,
        statusText: 'Too Many Requests',
        headers: new HttpHeaders({
          'Retry-After': '7',
        }),
      }
    );

    expect(capturedError).toEqual(jasmine.any(HttpErrorResponse));
    const detail = ((capturedError as HttpErrorResponse).error as { detail?: string } | null)?.detail;
    expect(detail).toContain('7 segundos');
  });

  it('adjunta mensaje fallback en 429 sin Retry-After', () => {
    let capturedError: unknown = null;

    httpClient.post(`${apiConfig.apiV1BaseUrl}/extract-preview`, {}).subscribe({
      next: () => fail('La request deberia fallar con 429'),
      error: (error: unknown) => {
        capturedError = error;
      },
    });

    const request = httpMock.expectOne(`${apiConfig.apiV1BaseUrl}/extract-preview`);
    request.flush({ detail: 'rate limited' }, { status: 429, statusText: 'Too Many Requests' });

    expect(capturedError).toEqual(jasmine.any(HttpErrorResponse));
    const detail = ((capturedError as HttpErrorResponse).error as { detail?: string } | null)?.detail;
    expect(detail).toContain('Reintenta en unos segundos');
  });

  it('no transforma errores distintos a 429', () => {
    let capturedError: unknown = null;

    httpClient.post(`${apiConfig.apiV1BaseUrl}/extract-preview`, {}).subscribe({
      next: () => fail('La request deberia fallar con 500'),
      error: (error: unknown) => {
        capturedError = error;
      },
    });

    const request = httpMock.expectOne(`${apiConfig.apiV1BaseUrl}/extract-preview`);
    request.flush({ detail: 'server error' }, { status: 500, statusText: 'Server Error' });

    expect(capturedError).toEqual(jasmine.any(HttpErrorResponse));
    const detail = ((capturedError as HttpErrorResponse).error as { detail?: string } | null)?.detail;
    expect(detail).toBe('server error');
  });
});
