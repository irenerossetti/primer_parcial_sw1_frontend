import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface LoginResponse {
  token: string;
  rol: string;
  nombre: string;
  email: string;
  userId?: string;
  departamentoNombre?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          const resolvedUserId = response.userId || response.email;
          localStorage.setItem('token', response.token);
          localStorage.setItem('rol', response.rol);
          localStorage.setItem('nombre', response.nombre);
          localStorage.setItem('userId', resolvedUserId);
          localStorage.setItem('email', response.email || '');
          localStorage.setItem('departamentoNombre', response.departamentoNombre || '');
          localStorage.setItem('user', JSON.stringify({
            userId: resolvedUserId,
            email: response.email || '',
            rol: response.rol,
            nombre: response.nombre,
            departamentoNombre: response.departamentoNombre || ''
          }));
        })
      );
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getRol(): string {
    return localStorage.getItem('rol') || '';
  }

  getNombre(): string {
    return localStorage.getItem('nombre') || '';
  }

  getUserId(): string {
    return localStorage.getItem('userId') || '';
  }

  getEmail(): string {
    return localStorage.getItem('email') || '';
  }

  getDepartamentoNombre(): string {
    return localStorage.getItem('departamentoNombre') || '';
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}