import { getVal } from "react-redux-firebase"
import max from "lodash/max"
import sumBy from "lodash/sumBy"
import countBy from "lodash/countBy"
import sortBy from "lodash/sortBy"

import { currentYear } from "./utils"

const bronzeAchievement = "/img/bronze.png"
const silverchievement = "/img/silver.png"
const goldAchievement = "/img/gold.png"

export function selectUser(state) {
  return state.firebase.auth
}

export function selectFindings(state) {
  return getVal(state.firestore.ordered, `findings`, [])
}
export function selectCurrentYearFindings(state) {
  const selectedYear = state.year
  return selectedYear === "all"
    ? selectFindings(state)
    : selectFindings(state).filter(
        finding => new Date(finding.date).getFullYear() === selectedYear
      )
}

export function selectBirds(state) {
  return state.birds
}

export function selectBirdsSortedByName(state) {
  return selectBirds(state).sort((a, b) => a.nameFi.localeCompare(b.nameFi))
}

export function selectFoundBirds(state) {
  const findings = selectFindings(state)
  const birds = selectBirds(state)
  return birds.filter(bird =>
    findings.find(finding => finding.bird === bird.id)
  )
}

export function selectHiscores(state) {
  return getVal(state.firestore.ordered, `hiscores`, [])
}

export function selectAchievements(state) {
  const currentYearFindings = selectCurrentYearFindings(state)
  const birds = selectBirdsSortedByName(state)
  const currentStars = currentYearFindings
    .map(f => birds.find(b => b.id === f.bird))
    .reduce((stars, b) => stars + b.rarity, 0)

  const maxFindingsPerDay = (() => {
    const byDate = countBy(currentYearFindings, finding =>
      new Date(finding.date).toISOString().substring(0, 10)
    )
    return max(Object.values(byDate)) || 0
  })()

  const longestStreak = (() => {
    const sorted = sortBy(currentYearFindings, "date")
    let longest = 0
    let currentLongest = 0
    let current = undefined
    const extractDate = date => new Date(date).toISOString().substring(0, 10)
    const extractNextDate = date => {
      const d = new Date(date)
      d.setDate(d.getDate() + 1)
      return d.toISOString().substring(0, 10)
    }
    for (let finding of sorted) {
      if (!current) {
        currentLongest = 1
      } else if (extractNextDate(current.date) === extractDate(finding.date)) {
        currentLongest++
      } else if (extractDate(current.date) !== extractDate(finding.date)) {
        if (currentLongest > longest) longest = currentLongest
        currentLongest = 1
      }
      current = finding
    }
    if (currentLongest > longest) longest = currentLongest
    return longest
  })()

  const isBirdFound = bird =>
    Boolean(currentYearFindings.find(finding => finding.bird === bird.id))

  const buildBirdAchievement = ({
    id,
    name,
    description,
    birds,
    bronzeTarget,
    silverTarget,
    goldTarget
  }) => {
    birds = birds.map(bird => ({ ...bird, found: isBirdFound(bird) }))
    return {
      id,
      name,
      description,
      progress: sumBy(birds, bird => Number(bird.found)),
      goals: [
        {
          target: bronzeTarget,
          badge: bronzeAchievement
        },
        {
          target: silverTarget,
          badge: silverchievement
        },
        {
          target: goldTarget,
          badge: goldAchievement
        }
      ],
      birds
    }
  }

  const achievments = [
    {
      id: "stars",
      name: "Tähtikaarti",
      description:
        "Kerää tähtiä lintuhavainnoilla. Harvinaisista linnuista saa enemmän tähtiä!",
      progress: currentStars,
      goals: [
        {
          target: 30,
          badge: bronzeAchievement
        },
        {
          target: 100,
          badge: silverchievement
        },
        {
          target: 250,
          badge: goldAchievement
        }
      ]
    },

    {
      id: "good-day",
      name: "Hyvä päivä",
      description: "Merkitse useita havaintoja yhden päivän aikana",
      progress: maxFindingsPerDay,
      goals: [
        {
          target: 3,
          badge: bronzeAchievement
        },
        {
          target: 6,
          badge: silverchievement
        },
        {
          target: 8,
          badge: goldAchievement
        }
      ]
    },

    {
      id: "day-streak",
      name: "Sitkeä sissi",
      description: "Merkitse havaintoja peräkkäisinä päivinä",
      progress: longestStreak,
      goals: [
        {
          target: 3,
          badge: bronzeAchievement
        },
        {
          target: 4,
          badge: silverchievement
        },
        {
          target: 5,
          badge: goldAchievement
        }
      ]
    },
    buildBirdAchievement({
      id: "backyard-birds",
      name: "Pihalinnut",
      description: "Merkkaa nämä yleiset pihapiirin linnut!",
      bronzeTarget: 4,
      silverTarget: 9,
      goldTarget: 14,
      birds: [
        "b-177",
        "b-155",
        "b-133",
        "b-179",
        "b-186",
        "b-185",
        "b-156",
        "b-134",
        "b-165",
        "b-166",
        "b-181",
        "b-128",
        "b-117",
        "b-201",
        "b-192",
        "b-197"
      ].map(birdId => birds.find(bird => bird.id === birdId))
    }),
    buildBirdAchievement({
      id: "strigidae",
      name: "Ei pöllömpi",
      description: "Merkkaa pöllölinnut!",
      bronzeTarget: 3,
      silverTarget: 5,
      goldTarget: 7,
      birds: birds.filter(bird => bird.familyLatin === "Strigidae")
    }),
    buildBirdAchievement({
      id: "picidae",
      name: "Rummuttajat",
      description: "Merkkaa tikkalinnut!",
      bronzeTarget: 2,
      silverTarget: 4,
      goldTarget: 6,
      birds: birds.filter(bird => bird.familyLatin === "Picidae")
    }),
    buildBirdAchievement({
      id: "laridae-sternidae",
      name: "Lokit ja tiirat",
      description: "Merkkaa lokit ja tiirat!",
      bronzeTarget: 4,
      silverTarget: 6,
      goldTarget: 8,
      birds: birds.filter(
        bird =>
          bird.familyLatin === "Laridae" || bird.familyLatin === "Sternidae"
      )
    }),
    buildBirdAchievement({
      id: "corvidae",
      name: "Varislinnut",
      description: "Merkkaa varlislinnut!",
      bronzeTarget: 2,
      silverTarget: 4,
      goldTarget: 7,
      birds: birds.filter(bird => bird.familyLatin === "Corvidae")
    }),
    buildBirdAchievement({
      id: "anatidae",
      name: "Sorsalinnut",
      description: "Merkkaa sorsalinnut!",
      bronzeTarget: 8,
      silverTarget: 15,
      goldTarget: 22,
      birds: birds.filter(bird => bird.familyLatin === "Anatidae")
    })
  ]

  return achievments
}
