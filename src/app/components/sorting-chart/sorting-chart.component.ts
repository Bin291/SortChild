import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-sorting-chart',
  imports: [],
  templateUrl: './sorting-chart.component.html',
  styleUrl: './sorting-chart.component.scss'
})
export class SortingChartComponent {
  @Input() algorithm: string = '';
  @Output() stepChange = new EventEmitter<number>();

  currentStep = 0;
  interval: any;
  isRunning = false;


  // Gọi từ component cha khi bấm nút play
  public play() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.interval = setInterval(() => {
      this.stepChange.emit(this.currentStep);
      this.currentStep++;
      if (this.currentStep >= this.getStepCount()) {
        this.stop();
      }
    }, 600); // hoặc speed tùy bạn
  }

  public stop() {
    clearInterval(this.interval);
    this.isRunning = false;
  }

  public reset() {
    this.stop();
    this.currentStep = 0;
    this.stepChange.emit(this.currentStep);
  }

  private getStepCount(): number {
    // Tuỳ thuật toán, bạn có thể tùy biến lại
    return 30;
  }
}
