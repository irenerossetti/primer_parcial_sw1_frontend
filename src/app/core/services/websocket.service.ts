import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any = null;
  private connected = false;
  private isConnecting = false;

  // Observables para diferentes eventos
  private tramiteActualizadoSubject = new BehaviorSubject<any>(null);
  private nuevoTramiteSubject = new BehaviorSubject<any>(null);
  private tramiteCompletadoSubject = new BehaviorSubject<any>(null);
  private cuelloBottellaSubject = new BehaviorSubject<any>(null);

  tramiteActualizado$ = this.tramiteActualizadoSubject.asObservable();
  nuevoTramite$ = this.nuevoTramiteSubject.asObservable();
  tramiteCompletado$ = this.tramiteCompletadoSubject.asObservable();
  cuellosBottellaActualizados$ = this.cuelloBottellaSubject.asObservable();

  constructor() {
    this.initializeStompClient();
  }

  /**
   * Inicializa el cliente STOMP para WebSocket
   */
  private initializeStompClient() {
    // Dinámicamente cargar SockJS y Stomp si no están disponibles
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js';

    const script2 = document.createElement('script');
    script2.src = 'https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js';

    script2.onload = () => {
      this.connect();
    };

    script1.onload = () => {
      document.head.appendChild(script2);
    };

    document.head.appendChild(script1);
  }

  /**
   * Conecta al servidor WebSocket
   */
  connect(): void {
    if (this.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    // Esperar a que SockJS y Stomp estén disponibles
    const checkLibraries = setInterval(() => {
      if ((window as any).SockJS && (window as any).Stomp) {
        clearInterval(checkLibraries);
        this.establishConnection();
      }
    }, 100);

    // Timeout de 5 segundos para evitar espera infinita
    setTimeout(() => {
      clearInterval(checkLibraries);
      if (!this.connected) {
        console.warn('No se pudo conectar a WebSocket');
        this.isConnecting = false;
      }
    }, 5000);
  }

  /**
   * Establece la conexión STOMP
   */
  private establishConnection(): void {
    try {
      const baseUrl = environment.apiUrl.replace('/api', '');
      const socket = new (window as any).SockJS(`${baseUrl}/ws-tramites`);
      this.stompClient = (window as any).Stomp.over(socket);

      this.stompClient.connect(
        {},
        (frame: any) => {
          console.log('WebSocket conectado:', frame);
          this.connected = true;
          this.isConnecting = false;

          // Suscribirse a los diferentes tópicos
          this.subscribeToTopics();
        },
        (error: any) => {
          console.error('Error en WebSocket:', error);
          this.isConnecting = false;
          // Reintentar conexión en 5 segundos
          setTimeout(() => this.connect(), 5000);
        }
      );
    } catch (error) {
      console.error('Error inicializando WebSocket:', error);
      this.isConnecting = false;
    }
  }

  /**
   * Se suscribe a los tópicos de notificaciones
   */
  private subscribeToTopics(): void {
    if (!this.stompClient || !this.stompClient.connected) {
      return;
    }

    // Suscribirse a actualizaciones de trámites
    this.stompClient.subscribe('/topic/tramites/actualizacion', (message: any) => {
      const data = JSON.parse(message.body);
      this.tramiteActualizadoSubject.next(data);
      console.log('Trámite actualizado:', data);
    });

    // Suscribirse a nuevos trámites
    this.stompClient.subscribe('/topic/tramites/nuevo', (message: any) => {
      const data = JSON.parse(message.body);
      this.nuevoTramiteSubject.next(data);
      console.log('Nuevo trámite:', data);
    });

    // Suscribirse a trámites completados
    this.stompClient.subscribe('/topic/tramites/completado', (message: any) => {
      const data = JSON.parse(message.body);
      this.tramiteCompletadoSubject.next(data);
      console.log('Trámite completado:', data);
    });

    // Suscribirse a actualizaciones de cuellos de botella
    this.stompClient.subscribe('/topic/analytics/cuellos-botella-actualizado', (message: any) => {
      const data = JSON.parse(message.body);
      this.cuelloBottellaSubject.next(data);
      console.log('Cuellos de botella actualizados');
    });

    // Suscribirse a notificaciones específicas del usuario
    const userEmail = this.getUserEmail();
    if (userEmail) {
      this.stompClient.subscribe(`/topic/tramites/${userEmail}`, (message: any) => {
        const data = JSON.parse(message.body);
        this.tramiteActualizadoSubject.next(data);
        console.log('Notificación personal:', data);
      });
    }
  }

  /**
   * Obtiene el email del usuario actual (si está disponible)
   */
  private getUserEmail(): string | null {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Decodificar JWT (base64)
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.sub || null;
      }
    } catch (error) {
      console.warn('No se pudo obtener email del usuario');
    }
    return null;
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Desconecta del servidor WebSocket
   */
  disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.disconnect(() => {
        console.log('Desconectado de WebSocket');
        this.connected = false;
      });
    }
  }
}
