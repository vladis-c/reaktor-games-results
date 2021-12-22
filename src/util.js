// determine victory function
export const ROCK = "ROCK"
export const PAPER = "PAPER"
export const SCISSORS = "SCISSORS"
export function determineVictory(hand1, hand2) {
  if (hand1 === hand2) {
    return 0
  }
  if (
    (hand1 === ROCK && hand2 === SCISSORS) ||
    (hand1 === PAPER && hand2 === ROCK) ||
    (hand1 === SCISSORS && hand2 === PAPER)
  ) {
    return 1
  }
  return -1
}
