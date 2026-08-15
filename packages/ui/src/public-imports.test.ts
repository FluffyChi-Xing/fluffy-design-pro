import { describe, expect, it } from 'vitest'
import { Button } from './entries/button'
import { Input } from './entries/input'
import { Textarea } from './entries/textarea'
import { Checkbox } from './entries/checkbox'
import { Card } from './entries/card'
import { Skeleton } from './entries/skeleton'
import { FEmpty } from './entries/empty'
import { FIcon, cn } from './index'

describe('public UI entries', () => {
  it('exports every first-release component and utility', () => {
    for (const component of [Button, Input, Textarea, Checkbox, Card, Skeleton, FEmpty, FIcon]) {
      expect(component).toBeTruthy()
    }
    expect(cn('rounded', ['p-2', { 'p-4': false }])).toBe('rounded p-2')
  })
})
