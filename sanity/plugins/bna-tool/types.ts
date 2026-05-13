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
  elapsed?: { ko?: string; en?: string; zh?: string; ja?: string };
  description?: { ko?: string; en?: string; zh?: string; ja?: string };
  beforeImage?: { asset?: { _ref: string } };
  afterImage?: { asset?: { _ref: string } };
  showOnMain: boolean;
  isVisible: boolean;
  sortOrder?: number;
}
