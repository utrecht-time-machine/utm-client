export interface ApiSearchResponse {
  '@id': string;
  title?: string;
  description?: string;
  authors?: string[];
  date?: Date;
  imageUrl?: string;
  collection?: string;
  originalUrl?: string;
  notes?: string[];
}
