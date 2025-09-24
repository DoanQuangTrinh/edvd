import { useState, useCallback } from 'react';

// Defines the shape of the history state
export type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

// Defines the actions that can be performed on the history
export type HistoryActions<T> = {
  set: (newPresent: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export const useHistory = <T,>(initialPresent: T): [HistoryState<T>, HistoryActions<T>] => {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = state.past.length !== 0;
  const canRedo = state.future.length !== 0;

  const undo = useCallback(() => {
    setState((currentState) => {
      const { past, present, future } = currentState;
      if (past.length === 0) return currentState; // Nothing to undo

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((currentState) => {
      const { past, present, future } = currentState;
      if (future.length === 0) return currentState; // Nothing to redo

      const next = future[0];
      const newFuture = future.slice(1);

      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const set = useCallback((newPresent: T) => {
    setState((currentState) => {
      const { past, present } = currentState;
      
      // If the new state is the same as the current one, do nothing
      if (JSON.stringify(newPresent) === JSON.stringify(present)) {
        return currentState;
      }

      return {
        past: [...past, present],
        present: newPresent,
        future: [], // Clear future on new action
      };
    });
  }, []);

  return [
    state, 
    { set, undo, redo, canUndo, canRedo }
  ];
}; 
