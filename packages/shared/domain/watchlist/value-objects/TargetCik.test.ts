import { describe, it, expect } from 'vitest'
import { TargetCik } from './TargetCik'

describe('TargetCik', () => {
  it('creates a value object from a digit string', () => {
    const cik = TargetCik.create('320193')
    expect(cik.getValue()).toBe('320193')
  })

  it('trims whitespace on creation', () => {
    const cik = TargetCik.create('  320193  ')
    expect(cik.getValue()).toBe('320193')
  })

  it('pads to 10 digits with leading zeros', () => {
    const cik = TargetCik.create('320193')
    expect(cik.getPadded()).toBe('0000320193')
  })

  it('throws on empty value', () => {
    expect(() => TargetCik.create('')).toThrow('TargetCik cannot be empty')
  })

  it('throws on non-digit value', () => {
    expect(() => TargetCik.create('AAPL')).toThrow('TargetCik must contain only digits')
  })

  it('compares equality by value', () => {
    const a = TargetCik.create('320193')
    const b = TargetCik.create('320193')
    const c = TargetCik.create('789019')
    expect(a.equals(b)).toBe(true)
    expect(a.equals(c)).toBe(false)
  })
})
