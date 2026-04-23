import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideApiConfig } from './core/config/api.config';
import { backendErrorInterceptor } from './core/interceptors/backend-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideApiConfig(), provideHttpClient(withInterceptors([backendErrorInterceptor]))]
};
