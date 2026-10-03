export type PlayerStatus = 'pending' | 'approved' | 'rejected' | 'sold' | 'unsold'

export interface Settings {
  purse: number
  basePrice: number
  increment: number
  maxSquad: number
  unit: string
  season: string
  venue: string
  auctionDate: string
  contactName: string
  contactPhone: string
  registrationOpen: boolean
}

export interface Team {
  id: string
  name: string
  short: string
  owner: string
  color: string
  purse: number
}

export interface Player {
  id: string
  name: string
  mobile: string
  age: number
  role: string
  battingStyle: string
  bowlingStyle: string
  previousTeam: string
  photo: string
  regNo: string
  status: PlayerStatus
  basePrice: number
  createdAt: number
  soldTo?: string | null
  soldPrice?: number | null
  soldAt?: number | null
}

export interface Bid {
  teamId: string
  amount: number
  at: number
}

export interface AuctionResult {
  playerId: string
  teamId?: string
  amount?: number
  result: 'sold' | 'unsold'
  at: number
}

export interface Auction {
  status: 'idle' | 'live'
  playerId?: string
  currentBid?: number | null
  leader?: string | null
  history?: Bid[]
  startedAt?: number
  lastResult?: AuctionResult | null
}

export interface TeamStat {
  team: Team
  count: number
  spent: number
  left: number
}

export const DEFAULT_SETTINGS: Settings = {
  purse: 10000,
  basePrice: 100,
  increment: 50,
  maxSquad: 12,
  unit: 'pts',
  season: '2026',
  venue: 'Malvan, Sindhudurg',
  auctionDate: '',
  contactName: '',
  contactPhone: '',
  registrationOpen: true,
}

export const DEMO_TEAMS = [
  { id: 't1', name: 'Malvan Mariners', short: 'MMR', owner: 'Rajesh Parab', color: '#3B82F6' },
  { id: 't2', name: 'Tarkarli Tuskers', short: 'TTK', owner: 'Sandeep Sawant', color: '#F97316' },
  { id: 't3', name: 'Devbag Dolphins', short: 'DDL', owner: 'Nitin Gawade', color: '#14B8A6' },
  { id: 't4', name: 'Kunkeshwar Kings', short: 'KKG', owner: 'Mahesh Naik', color: '#A855F7' },
  { id: 't5', name: 'Vengurla Waves', short: 'VWV', owner: 'Ganesh Walke', color: '#22C55E' },
  { id: 't6', name: 'Achra Chargers', short: 'ACH', owner: 'Santosh Prabhu', color: '#F43F5E' },
]

export const ROLES = ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper']
export const BAT = ['Right-hand', 'Left-hand']
export const BOWL = [
  'Right-arm fast',
  'Right-arm medium',
  'Right-arm spin',
  'Left-arm fast/medium',
  'Left-arm spin',
  "Doesn't bowl",
]

export const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  approved: 'Available',
  rejected: 'Rejected',
  sold: 'Sold',
  unsold: 'Unsold',
}

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
export const makeRegNo = () => 'MSL-' + Date.now().toString(36).slice(-5).toUpperCase()

export const PHOTO_MAX_BYTES = 160 * 1024

export interface PlayerForm {
  name: string
  mobile: string
  age: string | number
  role: string
  battingStyle: string
  bowlingStyle: string
  previousTeam: string
  photo: string
  agree?: boolean
}

/**
 * Registration rules, shared by the form (instant feedback) and the API (the real check).
 * Returns field -> message; an empty object means the form is valid.
 */
export function validatePlayer(
  f: PlayerForm,
  players: Pick<Player, 'mobile' | 'status' | 'regNo'>[],
  adminMode = false,
): Record<string, string> {
  const er: Record<string, string> = {}
  const name = String(f.name ?? '').trim()
  const mobile = String(f.mobile ?? '').trim()
  if (name.length < 3 || name.length > 80) er.name = "Enter the player's full name."
  if (!/^[6-9]\d{9}$/.test(mobile)) er.mobile = 'Enter a 10-digit mobile number.'
  const age = Number(f.age)
  if (!age || age < 12 || age > 70) er.age = 'Enter an age between 12 and 70.'
  if (!f.photo) er.photo = 'Add a photo so teams can see you at the auction.'
  if (!ROLES.includes(f.role)) er.role = 'Choose a playing role.'
  if (!adminMode && !f.agree) er.agree = 'Tick the box to confirm.'
  const dup = players.find((x) => x.mobile === mobile && x.status !== 'rejected')
  if (!er.mobile && dup) er.mobile = `This number is already registered as ${dup.regNo}.`
  return er
}
