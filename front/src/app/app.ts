import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('AiNotes');
  dreams = ["Хочу покодить", "Надо сделать приложение о земле"];
  neuro_dreams: string[] = [];
  isLoading = false;

  async onMagicClick() {
    if (this.dreams.length === 0) return;

    this.isLoading = true;
    try {
      const response = await fetch('https://ai-notes-sepia-nine.vercel.app/api/magic', {
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

  AddItem(inputElement: HTMLInputElement){
    const text = inputElement.value.trim();
    
    if (text) {
      this.dreams.push(text);
      inputElement.value = '';
    }
  }

  delItem(dream: any){
    this.dreams = this.dreams.filter(d => d !== dream);
  }
}
