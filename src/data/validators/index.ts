export interface ValidationIssue {
  scope: string;
  message: string;
}

export function validateRuntimePackScaffold(): ValidationIssue[] {
  return [];
}
