import { firestoreConnect } from "react-redux-firebase"

import { selectUser } from "./selectors"

export const listenFindings = firestoreConnect((props, store) => {
  const state = store.getState()
  const year = state.year
  const nextYear = year + 1
  const user = selectUser(state)
  const where = [["user", "==", user.uid]]
  if (year !== "all") {
    where.push(["date", ">=", `${year}-01-01`])
    where.push(["date", "<", `${nextYear}-01-01`])
  }

  return [
    {
      collection: "findings",
      where
    }
  ]
})

export const listenHiScores = firestoreConnect((props, store) => {
  const state = store.getState()
  const year = state.year
  const where = []
  if (year !== "all") {
    where.push(["year", "==", year])
  }
  console.log("listenHiScores", where)
  return [
    {
      collection: "hiscores",
      where
    }
  ]
})
