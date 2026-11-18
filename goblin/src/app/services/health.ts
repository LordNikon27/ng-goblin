import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
}

@Injectable({providedIn: 'root',})
export class Health {
  
  private readonly http = inject(HttpClient);

  getHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(
      'http://127.0.0.1:8000/api/health'
    );
  }
}
