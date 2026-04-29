import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OpenAIService, ChatMessage } from '../../core/services/openai.service';
import { environment } from '../../../environments/environment';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  icon: string;
  text: string;
  prompt: string;
}

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-container" [class.minimized]="isMinimized">
      <!-- Botón Flotante -->
      <button class="chat-fab" (click)="toggleMinimize()" *ngIf="isMinimized">
        <span class="material-icons">smart_toy</span>
        <span class="fab-badge" *ngIf="messages.length > 0">{{ messages.length }}</span>
      </button>

      <!-- Tooltip de Bienvenida -->
      <div class="welcome-tooltip" *ngIf="showWelcomeTooltip && isMinimized">
        <div class="tooltip-content">
          <span class="material-icons">waving_hand</span>
          <p>¡Hey! Pregunta aquí</p>
        </div>
        <div class="tooltip-arrow"></div>
      </div>

      <!-- Chat Expandido -->
      <div class="chat-window" *ngIf="!isMinimized">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="header-content">
            <span class="material-icons">smart_toy</span>
            <span class="header-title">Asistente AI</span>
            <span class="status-dot" [class.active]="!isLoading"></span>
          </div>
          <button class="btn-minimize" (click)="toggleMinimize()">
            <span class="material-icons">close</span>
          </button>
        </div>
        <!-- Chat Body -->
        <div class="chat-body">
          <div class="messages-container" #messagesContainer>
          <div class="welcome-message" *ngIf="messages.length === 0">
            <span class="material-icons">waving_hand</span>
            <p>¡Hola! Soy tu asistente AI. Puedo ayudarte con:</p>
            <ul>
              <li>Información sobre políticas y trámites</li>
              <li>Cómo usar el sistema de diagramas</li>
              <li>Gestión de usuarios y departamentos</li>
              <li>Análisis de cuellos de botella</li>
            </ul>
            <p>¿En qué puedo ayudarte?</p>
            
            <!-- Sugerencias de Preguntas Frecuentes -->
            <div class="quick-suggestions">
              <button 
                *ngFor="let action of quickActions" 
                class="suggestion-btn"
                (click)="sendQuickMessage(action.prompt)"
              >
                <span class="material-icons">{{ action.icon }}</span>
                <span>{{ action.text }}</span>
              </button>
            </div>
          </div>

          <div *ngFor="let msg of messages" class="message" [class.user]="msg.role === 'user'" [class.assistant]="msg.role === 'assistant'">
            <div class="message-avatar">
              <span class="material-icons">{{ msg.role === 'user' ? 'person' : 'smart_toy' }}</span>
            </div>
            <div class="message-content">
              <div class="message-text">{{ msg.content }}</div>
              <div class="message-time">{{ msg.timestamp | date:'short' }}</div>
            </div>
          </div>

          <div *ngIf="isLoading" class="message assistant">
            <div class="message-avatar">
              <span class="material-icons">smart_toy</span>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>

          </div>
        </div>

        <!-- Input Area -->
        <div class="chat-input">
          <button class="btn-clear" (click)="clearHistory()" title="Limpiar historial" *ngIf="messages.length > 0">
            <span class="material-icons">delete_outline</span>
          </button>
          <input 
            type="text" 
            [(ngModel)]="userInput" 
            (keyup.enter)="sendMessage()"
            placeholder="Escribe tu pregunta..."
            [disabled]="isLoading"
          />
          <button class="btn-send" (click)="sendMessage()" [disabled]="!userInput.trim() || isLoading">
            <span class="material-icons">send</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chatbot-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
    }

    /* Botón Flotante */
    .chat-fab {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .chat-fab:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 32px rgba(37, 99, 235, 0.5);
    }

    .chat-fab:active {
      transform: scale(0.95);
    }

    .chat-fab .material-icons {
      font-size: 32px;
    }

    .fab-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: white;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
    }

    /* Tooltip de Bienvenida */
    .welcome-tooltip {
      position: absolute;
      bottom: 80px;
      right: 0;
      animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .tooltip-content {
      background: white;
      padding: 16px 20px;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      white-space: nowrap;
      border: 1px solid #e2e8f0;
    }

    .tooltip-content .material-icons {
      font-size: 24px;
      color: #2563eb;
    }

    .tooltip-content p {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
    }

    .tooltip-arrow {
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 10px solid white;
      position: absolute;
      bottom: -9px;
      right: 24px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }

    /* Ventana de Chat */
    .chat-window {
      width: 400px;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      max-height: 650px;
      border: 1px solid rgba(0,0,0,0.05);
      animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .chat-header {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 18px 24px;
      border-radius: 20px 20px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-content .material-icons {
      font-size: 28px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
    }

    .header-title {
      font-weight: 700;
      font-size: 17px;
      letter-spacing: -0.3px;
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #ef4444;
      animation: pulse 2s infinite;
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }

    .status-dot.active {
      background: #10b981;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      animation: pulse-active 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { 
        opacity: 1;
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
      }
      50% { 
        opacity: 0.6;
        box-shadow: 0 0 0 4px rgba(239, 68, 68, 0);
      }
    }

    @keyframes pulse-active {
      0%, 100% { 
        opacity: 1;
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      }
      50% { 
        opacity: 1;
        box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
      }
    }

    .btn-minimize {
      background: rgba(255, 255, 255, 0.15);
      border: none;
      color: white;
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .btn-minimize:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.05);
    }

    .btn-minimize:active {
      transform: scale(0.95);
    }

    .chat-body {
      display: flex;
      flex-direction: column;
      height: 550px;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .welcome-message {
      text-align: center;
      color: #64748b;
      padding: 30px 24px;
      background: linear-gradient(to bottom, #f8fafc, #ffffff);
    }

    .welcome-message .material-icons {
      font-size: 56px;
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 16px;
      filter: drop-shadow(0 2px 4px rgba(37, 99, 235, 0.2));
    }

    .welcome-message p {
      font-size: 15px;
      font-weight: 500;
      color: #334155;
      margin-bottom: 20px;
    }

    .welcome-message ul {
      text-align: left;
      margin: 20px 0;
      padding-left: 24px;
      list-style: none;
    }

    .welcome-message li {
      margin: 12px 0;
      color: #475569;
      font-size: 14px;
      position: relative;
      padding-left: 8px;
    }

    .welcome-message li::before {
      content: "✓";
      position: absolute;
      left: -20px;
      color: #2563eb;
      font-weight: bold;
    }

    .quick-suggestions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 24px;
      padding: 0 12px;
    }

    .suggestion-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 13px;
      color: #475569;
      font-weight: 500;
      text-align: left;
    }

    .suggestion-btn:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      border-color: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .suggestion-btn .material-icons {
      font-size: 18px;
    }

    .message {
      display: flex;
      gap: 10px;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message.user {
      flex-direction: row-reverse;
    }

    .message-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .message.user .message-avatar {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
    }

    .message.assistant .message-avatar {
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      color: #2563eb;
      border: 2px solid #e2e8f0;
    }

    .message-content {
      max-width: 70%;
    }

    .message-text {
      padding: 12px 16px;
      border-radius: 16px;
      line-height: 1.5;
      word-wrap: break-word;
    }

    .message.user .message-text {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      border-bottom-right-radius: 4px;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
    }

    .message.assistant .message-text {
      background: #f1f5f9;
      color: #1e293b;
      border-bottom-left-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    .message-time {
      font-size: 11px;
      color: #999;
      margin-top: 4px;
      padding: 0 8px;
    }

    .typing-indicator {
      display: flex;
      gap: 6px;
      padding: 14px 18px;
      background: #f1f5f9;
      border-radius: 18px;
      border-bottom-left-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      animation: typing 1.4s infinite ease-in-out;
    }

    .typing-indicator span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .typing-indicator span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes typing {
      0%, 60%, 100% { 
        transform: translateY(0);
        opacity: 0.7;
      }
      30% { 
        transform: translateY(-12px);
        opacity: 1;
      }
    }

    .quick-actions {
      padding: 0 20px 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .quick-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 14px;
      color: #475569;
      font-weight: 500;
    }

    .quick-btn:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      border-color: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .quick-btn .material-icons {
      font-size: 20px;
      transition: transform 0.2s;
    }

    .quick-btn:hover .material-icons {
      transform: scale(1.1);
    }

    .chat-input {
      display: flex;
      gap: 8px;
      padding: 18px 24px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      border-radius: 0 0 20px 20px;
    }

    .btn-clear {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: white;
      color: #64748b;
      border: 2px solid #e2e8f0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-clear:hover {
      background: #fee2e2;
      color: #ef4444;
      border-color: #fecaca;
      transform: scale(1.05);
    }

    .chat-input input {
      flex: 1;
      padding: 12px 18px;
      border: 2px solid #e2e8f0;
      border-radius: 24px;
      outline: none;
      font-size: 14px;
      background: white;
      transition: all 0.2s;
    }

    .chat-input input:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .chat-input input::placeholder {
      color: #94a3b8;
    }

    .btn-send {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    }

    .btn-send:hover:not(:disabled) {
      background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
      transform: scale(1.08);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
    }

    .btn-send:active:not(:disabled) {
      transform: scale(0.95);
    }

    .btn-send:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
      box-shadow: none;
    }

    .messages-container::-webkit-scrollbar {
      width: 6px;
    }

    .messages-container::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .messages-container::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;
    }

    .messages-container::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `]
})
export class AIChatbotComponent implements OnInit {
  messages: Message[] = [];
  userInput = '';
  isLoading = false;
  isMinimized = true;
  showWelcomeTooltip = false;
  
  private http = inject(HttpClient);
  private conversationHistory: ChatMessage[] = [];
  private systemContext = '';
  
  quickActions: QuickAction[] = [
    { icon: 'help_outline', text: '¿Cómo crear una política?', prompt: '¿Cómo puedo crear una nueva política de negocio?' },
    { icon: 'account_tree', text: 'Usar el editor de diagramas', prompt: '¿Cómo uso el editor de diagramas de flujo?' },
    { icon: 'analytics', text: 'Analizar cuellos de botella', prompt: '¿Cómo puedo detectar cuellos de botella en mis procesos?' },
    { icon: 'people', text: 'Gestionar usuarios', prompt: '¿Cómo gestiono usuarios y departamentos?' }
  ];

  private systemPrompt = `Eres un asistente AI experto en sistemas de gestión de flujos de trabajo y políticas de negocio. 
Ayudas a usuarios a entender y usar un sistema que incluye:
- Creación y gestión de políticas de negocio
- Editor de diagramas de flujo con GoJS
- Gestión de trámites y seguimiento
- Análisis de cuellos de botella
- Gestión de usuarios (ADMIN, FUNCIONARIO, CLIENTE) y departamentos

Responde de manera clara, concisa y amigable. Si no sabes algo, admítelo. 
Usa ejemplos prácticos cuando sea posible.

CONTEXTO DEL SISTEMA ACTUAL:
{context}`;

  constructor(private openaiService: OpenAIService) {}

  async ngOnInit() {
    // Cargar historial persistente
    this.loadHistory();
    
    // Cargar contexto del sistema
    await this.loadSystemContext();
    
    // Inicializar conversación con contexto
    this.conversationHistory.push({
      role: 'system',
      content: this.systemPrompt.replace('{context}', this.systemContext)
    });

    // Mostrar tooltip de bienvenida solo la primera vez
    const hasSeenWelcome = localStorage.getItem('chatbot_welcome_shown');
    if (!hasSeenWelcome) {
      setTimeout(() => {
        this.showWelcomeTooltip = true;
        localStorage.setItem('chatbot_welcome_shown', 'true');
        
        setTimeout(() => {
          this.showWelcomeTooltip = false;
        }, 5000);
      }, 1000);
    }
  }

  private async loadSystemContext() {
    try {
      // Obtener estadísticas del sistema
      const [politicas, tramites, usuarios] = await Promise.all([
        this.http.get<any[]>(`${environment.apiUrl}/politicas`).toPromise().catch(() => []),
        this.http.get<any[]>(`${environment.apiUrl}/tramites`).toPromise().catch(() => []),
        this.http.get<any[]>(`${environment.apiUrl}/usuarios`).toPromise().catch(() => [])
      ]);

      this.systemContext = `
- Total de políticas activas: ${politicas?.length || 0}
- Total de trámites: ${tramites?.length || 0}
- Total de usuarios: ${usuarios?.length || 0}
- Políticas disponibles: ${politicas?.map(p => p.nombre).join(', ') || 'Ninguna'}
      `.trim();
    } catch (error) {
      console.log('No se pudo cargar el contexto del sistema');
      this.systemContext = 'Sistema en modo básico';
    }
  }

  private loadHistory() {
    const saved = localStorage.getItem('chatbot_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.messages = parsed.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        this.conversationHistory = parsed.conversationHistory;
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }

  private saveHistory() {
    try {
      localStorage.setItem('chatbot_history', JSON.stringify({
        messages: this.messages,
        conversationHistory: this.conversationHistory
      }));
    } catch (e) {
      console.error('Error saving history:', e);
    }
  }

  clearHistory() {
    if (confirm('¿Estás seguro de que quieres limpiar el historial de conversación?')) {
      this.messages = [];
      this.conversationHistory = [{
        role: 'system',
        content: this.systemPrompt.replace('{context}', this.systemContext)
      }];
      localStorage.removeItem('chatbot_history');
    }
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.showWelcomeTooltip = false; // Ocultar tooltip al abrir
  }

  sendQuickMessage(message: string) {
    this.userInput = message;
    this.sendMessage();
  }

  async sendMessage() {
    if (!this.userInput.trim() || this.isLoading) return;

    const userMessage = this.userInput.trim();
    this.userInput = '';

    // Add user message
    this.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    this.isLoading = true;
    this.scrollToBottom();

    try {
      const response = await this.openaiService.chat(this.conversationHistory).toPromise();
      
      if (response && response.choices && response.choices.length > 0) {
        const assistantMessage = response.choices[0].message.content;
        
        this.messages.push({
          role: 'assistant',
          content: assistantMessage,
          timestamp: new Date()
        });

        this.conversationHistory.push({
          role: 'assistant',
          content: assistantMessage
        });
      }
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      this.messages.push({
        role: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor verifica tu API key de OpenAI en el archivo environment.ts',
        timestamp: new Date()
      });
    } finally {
      this.isLoading = false;
      this.scrollToBottom();
      this.saveHistory(); // Guardar historial después de cada mensaje
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}
