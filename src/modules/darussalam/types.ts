export type RoomCategory = 'indoor' | 'outdoor' | 'other';

export interface RoomRequirement {
  id: string;
  label: string;
  done: boolean;
}

export interface Room {
  id: string;
  name: string;
  tagline?: string;
  icon: string;
  category: RoomCategory;
  description?: string;
  moodStyle?: string;
  moodTags?: string[];
  colorPalette?: string[];
  materials?: string[];
  requirements?: RoomRequirement[];
  order: number;
  favorite?: boolean;
  createdAt: number;
  updatedAt: number;
  pendingSync?: boolean;
}

export type IdeaCaptureType = 'note' | 'photo' | 'video' | 'voice' | 'link';

export interface IdeaNote {
  id: string;
  text: string;
  createdAt: number;
}

export interface IdeaLink {
  id: string;
  label: string;
  url: string;
}

export interface IdeaRequirement {
  id: string;
  label: string;
  done: boolean;
}

export interface Idea {
  id: string;
  roomId: string | null;
  type: IdeaCaptureType;
  title: string;
  description?: string;
  whyILoveThis?: string;
  linkUrl?: string;
  tag?: string;
  category?: string;
  createdBy?: string;
  measurements?: string;
  materials?: string[];
  links?: IdeaLink[];
  notesList?: IdeaNote[];
  requirements?: IdeaRequirement[];
  fileIds?: string[];
  mediaCount?: number;
  favorite?: boolean;
  inInspiration?: boolean;
  archived?: boolean;
  createdAt: number;
  updatedAt: number;
  pendingSync?: boolean;
}

export interface IdeaFile {
  id: string;
  ideaId: string;
  blob: Blob;
  thumbnail?: Blob;
  mimeType: string;
  durationSeconds?: number;
  createdAt: number;
}

export interface Measurement {
  id: string;
  roomId: string;
  label: string;
  value: string;
  unit?: string;
  createdAt: number;
}

export interface RoomNote {
  id: string;
  roomId: string;
  text: string;
  createdAt: number;
}

export interface Decision {
  id: string;
  title: string;
  reason?: string;
  alternatives?: string;
  decisionMaker?: string;
  roomId?: string | null;
  date: number;
  createdAt: number;
  updatedAt: number;
}

export type WishlistCategory = 'fixtures' | 'materials' | 'furniture' | 'lighting' | 'other';

export interface WishlistItem {
  id: string;
  title: string;
  category?: WishlistCategory;
  notes?: string;
  roomId?: string | null;
  resolved?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type DocumentCategory = 'floorPlan' | 'elevation' | 'moodBoard' | 'sketch' | 'municipality' | 'other';

export interface DocumentRecord {
  id: string;
  name: string;
  category: DocumentCategory;
  roomId?: string | null;
  fileId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DocumentFile {
  id: string;
  documentId: string;
  blob: Blob;
  mimeType: string;
  fileName: string;
  createdAt: number;
}

export interface VisionBoard {
  id: 'house';
  styleName?: string;
  tags?: string[];
  colorPalette?: string[];
  materials?: string[];
  updatedAt: number;
}

export interface HouseSettings {
  id: 'house';
  houseName: string;
  houseSubtitle?: string;
  currency: string;
  units: 'metric' | 'imperial';
  updatedAt: number;
}

export interface PendingDelete {
  id: string;
  kind: 'room' | 'idea' | 'file' | 'measurement' | 'note' | 'decision' | 'wishlistItem' | 'document';
  targetId: string;
  createdAt: number;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
