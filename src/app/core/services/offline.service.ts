import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Servicio para gestionar el modo offline de la PWA
 */
@Injectable({
  providedIn: 'root'
})
export class OfflineService {
  private onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public online$ = this.onlineSubject.asObservable();
  
  private pendingOperations: any[] = [];
  private readonly PENDING_OPS_KEY = 'workflow_pending_operations';

  constructor() {
    this.initConnectivityMonitoring();
    this.loadPendingOperations();
  }

  /**
   * Inicializa el monitoreo de conectividad
   */
  private initConnectivityMonitoring(): void {
    // Escuchar cambios de conectividad
    merge(
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    ).pipe(
      map(() => navigator.onLine)
    ).subscribe(isOnline => {
      console.log(`[OfflineService] Connectivity changed: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
      this.onlineSubject.next(isOnline);
      
      // Si volvió online, intentar sincronizar
      if (isOnline) {
        this.syncPendingOperations();
      }
    });
  }

  /**
   * Verifica si hay conexión
   */
  isOnline(): boolean {
    return this.onlineSubject.value;
  }

  /**
   * Agrega una operación a la cola de pendientes
   */
  addPendingOperation(operation: PendingOperation): void {
    this.pendingOperations.push({
      ...operation,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      attempts: 0
    });
    
    this.savePendingOperations();
    console.log(`[OfflineService] Added pending operation: ${operation.type}`);
  }

  /**
   * Obtiene operaciones pendientes
   */
  getPendingOperations(): PendingOperation[] {
    return [...this.pendingOperations];
  }

  /**
   * Cuenta operaciones pendientes
   */
  getPendingCount(): number {
    return this.pendingOperations.length;
  }

  /**
   * Sincroniza operaciones pendientes
   */
  async syncPendingOperations(): Promise<void> {
    if (!this.isOnline() || this.pendingOperations.length === 0) {
      return;
    }

    console.log(`[OfflineService] Syncing ${this.pendingOperations.length} operations...`);

    const operations = [...this.pendingOperations];
    
    for (const op of operations) {
      try {
        await this.executeOperation(op);
        
        // Si tuvo éxito, eliminar de pendientes
        this.removePendingOperation(op.id);
        console.log(`[OfflineService] Synced: ${op.type}`);
      } catch (error) {
        console.error(`[OfflineService] Failed to sync ${op.type}:`, error);
        
        // Incrementar contador de intentos
        op.attempts++;
        
        // Si superó 5 intentos, eliminar
        if (op.attempts >= 5) {
          console.warn(`[OfflineService] Removing operation after 5 failed attempts: ${op.id}`);
          this.removePendingOperation(op.id);
        }
      }
    }

    this.savePendingOperations();
  }

  /**
   * Ejecuta una operación pendiente
   */
  private async executeOperation(op: PendingOperation): Promise<any> {
    const response = await fetch(op.url, {
      method: op.method,
      headers: {
        'Content-Type': 'application/json',
        ...op.headers
      },
      body: op.data ? JSON.stringify(op.data) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Elimina una operación de la cola
   */
  private removePendingOperation(id: string): void {
    this.pendingOperations = this.pendingOperations.filter(op => op.id !== id);
    this.savePendingOperations();
  }

  /**
   * Guarda operaciones en localStorage
   */
  private savePendingOperations(): void {
    try {
      localStorage.setItem(
        this.PENDING_OPS_KEY,
        JSON.stringify(this.pendingOperations)
      );
    } catch (error) {
      console.error('[OfflineService] Error saving pending operations:', error);
    }
  }

  /**
   * Carga operaciones desde localStorage
   */
  private loadPendingOperations(): void {
    try {
      const stored = localStorage.getItem(this.PENDING_OPS_KEY);
      if (stored) {
        this.pendingOperations = JSON.parse(stored);
        console.log(`[OfflineService] Loaded ${this.pendingOperations.length} pending operations`);
      }
    } catch (error) {
      console.error('[OfflineService] Error loading pending operations:', error);
      this.pendingOperations = [];
    }
  }

  /**
   * Limpia todas las operaciones pendientes
   */
  clearPendingOperations(): void {
    this.pendingOperations = [];
    this.savePendingOperations();
    console.log('[OfflineService] Cleared all pending operations');
  }

  /**
   * Registra el Service Worker
   */
  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('[OfflineService] Service Worker registered:', registration.scope);
        
        // Solicitar permisos de notificación
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      } catch (error) {
        console.error('[OfflineService] Service Worker registration failed:', error);
      }
    }
  }
}

/**
 * Interfaz para operaciones pendientes
 */
export interface PendingOperation {
  id?: string;
  type: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: any;
  headers?: { [key: string]: string };
  timestamp?: string;
  attempts?: number;
}
