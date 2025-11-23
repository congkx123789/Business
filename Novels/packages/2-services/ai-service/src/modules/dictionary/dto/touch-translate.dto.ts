export interface TouchTranslateRequestDto {
  word: string;
  fromLang: string;
  toLang: string;
  position?: string;
}

export interface TouchTranslateResponseDto {
  word: string;
  definitions: string[];
  position?: string;
}


