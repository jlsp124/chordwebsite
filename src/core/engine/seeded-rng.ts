function hashSeed(seed: string): number {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next ^= next + Math.imul(next ^ (next >>> 7), 61 | next);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export interface WeightedChoice<TValue> {
  value: TValue;
  weight: number;
}

export interface SeededRng {
  readonly seed: string;
  next(): number;
  pickIndex(length: number): number;
  choose<TValue>(values: readonly TValue[]): TValue;
  chooseWeighted<TValue>(choices: readonly WeightedChoice<TValue>[]): TValue;
  fork(label: string): SeededRng;
}

export function createSeededRng(seed: string): SeededRng {
  const normalizedSeed = seed.trim().length > 0 ? seed : 'default-seed';
  const random = mulberry32(hashSeed(normalizedSeed));

  return {
    seed: normalizedSeed,
    next() {
      return random();
    },
    pickIndex(length) {
      if (length <= 0) {
        throw new Error('Cannot pick an index from an empty collection.');
      }

      return Math.floor(random() * length);
    },
    choose(values) {
      const choice = values[this.pickIndex(values.length)];

      if (choice === undefined) {
        throw new Error('Deterministic choice resolved to an undefined value.');
      }

      return choice;
    },
    chooseWeighted(choices) {
      const positiveChoices = choices.filter((choice) => choice.weight > 0);

      if (positiveChoices.length === 0) {
        throw new Error('Cannot choose from a weighted collection with no positive weights.');
      }

      const totalWeight = positiveChoices.reduce((sum, choice) => sum + choice.weight, 0);
      let cursor = random() * totalWeight;

      for (const choice of positiveChoices) {
        cursor -= choice.weight;

        if (cursor <= 0) {
          return choice.value;
        }
      }

      const fallbackChoice = positiveChoices[positiveChoices.length - 1];

      if (!fallbackChoice) {
        throw new Error('Weighted selection lost its fallback choice.');
      }

      return fallbackChoice.value;
    },
    fork(label) {
      return createSeededRng(`${normalizedSeed}:${label}`);
    }
  };
}
