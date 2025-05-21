import {Injectable, Renderer2, RendererFactory2} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private renderer: Renderer2;
  private readonly darkClass = 'dark-theme';
  private isBrowser = typeof window !== 'undefined';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  enableDarkTheme(): void {
    this.renderer.addClass(document.documentElement, this.darkClass);
    if (this.isBrowser) localStorage.setItem('theme', 'dark');
  }

  enableLightTheme(): void {
    this.renderer.removeClass(document.documentElement, this.darkClass);
    if (this.isBrowser) localStorage.setItem('theme', 'light');
  }

  toggleTheme(): void {
    const isDark = document.documentElement.classList.contains(this.darkClass);
    isDark ? this.enableLightTheme() : this.enableDarkTheme();
  }

  /** ✅ Đây là phần quan trọng */
  loadInitialTheme(): void {
    if (!this.isBrowser) return;

    const saved = localStorage.getItem('theme');

    if (saved === 'light') {
      this.enableLightTheme();
    } else {
      // ✅ Mặc định dark nếu chưa có hoặc là "dark"
      this.enableDarkTheme();
    }
  }

  isDarkTheme(): boolean {
    return document.documentElement.classList.contains(this.darkClass);
  }
}
