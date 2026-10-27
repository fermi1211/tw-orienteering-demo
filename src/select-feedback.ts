/** Keep keyboard focus discoverable, without a persistent ring after selecting. */
export function installSelectFeedback(doc: Document): () => void {
  const selectOf = (event: Event) => event.target instanceof HTMLSelectElement ? event.target : null;
  const commit = (event: Event) => selectOf(event)?.setAttribute('data-selection-committed', 'true');
  const reset = (event: Event) => selectOf(event)?.removeAttribute('data-selection-committed');
  const keyboard = (event: KeyboardEvent) => {
    doc.documentElement.dataset.focusModality = 'keyboard';
    if (['ArrowUp', 'ArrowDown', 'Home', 'End', ' ', 'F4'].includes(event.key)) reset(event);
    if (['Enter', 'Escape'].includes(event.key)) commit(event);
  };
  const pointer = (event: Event) => {
    doc.documentElement.dataset.focusModality = 'pointer';
    commit(event);
  };
  // Delegation also covers dialogs, lazy screens and editor-created native selects.
  doc.addEventListener('pointerdown', pointer, true);
  doc.addEventListener('change', commit, true);
  doc.addEventListener('focusout', reset, true);
  doc.addEventListener('keydown', keyboard, true);
  return () => {
    doc.removeEventListener('pointerdown', pointer, true);
    doc.removeEventListener('change', commit, true);
    doc.removeEventListener('focusout', reset, true);
    doc.removeEventListener('keydown', keyboard, true);
    delete doc.documentElement.dataset.focusModality;
  };
}
