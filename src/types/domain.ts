export type EntityId = string;
export type IsoDateTime = string;

export type ReportSource = "whatsapp" | "manual" | "seed";

export type ReportPriority = "low" | "normal" | "high" | "urgent";

export type ReportStatusSlug =
  | "new"
  | "in_review"
  | "validated"
  | "needs_info"
  | "duplicate"
  | "closed";

export type EvidenceType = "photo" | "video" | "text" | "location" | "document";

export type ReportHistoryEventType = "status_change" | "internal_note";

export type ReportHistoryActor = "local_admin";

export type LocationSource =
  | "shared_location"
  | "manual_text"
  | "admin_adjusted"
  | "unknown";

export interface Report {
  id: EntityId;
  title: string;
  description: string;
  categoryId: EntityId;
  statusId: EntityId;
  locationId?: EntityId;
  reporterId?: EntityId;
  source: ReportSource;
  sourceMessageId?: string;
  receivedAt: IsoDateTime;
  validatedAt?: IsoDateTime;
  closedAt?: IsoDateTime;
  priority: ReportPriority;
  notes?: string;
}

export interface LocalSeedReport {
  id: EntityId;
  title: string;
  description: string;
  category: string;
  status: ReportStatusSlug;
  priority: ReportPriority;
  locationText: string;
  neighborhood: string;
  zone: string;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  source: ReportSource;
  evidenceCount: number;
  citizenAlias: string;
}

export interface Reporter {
  id: EntityId;
  displayName?: string;
  phoneHash?: string;
  phoneLast4?: string;
  consentFlags: string[];
  createdAt: IsoDateTime;
}

export interface Category {
  id: EntityId;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Location {
  id: EntityId;
  latitude?: number;
  longitude?: number;
  addressText?: string;
  neighborhood?: string;
  municipality?: string;
  state?: string;
  country: string;
  accuracyMeters?: number;
  source: LocationSource;
}

export interface Status {
  id: EntityId;
  name: string;
  slug: ReportStatusSlug;
  description: string;
  isTerminal: boolean;
}

export interface Evidence {
  id: EntityId;
  reportId: EntityId;
  type: EvidenceType;
  url?: string;
  storageKey?: string;
  caption?: string;
  capturedAt?: IsoDateTime;
  receivedAt: IsoDateTime;
  metadata?: Record<string, unknown>;
}

export interface LocalReportHistoryEvent {
  id: EntityId;
  reportId: EntityId;
  type: ReportHistoryEventType;
  createdAt: IsoDateTime;
  actor: ReportHistoryActor;
  note?: string;
  previousStatus?: ReportStatusSlug;
  newStatus?: ReportStatusSlug;
}

export interface DuplicateGroup {
  id: EntityId;
  canonicalReportId: EntityId;
  reason: string;
  confidence?: number;
  createdAt: IsoDateTime;
}

export interface AdminUser {
  id: EntityId;
  name: string;
  email: string;
  role: "reviewer" | "admin";
  isActive: boolean;
  createdAt: IsoDateTime;
}

export interface Zone {
  id: EntityId;
  name: string;
  type: "municipality" | "neighborhood" | "district" | "custom_zone";
  parentId?: EntityId;
  boundaryGeoJson?: unknown;
}
