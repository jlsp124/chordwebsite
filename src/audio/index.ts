import * as Tone from 'tone';
import { realizeMidiClip } from '../core/utils/midi-realization.ts';
import type { GenerationBundle } from '../core/types/index.ts';

interface PreviewHit {
  time: number;
  midiNotes: number[];
  durationSeconds: number;
  velocity: number;
}

let previewSynth: Tone.PolySynth<Tone.Synth> | null = null;
let previewPart: Tone.Part<PreviewHit> | null = null;
let previewEndEventId: number | null = null;
let previewEndCallback: (() => void) | null = null;

function beatsToSeconds(beats: number, bpm: number): number {
  return beats * (60 / bpm);
}

function getPreviewSynth(): Tone.PolySynth<Tone.Synth> {
  if (!previewSynth) {
    previewSynth = new Tone.PolySynth(Tone.Synth).toDestination();
    previewSynth.volume.value = -10;
    previewSynth.set({
      oscillator: {
        type: 'triangle'
      },
      envelope: {
        attack: 0.01,
        decay: 0.12,
        sustain: 0.55,
        release: 0.8
      }
    });
  }

  return previewSynth;
}

function clearPreviewScheduling(): void {
  const transport = Tone.getTransport();

  if (previewEndEventId !== null) {
    transport.clear(previewEndEventId);
    previewEndEventId = null;
  }

  if (previewPart) {
    previewPart.dispose();
    previewPart = null;
  }
}

export function stopProgressionPreview(notifyEnded = false): void {
  const transport = Tone.getTransport();

  clearPreviewScheduling();
  transport.stop();
  transport.cancel(0);
  transport.seconds = 0;
  previewSynth?.releaseAll();

  const callback = previewEndCallback;
  previewEndCallback = null;

  if (notifyEnded) {
    callback?.();
  }
}

export async function startProgressionPreview(
  bundle: GenerationBundle,
  onEnded?: () => void
): Promise<{ bpm: number; totalSeconds: number }> {
  await Tone.start();
  stopProgressionPreview(false);

  const clip = realizeMidiClip(bundle);
  const transport = Tone.getTransport();
  const synth = getPreviewSynth();

  previewEndCallback = onEnded ?? null;
  transport.bpm.value = clip.bpm;
  transport.seconds = 0;

  previewPart = new Tone.Part(
    (time, hit) => {
      const frequencies = hit.midiNotes.map((midiNote) =>
        Tone.Frequency(midiNote, 'midi').toFrequency()
      );

      synth.triggerAttackRelease(frequencies, hit.durationSeconds, time, hit.velocity);
    },
    clip.hits.map((hit) => ({
      time: beatsToSeconds(hit.timeBeats, clip.bpm),
      midiNotes: hit.midiNotes,
      durationSeconds: beatsToSeconds(hit.durationBeats, clip.bpm),
      velocity: hit.velocity
    }))
  ).start(0);

  const totalSeconds = beatsToSeconds(clip.totalBeats, clip.bpm);
  previewEndEventId = transport.scheduleOnce(() => {
    stopProgressionPreview(true);
  }, totalSeconds + 0.05);

  transport.start('+0.01');

  return {
    bpm: clip.bpm,
    totalSeconds
  };
}
