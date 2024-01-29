export class Node<T = unknown> {
  public value: T;
  public next: Node<T> | null;
  constructor(value: T) {
    this.value = value;
    this.next = null;
  }
}

export class Queue<T> {
  public head: Node<T> | null;
  public tail: Node<T> | null;
  public length: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  enqueue(itemsArray: T[]): T[] {
    for (const item of itemsArray) {
      const newNode = new Node(item);
      if (this.head === null) {
        this.head = newNode;
        this.tail = newNode;
      } else {
        if (this.tail !== null) {
          this.tail.next = newNode;
        }
        this.tail = newNode;
      }
      this.length++;
    }
    return itemsArray;
  }

  dequeue(n: number): T[] {
    const dequeuedItems: T[] = [];

    for (let i = 0; i < n; i++) {
      if (this.head === null) {
        break;
      }
      const dequeuedItem = this.head.value;
      this.head = this.head.next;
      this.length--;
      dequeuedItems.push(dequeuedItem);
    }

    if (this.length === 0) {
      this.tail = null;
    }

    return dequeuedItems;
  }

  public reset(): T[] {
    return this.dequeue(this.length);
  }
}
