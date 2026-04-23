import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { API_CONFIG, isBackendApiV1Url, parseAbsoluteUrl } from '../config/api.config';

function pluralizeSeconds(seconds: number): string {
  return `${seconds} segundo${seconds === 1 ? '' : 's'}`;
}

function parseRetryAfterInSeconds(retryAfterValue: string | null): number | null {
  if (!retryAfterValue) {
    return null;
  }

  const secondsValue = Number(retryAfterValue);
  if (Number.isFinite(secondsValue) && secondsValue >= 0) {
    return Math.ceil(secondsValue);
  }

  const targetEpochMs = Date.parse(retryAfterValue);
  if (Number.isNaN(targetEpochMs)) {
    return null;
  }

  const deltaSeconds = Math.ceil((targetEpochMs - Date.now()) / 1000);
  return deltaSeconds > 0 ? deltaSeconds : 0;
}

function attachFriendlyDetail(error: HttpErrorResponse, detail: string): HttpErrorResponse {
  const body =
    error.error && typeof error.error === 'object' && !Array.isArray(error.error)
      ? ({ ...(error.error as Record<string, unknown>), detail } as Record<string, unknown>)
      : { detail };

  return new HttpErrorResponse({
    error: body,
    headers: error.headers,
    status: error.status,
    statusText: error.statusText,
    url: error.url || undefined,
  });
}

export const backendErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const apiConfig = inject(API_CONFIG);
  const requestUrl = parseAbsoluteUrl(request.url);

  if (!requestUrl || !isBackendApiV1Url(requestUrl, apiConfig)) {
    return next(request);
  }

  const sanitizedRequest = request.withCredentials ? request.clone({ withCredentials: false }) : request;

  return next(sanitizedRequest).pipe(
    catchError((rawError: unknown) => {
      if (!(rawError instanceof HttpErrorResponse) || rawError.status !== 429) {
        return throwError(() => rawError);
      }

      const retryAfterSeconds = parseRetryAfterInSeconds(rawError.headers.get('Retry-After'));
      const detail =
        retryAfterSeconds !== null
          ? `Demasiadas solicitudes al backend. Reintenta en ${pluralizeSeconds(retryAfterSeconds)}.`
          : 'Demasiadas solicitudes al backend. Reintenta en unos segundos.';

      return throwError(() => attachFriendlyDetail(rawError, detail));
    })
  );
};
