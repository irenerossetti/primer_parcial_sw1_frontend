import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Editor Colaborativo de Documentos
 * Permite edición en tiempo real con múltiples usuarios (WebSocket)
 */
@Component({
  selector: 'app-collaborative-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collaborative-editor.component.html',
  styleUrls: ['./collaborative-editor.component.css']
})
export class CollaborativeEditorComponent implements OnInit, OnDestroy {
  // Configuración
  private readonly API_URL = `${environment.mlServiceUrl}/collaborative`;
  private readonly WS_URL = `${environment.mlServiceWsUrl}/collaborative/ws`;

  // Estado del documento
  docId: string = 'doc-001';
  content: string = '';
  userId: string = 'user-' + Math.random().toString(36).substr(2, 9);
  username: string = 'Usuario ' + this.userId.substr(5, 4);
  myColor: string = '#3498db';

  // Usuarios activos
  activeUsers: any[] = [];

  // WebSocket
  private ws?: WebSocket;
  connected = false;

  // Estado
  loading = false;
  error: string | null = null;
  
  // Sincronización
  private syncTimeout: any;
  lastSaved: Date | null = null;
  isDirty = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Simular modo sin WebSocket real (para demo)
    this.loadDocument();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  /**
   * Carga documento existente
   */
  async loadDocument(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // Primero intentar cargar documento
      const response: any = await this.http
        .get(`${this.API_URL}/document/${this.docId}`)
        .toPromise();

      if (response.success) {
        this.content = response.document.content;
        this.activeUsers = response.document.active_users || [];
      }
    } catch (err: any) {
      // Si no existe, crear nuevo
      if (err.status === 404) {
        await this.createDocument();
      } else {
        this.error = 'Error cargando documento';
        console.error(err);
      }
    } finally {
      this.loading = false;
    }
  }

  /**
   * Crea nuevo documento
   */
  async createDocument(): Promise<void> {
    try {
      const response: any = await this.http
        .post(`${this.API_URL}/create-document`, {
          doc_id: this.docId,
          content: 'Escribe aquí tu documento colaborativo...\n\nPuedes editar este texto.',
          owner_id: this.userId
        })
        .toPromise();

      if (response.success) {
        this.content = response.document.content;
        console.log('✓ Documento creado');
      }
    } catch (err) {
      this.error = 'Error creando documento';
      console.error(err);
    }
  }

  /**
   * Conectar a WebSocket (simplificado para demo)
   */
  connectWebSocket(): void {
    try {
      this.ws = new WebSocket(`${this.WS_URL}/${this.docId}/${this.userId}`);

      this.ws.onopen = () => {
        console.log('🔌 WebSocket conectado');
        this.connected = true;
        
        // Enviar mensaje de join
        this.ws!.send(JSON.stringify({
          action: 'join',
          username: this.username
        }));
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.error = 'Error de conexión WebSocket';
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket desconectado');
        this.connected = false;
      };
    } catch (err) {
      console.error('Error connecting WebSocket:', err);
      this.error = 'No se pudo conectar al servidor en tiempo real';
    }
  }

  /**
   * Desconectar WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.send(JSON.stringify({ action: 'leave' }));
      this.ws.close();
      this.ws = undefined;
    }
  }

  /**
   * Maneja mensajes del WebSocket
   */
  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'welcome':
        this.myColor = data.color;
        this.activeUsers = data.document_state.active_users || [];
        this.content = data.document_state.content;
        console.log('✓ Bienvenido al documento:', data);
        break;

      case 'change':
        // Aplicar cambio de otro usuario
        this.applyRemoteChange(data.change);
        break;

      case 'user_joined':
        this.activeUsers.push(data.user);
        console.log('👤 Usuario unido:', data.user.username);
        break;

      case 'user_left':
        this.activeUsers = this.activeUsers.filter(u => u.user_id !== data.user_id);
        console.log('👤 Usuario salió');
        break;

      case 'cursor':
        // Actualizar posición de cursor de otro usuario
        const user = this.activeUsers.find(u => u.user_id === data.user_id);
        if (user) {
          user.cursor_position = data.position;
        }
        break;
    }
  }

  /**
   * Aplica cambio remoto al documento
   */
  private applyRemoteChange(change: any): void {
    if (change.user_id === this.userId) return; // Ignorar propios cambios

    // Aplicar cambio
    if (change.change_type === 'replace') {
      this.content = change.content;
    }
    // TODO: Implementar insert/delete granular
  }

  /**
   * Cuando el usuario escribe (detectar cambios)
   */
  onContentChange(): void {
    this.isDirty = true;

    // Debounce para no enviar cada tecla
    clearTimeout(this.syncTimeout);
    this.syncTimeout = setTimeout(() => {
      this.syncChange();
    }, 1000); // 1 segundo de debounce
  }

  /**
   * Sincroniza cambio con el servidor
   */
  async syncChange(): Promise<void> {
    if (!this.isDirty) return;

    try {
      if (this.connected && this.ws) {
        // Enviar por WebSocket
        this.ws.send(JSON.stringify({
          action: 'change',
          change_type: 'replace',
          content: this.content
        }));
      } else {
        // Fallback: enviar por HTTP
        await this.http.post(`${this.API_URL}/apply-change`, {
          doc_id: this.docId,
          user_id: this.userId,
          change_type: 'replace',
          content: this.content
        }).toPromise();
      }

      this.isDirty = false;
      this.lastSaved = new Date();
    } catch (err) {
      console.error('Error sincronizando cambio:', err);
    }
  }

  /**
   * Guarda snapshot manual
   */
  async saveSnapshot(): Promise<void> {
    this.loading = true;

    try {
      const response: any = await this.http
        .post(`${this.API_URL}/save-snapshot/${this.docId}`, {})
        .toPromise();

      if (response.success) {
        this.lastSaved = new Date();
        alert('✓ Documento guardado exitosamente');
      }
    } catch (err) {
      alert('❌ Error guardando documento');
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Ver historial de cambios
   */
  async viewHistory(): Promise<void> {
    try {
      const response: any = await this.http
        .get(`${this.API_URL}/history/${this.docId}?limit=10`)
        .toPromise();

      if (response.success) {
        console.log('Historial:', response.history);
        alert(`Historial: ${response.count} cambios recientes`);
      }
    } catch (err) {
      alert('Error obteniendo historial');
      console.error(err);
    }
  }

  /**
   * Obtiene iniciales del username
   */
  getUserInitials(username: string): string {
    return username.split(' ').map(w => w[0]).join('').toUpperCase().substr(0, 2);
  }
}
