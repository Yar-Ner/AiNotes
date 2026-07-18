import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgZone } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true // Это важно для Standalone-компонентов
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    // Метод bypassSecurityTrustHtml разрешает вставку HTML
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, SafeHtmlPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('AiNotes');
  dreams = ["Хочу покодить", "Надо сделать приложение о земле"];
  neuro_dreams: string[] = [];
  isLoading = false;
  newDream: string = '';
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
      this.neuro_dreams = [data.result || 'Нет ответа'];
    } catch (error) {
      console.error('Ошибка ИИ:', error);
      this.neuro_dreams = ['Ошибка подключения к серверу'];
    } finally {
      this.isLoading = false;
    }
  }

  AddItem(dream: string) {
  if (dream && dream.trim() !== '') {
    this.dreams.push(dream); // Добавляем в список
    this.newDream = '';      // Очищаем поле после отправки
  }
}
// В компоненте
recognition: any;
constructor(private zone: NgZone) {}
ngOnInit() {
    // Используем проверку, чтобы код не падал, если API не поддерживается
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'ru-RU';
      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
  this.zone.run(() => {
    this.newDream = transcript; // Теперь Angular точно узнает об изменениях
  });
      };
    } else {
      console.warn('Ваш браузер не поддерживает распознавание речи');
    }
  }

// Добавь переменную в класс
isListening: boolean = false;

startListening() {
  if (this.isListening) {
    // Если уже слушаем, можно либо просто выйти, либо остановить:
    // this.recognition.stop(); 
    return; 
  }

  if (this.recognition) {
    this.isListening = true;
    this.recognition.start();

    // Когда распознавание завершилось, сбрасываем флаг
    this.recognition.onend = () => {
      this.isListening = false;
    };
  }
}

stopListening() {
  if (this.recognition && this.isListening) {
    this.recognition.stop();
    this.isListening = false;
  }
}
  delItem(dream: any){
    this.dreams = this.dreams.filter(d => d !== dream);
  }
}
