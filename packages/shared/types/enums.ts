/**
 * Shared enums used across domain / application / presentation layers.
 */

export enum WatchlistType {
  Issuer = 'issuer',
  Owner = 'owner',
}

export function isWatchlistType(value: string): value is WatchlistType {
  return value === WatchlistType.Issuer || value === WatchlistType.Owner
}

export enum TransactionCode {
  Purchase = 'P',
  Sale = 'S',
}

export enum AcquiredDisposedCode {
  Acquired = 'A',
  Disposed = 'D',
}
