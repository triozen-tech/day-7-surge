"use client";

// Tiny cart store: "Add to cart" buttons add, the nav's Cart pill listens and bumps.
type Listener = (count: number, added?: { name: string }) => void;
let count = 0;
const listeners = new Set<Listener>();

export const cart = {
  add(name: string) {
    count += 1;
    listeners.forEach((l) => l(count, { name }));
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    fn(count);
    return () => {
      listeners.delete(fn);
    };
  },
};
