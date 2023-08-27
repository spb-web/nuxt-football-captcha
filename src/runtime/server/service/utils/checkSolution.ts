import { SessionData } from "../handleSession"

export const checkSolution = async (contest: Required<SessionData>['contest'], mousePath: Uint16Array) => {
  const lastX = mousePath.at(-4)
  const lastY = mousePath.at(-3)
  const lastIndex = mousePath.at(-2)
  
  if (typeof lastX !== 'number' || typeof lastY !== 'number' || typeof lastIndex !== 'number') {
    return false
  }

  console.log(contest.target, (lastX  - 120 / 2), (lastY  - 120 + 20), lastIndex)

  if (
    Math.abs(contest.target.x - (lastX  - 120 / 2)) < 40
    && Math.abs(contest.target.y - (lastY  - 120 + 20)) < 40
    && lastIndex === contest.target.interactiveObjectIndex
  ) {
    return true
  }

  return false
}
