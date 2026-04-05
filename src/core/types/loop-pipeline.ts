export const SOURCE_LICENSE_CLASSES = [
  'open',
  'mixed',
  'noncommercial',
  'share_alike_data',
  'ambiguous'
] as const;

export const SOURCE_ROLES = [
  'primary_backbone',
  'broad_harmony',
  'color_vocabulary',
  'optional_vocabulary'
] as const;

export const LOOP_CLOSURES = [
  'open',
  'soft_resolve',
  'strong_resolve',
  'turnback',
  'contrastive'
] as const;

export type SourceLicenseClass = (typeof SOURCE_LICENSE_CLASSES)[number];
export type SourceRole = (typeof SOURCE_ROLES)[number];
export type LoopClosure = (typeof LOOP_CLOSURES)[number];

export interface SourceDownloadTarget {
  fileName: string;
  kind: 'direct' | 'github_archive';
  url: string;
  notes?: string;
}

export interface SourceRegistryEntry {
  sourceId: string;
  version: string;
  downloadUrl: string;
  format: string;
  license: string;
  licenseClass: SourceLicenseClass;
  role: SourceRole;
  enabledByDefault: boolean;
  checksum: string;
  notes: string;
  downloadTargets?: SourceDownloadTarget[];
}

export interface SourceRegistry {
  registryVersion: string;
  sources: SourceRegistryEntry[];
}

export interface DownloadLockEntry {
  sourceId: string;
  version: string;
  fileName: string;
  url: string;
  checksum: string;
  fetchedAt: string;
  localPath: string;
}

export interface DownloadLockfile {
  lockVersion: string;
  entries: DownloadLockEntry[];
}

export interface NormalizedChordEvent {
  sourceId: string;
  partition: string;
  workId: string;
  annotationId: string;
  licenseClass: SourceLicenseClass;
  meter: string;
  barIndex: number;
  beatStart: number;
  beatEnd: number;
  chordOriginal: string;
  chordNormalized: string;
  rootPc: number | null;
  quality: string;
  extensions: string[];
  bass: string | null;
  globalKey: string | null;
  localKey: string | null;
  mode: 'major' | 'minor' | 'unknown';
  romanNumeral: string;
  functionLabel: string;
  timeBasis: 'measure_beat' | 'seconds';
  confidence: number;
  parseFlags: string[];
  provenance: Record<string, string | number | boolean | null>;
}

export interface NormalizedWorkMetadata {
  sourceId: string;
  partition: string;
  workId: string;
  annotationId: string;
  meter: string;
  sectionHints: string[];
  tempoClass: string;
  sourceFlags: string[];
  provenance: Record<string, string | number | boolean | null>;
}

export interface LoopSourceReference {
  sourceId: string;
  partition: string;
  workId: string;
  annotationId: string;
  startBar: number;
  endBar: number;
  licenseClass: SourceLicenseClass;
}

export interface ExtractedLoopCandidate {
  id: string;
  mode: 'major' | 'minor';
  chordCount: 2 | 4;
  romanSequence: string[];
  functionPath: string[];
  durationPatternBeats: number[];
  closure: LoopClosure;
  colorProfile: string[];
  loopability: number;
  averageConfidence: number;
  transformSlots: Array<{
    slotIndex: number;
    allowedDecorations: string[];
    allowedSlashBassDegrees: string[];
  }>;
  repeat8Ok: boolean;
  repeat16Ok: boolean;
  supportCount: number;
  sourceRefs: LoopSourceReference[];
  tags: string[];
  rejectionReasons?: string[];
}

export interface DedupeCluster {
  clusterId: string;
  canonicalCandidateId: string;
  supportCount: number;
  sourceCount: number;
  sourceDiversity: number;
  clusterMembers: string[];
  exactDedupeKey: string;
  nearDedupeKey: string;
}

export interface LoopScoreBreakdown {
  loopFitness: number;
  crossSourceSupport: number;
  annotationTrust: number;
  transformHeadroom: number;
  styleFitPrior: number;
  harmonicColorValue: number;
  penalty: number;
  total: number;
}

export interface ScoredLoopCluster extends DedupeCluster {
  canonicalLoop: ExtractedLoopCandidate;
  score: LoopScoreBreakdown;
  styleSupport: Record<string, number>;
}

export interface StyleMappingRule {
  substyleId: string;
  preferredModes: Array<'major' | 'minor'>;
  preferredSources: string[];
  requiredTags: string[];
  forbiddenTags: string[];
  boostTags: string[];
}

export interface SourcePolicyRule {
  sourceId: string;
  allowForDerivedRuntime: boolean;
  includePartitions: string[];
  excludePartitions: string[];
  notes: string;
}

export interface ProvenanceSummary {
  sourceCount: number;
  sourceIds: string[];
  partitionCount: number;
  evidenceCount: number;
  licenseMix: SourceLicenseClass[];
}

export interface LoopArchetype {
  id: string;
  substyleId: string;
  name: string;
  bars: 4;
  chordCount: 2 | 4;
  romanNumerals: string[];
  functionPath: string[];
  durationPatternBeats: number[];
  closure: LoopClosure;
  colorProfile: string[];
  loopability: number;
  transformSlots: Array<{
    slotIndex: number;
    allowedDecorations: string[];
    allowedSlashBassDegrees: string[];
    forbidOnLowSpice: boolean;
  }>;
  tags: string[];
  weight: number;
  repeat8Allowed: boolean;
  repeat16Allowed: boolean;
  provenanceSummary: ProvenanceSummary;
}

export interface CompiledLoopPack {
  packVersion: string;
  packId: string;
  family: {
    id: string;
    name: string;
    description: string;
    tags: string[];
    substyleIds: string[];
  };
  substyles: Array<{
    id: string;
    familyId: string;
    name: string;
    description: string;
    tags: string[];
    loopArchetypeIds: string[];
    harmonicRhythmProfileIds: string[];
    spicinessTransformIds: string[];
    variationRuleIds: string[];
    specialMoveIds: string[];
    midiPresetIds: string[];
  }>;
  loopArchetypes: LoopArchetype[];
  harmonicRhythmProfiles: unknown[];
  spicinessTransforms: unknown[];
  variationRules: unknown[];
  specialMoves: unknown[];
  midiPresets: unknown[];
  provenanceSummary: ProvenanceSummary;
}

export interface LoopFragmentProposal {
  id: string;
  substyleId: string;
  clusterId: string;
  canonicalCandidateId: string;
  romanSequence: string[];
  functionPath: string[];
  durationPatternBeats: number[];
  closure: LoopClosure;
  colorProfile: string[];
  tags: string[];
  totalScore: number;
  styleFitScore: number;
  reviewStatus: 'ready_for_review' | 'blocked_by_source_policy' | 'blocked_by_blacklist';
  provenanceSummary: ProvenanceSummary;
}

export interface GeneratedLoopFragments {
  generatedVersion: string;
  generatedAt: string;
  substyles: Array<{
    substyleId: string;
    loopFragments: LoopFragmentProposal[];
  }>;
}
