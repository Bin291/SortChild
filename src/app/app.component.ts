import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {GetStartComponent} from './components/get-start/get-start.component';
import {SortLabComponent} from './components/sort-lab/sort-lab.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [ GetStartComponent, SortLabComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'appsort';
  started = false;
  onStart() {
    this.started = true;
  }

  onReset() {
    this.started = false;
  }
  onStartLab() {
    this.started = true;
  }

}
