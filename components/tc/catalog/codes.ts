import type { TierKey } from '@/lib/courses'

// Design codes ("SC-01", "MFG-02"...) mapped to the real category ids in lib/courses.ts
export const SPEC_CODES: Record<string, string> = {
  'supply-chain': 'SC-01',
  'manufactura': 'MFG-02',
  'stocks': 'STK-03',
  'sop': 'S&OP-04',
  'demand-planner': 'DP-05',
  'supply-planning': 'SP-06',
  'planif-materiales': 'MAT-07',
}

export const TIER_SHORT: Record<TierKey, string> = {
  starter: 'STR',
  pro: 'PRO',
  expert: 'EXP',
}

export const TIER_TRI: Record<TierKey, string> = {
  starter: '▲',
  pro: '▲▲',
  expert: '▲▲▲',
}
