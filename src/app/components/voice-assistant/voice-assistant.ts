import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpenAIService } from '../../core/services/openai.service';

declare var webkitSpeechRecognition: any;

export interface VoiceCommand {
  action: 'addNode' | 'addLane' | 'connect' | 'delete' | 'edit' | 'save' | 'help';
  params?: any;
  rawText: string;
}

@Component({
  selector: 'app-voice-assistant',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="voice-assistant" [class.active]="isListening">
      <button class="voice-btn" (click)="toggleListening()" [class.listening]="isListening">
        <span class="material-icons">{{ isListening ? 'mic' : 'mic_none' }}</span>
      </button>
      
      <div class="voice-feedback" *ngIf="isListening || transcript">
        <div class="feedback-content">
          <div class="listening-animation" *ngIf="isListening">
            <div class="wave"></div>
            <div class="wave"></div>
            <div class="wave"></div>
          </div>
          <p class="transcript" *ngIf="transcript">{{ transcript }}</p>
          <p class="status">{{ statusMessage }}</p>
        </div>
      </div>

      <div class="voice-help" *ngIf="showHelp">
        <h4>Comandos de Voz Disponibles:</h4>
        <ul>
          <li><strong>"Agregar nodo [nombre]"</strong> - Crea un nuevo nodo</li>
          <li><strong>"Agregar calle [nombre]"</strong> - Crea una nueva calle/lane</li>
          <li><strong>"Conectar [nodo1] con [nodo2]"</strong> - Conecta dos nodos</li>
          <li><strong>"Eliminar nodo [nombre]"</strong> - Elimina un nodo</li>
          <li><strong>"Editar nodo [nombre] a [nuevo nombre]"</strong> - Renombra un nodo</li>
          <li><strong>"Guardar diagrama"</strong> - Guarda el diagrama actual</li>
          <li><strong>"Ayuda"</strong> - Muestra esta ayuda</li>
        </ul>
        <button class="btn-close-help" (click)="showHelp = false">
          <span class="material-icons">close</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .voice-assistant {
      position: fixed;
      bottom: 100px;
      right: 30px;
      z-index: 9998;
    }

    .voice-btn {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .voice-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 30px rgba(102, 126, 234, 0.6);
    }

    .voice-btn.listening {
      animation: pulse 1.5s infinite;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 4px 20px rgba(245, 87, 108, 0.4);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 6px 30px rgba(245, 87, 108, 0.6);
      }
    }

    .voice-btn .material-icons {
      font-size: 32px;
    }

    .voice-feedback {
      position: absolute;
      bottom: 80px;
      right: 0;
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      min-width: 300px;
      max-width: 400px;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .feedback-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .listening-animation {
      display: flex;
      justify-content: center;
      gap: 6px;
      height: 40px;
      align-items: center;
    }

    .wave {
      width: 4px;
      height: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 2px;
      animation: wave 1s ease-in-out infinite;
    }

    .wave:nth-child(2) {
      animation-delay: 0.1s;
    }

    .wave:nth-child(3) {
      animation-delay: 0.2s;
    }

    @keyframes wave {
      0%, 100% {
        height: 20px;
      }
      50% {
        height: 40px;
      }
    }

    .transcript {
      font-size: 16px;
      color: #2c3e50;
      margin: 0;
      font-weight: 500;
    }

    .status {
      font-size: 13px;
      color: #7f8c8d;
      margin: 0;
    }

    .voice-help {
      position: absolute;
      bottom: 80px;
      right: 0;
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      width: 350px;
      animation: slideUp 0.3s ease;
    }

    .voice-help h4 {
      margin: 0 0 16px 0;
      color: #2c3e50;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .voice-help ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .voice-help li {
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
      color: #555;
      font-size: 14px;
      line-height: 1.5;
    }

    .voice-help li:last-child {
      border-bottom: none;
    }

    .btn-close-help {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      cursor: pointer;
      color: #999;
      padding: 4px;
      display: flex;
      align-items: center;
    }

    .btn-close-help:hover {
      color: #666;
    }
  `]
})
export class VoiceAssistantComponent implements OnInit, OnDestroy {
  @Output() commandExecuted = new EventEmitter<VoiceCommand>();

  isListening = false;
  transcript = '';
  statusMessage = 'Presiona el botón y habla...';
  showHelp = false;
  
  private recognition: any;
  private isProcessing = false;
  private speechSynthesis: SpeechSynthesis | null = null;
  private voiceEnabled = true;

  constructor(private openaiService: OpenAIService) {}

  ngOnInit() {
    this.initSpeechRecognition();
    this.initSpeechSynthesis();
  }

  ngOnDestroy() {
    if (this.recognition) {
      this.recognition.stop();
    }
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  private initSpeechSynthesis() {
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    } else {
      console.warn('Speech synthesis not supported');
      this.voiceEnabled = false;
    }
  }

  private speak(text: string) {
    if (!this.speechSynthesis || !this.voiceEnabled) return;

    this.speechSynthesis.cancel(); // Cancelar cualquier speech anterior
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    this.speechSynthesis.speak(utterance);
  }

  private initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.statusMessage = 'Escuchando...';
      };

      this.recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        this.transcript = transcript;

        if (event.results[current].isFinal) {
          this.processVoiceCommand(transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.statusMessage = 'Error: ' + event.error;
        this.isListening = false;
      };

      this.recognition.onend = () => {
        if (!this.isProcessing) {
          this.isListening = false;
          this.statusMessage = 'Presiona el botón y habla...';
        }
      };
    } else {
      console.warn('Speech recognition not supported');
      this.statusMessage = 'Reconocimiento de voz no soportado en este navegador';
    }
  }

  toggleListening() {
    if (!this.recognition) {
      alert('El reconocimiento de voz no está disponible en tu navegador. Usa Chrome o Edge.');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      this.transcript = '';
      this.recognition.start();
    }
  }

  private async processVoiceCommand(text: string) {
    this.isProcessing = true;
    this.statusMessage = 'Procesando comando con AI...';

    try {
      const command = await this.interpretCommandWithAI(text);
      
      if (command) {
        this.commandExecuted.emit(command);
        this.statusMessage = '✓ Comando ejecutado';
        
        // Feedback de voz
        const feedback = this.getVoiceFeedback(command);
        this.speak(feedback);
        
        setTimeout(() => {
          this.transcript = '';
          this.statusMessage = 'Presiona el botón y habla...';
        }, 2000);
      } else {
        this.statusMessage = 'No se pudo interpretar el comando';
        this.speak('No entendí el comando. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error processing command:', error);
      this.statusMessage = 'Error al procesar el comando';
      this.speak('Hubo un error al procesar el comando.');
    } finally {
      this.isProcessing = false;
    }
  }

  private getVoiceFeedback(command: VoiceCommand): string {
    switch (command.action) {
      case 'addNode':
        return `Nodo ${command.params?.text || 'nuevo'} agregado correctamente`;
      case 'addLane':
        return `Calle ${command.params?.text || 'nueva'} agregada correctamente`;
      case 'connect':
        return `Nodos conectados correctamente`;
      case 'delete':
        return `Nodo eliminado correctamente`;
      case 'edit':
        return `Nodo renombrado correctamente`;
      case 'save':
        return `Diagrama guardado correctamente`;
      case 'help':
        return `Mostrando ayuda de comandos disponibles`;
      default:
        return 'Comando ejecutado';
    }
  }

  private async interpretCommandWithAI(text: string): Promise<VoiceCommand | null> {
    const systemPrompt = `Eres un asistente que interpreta comandos de voz para un editor de diagramas de flujo.
Analiza el comando del usuario y devuelve un JSON con la acción a realizar.

Acciones disponibles:
- addNode: Agregar un nodo (params: {text: string, type?: 'Circle'|'Diamond'|'Database'|'RoundedRectangle'})
- addLane: Agregar una calle/lane (params: {text: string})
- connect: Conectar dos nodos (params: {from: string, to: string})
- delete: Eliminar un nodo (params: {text: string})
- edit: Editar/renombrar un nodo (params: {oldText: string, newText: string})
- save: Guardar el diagrama
- help: Mostrar ayuda

Ejemplos:
"agregar nodo validación" -> {"action": "addNode", "params": {"text": "Validación"}}
"crear calle cliente" -> {"action": "addLane", "params": {"text": "Cliente"}}
"conectar inicio con validación" -> {"action": "connect", "params": {"from": "Inicio", "to": "Validación"}}
"eliminar nodo prueba" -> {"action": "delete", "params": {"text": "Prueba"}}
"editar nodo inicio a comienzo" -> {"action": "edit", "params": {"oldText": "Inicio", "newText": "Comienzo"}}
"guardar diagrama" -> {"action": "save"}
"ayuda" -> {"action": "help"}

Responde SOLO con el JSON, sin texto adicional.`;

    try {
      const response = await this.openaiService.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ]).toPromise();

      if (response && response.choices && response.choices.length > 0) {
        const content = response.choices[0].message.content.trim();
        // Remove markdown code blocks if present
        const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        
        return {
          ...parsed,
          rawText: text
        };
      }
    } catch (error) {
      console.error('Error interpreting with AI:', error);
      // Fallback: simple pattern matching
      return this.fallbackInterpretation(text);
    }

    return null;
  }

  private fallbackInterpretation(text: string): VoiceCommand | null {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('ayuda')) {
      this.showHelp = true;
      return { action: 'help', rawText: text };
    }

    if (lowerText.includes('guardar')) {
      return { action: 'save', rawText: text };
    }

    if (lowerText.includes('conectar')) {
      const match = text.match(/conectar\s+(.+?)\s+con\s+(.+)/i);
      if (match) {
        return {
          action: 'connect',
          params: { from: match[1].trim(), to: match[2].trim() },
          rawText: text
        };
      }
    }

    if (lowerText.includes('eliminar')) {
      const words = text.split(' ');
      const nodeText = words.slice(2).join(' ');
      if (nodeText) {
        return {
          action: 'delete',
          params: { text: nodeText },
          rawText: text
        };
      }
    }

    if (lowerText.includes('editar') || lowerText.includes('renombrar')) {
      const match = text.match(/(?:editar|renombrar)\s+(?:nodo\s+)?(.+?)\s+a\s+(.+)/i);
      if (match) {
        return {
          action: 'edit',
          params: { oldText: match[1].trim(), newText: match[2].trim() },
          rawText: text
        };
      }
    }

    if (lowerText.includes('nodo') || lowerText.includes('agregar')) {
      const words = text.split(' ');
      const nodeText = words.slice(2).join(' ') || 'Nuevo Nodo';
      return {
        action: 'addNode',
        params: { text: nodeText },
        rawText: text
      };
    }

    if (lowerText.includes('calle') || lowerText.includes('lane')) {
      const words = text.split(' ');
      const laneText = words.slice(2).join(' ') || 'Nueva Calle';
      return {
        action: 'addLane',
        params: { text: laneText },
        rawText: text
      };
    }

    return null;
  }
}
