import type { VariationType } from '../types/index.ts';

export const VARIATION_DISPLAY_ORDER: VariationType[] = [
  'safer',
  'richer',
  'darker',
  'brighter',
  'more_open',
  'more_resolved',
  'pre_chorus_lift',
  'chorus_payoff',
  'bridge_contrast'
];

const VARIATION_VERSION_LABELS: Record<VariationType, string> = {
  safer: 'Safer Version',
  richer: 'Richer Version',
  darker: 'Darker Version',
  brighter: 'Brighter Version',
  more_open: 'More Open-Loop Version',
  more_resolved: 'More Resolved Version',
  pre_chorus_lift: 'Pre-Chorus Lift Version',
  chorus_payoff: 'Chorus Payoff Version',
  bridge_contrast: 'Bridge Contrast Version'
};

export function getVariationVersionLabel(type: VariationType): string {
  return VARIATION_VERSION_LABELS[type];
}

export function formatVariationType(type: VariationType): string {
  return type.replace(/_/g, ' ');
}
