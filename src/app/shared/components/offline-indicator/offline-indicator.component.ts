import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { OfflineService } from '../../../core/services/offline.service';

/**
 * Indicador visual de estado offline/online
 * Muestra banner cuando no hay conexión
 */
@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="offline-indicator" [class.offline]="!isOnline" [class.syncing]="isSyncing">
      <div class="content" *ngIf="!isOnline || pendingCount > 0">
        <div class="status-icon">
          <span *ngIf="!isOnline">📡</span>
          <span *ngIf="isOnline && pendingCount > 0">🔄</span>
        </div>
        
        <div class="status-text">
          <span *ngIf="!isOnline" class="offline-text">
            Sin conexión - Trabajando offline
          </span>
          <span *ngIf="isOnline && pendingCount > 0" class="syncing-text">
            Sincronizando {{ pendingCount }} operación(es)...
          </span>
        </div>
        
        <button 
          *ngIf="isOnline && pendingCount > 0"
          class="sync-button"
          (click)="forceSync()"
          [disabled]="isSyncing">
          Sincronizar ahora
        </button>
      </div>
    </div>
  `,
  styles: [`
    .offline-indicator {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      transition: all 0.3s ease;
      transform: translateY(-100%);
    }

    .offline-indicator.offline,
    .offline-indicator.syncing {
      transform: translateY(0);
    }

    .offline-indicator.offline {
      background: #f59e0b;
      color: white;
    }

    .offline-indicator.syncing {
      background: #3b82f6;
      color: white;
    }

    .content {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 20px;
      gap: 12px;
    }

    .status-icon {
      font-size: 24px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .status-text {
      font-size: 14px;
      font-weight: 500;
    }

    .sync-button {
      padding: 6px 16px;
      background: white;
      color: #3b82f6;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .sync-button:hover:not(:disabled) {
      background: #f3f4f6;
      transform: scale(1.05);
    }

    .sync-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .offline-text {
      animation: fadeIn 0.5s;
    }

    .syncing-text {
      animation: pulse 1.5s infinite;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class OfflineIndicatorComponent implements OnInit, OnDestroy {
  isOnline = true;
  pendingCount = 0;
  isSyncing = false;
  
  private subscriptions: Subscription[] = [];

  constructor(private offlineService: OfflineService) {}

  ngOnInit(): void {
    // Suscribirse a cambios de conectividad
    const onlineSub = this.offlineService.online$.subscribe(online => {
      this.isOnline = online;
      
      // Si volvió online, actualizar count de pendientes
      if (online) {
        this.updatePendingCount();
      }
    });
    
    this.subscriptions.push(onlineSub);
    
    // Estado inicial
    this.isOnline = this.offlineService.isOnline();
    this.updatePendingCount();
    
    // Actualizar count periódicamente
    setInterval(() => this.updatePendingCount(), 5000);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  updatePendingCount(): void {
    this.pendingCount = this.offlineService.getPendingCount();
  }

  async forceSync(): Promise<void> {
    if (this.isSyncing || !this.isOnline) return;
    
    this.isSyncing = true;
    
    try {
      await this.offlineService.syncPendingOperations();
      this.updatePendingCount();
    } catch (error) {
      console.error('Error al sincronizar:', error);
    } finally {
      this.isSyncing = false;
    }
  }
}
