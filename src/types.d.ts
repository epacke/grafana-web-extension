// Global type declarations for the Script Manager
declare global {
  function waitFor(urlRegex: RegExp, cssSelector: string | null, scriptFunction: () => void): void;
}

export {};
