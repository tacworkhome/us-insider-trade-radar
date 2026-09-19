/**
 * TargetCik Value Object — represents an SEC CIK number (company or insider id)
 */

export class TargetCik {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('TargetCik cannot be empty')
    }
    if (!/^\d+$/.test(value)) {
      throw new Error('TargetCik must contain only digits')
    }
  }

  static create(value: string): TargetCik {
    return new TargetCik(value.trim())
  }

  getValue(): string {
    return this.value
  }

  /** Get padded CIK (10 digits with leading zeros) */
  getPadded(): string {
    return this.value.padStart(10, '0')
  }

  equals(other: TargetCik): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
