import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WebSocketService } from '../../core/services/websocket.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private webSocketService: WebSocketService
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
  next: (response) => {
    this.cargando = false;
    
    // Conectar a WebSocket después del login exitoso
    this.webSocketService.connect();
    
    if (response.rol === 'CLIENTE') {
      this.router.navigate(['/cliente']);
    } else if (response.rol === 'FUNCIONARIO') {
      this.router.navigate(['/funcionario']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  },
  error: () => {
    this.cargando = false;
    this.error = 'Email o contraseña incorrectos';
  }
});
  }
}