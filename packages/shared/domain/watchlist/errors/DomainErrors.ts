/**
 * Watchlist Domain Errors
 */

export class WatchlistLimitExceededError extends Error {
  constructor(
    public readonly current: number,
    public readonly limit: number
  ) {
    super(`Watchlist limit exceeded. You have ${current} items, limit is ${limit}.`)
    this.name = 'WatchlistLimitExceededError'
  }
}

export class WatchlistItemAlreadyExistsError extends Error {
  constructor(public readonly targetName: string) {
    super(`${targetName} is already in your watchlist`)
    this.name = 'WatchlistItemAlreadyExistsError'
  }
}

export class WatchlistItemNotFoundError extends Error {
  constructor(public readonly itemId: string) {
    super(`Watchlist item not found: ${itemId}`)
    this.name = 'WatchlistItemNotFoundError'
  }
}

export class UnauthorizedWatchlistAccessError extends Error {
  constructor() {
    super('You do not have permission to access this watchlist item')
    this.name = 'UnauthorizedWatchlistAccessError'
  }
}
