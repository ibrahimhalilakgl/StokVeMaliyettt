declare module 'react-to-print' {
  import { ReactInstance } from 'react';

  interface UseReactToPrintOptions {
    content: () => ReactInstance | null;
    documentTitle?: string;
    pageStyle?: string;
    onBeforeGetContent?: () => Promise<void>;
    onBeforePrint?: () => Promise<void>;
    onAfterPrint?: () => void;
    removeAfterPrint?: boolean;
    suppressErrors?: boolean;
  }

  export function useReactToPrint(options: UseReactToPrintOptions): () => void;
} 
