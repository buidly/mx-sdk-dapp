type SafeWindowType<T extends Window = Window> = {
  [K in keyof T]?: T[K];
};

export const getIsBuidlyExtensionAvailable = () => {
  const safeWindow = typeof window !== 'undefined' ? window : ({} as SafeWindowType);
  return Boolean(safeWindow?.buidlyWallet);
};
