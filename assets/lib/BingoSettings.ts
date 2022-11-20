export class BingoSettings {
  discovery: null | number = null
  lockout: boolean = false
  size: number = 5
  goalType: 'cards' | 'lines' | 'all' = 'lines'
  goalAmount: number = 3
}
