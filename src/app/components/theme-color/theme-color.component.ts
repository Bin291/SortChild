import {Component, OnInit} from '@angular/core';
import {ThemeService} from '../../services/theme/theme.service';

@Component({
  selector: 'app-theme-color',
  imports: [],
  templateUrl: './theme-color.component.html',
  styleUrl: './theme-color.component.scss'
})
export class ThemeColorComponent implements OnInit{
  isLightTheme = false;
  constructor(private themeService: ThemeService) {

  }
  ngOnInit() {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    this.isLightTheme = saved === 'light';
  }

  onToggleThemeMode(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isLightTheme = isChecked;

    if (isChecked) {

      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }
}
