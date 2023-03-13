export class BingoSettings {
  discovery: null | number = null
  revealFirstNCompletedGoals: number = 0
  lockout: boolean = false
  size: number = 5
  goalType: 'cards' | 'lines' | 'all' = 'lines'
  goalAmount: number = 3
}
