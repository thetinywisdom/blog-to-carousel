export interface ArticleData {
  title: string;
  subtitle: string;
  rawText: string;
  chunks: string[];
  imageUrl: string | null;
}

export interface SlideChunk {
  id: string;
  text: string;
  index: number;
}

export type ProcessingMode = 'full' | 'short';

export type AppStep = 'landing' | 'processing' | 'editing' | 'exporting';

export const CLOSING_TEXT = `Remember, it's not going to be easy.\nBut it's not impossible.\n\nThe Tiny Wisdom\nwww.thetinywisdom.com`;
