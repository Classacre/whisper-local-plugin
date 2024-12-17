import { setIcon } from 'obsidian';

export class RecordingIndicator {
    private element: HTMLElement;
    private startTime: number = 0;
    private intervalId: number | null = null;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    start() {
        this.startTime = Date.now();
        this.updateDisplay();
        this.intervalId = window.setInterval(() => this.updateDisplay(), 1000);
        this.element.addClass('is-recording');
    }

    stop() {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
        }
        this.element.removeClass('is-recording');
    }

    private updateDisplay() {
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        
        this.element.empty();
        setIcon(this.element, 'dot');
        this.element.createSpan({
            text: ` ${minutes}:${seconds.toString().padStart(2, '0')}`
        });
    }
}
