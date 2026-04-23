import { InjectionToken, Provider } from '@angular/core';

import { environment } from '../../../environments/environment';

export interface ApiConfig {
  backendBaseUrl: string;
  apiV1BaseUrl: string;
}

const API_V1_PREFIX = '/api/v1';
const DEFAULT_BACKEND_BASE_URL = 'http://localhost:8000';

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}

function resolveApiV1BaseUrl(backendBaseUrl: string): string {
  const normalizedBaseUrl = normalizeBaseUrl(backendBaseUrl);
  if (normalizedBaseUrl.endsWith(API_V1_PREFIX)) {
    return normalizedBaseUrl;
  }
  return `${normalizedBaseUrl}${API_V1_PREFIX}`;
}

export function createApiConfig(): ApiConfig {
  const backendBaseUrl = normalizeBaseUrl(environment.backendBaseUrl || DEFAULT_BACKEND_BASE_URL);

  return {
    backendBaseUrl,
    apiV1BaseUrl: resolveApiV1BaseUrl(backendBaseUrl),
  };
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  factory: () => createApiConfig(),
});

export function provideApiConfig(): Provider {
  return {
    provide: API_CONFIG,
    useFactory: createApiConfig,
  };
}

export function buildApiV1Url(apiConfig: Pick<ApiConfig, 'apiV1BaseUrl'>, apiPath: string): string {
  const normalizedPath = apiPath.replace(/^\/+/, '');
  return `${apiConfig.apiV1BaseUrl}/${normalizedPath}`;
}

export function parseAbsoluteUrl(rawUrl: string): URL | null {
  try {
    return new URL(rawUrl);
  } catch {
    return null;
  }
}

export function isBackendApiV1Url(url: URL, apiConfig: Pick<ApiConfig, 'apiV1BaseUrl'>): boolean {
  const apiBaseUrl = new URL(`${apiConfig.apiV1BaseUrl}/`);
  const normalizedApiPathPrefix = apiBaseUrl.pathname.endsWith('/')
    ? apiBaseUrl.pathname
    : `${apiBaseUrl.pathname}/`;

  return url.origin === apiBaseUrl.origin && url.pathname.startsWith(normalizedApiPathPrefix);
}
