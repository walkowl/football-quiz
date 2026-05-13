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
