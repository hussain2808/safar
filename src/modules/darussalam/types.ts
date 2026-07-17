export type RoomCategory = 'indoor' | 'outdoor' | 'other';

export interface RoomRequirement {
  id: string;
  label: string;
  done: boolean;
}

export interface RoomProgress {
  ideas: { current: number; target: number };
  measurements: { current: number; target: number };
  decisions: { current: number; target: number };
  documents: { current: number; target: number };
}

export interface Room {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  category: RoomCategory;
  description?: string;
  moodStyle?: string;
  moodTags?: string[];
  colorPalette?: string[];
  materials?: string[];
  requirements?: RoomRequirement[];
  progress?: RoomProgress;
  measurementsCount: number;
  documentsCount: number;
  notesCount: number;
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

export interface PendingDelete {
  id: string;
  kind: 'room' | 'idea' | 'file';
  targetId: string;
  createdAt: number;
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
