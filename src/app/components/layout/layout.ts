import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Notificacion, NotificacionService } from '../../core/services/notificacion.service';
import { AIChatbotComponent } from '../ai-chatbot/ai-chatbot';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, AIChatbotComponent],
  template: `
    <div class="app-container">
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <div class="logo" (click)="toggleSidebar()">
            <span class="material-icons">account_tree</span>
            <span *ngIf="!sidebarCollapsed" class="logo-text">WorkFlow</span>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <a *ngFor="let item of menuItems" 
             [routerLink]="item.path" 
             routerLinkActive="active"
             class="nav-item">
            <span class="material-icons">{{ item.icon }}</span>
            <span *ngIf="!sidebarCollapsed" class="nav-text">{{ item.label }}</span>
          </a>
        </nav>
        
        <div class="sidebar-footer">
          <button class="nav-item" (click)="logout()">
            <span class="material-icons">logout</span>
            <span *ngIf="!sidebarCollapsed" class="nav-text">Salir</span>
          </button>
        </div>
      </aside>
      
      <main class="main-content">
        <header class="top-header">
          <button class="menu-toggle" (click)="toggleSidebar()">
            <span class="material-icons">menu</span>
          </button>
          <div class="header-title">
            <h2>{{ tituloActual }}</h2>
          </div>
          <div class="user-menu">
            <div class="notification-wrapper">
              <button class="notification-btn" (click)="toggleNotificaciones()">
                <span class="material-icons">notifications_none</span>
                <span class="notification-badge" *ngIf="notificacionesNoLeidas > 0">{{ notificacionesNoLeidas }}</span>
              </button>

              <div class="notification-dropdown" *ngIf="mostrarNotificaciones">
                <div class="dropdown-header">
                  <strong>Notificaciones</strong>
                  <button class="link-btn" (click)="marcarTodasLeidas()" [disabled]="notificacionesNoLeidas === 0">Marcar todas</button>
                </div>

                <div class="dropdown-empty" *ngIf="notificaciones.length === 0">
                  No tienes notificaciones.
                </div>

                <div class="notification-item" *ngFor="let n of notificaciones" [class.no-leida]="!n.leida" (click)="abrirNotificacion(n)">
                  <div class="notification-title">{{ n.titulo }}</div>
                  <div class="notification-message">{{ n.mensaje }}</div>
                  <div class="notification-meta">
                    <span>{{ n.creadoEn | date:'dd/MM HH:mm' }}</span>
                    <button class="link-btn" *ngIf="!n.leida" (click)="marcarLeida(n, $event)">Marcar leida</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="user-avatar">
              <span class="material-icons">account_circle</span>
              <span>{{ getNombreUsuario() }}</span>
              <span class="rol-badge">{{ getRol() }}</span>
            </div>
          </div>
        </header>
        
        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- AI Chatbot -->
      <app-ai-chatbot></app-ai-chatbot>
    </div>
  `,
  styles: [`
    * { margin: 0; padding: 0; box-sizing: border-box; }
    .app-container { display: flex; min-height: 100vh; background: #f5f7fa; }
    
    /* Sidebar mejorado - solo iconos */
    .sidebar { 
      width: 80px; 
      background: linear-gradient(180deg, #1a237e 0%, #0d1b5e 100%); 
      color: white; 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
      display: flex; 
      flex-direction: column;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 100;
    }
    .sidebar.collapsed { width: 80px; }
    .sidebar:not(.collapsed) { width: 260px; }
    
    .sidebar-header { 
      padding: 24px 16px; 
      border-bottom: 1px solid rgba(255,255,255,0.1);
      display: flex;
      justify-content: center;
    }
    .logo { 
      display: flex; 
      align-items: center; 
      justify-content: center;
      gap: 12px; 
      cursor: pointer;
      transition: all 0.3s;
    }
    .logo:hover {
      transform: scale(1.1);
    }
    .logo .material-icons { 
      font-size: 32px; 
      color: #64b5f6;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }
    .logo-text { 
      font-size: 1.3rem; 
      font-weight: 700;
      background: linear-gradient(135deg, #64b5f6, #90caf9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .sidebar-nav { 
      flex: 1; 
      padding: 20px 12px; 
      display: flex; 
      flex-direction: column; 
      gap: 12px;
      overflow-y: auto;
    }
    
    .nav-item { 
      display: flex; 
      align-items: center; 
      justify-content: center;
      gap: 12px; 
      padding: 14px 16px; 
      border-radius: 12px; 
      color: rgba(255,255,255,0.8); 
      text-decoration: none; 
      cursor: pointer; 
      background: none; 
      border: none; 
      width: 100%; 
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    
    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 14px 12px;
    }
    
    .sidebar:not(.collapsed) .nav-item {
      justify-content: flex-start;
    }
    
    .nav-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #64b5f6;
      transform: scaleY(0);
      transition: transform 0.3s;
    }
    
    .nav-item:hover { 
      background: rgba(100, 181, 246, 0.15);
      color: white;
      transform: translateX(4px);
    }
    
    .nav-item:hover::before {
      transform: scaleY(1);
    }
    
    .nav-item.active { 
      background: linear-gradient(135deg, #2196f3, #1976d2);
      color: white;
      box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
    }
    
    .nav-item.active::before {
      transform: scaleY(1);
      background: white;
    }
    
    .nav-item .material-icons { 
      font-size: 24px;
      min-width: 24px;
      transition: all 0.3s;
    }
    
    .nav-item:hover .material-icons {
      transform: scale(1.1);
    }
    
    .nav-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .sidebar-footer { 
      padding: 20px 12px; 
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    .main-content { 
      flex: 1; 
      display: flex; 
      flex-direction: column; 
      overflow-x: hidden;
      transition: margin-left 0.3s;
    }
    
    .top-header { 
      background: white; 
      padding: 16px 24px; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    
    .menu-toggle { 
      background: none; 
      border: none; 
      cursor: pointer; 
      padding: 8px; 
      border-radius: 8px; 
      display: flex; 
      align-items: center;
      transition: all 0.2s;
    }
    
    .menu-toggle:hover {
      background: #f0f4f8;
      transform: scale(1.1);
    }
    
    .header-title h2 { 
      color: #2c3e50; 
      font-size: 1.3rem;
      font-weight: 600;
    }
    
    .user-menu { 
      display: flex; 
      align-items: center; 
      gap: 20px; 
      position: relative;
    }
    
    .notification-wrapper { position: relative; }
    
    .notification-btn { 
      background: none; 
      border: none; 
      cursor: pointer; 
      position: relative; 
      display: inline-flex; 
      align-items: center; 
      justify-content: center; 
      padding: 8px; 
      border-radius: 8px;
      transition: all 0.2s;
    }
    
    .notification-btn:hover { 
      background: #f0f4f8;
      transform: scale(1.1);
    }
    
    .notification-badge { 
      position: absolute; 
      top: 2px; 
      right: 2px; 
      min-width: 20px; 
      height: 20px; 
      border-radius: 10px; 
      background: linear-gradient(135deg, #e53935, #c62828);
      color: white; 
      font-size: 0.7rem; 
      font-weight: 700; 
      display: inline-flex; 
      align-items: center; 
      justify-content: center; 
      padding: 0 6px;
      box-shadow: 0 2px 8px rgba(229, 57, 53, 0.4);
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    .notification-dropdown { 
      position: absolute; 
      right: 0; 
      top: 48px; 
      width: 360px; 
      max-height: 450px; 
      overflow-y: auto; 
      background: white; 
      border: 1px solid #dfe7ef; 
      border-radius: 12px; 
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
      z-index: 20;
      animation: slideDown 0.3s ease;
    }
    
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .dropdown-header { 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      padding: 14px 16px; 
      border-bottom: 1px solid #eef2f6;
      background: linear-gradient(135deg, #f8f9fa, #ffffff);
    }
    
    .dropdown-empty { 
      padding: 24px 16px; 
      color: #6b7785; 
      font-size: 0.9rem;
      text-align: center;
    }
    
    .notification-item { 
      padding: 12px 16px; 
      border-bottom: 1px solid #f1f4f8; 
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .notification-item:hover { 
      background: #f8fbff;
      transform: translateX(4px);
    }
    
    .notification-item.no-leida { 
      background: #eef6ff;
      border-left: 4px solid #2196f3;
    }
    
    .notification-title { 
      font-weight: 600; 
      color: #2c3e50; 
      font-size: 0.9rem; 
      margin-bottom: 4px;
    }
    
    .notification-message { 
      color: #526172; 
      font-size: 0.85rem; 
      line-height: 1.4; 
      margin-bottom: 6px;
    }
    
    .notification-meta { 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      color: #7c8896; 
      font-size: 0.75rem;
    }
    
    .link-btn { 
      background: none; 
      border: none; 
      color: #1565c0; 
      cursor: pointer; 
      font-size: 0.75rem; 
      padding: 0;
      font-weight: 600;
      transition: all 0.2s;
    }
    
    .link-btn:hover {
      color: #0d47a1;
      text-decoration: underline;
    }
    
    .link-btn:disabled { 
      color: #9aa6b2; 
      cursor: not-allowed;
    }
    
    .user-avatar { 
      display: flex; 
      align-items: center; 
      gap: 10px; 
      color: #555;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    
    .user-avatar:hover {
      background: #f0f4f8;
    }
    
    .rol-badge { 
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      color: #1565c0; 
      padding: 4px 10px; 
      border-radius: 12px; 
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .content-area { 
      padding: 24px; 
      flex: 1;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    /* Scrollbar personalizado */
    .sidebar-nav::-webkit-scrollbar,
    .notification-dropdown::-webkit-scrollbar {
      width: 6px;
    }
    
    .sidebar-nav::-webkit-scrollbar-track,
    .notification-dropdown::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .sidebar-nav::-webkit-scrollbar-thumb,
    .notification-dropdown::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
    }
    
    .sidebar-nav::-webkit-scrollbar-thumb:hover,
    .notification-dropdown::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = true; // Cambiado a true para que inicie colapsado
  menuItems: any[] = [];
  tituloActual = 'Dashboard';
  notificaciones: Notificacion[] = [];
  notificacionesNoLeidas = 0;
  mostrarNotificaciones = false;
  private pollingId?: ReturnType<typeof setInterval>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit() {
    this.actualizarMenuPorRol();
    this.cargarNotificaciones();
    this.pollingId = setInterval(() => this.cargarNotificaciones(), 30000);
    
    // Escuchar cambios de ruta
    this.router.events.subscribe(() => {
      const path = this.router.url;
      const menu = this.menuItems.find(m => path.includes(m.path));
      if (menu) this.tituloActual = menu.label;
    });
  }

  ngOnDestroy() {
    if (this.pollingId) {
      clearInterval(this.pollingId);
    }
  }

  actualizarMenuPorRol() {
    const rol = this.authService.getRol();
    const items: any[] = [];
  
    // Dashboard común para todos
    items.push({ path: '/dashboard', icon: 'dashboard', label: 'Dashboard' });
  
    if (rol === 'ADMIN') {
      items.push(
        { path: '/tramites', icon: 'assignment', label: 'Trámites' },
        { path: '/diagramador', icon: 'timeline', label: 'Diagramador' },
        { path: '/templates', icon: 'auto_awesome', label: 'Flujo de Actividades' },
        { path: '/departamentos', icon: 'business', label: 'Departamentos' },
        { path: '/politicas', icon: 'policy', label: 'Políticas' },
        { path: '/usuarios', icon: 'people', label: 'Usuarios' }
      );
    } else if (rol === 'FUNCIONARIO') {
      items.push(
        { path: '/funcionario', icon: 'assignment', label: 'Mis Trámites' }
      );
    } else if (rol === 'CLIENTE') {
      items.push(
        { path: '/cliente', icon: 'assignment', label: 'Mis Trámites' }
      );
    }
    
    this.menuItems = items;
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getNombreUsuario(): string {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.nombre || user.email || 'Usuario';
      } catch (e) {
        return 'Usuario';
      }
    }
    return 'Usuario';
  }

  getRol(): string {
    return this.authService.getRol();
  }

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.mostrarNotificaciones) {
      this.cargarNotificaciones();
    }
  }

  cargarNotificaciones() {
    this.notificacionService.getNotificaciones().subscribe({
      next: (data) => {
        this.notificaciones = data.slice(0, 15);
        this.notificacionesNoLeidas = this.notificaciones.filter(n => !n.leida).length;
      },
      error: (err) => {
        console.error('Error cargando notificaciones:', err);
      }
    });
  }

  marcarLeida(notificacion: Notificacion, event: Event) {
    event.stopPropagation();
    this.notificacionService.marcarLeida(notificacion.id).subscribe({
      next: () => this.cargarNotificaciones(),
      error: (err) => console.error('Error marcando notificacion:', err)
    });
  }

  marcarTodasLeidas() {
    this.notificacionService.marcarTodasLeidas().subscribe({
      next: () => this.cargarNotificaciones(),
      error: (err) => console.error('Error marcando notificaciones:', err)
    });
  }

  abrirNotificacion(notificacion: Notificacion) {
    if (!notificacion.leida) {
      this.notificacionService.marcarLeida(notificacion.id).subscribe({
        next: () => this.cargarNotificaciones(),
        error: (err) => console.error('Error marcando notificacion:', err)
      });
    }

    if (notificacion.tramiteId) {
      const rol = this.getRol();
      if (rol === 'FUNCIONARIO') {
        this.router.navigate(['/funcionario']);
      } else if (rol === 'CLIENTE') {
        this.router.navigate(['/cliente']);
      } else {
        this.router.navigate(['/tramites']);
      }
    }
  }
}