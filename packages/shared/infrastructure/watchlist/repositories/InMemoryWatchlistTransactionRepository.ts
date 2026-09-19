/**
 * In-memory implementation of IWatchlistTransactionRepository.
 * Serves canned "latest transaction" rows for watched issuers/owners from a
 * fixture array instead of a Supabase RPC.
 */
import type {
  IWatchlistTransactionRepository,
  WatchlistLatestTransactionRaw,
} from '../../../domain/watchlist'

export class InMemoryWatchlistTransactionRepository implements IWatchlistTransactionRepository {
  constructor(private readonly rows: WatchlistLatestTransactionRaw[] = []) {}

  async getLatestTransactions(watchType: string): Promise<WatchlistLatestTransactionRaw[]> {
    // watchType filtering happens at the query layer in production; the
    // fixture data here is already scoped, so we just return it as-is.
    void watchType
    return this.rows
  }
}
