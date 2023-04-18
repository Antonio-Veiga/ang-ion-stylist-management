import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Default_PT } from 'src/app/defaults/langs/pt-pt/Defaults';


@Injectable()
export class ErrorHandlingService implements HttpInterceptor {
  constructor() { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((response: HttpErrorResponse) => {
        if (response.error instanceof ErrorEvent) return throwError(() => new Error(`${Default_PT.ERROR_ON_CLIENT}: ${response.statusText}`))
        return throwError(() => new Error(`${Default_PT.ERROR_ON_SERVER} ${response.status}: ${response.statusText}`))
      })
    );
  }
}
