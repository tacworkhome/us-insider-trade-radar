import { describe, it, expect } from 'vitest'
import { WatchlistItemId } from './WatchlistItemId'

describe('WatchlistItemId', () => {
  it('creates from a non-empty string', () => {
    const id = WatchlistItemId.create('item-1')
    expect(id.getValue()).toBe('item-1')
    expect(id.toString()).toBe('item-1')
  })

  it('throws on empty value', () => {
    expect(() => WatchlistItemId.create('')).toThrow('WatchlistItemId cannot be empty')
  })

  it('throws on whitespace-only value', () => {
    expect(() => WatchlistItemId.create('   ')).toThrow('WatchlistItemId cannot be empty')
  })

  it('compares equality by value', () => {
    const a = WatchlistItemId.create('item-1')
    const b = WatchlistItemId.create('item-1')
    const c = WatchlistItemId.create('item-2')
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })
})
