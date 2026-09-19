export interface ReportSignals {
  clusterBuying: boolean
  repeatBuyer: boolean
  buyingOnly: boolean
  increasingSize: boolean
}

export interface ReportTransaction {
  ownerName: string
  officerTitle: string
  date: string
  shares: number
  value: number
  isBuy: boolean
}

export interface CompanyReportDTO {
  ticker: string
  companyName: string
  generatedAt: string
  periodDays: number
  insiderActivity: {
    totalBuys: number
    totalSells: number
    netShares: number
    netValue: number
    uniqueInsiders: number
  }
  signals: ReportSignals
  confidenceScore: number
  topTransactions: ReportTransaction[]
  summary: string
}
