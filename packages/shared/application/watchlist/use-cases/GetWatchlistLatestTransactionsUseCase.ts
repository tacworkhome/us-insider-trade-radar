import type { IWatchlistTransactionRepository } from '../../../domain/watchlist'
import type { WatchlistLatestTransactionDTO } from '../dtos/WatchlistLatestTransactionDTO'
import { getTopRole } from '../../../utils/format'

export class GetWatchlistLatestTransactionsUseCase {
  constructor(private readonly repo: IWatchlistTransactionRepository) {}

  async execute(watchType: string): Promise<WatchlistLatestTransactionDTO[]> {
    const rows = await this.repo.getLatestTransactions(watchType)
    return rows.map((row) => ({
      ...row,
      display_role: getTopRole({
        isOfficer: row.is_officer,
        isDirector: row.is_director,
        isTenPercentOwner: row.is_ten_percent_owner,
        isOther: row.is_other,
        officerTitle: row.officer_title,
      }),
    }))
  }
}
