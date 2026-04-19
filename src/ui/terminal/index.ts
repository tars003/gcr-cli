import type { UI } from '../types.js';
import { askConfirm, askSelect, askMultiselect, askInput } from './prompts.js';
import { display, startSpinner, stopSpinner, stream } from './display.js';

export const terminalUI: UI = {
  confirm:     (message)                        => askConfirm(message),
  select:      (message, choices)               => askSelect(message, choices),
  multiselect: (message, choices, preselected)  => askMultiselect(message, choices, preselected),
  input:       (message)                        => askInput(message),
  display,
  startSpinner,
  stopSpinner,
  stream,
};
