/**
 * WatchlistItem Entity (Aggregate Root)
 */

import { WatchlistItemId } from '../value-objects/WatchlistItemId'
import { TargetCik } from '../value-objects/TargetCik'
import { WatchlistType } from '../../../types/enums'

export interface WatchlistItemProps {
  id: WatchlistItemId
  userId: string
  watchType: WatchlistType
  targetCik: TargetCik
  targetName: string
  createdAt: Date
  updatedAt: Date
}

export class WatchlistItem {
  private constructor(private props: WatchlistItemProps) {}

  static create(params: {
    id: WatchlistItemId
    userId: string
    watchType: WatchlistType
    targetCik: TargetCik
    targetName: string
  }): WatchlistItem {
    const now = new Date()

    return new WatchlistItem({
      id: params.id,
      userId: params.userId,
      watchType: params.watchType,
      targetCik: params.targetCik,
      targetName: params.targetName,
      createdAt: now,
      updatedAt: now,
    })
  }

  /** Reconstitute from persistence */
  static reconstitute(props: WatchlistItemProps): WatchlistItem {
    return new WatchlistItem(props)
  }

  get id(): WatchlistItemId {
    return this.props.id
  }

  get userId(): string {
    return this.props.userId
  }

  get watchType(): WatchlistType {
    return this.props.watchType
  }

  get targetCik(): TargetCik {
    return this.props.targetCik
  }

  get targetName(): string {
    return this.props.targetName
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  updateTargetName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Target name cannot be empty')
    }
    this.props.targetName = newName
    this.props.updatedAt = new Date()
  }

  belongsToUser(userId: string): boolean {
    return this.props.userId === userId
  }

  isWatchingIssuer(): boolean {
    return this.props.watchType === WatchlistType.Issuer
  }

  isWatchingOwner(): boolean {
    return this.props.watchType === WatchlistType.Owner
  }

  isWatchingTarget(cik: TargetCik): boolean {
    return this.props.targetCik.equals(cik)
  }
}
