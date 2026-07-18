import { Component, signal, OnInit, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from './markdown.pipe'; // Укажи правильный путь

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  protected readonly title = signal('AiNotes');
  
  dreams: string[] = ["Хочу покодить", "Надо сделать приложение о земле"];
  neuro_dreams: string[] = [];
  
  isLoading = false;
  newDream: string = '';
  isListening: boolean = false;
  
  recognition: any;

  constructor(private zone: NgZone) {}

  ngOnInit() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'ru-RU';
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.zone.run(() => {
          this.newDream = transcript;
        });
      };
      this.recognition.onend = () => {
        this.zone.run(() => { this.isListening = false; });
      };
    }
  }

  // Методы управления
async onMagicClick() {
    if (this.dreams.length === 0) return;
    this.isLoading = true;
    try {
      const response = await fetch('https://ainotes-82br.onrender.com/api/magic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreams: this.dreams })
      });
      const data = await response.json();
      
      // ДОБАВЛЕНА ЗАМЕНА для корректного отображения списков
      const rawResult = data.result || 'Нет ответа';
      const formattedResult = rawResult.replace(/- /g, '\n- '); 
      
      this.neuro_dreams = [formattedResult];
    } catch (error) {
      console.error('Ошибка ИИ:', error);
      this.neuro_dreams = ['Ошибка подключения к серверу'];
    } finally {
      this.isLoading = false;
    }
  }

  AddItem(dream: string) {
    if (dream?.trim()) {
      this.dreams.push(dream);
      this.newDream = '';
    }
  }

  delItem(dream: string) {
    this.dreams = this.dreams.filter(d => d !== dream);
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.recognition.start();
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }
}
