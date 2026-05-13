export interface BnaDoc {
  _id: string;
  _updatedAt: string;
  treatmentName: string;
  sessions?: number;
  showOnMain: boolean;
  isVisible: boolean;
  sortOrder?: number;
}

export interface BnaFullDoc {
  _id: string;
  _updatedAt: string;
  treatmentRef?: { _ref: string; _type: string };
  treatmentName: string;
  sessions?: number;
  elapsed?: { ko?: string };
  description?: { ko?: string; en?: string };
  showOnMain: boolean;
  isVisible: boolean;
  sortOrder?: number;
}
