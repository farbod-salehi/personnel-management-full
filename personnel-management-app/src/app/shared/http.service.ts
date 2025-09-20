import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, retry, throwError } from "rxjs";

import { environment } from "../../environments/environment";

@Injectable({
  providedIn:'root'
})
export class HttpService {

  private http = inject(HttpClient);

  request(apiUrl: string, method: 'GET' | 'PATCH' | 'DELETE' | 'POST', parameters: any | null = null, token: string | null = null, responseIsArrayBuffer: boolean = false) {

    return this.http.request(method,`${environment.serverUrl}${apiUrl}`,{
      body: parameters,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token ?? '',
      }),
      responseType: responseIsArrayBuffer ? "arraybuffer" : undefined
    }).pipe(retry(2),catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }
}
