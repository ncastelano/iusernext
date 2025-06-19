declare module '@ffmpeg/ffmpeg' {
  export function createFFmpeg(options?: { log?: boolean }): {
    load: () => Promise<void>;
    isLoaded: () => boolean;    // aqui
    FS: (command: string, ...args: any[]) => any;
    run: (...args: string[]) => Promise<void>;
    setProgress?: (callback: (progress: any) => void) => void;
    exit?: () => void;
  };
  export function fetchFile(input: string | Blob | Uint8Array): Promise<Uint8Array>;
}
