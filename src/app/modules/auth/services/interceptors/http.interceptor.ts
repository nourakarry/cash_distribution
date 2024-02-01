import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Inject, Injectable, Injector, PLATFORM_ID } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from 'src/environments/environment';
import { AuthModel } from 'src/app/modules/auth/models/auth.model';
import { Router } from '@angular/router';

@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {
  private readonly authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
  private readonly loginApiUrl = 'api/login';
  private readonly acceptLanguageHeader = 'Accept-Language';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (req.url.includes(this.loginApiUrl)) {
      return this.handleRequest(req, next);
    }

    if (isPlatformBrowser(this.platformId)) {
      const authModel = this.getAuthFromLocalStorage();
      if (authModel?.authToken) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${authModel.authToken}`,
          },
        });
      }
    }

    req = req.clone({
      setHeaders: {
        [this.acceptLanguageHeader]: 'ar',
      },
    });

    return this.handleRequest(req, next);
  }

  getAuthFromLocalStorage(): AuthModel | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }

      return JSON.parse(lsValue);
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  logout() {
    localStorage.removeItem(this.authLocalStorageToken);
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
  }

  handleRequest(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req);
  }

}
