export type DataSourceKind = "mock" | "provider";

export type DataConfidence = "mock" | "official" | "reported" | "estimated";

export interface DataSource {
  kind: DataSourceKind;
  label: string;
  retrievedAt: string;
  confidence: DataConfidence;
}

export interface FreshnessMetadata {
  label: string;
  validUntil: string;
}

export type ContentEntityKind =
  | "competition"
  | "fixture"
  | "player"
  | "team"
  | "topic";

export interface ContentEntityRef {
  kind: ContentEntityKind;
  id: string;
  label: string;
}
