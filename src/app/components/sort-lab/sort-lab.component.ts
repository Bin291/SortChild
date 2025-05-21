import {Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, Input} from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {RandomDialogComponent} from '../random-dialog/random-dialog.component';
import {CodeHighlightComponent} from '../code-highlight/code-highlight.component';
import {SortingChartComponent} from '../sorting-chart/sorting-chart.component';
import {ThemeColorComponent} from '../theme-color/theme-color.component';

interface AlgorithmState {
  name: string;
  numbers: number[];
  currentStep: number;
  isFinished: boolean;
  startTime: number;
  endTime?: number;
  instructions?: string[];

  steps?: any[];
  history?: { // Kept: Used by backStep logic
    numbers: number[];
    currentStep: number;
    swapIndices?: [number, number];
    currentAction: string;
    shellGap?: number;
    shellI?: number;
    radixDigit?: number;
    compareIndices?: [number, number];
    i?: number; j?: number; key?: number;
    swappedInPass?: boolean; // Bubble
    minIndex?: number; // Selection
    shellJ?: number; shellTemp?: number;
    maxNum?: number; // Radix
    initialized?: boolean;
  }[];

  // --- Highlighting ---
  swapIndices?: [number, number]; // Kept: Indices just swapped/moved
  compareIndices?: [number, number]; // New: Indices being compared
  initialized?: boolean;
  i?: number;
  j?: number;
  key?: number;
  swappedInPass?: boolean;
  minIndex?: number;
  shellGap?: number;
  shellI?: number;
  shellJ?: number;
  shellTemp?: number;
  radixDigit?: number;
  maxNum?: number;
}
interface Step {
  action: string;
  snapshot: number[];
  low?: number;
  high?: number;
  i?: number;
  j?: number;
  pivotIndex?: number;
  line: number;
}
@Component({
  selector: 'app-sort-lab',
  templateUrl: 'sort-lab.component.html',
  styleUrls: ['sort-lab.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    NgForOf,
    NgClass,
    NgIf,
    CodeHighlightComponent,
    SortingChartComponent,
    ThemeColorComponent,
  ],
})
export class SortLabComponent implements OnInit, OnDestroy {
  mode: 'single' | 'dual' | 'all' = 'single';
  selectedAlgorithm: string = 'insertion';
  selectedAlgorithm2: string = 'bubble';
  numbers: number[] = [1, 2, 10, 23, 12, 18, 9, 20, 25, 6, 7];
  newNumber: number | null = null;
  @Input() algorithmDescription: string = '';
  speed: number = 1;
  isPlaying: boolean = false;
  playButtonText: string = 'Play';
  pauseButtonText: string = 'Pause';
  private timeoutId: any = null;
  previousStates: AlgorithmState[][] = [];
  currentAction: string = '';
  currentPseudoCode: string[] = [];
  currentLineIndex = -1;
  inputValues: string[] = [];
  @Output() stepChange = new EventEmitter<number>();
  @ViewChild('chart') chartComponent!: any;
  previousValues: number[] = [];
  lineHighlightQueue: number[] = [];

  storePreviousValue(index: number): void {
    this.previousValues[index] = this.numbers[index];
  }

  algorithmStates: AlgorithmState[] = [];
  algorithms: string[] = ['insertion', 'bubble', 'quick', 'shell', 'radix', 'selection'];
  algorithmNames: { [key: string]: string } = {
    insertion: 'Insertion Sort',
    bubble: 'Bubble Sort',
    quick: 'Quick Sort',
    shell: 'Shell Sort',
    radix: 'Radix Sort',
    selection: 'Selection Sort',
  };
  pseudoCodes: { [key: string]: string[] } = {
    bubble: [
      'for (int i = 0; i < n - 1; i++) {',
      '  for (int j = 0; j < n - i - 1; j++) {',
      '    if (arr[j] > arr[j + 1]) {',
      '      swap(arr[j], arr[j + 1]);',
      '    }',
      '  }',
      '}'
    ],
    selection: [
      'for (int i = 0; i < n - 1; i++) {',
      '  int minIndex = i;',
      '  for (int j = i + 1; j < n; j++) {',
      '    if (arr[j] < arr[minIndex]) {',
      '      minIndex = j;',
      '    }',
      '  }',
      '  swap(arr[i], arr[minIndex]);',
      '}'
    ],
    insertion: [
      'for (int i = 1; i < n; i++) {',
      '   int key = arr[i];',
      '   int j = i - 1;',
      '   while (j >= 0 && arr[j] > key) {',
      '     arr[j + 1] = arr[j];',
      '       j--;',
      '    }',
      '    arr[j + 1] = key;',
      ' }'
    ],
    quick: [
      'void quickSort(int arr[], int low, int high) {',
      '  if (low < high) {',
      '    int pi = partition(arr, low, high);',
      '    quickSort(arr, low, pi - 1);',
      '    quickSort(arr, pi + 1, high);',
      '  }',
      '}'
    ],
    shell: [
      'for (int gap = n / 2; gap > 0; gap /= 2) {',
      '  for (int i = gap; i < n; i++) {',
      '    int temp = arr[i];',
      '    int j;',
      '    for (j = i; j >= gap && arr[j - gap] > temp; j -= gap) {',
      '      arr[j] = arr[j - gap];',
      '    }',
      '    arr[j] = temp;',
      '  }',
      '}'
    ],
    radix: [
      'int max = getMax(arr, n);',
      'for (int exp = 1; max / exp > 0; exp *= 10) {',
      '  countSort(arr, n, exp);',
      '}'
    ]
  };
  algorithmDescriptions: { [key: string]: string } = {
    insertion: `Description: A simple sorting algorithm that builds the final sorted array one element at a time by inserting each element into its correct position of the array.

Steps
  1. Start from the second element in the array.
  2. Compare it with the elements to its left.
  3. Shift larger elements to the right and insert the current element intoitsts correct position.

Complexity
  - Time: Best 0(n), Average/Worst O(n²)
  - Space: O(1)`,

    bubble: `Description: A basic sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.

Steps
  1. Traverse the array multiple times.
  2. Compare each pair of adjacent elements.
  3. Swap if needed, and repeat until no swaps are required.

Complexity
  - Time: Best O(n), Average/Worst O(n²)
  - Space: O(1)`,

    quick: `Description: A highly efficient divide-and-conquer sorting algorithm that partitions the array into subarrays based on a pivot and recursively sorts the subarrays.

Steps
  1. Choose a pivot element from the array.
  2. Partition the array into two parts: elements less than the pivot and greater than the pivot.
  3. Recursively apply the same steps to the subarrays.

Complexity
  - Time: Best/Average O(n log n), Worst O(n²)
  - Space: O(log n) (for recursion stack)`,

    shell: `Description: An optimization of insertion sort that starts by comparing elements far apart and gradually reduces the gap between elements to be compared.

Steps
  1. Choose a large initial gap between elements.
  2. Use insertion sort on elements that are 'gap' apart.
  3. Gradually reduce the gap until it becomes 1.

Complexity
  - Time: Depends on the gap sequence; typically between O(n) and O(n²)
  - Space: O(1)`,

    radix: `Description: A non-comparative sorting algorithm that sorts numbers digit by digit, starting from the least significant digit using a stable sorting algorithm such as counting sort.

Steps
  1. Sort elements based on the least significant digit.
  2. Move to the next digit and repeat using a stable sort.
  3. Continue until the most significant digit is sorted.

Complexity
  - Time: O(nk), where k is the number of digits
  - Space: O(n + k)`,

    selection: `Description: A simple comparison-based algorithm that divides the array into a sorted and unsorted part, repeatedly selecting the minimum from the unsorted part and placing it at the beginning.

Steps
  1. Find the minimum element in the unsorted portion.
  2. Swap it with the first unsorted element.
  3. Move the sorted boundary one step to the right.

Complexity
  - Time: Best/Average/Worst O(n²)
  - Space: O(1)`,

  };

  constructor(private dialog: MatDialog) {
  }

  ngOnInit() {
    const savedMode = localStorage.getItem('sortLabMode') as 'single' | 'dual' | 'all';
    this.mode = savedMode || 'single';
    this.updateDescription();
    this.reset();
    this.inputValues = this.numbers.map(n => n.toString());
  }

  ngOnDestroy() {
    this.clearTimeout();
  }

  setMode(mode: 'single' | 'dual' | 'all') {
    this.mode = mode;
    localStorage.setItem('sortLabMode', mode);
    this.reset();
  }

  getMaxHeight(numbers: number[]): number {
    const maxValue = Math.max(...numbers, 1);
    const maxHeight = this.mode === 'all' ? 150 : 300;
    const minHeightFactor = 2;

    if (maxValue < 10) {
      return (maxHeight / 10) * minHeightFactor;
    }
    const scaleFactor = maxHeight / Math.min(maxValue, 1000);
    return scaleFactor;
  }

  getBarHeight(num: number, numbers: number[]): number {
    const minHeight = 10;
    const calculatedHeight = num * this.getMaxHeight(numbers);
    return Math.max(minHeight, calculatedHeight);
  }

  getBarWidth(numbers: number[]): number {
    const baseWidth = this.mode === 'all' ? 10 : 15;
    const minWidth = this.mode === 'all' ? 5 : 10;
    const maxElements = 50;
    const numElements = numbers.length;

    let calculatedWidth = baseWidth;
    if (numElements > maxElements) {
      calculatedWidth = baseWidth * (maxElements / numElements);
    }
    return Math.max(minWidth, calculatedWidth);
  }

  getCompactMaxHeight(numbers: number[]): number {
    const maxValue = Math.max(...numbers, 1);
    const maxHeight = 150; // Height of the div
    const minHeightFactor = 2;

    if (maxValue < 10) {
      return (maxHeight / 10) * minHeightFactor;
    }
    const scaleFactor = maxHeight / Math.min(maxValue, 1000);
    return scaleFactor;
  }

  getCompactBarHeight(num: number, numbers: number[]): number {
    const minHeight = 5;
    const calculatedHeight = num * this.getCompactMaxHeight(numbers);
    return Math.max(minHeight, calculatedHeight);
  }

  getCompactBarWidth(numbers: number[]): number {
    const baseWidth = 10;
    const minWidth = 5;
    const maxElements = 30;
    const numElements = numbers.length;

    let calculatedWidth = baseWidth;
    if (numElements > maxElements) {
      calculatedWidth = baseWidth * (maxElements / numElements);
    }
    return Math.max(minWidth, calculatedWidth);
  }

  addNumber() {
    if (this.newNumber !== null) {
      // Không cho phép thêm số âm hoặc số 0
      if (this.newNumber <= 0) {
        alert('Only positive integers greater than 0 can be added!');
        this.newNumber = null;
        return;
      }

      if (this.newNumber > 1000) {
        alert('The number entered cannot be greater than 1000!');
        this.newNumber = null;
        return;
      }

      if (this.numbers.length >= 27) {
        alert('Maximum number of elements reached (27).');
        this.newNumber = null;
        return;
      }

      // Thêm số vào mảng và reset
      this.numbers.push(this.newNumber);
      this.newNumber = null;
      this.reset();
    }
  }


  trackByIndex(index: number, item: any): number {
    return index;
  }

  handleKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const rawValue = this.numbers[index];
      if (rawValue == null || String(rawValue).trim() === '') {
        this.removeNumber(index);
        return;
      }
      const value = Number(rawValue);
      if (isNaN(value)) {
        return;
      }
      if (!Number.isInteger(value) || value < 0) {
        alert('Please enter a non-negative integer.');
        this.numbers[index] = this.previousValues[index];
        return;
      }
      if (value > 1000) {
        alert('Input number cannot be greater than 1000!');
        this.numbers[index] = this.previousValues[index];
        return;
      }
      this.previousValues[index] = value;
      (event.target as HTMLInputElement).blur();
    }
  }

  removeNumber(index: number): void {
    this.numbers.splice(index, 1);
    this.inputValues.splice(index, 1);
    this.reset();
  }


  randomize() {
    const dialogRef = this.dialog.open(RandomDialogComponent, {
      width: '300px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result <= 100 && result > 0) { // Limit random elements
        this.numbers = Array.from({length: result}, () => Math.floor(Math.random() * 100) + 1); // Adjust range if needed
        this.reset();
      } else if (result > 100) {
        alert("Maximum number of elements to randomize is 100.");
      }
    });
  }

  clear() {
    this.numbers = [];
    this.reset();
  }


  reset() {
    this.isPlaying = false;
    this.currentAction = '';
    this.playButtonText = 'Play';
    this.pauseButtonText = 'Pause';
    this.clearTimeout(); // Hủy setTimeout khi reset
    this.algorithmStates = [];

    if (this.mode === 'single') {
      this.algorithmStates = [
        {
          name: this.selectedAlgorithm,
          numbers: [...this.numbers],
          currentStep: 0,
          isFinished: false,
          startTime: 0,
          instructions: [...this.updateDescription()]
        },

      ];
    } else if (this.mode === 'dual') {
      this.algorithmStates = [
        {name: this.selectedAlgorithm, numbers: [...this.numbers], currentStep: 0, isFinished: false, startTime: 0},
        {name: this.selectedAlgorithm2, numbers: [...this.numbers], currentStep: 0, isFinished: false, startTime: 0},
      ];
    } else if (this.mode === 'all') {
      this.algorithmStates = this.algorithms.map(algo => ({
        name: algo,
        numbers: [...this.numbers],
        currentStep: 0,
        isFinished: false,
        startTime: 0,
      }));
    }

    this.algorithmStates.forEach(state => {
      if (state.name === 'quick') {
        state.steps = this.generateQuickSortSteps([...state.numbers], 0, state.numbers.length - 1);
      } else if (state.name === 'shell') {
        state.shellGap = Math.floor(state.numbers.length / 2);
        state.shellI = state.shellGap;
      } else if (state.name === 'radix') {
        state.radixDigit = 1;
      }
    });
  }

  submit() {
    this.play();
    this.reset();
  }

  play() {
    // Check if already finished or numbers are empty
    if (this.algorithmStates.every(s => s.isFinished) || this.numbers.length === 0) {
      this.reset(); // Reset if finished or empty before playing
    }
    if (this.isPaused) {
      this.resumeSorting();
      return;
    }
    this.isPlaying = true;
    this.isPaused = false;
    this.playButtonText = 'Playing...';
    this.pauseButtonText = 'Pause';
    this.currentAction = 'Sorting started!';
    // Record start time only if not already started/resumed
    this.algorithmStates.forEach(state => {
      if (state.startTime === 0) state.startTime = Date.now()
    });
    this.runAlgorithms();
  }

  isPaused = false;

  togglePause() {
    if (this.isPlaying) {
      // Đang chạy -> thì pause
      this.isPaused = true;
      this.isPlaying = false;
      this.playButtonText = 'Play';
      this.pauseButtonText = 'Paused';
      this.currentAction = 'Sorting paused.';
    } else if (this.isPaused) {
      // Nếu đang bị pause → resume lại
      this.resumeSorting();
    }
  }

  resumeSorting() {
    if (!this.isPaused) return;
    this.isPlaying = true;
    this.isPaused = false;
    this.playButtonText = 'Playing...';
    this.pauseButtonText = 'Pause';
    this.currentAction = 'Sorting resumed!';
    this.runAlgorithms(); // tiếp tục thực thi sorting step
  }


  nextStep() {
    if (this.isPlaying || this.algorithmStates.every(s => s.isFinished)) return; // Don't step if playing or finished
    const clonedStates: AlgorithmState[] = JSON.parse(JSON.stringify(this.algorithmStates));
    this.previousStates.push(clonedStates); // Push the snapshot before the step
    let actionTaken = false;
    this.algorithmStates.forEach(state => {
      if (!state.isFinished) {
        this.runAlgorithmStep(state);
        actionTaken = true;
        if (this.mode === 'single') {
        }
      }
    });
    if (!actionTaken) {
      this.currentAction = "Sorting already complete.";
      this.previousStates.pop(); // Remove the state we just pushed as nothing happened
    } else {
      this.currentAction = 'Stepped forward'; // General action message
    }
    if (this.mode === 'single' && this.algorithmStates.length > 0) {
    }
  }

  backStep() {
    if (this.previousStates.length === 0) return;

    this.clearTimeout();
    this.isPlaying = false;
    this.isPaused = false;
    this.playButtonText = 'Play';
    this.pauseButtonText = 'Pause';

    const previousSnapshot = this.previousStates.pop();
    if (previousSnapshot) {
      this.algorithmStates = JSON.parse(JSON.stringify(previousSnapshot));
      this.currentAction = 'Stepped back';
      const state = this.algorithmStates[0];
      let nextLineIndex = -1;
      if (state.steps && typeof state.currentStep === 'number') {
        const step = state.steps[state.currentStep];
        nextLineIndex = step?.line ?? -1;
      } else if (this.mode === 'single') {
        state.currentStep--;
        this.runAlgorithmStep(state);
        return;
      }
      this.currentLineIndex = nextLineIndex;
      this.stepChange.emit(this.currentLineIndex);
    }
  }


  onSpeedChange(event: Event) {
      const inputElement = event.target as HTMLInputElement;
      const value = Number(inputElement.value);
      console.log('Speed changed to:', value);
      this.speed = Math.max(0.1, value);
      console.log('Formatted speed label:', this.formatSpeedLabel(this.speed));
      if (this.isPlaying && !this.isPaused) {
        this.clearTimeout();
        this.runAlgorithms();
      }
    }
    formatSpeedLabel(value: number): string {
      return `${value}x`;
    }
  updateDescription(): string[] {
    this.algorithmDescription = this.algorithmDescriptions[this.selectedAlgorithm] || ' ';
    this.currentPseudoCode = this.pseudoCodes[this.selectedAlgorithm] || [];
    this.currentLineIndex = -1;
    this.stepChange.emit(this.currentLineIndex);
    return this.currentPseudoCode;
  }

  getBarColor(index: number, state: AlgorithmState): string {
    if (state.isFinished) {
      return '#4CAF50';
    }
    if (state.swapIndices) {
      if (index === state.swapIndices[0]) {
        return '#1c82ff';
      } else if (index === state.swapIndices[1]) {
        return '#ff5722';
      }
    }
    if (state.compareIndices) {
      if (index === state.compareIndices[0] || index === state.compareIndices[1]) {
        return '#ff27e3';
      }
    }
    return '#673ab7';
  }

  runAlgorithms() {
    const clonedStates: AlgorithmState[] = JSON.parse(JSON.stringify(this.algorithmStates));
    this.previousStates.push(clonedStates);
    if (this.previousStates.length > 1000) this.previousStates.shift(); // tránh tràn bộ nhớ


    if (!this.isPlaying || this.isPaused) return;
    this.clearTimeout();
    this.timeoutId = setTimeout(() => {
      if (!this.isPlaying || this.isPaused) return;
      let allFinished = true;
      let actionTakenInStep = false;
      this.algorithmStates.forEach(state => {
        if (!state.isFinished) {
          const stepBefore = state.currentStep;
          this.runAlgorithmStep(state);
          if (state.currentStep !== stepBefore || state.isFinished) {
            actionTakenInStep = true;
          }
          if (!state.isFinished) {
            allFinished = false;
          } else if (!state.endTime) {
            state.endTime = Date.now();
          }
        }
      });
      if (!allFinished && actionTakenInStep) {
        this.runAlgorithms();
      } else if (allFinished) {
        this.isPlaying = false;
        this.isPaused = false;
        this.playButtonText = 'Play';
        this.pauseButtonText = 'Pause';
        this.currentAction = 'Sorting complete!';
        this.currentLineIndex = -1;
        this.stepChange.emit(this.currentLineIndex);
        this.algorithmStates.forEach(state => state.swapIndices = undefined);
      } else if (!actionTakenInStep) {
        console.warn("Algorithm loop stopped: No state advanced in the last step. Possible infinite loop or error in algorithm logic.");
        this.isPlaying = false;
        this.isPaused = false;
        this.playButtonText = 'Play';
        this.pauseButtonText = 'Pause';
        this.currentAction = 'Sorting stopped due to potential issue.';
      }
    }, 2000 / this.speed);
  }

  private clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  runAlgorithmStep(state: AlgorithmState) {
    const nums = state.numbers;
    if (state.isFinished) return;

    state.compareIndices = undefined;
    state.swapIndices = undefined;

    if (!state.initialized) {
      state.initialized = true;
      switch (state.name) {
        case 'insertion':
          state.i = 1;
          if (nums.length > 1) {
            state.key = nums[1];
            state.j = 0;
          } else state.isFinished = true;
          break;
        case 'bubble':
          state.i = 0;
          state.j = 0;
          state.swappedInPass = false;
          if (nums.length <= 1) state.isFinished = true;
          break;
        case 'selection':
          state.i = 0;
          state.minIndex = 0;
          state.j = 1;
          if (nums.length <= 1) state.isFinished = true;
          break;
        case 'quick':
          state.steps = this.generateQuickSortSteps([...nums], 0, nums.length - 1);
          break;
        case 'shell':
          state.shellGap = Math.floor(nums.length / 2);
          if (state.shellGap > 0) {
            state.shellI = state.shellGap;
            state.shellTemp = nums[state.shellI];
            state.shellJ = state.shellI;
          } else state.isFinished = true;
          break;
        case 'radix':
          state.radixDigit = 1;
          state.maxNum = nums.length > 0 ? Math.max(...nums) : 0;
          if ((state.maxNum === 0 && nums.length <= 1) || nums.length === 0) {
            state.isFinished = true;
          }
          break;
      }
    }

    const algo = state.name;
    switch (algo) {
      case 'insertion':
        if (state.i! < nums.length) {
          this.lineHighlightQueue.push(0, 1, 2);
          if (state.j! >= 0 && nums[state.j!] > state.key!) {
            this.lineHighlightQueue.push(3, 4);
            nums[state.j! + 1] = nums[state.j!];
            state.swapIndices = [state.j! + 1, state.j!];
            this.currentAction = `Shifting ${nums[state.j! + 1]} to position ${state.j! + 1}`;
            state.j!--;
          } else {
            this.lineHighlightQueue.push(5, 6);
            nums[state.j! + 1] = state.key!;
            state.swapIndices = [state.j! + 1, state.i!];
            this.currentAction = `Inserted ${state.key!} at position ${state.j! + 1}`;
            state.i!++;
            if (state.i! < nums.length) {
              state.key = nums[state.i!];
              state.j = state.i! - 1;
              this.lineHighlightQueue.push(0, 1, 2);
            } else {
              state.isFinished = true;
              this.currentAction = 'Array is sorted';
              this.lineHighlightQueue.push(7);
            }
          }
        } else {
          state.isFinished = true;
          this.currentAction = 'Array is sorted';
          this.lineHighlightQueue.push(7);
        }
        break;

      case 'bubble':
        const n = nums.length;
        if (state.i! < n - 1) {
          if (state.j! < n - state.i! - 1) {
            this.lineHighlightQueue.push(0, 1, 2);
            state.compareIndices = [state.j!, state.j! + 1];
            this.currentAction = `Comparing ${nums[state.j!]} and ${nums[state.j! + 1]}`;
            if (nums[state.j!] > nums[state.j! + 1]) {
              [nums[state.j!], nums[state.j! + 1]] = [nums[state.j! + 1], nums[state.j!]];
              state.swapIndices = [state.j!, state.j! + 1];
              state.swappedInPass = true;
              this.currentAction = `Swapped ${nums[state.j! + 1]} with ${nums[state.j!]}`;
              this.lineHighlightQueue.push(3, 4);
            } else {
              this.lineHighlightQueue.push(4);
            }
            state.j!++;
          } else {
            if (!state.swappedInPass!) {
              state.isFinished = true;
              this.currentAction = 'Array is sorted (no swaps in last pass)';
            } else {
              state.i!++;
              state.j = 0;
              state.swappedInPass = false;
            }
          }
        } else {
          state.isFinished = true;
          this.currentAction = 'Array is sorted';
        }
        break;

      case 'selection':
        const len = nums.length;
        if (state.i! < len - 1) {
          this.lineHighlightQueue.push(0, 1);
          if (state.j! < len) {
            this.lineHighlightQueue.push(2, 3);
            state.compareIndices = [state.j!, state.minIndex!];
            this.currentAction = `Comparing ${nums[state.j!]} with current min ${nums[state.minIndex!]}`;
            if (nums[state.j!] < nums[state.minIndex!]) {
              state.minIndex = state.j!;
              this.lineHighlightQueue.push(4);
              this.currentAction += `. New min found: ${nums[state.minIndex!]}`;
            }
            state.j!++;
          } else {
            this.lineHighlightQueue.push(5);
            if (state.minIndex !== state.i!) {
              [nums[state.i!], nums[state.minIndex!]] = [nums[state.minIndex!], nums[state.i!]];
              state.swapIndices = [state.i!, state.minIndex!];
              this.currentAction = `Swapped min ${nums[state.i!]} into position ${state.i!}`;
            } else {
              this.currentAction = `Element ${nums[state.i!]} already in correct position ${state.i!}`;
            }
            state.i!++;
            if (state.i! < len - 1) {
              state.minIndex = state.i!;
              state.j = state.i! + 1;
            } else {
              state.isFinished = true;
              this.currentAction = 'Array is sorted';
            }
          }
        } else {
          state.isFinished = true;
          this.currentAction = 'Array is sorted';
        }
        break;

      case 'quick':
        if (state.steps && state.currentStep < state.steps.length) {
          const step = state.steps[state.currentStep];
          if (step.snapshot) state.numbers = [...step.snapshot];
          state.swapIndices = [step.i, step.j];
          this.lineHighlightQueue.push(step.line ?? 2);
          this.currentAction = `QuickSort: Swapped ${step.snapshot?.[step.i]} and ${step.snapshot?.[step.j]}`;
          state.currentStep++;
        } else {
          state.isFinished = true;
          this.currentAction = 'QuickSort finished.';
          this.lineHighlightQueue.push(-1);
        }
        break;

      case 'shell':
        if (state.shellGap! > 0) {
          if (state.shellI! < nums.length) {
            if (state.shellJ! >= state.shellGap! && nums[state.shellJ! - state.shellGap!] > state.shellTemp!) {
              this.lineHighlightQueue.push(3, 4);
              nums[state.shellJ!] = nums[state.shellJ! - state.shellGap!];
              state.swapIndices = [state.shellJ!, state.shellJ! - state.shellGap!];
              this.currentAction = `Shell Shift (gap ${state.shellGap!})`;
              state.shellJ! -= state.shellGap!;
            } else {
              this.lineHighlightQueue.push(5, 6);
              nums[state.shellJ!] = state.shellTemp!;
              state.swapIndices = [state.shellJ!, state.shellI!];
              this.currentAction = `Shell Insert (gap ${state.shellGap!})`;
              state.shellI!++;
              if (state.shellI! < nums.length) {
                state.shellTemp = nums[state.shellI!];
                state.shellJ = state.shellI!;
              }
            }
          } else {
            state.shellGap = Math.floor(state.shellGap! / 2);
            if (state.shellGap! > 0) {
              state.shellI = state.shellGap!;
              state.shellTemp = nums[state.shellI!];
              state.shellJ = state.shellI!;
              this.currentAction = `Starting next Shell pass with gap ${state.shellGap!}`;
            } else {
              state.isFinished = true;
              this.currentAction = 'Array is sorted';
            }
          }
        } else {
          state.isFinished = true;
          this.currentAction = 'Array is sorted';
        }
        break;

      case 'radix':
        if (state.radixDigit! <= state.maxNum!) {
          const digit = state.radixDigit!;
          const output = new Array(nums.length).fill(0);
          const count = new Array(10).fill(0);
          this.lineHighlightQueue.push(0, 1);
          for (let i = 0; i < nums.length; i++) {
            const digitValue = Math.floor(nums[i] / digit) % 10;
            count[digitValue]++;
          }
          for (let i = 1; i < 10; i++) count[i] += count[i - 1];
          this.lineHighlightQueue.push(2, 3);
          for (let i = nums.length - 1; i >= 0; i--) {
            const digitValue = Math.floor(nums[i] / digit) % 10;
            output[count[digitValue] - 1] = nums[i];
            count[digitValue]--;
          }
          this.lineHighlightQueue.push(4);
          for (let i = 0; i < nums.length; i++) {
            nums[i] = output[i];
          }
          this.currentAction = `Radix Sort: Finished pass for digit ${digit}`;
          state.radixDigit! *= 10;
          if (state.radixDigit! > state.maxNum!) {
            state.isFinished = true;
            this.currentAction = 'Array is sorted';
          }
        } else {
          state.isFinished = true;
          this.currentAction = 'Array is sorted';
        }
        break;
    }

    if (!state.isFinished && this.isSorted(nums)) {
      state.isFinished = true;
      this.currentAction = 'Array is sorted';
    }

    state.currentStep++;

    if (this.mode === 'single') {
      if (this.lineHighlightQueue.length > 0) {
        this.processLineHighlightQueue();
      } else {
        this.currentLineIndex = -1;
        this.stepChange.emit(this.currentLineIndex);
      }
    }
  }



  isSorted(nums: number[]): boolean {
    for (let i = 0; i < nums.length - 1; i++) {
      if (nums[i] > nums[i + 1]) {
        return false;
      }
    }
    return true;
  }

  generateQuickSortSteps(nums: number[], low: number, high: number): any[] {
    const steps: any[] = [];
    const numsCopy = [...nums];
    this.quickSortSteps(numsCopy, 0, numsCopy.length - 1, steps);
    console.log("Steps:", steps);
    console.log("Final sorted array:", numsCopy);
    console.log("Sorted:", numsCopy);
    console.log("isSorted:", this.isSorted(numsCopy));
    return steps;
  }

  quickSortSteps(arr: number[], low: number, high: number, steps: Step[]): void {
    const stack: { low: number; high: number }[] = [];
    stack.push({low, high});
    while (stack.length > 0) {
      const {low, high} = stack.pop()!;
      if (low < high) {
        steps.push({
          action: 'recursive-call',
          low,
          high,
          snapshot: [...arr],
          line: 1
        });
        const pi = this.partition(arr, low, high, steps);
        stack.push({low: pi + 1, high: high});
        stack.push({low: low, high: pi - 1});
      }
    }
  }

  partition(arr: number[], low: number, high: number, steps: any[]): number {
    const pivot = arr[high];
    let i = low - 1;
    steps.push({
      action: 'choose-pivot',
      pivotIndex: high,
      snapshot: [...arr],
      line: 2
    });
    for (let j = low; j < high; j++) {
      steps.push({
        action: 'compare',
        i,
        j,
        pivotIndex: high,
        snapshot: [...arr],
        line: 3
      });
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({
          action: 'swap',
          i,
          j,
          value1: arr[i],
          value2: arr[j],
          snapshot: [...arr],
          line: 4
        });

      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({
      action: 'pivot-swap',
      i: i + 1,
      j: high,
      value1: arr[i + 1],
      value2: arr[high],
      snapshot: [...arr],
      line: 5
    });
    return i + 1;
  }
  getExecutionTime(state: AlgorithmState): string {
    if (!state.startTime) return '...'; // Not started
    if (!state.isFinished || !state.endTime) return 'Running...';
    const time = (state.endTime - state.startTime) / 1000;
    return `${time.toFixed(2)}s`;
  }

  getAvailableAlgorithmsForSecondDropdown(): string[] {
    return this.algorithms.filter(algo => algo !== this.selectedAlgorithm);
  }
  processLineHighlightQueue() {
    if (this.lineHighlightQueue.length > 0) {
      const nextLine = this.lineHighlightQueue.shift()!;
      this.currentLineIndex = nextLine;
      this.stepChange.emit(this.currentLineIndex);

      setTimeout(() => this.processLineHighlightQueue(), 500);
    }
  }
}
