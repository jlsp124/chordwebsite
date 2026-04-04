import MidiPackage from '@tonejs/midi';
import { realizeMidiClip } from '../core/utils/midi-realization.ts';
import type { GenerationBundle } from '../core/types/index.ts';

const { Midi } = MidiPackage;

export const MIDI_EXPORT_DISABLED_REASON = 'Generate a progression first to unlock MIDI export.';

export interface MidiFileArtifact {
  blob: Blob;
  byteLength: number;
  bytes: Uint8Array;
  clipBpm: number;
  fileName: string;
}

interface DownloadAnchorLike {
  click(): void;
  download: string;
  href: string;
  rel: string;
}

export interface DownloadBrowserDependencies<TAnchor extends DownloadAnchorLike = HTMLAnchorElement> {
  appendAnchor(anchor: TAnchor): void;
  createAnchor(): TAnchor;
  createObjectURL(blob: Blob): string;
  removeAnchor(anchor: TAnchor): void;
  revokeObjectURL(url: string): void;
  scheduleCleanup(callback: () => void): void;
}

function beatsToSeconds(beats: number, bpm: number): number {
  return beats * (60 / bpm);
}

function getDefaultBrowserDependencies(): DownloadBrowserDependencies {
  return {
    appendAnchor(anchor) {
      anchor.rel = 'noopener';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
    },
    createAnchor() {
      return document.createElement('a');
    },
    createObjectURL(blob) {
      return URL.createObjectURL(blob);
    },
    removeAnchor(anchor) {
      anchor.remove();
    },
    revokeObjectURL(url) {
      URL.revokeObjectURL(url);
    },
    scheduleCleanup(callback) {
      window.setTimeout(callback, 1000);
    }
  };
}

export function createMidiFileArtifact(bundle: GenerationBundle): MidiFileArtifact {
  const clip = realizeMidiClip(bundle);
  const midi = new Midi();
  midi.name = `${bundle.metadata.substyleName} Progression`;
  midi.header.setTempo(clip.bpm);

  const track = midi.addTrack();
  track.name = bundle.metadata.substyleName;
  track.channel = 0;
  track.instrument.number = 0;

  for (const noteEvent of clip.noteEvents) {
    track.addNote({
      midi: noteEvent.midi,
      time: beatsToSeconds(noteEvent.timeBeats, clip.bpm),
      duration: beatsToSeconds(noteEvent.durationBeats, clip.bpm),
      velocity: noteEvent.velocity
    });
  }

  const bytes = midi.toArray();
  const blobBytes = new Uint8Array(bytes.byteLength);
  blobBytes.set(bytes);

  return {
    blob: new Blob([blobBytes], { type: 'audio/midi' }),
    byteLength: bytes.byteLength,
    bytes,
    clipBpm: clip.bpm,
    fileName: clip.fileName
  };
}

export function downloadMidiBundle(
  bundle: GenerationBundle,
  dependencies: DownloadBrowserDependencies = getDefaultBrowserDependencies()
): MidiFileArtifact {
  const artifact = createMidiFileArtifact(bundle);
  const objectUrl = dependencies.createObjectURL(artifact.blob);
  const anchor = dependencies.createAnchor();

  anchor.href = objectUrl;
  anchor.download = artifact.fileName;
  anchor.rel = 'noopener';

  dependencies.appendAnchor(anchor);
  anchor.click();
  dependencies.removeAnchor(anchor);
  dependencies.scheduleCleanup(() => {
    dependencies.revokeObjectURL(objectUrl);
  });

  return artifact;
}
