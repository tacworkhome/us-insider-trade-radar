/**
 * WatchlistItemId Value Object
 */

export class WatchlistItemId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('WatchlistItemId cannot be empty')
    }
  }

  static create(value: string): WatchlistItemId {
    return new WatchlistItemId(value)
  }

  getValue(): string {
    return this.value
  }

  equals(other: WatchlistItemId): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
