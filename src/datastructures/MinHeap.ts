
export class Heap<T> {
    private heap: (T | null)[];
    private comparator: (a: T, b: T) => number;
    private size: number;
    private capacity: number;

    constructor(capacity: number, comparator: (a: T, b: T) => number = (a,b) => (a < b  ? - 1 : a > b ? 1 : 0)) {
        this.capacity = capacity;
        this.heap = new Array<T | null>(capacity).fill(null);
        this.comparator = comparator;
        this.size = 0;
    }

    // get right child from parent
    private getRightChild(index: number): number {
        return 2 * index + 1;
    }

    // get left child from parent
    private getLeftChild(index: number): number {
        return 2 * (index + 1);
    }

    // get parent from children
    private getParent(index: number): number {
        return Math.floor((index - 1) / 2);
    }

    // swap ith and jth elements
    private swap(i: number, j: number): void {
        const temp = this.heap[i];
        this.heap[i] = this.heap[j];
        this.heap[j] = temp;
    }

    // shift down the root element to maintain heap property
    private heapify() : void {
        let currentIndex = 0;
        while (true) {
            const leftChild = this.getLeftChild(currentIndex);
            const rightChild = this.getRightChild(currentIndex);

            let smallestChildIndex = leftChild;
            if (rightChild < this.capacity && this.heap[rightChild] != null && this.comparator(this.heap[rightChild]!, this.heap[leftChild]!) < 0) {
                smallestChildIndex = rightChild;
            }

            if (smallestChildIndex >= this.size || this.heap[smallestChildIndex] == null || this.comparator(this.heap[smallestChildIndex]!, this.heap[currentIndex]!) >= 0) {
                break;
            }

            this.swap(currentIndex, smallestChildIndex);
            currentIndex = smallestChildIndex;
        }
    }  

    // root element of the heap
    head(): T | null {
        if (this.size === 0) {
            return null;
        }
        return this.heap[0];
    }

    // last element of the heap
    tail(): T | null {
        if (this.size === 0) {
            return null;
        }
        return this.heap[this.size - 1];
    }

    // puishes an element into the heap
    heappush(item: T): boolean {
        // maintains heap property by inserting from bottom and shifting up
        if (this.size >= this.capacity) {
            return false;
        }

        let index = this.size;
        this.heap[index] = item;
        this.size += 1;

        while (index > 0) {
            const parentIndex = this.getParent(index);
            if (this.heap[parentIndex] != null && this.comparator(item, this.heap[parentIndex]!) >= 0) {
                break;
            }
            this.swap(index, parentIndex);
            index = parentIndex;
        }

        return true;
    }

    // removes and returns the root element
    heappop(): T | null {
        // maintains heap property by swapping last element and shifting down
        const root = this.head();

        if (root) {
            this.swap(0, this.size - 1);
            this.heap[this.size - 1] = null;
            this.heapify();
            this.size -= 1;
        }

        return root;
    }

    // combines a push and pull operation, returning the root
    pushpop(item: T): T | null {
        const root = this.head();
        
        this.heap[0] = item;
        this.heapify();
        // increases the size if the heap was empty before.
        if (this.size === 0) {
            this.size += 1;
        }
        return root;
    }         

    // debug function to get heap as array
    getArray(): (T | null)[] {
        return this.heap.slice(0, this.size);
    }
}