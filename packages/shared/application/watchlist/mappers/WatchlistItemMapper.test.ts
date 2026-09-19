import { describe, it, expect } from 'vitest'
import { WatchlistItemMapper } from './WatchlistItemMapper'
import { WatchlistItem, WatchlistItemId, TargetCik } from '../../../domain/watchlist'
import { WatchlistType } from '../../../types/enums'

describe('WatchlistItemMapper', () => {
  it('maps a domain entity to a plain DTO', () => {
    const item = WatchlistItem.create({
      id: WatchlistItemId.create('item-1'),
      userId: 'user-1',
      watchType: WatchlistType.Issuer,
      targetCik: TargetCik.create('320193'),
      targetName: 'Apple Inc.',
    })

    const dto = WatchlistItemMapper.toDTO(item)
    expect(dto).toMatchObject({
      id: 'item-1',
      userId: 'user-1',
      watchType: 'issuer',
      targetCik: '320193',
      targetName: 'Apple Inc.',
    })
    expect(typeof dto.createdAt).toBe('string')
  })

  it('maps a list of entities', () => {
    const items = [
      WatchlistItem.create({
        id: WatchlistItemId.create('item-1'),
        userId: 'user-1',
        watchType: WatchlistType.Issuer,
        targetCik: TargetCik.create('320193'),
        targetName: 'Apple Inc.',
      }),
      WatchlistItem.create({
        id: WatchlistItemId.create('item-2'),
        userId: 'user-1',
        watchType: WatchlistType.Owner,
        targetCik: TargetCik.create('1234567'),
        targetName: 'Jane Insider',
      }),
    ]

    expect(WatchlistItemMapper.toDTOs(items)).toHaveLength(2)
  })
})
