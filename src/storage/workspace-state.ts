import { DEFAULT_CONTROL_STATE, type ShellControlState } from '../core/options';

export interface WorkspaceState {
  lastUsedSettings: ShellControlState;
}

const STORAGE_KEY = 'chord-generator.workspace-state';

const DEFAULT_WORKSPACE_STATE: WorkspaceState = {
  lastUsedSettings: DEFAULT_CONTROL_STATE
};

function normalizeControls(value: Partial<ShellControlState> | null | undefined): ShellControlState {
  return {
    familyId:
      typeof value?.familyId === 'string' && value.familyId.trim().length > 0
        ? value.familyId
        : DEFAULT_CONTROL_STATE.familyId,
    substyleId:
      typeof value?.substyleId === 'string' && value.substyleId.trim().length > 0
        ? value.substyleId
        : DEFAULT_CONTROL_STATE.substyleId,
    key:
      typeof value?.key === 'string' && value.key.trim().length > 0
        ? value.key
        : DEFAULT_CONTROL_STATE.key,
    scaleMode: value?.scaleMode === 'minor' ? 'minor' : DEFAULT_CONTROL_STATE.scaleMode,
    loopBars:
      value?.loopBars === 8 || value?.loopBars === 16
        ? value.loopBars
        : DEFAULT_CONTROL_STATE.loopBars,
    chordChangeRate:
      value?.chordChangeRate === 'two_bars'
        ? 'two_bars'
        : DEFAULT_CONTROL_STATE.chordChangeRate,
    spiceLevel:
      typeof value?.spiceLevel === 'number' && Number.isFinite(value.spiceLevel)
        ? Math.min(4, Math.max(1, Math.round(value.spiceLevel)))
        : DEFAULT_CONTROL_STATE.spiceLevel
  };
}

export function loadWorkspaceState(): WorkspaceState {
  try {
    const rawValue = globalThis.localStorage?.getItem(STORAGE_KEY);

    if (!rawValue) {
      return DEFAULT_WORKSPACE_STATE;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<WorkspaceState>;

    return {
      lastUsedSettings: normalizeControls(parsedValue.lastUsedSettings)
    };
  } catch {
    return DEFAULT_WORKSPACE_STATE;
  }
}

export function saveWorkspaceState(state: WorkspaceState): void {
  try {
    globalThis.localStorage?.setItem(
      STORAGE_KEY,
      JSON.stringify({
        lastUsedSettings: normalizeControls(state.lastUsedSettings)
      })
    );
  } catch {
    // Ignore storage failures so the app still works statically.
  }
}
