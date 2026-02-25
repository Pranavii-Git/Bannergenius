export interface BannerContent {
  headline: string;
  subheadline: string;
  cta: string;
  imagePrompt: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
