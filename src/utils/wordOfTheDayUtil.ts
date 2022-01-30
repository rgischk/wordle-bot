const SEED_DATE = new Date(2021,5,19,0,0,0,0);
const MS_IN_A_DAY = 864e5

export function determineWordOfTheDay(day: Date, wordlist: string[]) {
    let dayOffset = determineDayOffsetFromSeed(day);
    const solutionIndex = dayOffset % wordlist.length
    return wordlist[solutionIndex]
}

export function determineDayOffsetFromSeed(day: Date) {
    return determineDayOffset(SEED_DATE, day)
}

export function determineDayOffset(startDay: Date, endDay: Date) {
    let startDayCopy = new Date(startDay)
    let endDayCopy = new Date(endDay)
    let normalizedStartDayInMs = startDayCopy.setHours(0, 0, 0, 0)
    let normalizedEndDayInMs = endDayCopy.setHours(0, 0, 0, 0)
    let differenceInMs = normalizedEndDayInMs - normalizedStartDayInMs;
    return Math.round(differenceInMs / MS_IN_A_DAY)
}
