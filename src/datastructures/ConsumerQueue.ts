type queueObj<T> = {
    item: T,
    availability: number
}

export class ConsumerQueue<T> {
    
    private queue: queueObj<T>[];
    private capacity: number;
    private front: number;
    private back: number;
    private consumers: number;

    constructor(capacity: number, consumers: number) {
        this.queue = new Array<queueObj<T>>(capacity);
        this.front = 0;
        this.back = 0;
        this.capacity = capacity;
        this.consumers = consumers;
    }

    private createItem(item: T): queueObj<T> {
        return {
            item: item,
            availability: this.consumers
        };
    }

    isEmpty(): boolean {
        return this.front === this.back;
    }

    isFull(): boolean {
        return (this.back + 1) % this.capacity === this.front % this.capacity;
    }

    head(): T | null {
        if (this.isEmpty()) {
            return null;
        }
        return this.queue[this.front].item;
    }

    tail(): T | null {  
        if (this.isEmpty()) {
            return null;
        }
        return this.queue[(this.back - 1 + this.capacity) % this.capacity].item;
    }

    enqueue(item: T): boolean {
        if (this.isFull()) {
            // Queue is full
            return false;
        };
        this.queue[this.back] = this.createItem(item);
        this.back += 1;
        return true;
    }

    dequeue(): T | null {
        if (this.isEmpty()) {
            // Queue is empty
            return null;
        }
        const item = this.queue[this.front];
        item.availability -= 1;
        
        if (item.availability === 0) {
            this.front += 1;
        }

        return item.item;
    }

}