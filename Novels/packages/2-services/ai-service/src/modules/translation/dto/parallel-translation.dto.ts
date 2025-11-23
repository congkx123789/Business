export type ParallelTranslationDisplayMode = "line-by-line" | "side-by-side" | "interleaved";

export interface ParallelTranslationDto {
  text: string;
  fromLang: string;
  toLang: string;
  displayMode?: ParallelTranslationDisplayMode;
}


