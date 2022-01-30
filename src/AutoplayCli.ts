import {GameStatus, MAX_AMOUNT_GUESSES, WordleGame} from "./WordleGame";
import {WordleBot} from "./WordleBot";
import {readWordList} from "./utils/wordlistUtils";
import {PathLike} from "fs";

export async function autoplayCli(wordlist: PathLike, validationWordlist: PathLike, count: number, words?: string[], validationWords?: string[], forcedWord?: string, ordered?: boolean, endless?: boolean, quitOnEnd?: boolean, sleep?: string, debug?: boolean) {
    console.log("")
    console.log("### Running Wordle Autoplay...")
    if (debug) {
        console.log({words, validationWords, wordlist, validationWordlist, count, forcedWord, ordered, endless, debug})
    }
    console.log("")

    if (!words) {
        words = await readWordList(wordlist)
    }
    if (!validationWords) {
        validationWords = await readWordList(validationWordlist)
    }

    if (forcedWord && !words.includes(forcedWord)) {
        console.log("The forced word is not in the wordlist!")
        return
    }

    const stats: Stats = {
        gamesPlayed: 0,
        totalGames: (ordered && endless && quitOnEnd) ? words.length : endless ? undefined : count,
        botWins: 0,
        gameWins: 0,
        winDistribution: initializeWindDistribution(),
        lastGame: undefined,
        failedWords: []
    }

    writeStats(stats)

    while (endless || stats.gamesPlayed < count) {
        if (ordered && endless && quitOnEnd && stats.gamesPlayed >= words.length) {
            break
        }

        if (ordered) {
            forcedWord = words[stats.gamesPlayed % words.length]
        }

        const game = new WordleGame(words, validationWords, forcedWord)
        const bot = new WordleBot(words)
        try {
            let guess = bot.firstGuess()
            let guessResult = game.guess(guess)

            while (game.getGameStatus() === GameStatus.RUNNING) {
                guess = bot.nextGuess(guess, guessResult)
                guessResult = game.guess(guess)
            }
        } catch (e) {
            console.error("An error occurred!", {word: game.word, guesses: game.guesses, botState: bot.state}, e)
            throw e
        }

        stats.gamesPlayed += 1
        if (game.getGameStatus() === GameStatus.YOU_LOST) {
            stats.gameWins += 1
            stats.winDistribution[MAX_AMOUNT_GUESSES] += 1
            stats.failedWords.push(game.word)
        } else if (game.getGameStatus() === GameStatus.YOU_WON) {
            stats.botWins += 1
            stats.winDistribution[game.guesses.length - 1] += 1
        }
        stats.lastGame = {
            word: game.word,
            guesses: game.guesses,
            gameStatus: game.getGameStatus()
        }

        updateStats(stats)

        if (sleep) {
            await sleepFor(parseInt(sleep))
        }
    }
}

function initializeWindDistribution(): number[] {
    const winDistribution = []
    for (let index = 0; index < MAX_AMOUNT_GUESSES + 1; index++) {
        winDistribution[index] = 0
    }
    return winDistribution
}

type Stats = {
    gamesPlayed: number
    totalGames: number | undefined
    botWins: number
    gameWins: number
    winDistribution: number[]
    lastGame?: {
        word: string
        guesses: string[]
        gameStatus: GameStatus
    }
    failedWords: string[]
}

/*
Games played: x/y
Bot wins/losses: x/y - x%/y%
Win distribution:
    1st try: x
    2nd try: x
    3rd try: x
    4th try: x
    5th try: x
    6th try: x
    failed:  x
Failed words: wrath, shorn
Last game:
    Word: hairy
    Guesses: source, yield, hairy
    Bot <won|lost>!
 */
function writeStats(stats: Stats) {
    const maxNumber = stats.totalGames || Number.MAX_SAFE_INTEGER
    const maxSymbol = stats.totalGames || "∞"
    const botPercentage = Math.round(100 / stats.gamesPlayed * stats.botWins)
    const gamePercentage = Math.round(100 / stats.gamesPlayed * stats.gameWins)

    process.stdout.write(`   Games played: ${formatNumber(stats.gamesPlayed, maxNumber)}/${maxSymbol}\n`)
    process.stdout.write(`Bot wins/losses: ${formatNumber(stats.botWins, maxNumber)}/${formatNumber(stats.gameWins, maxNumber, false)} - ${formatNumber(botPercentage, 100)}%/${gamePercentage}%\n`)
    process.stdout.write(`Win distribution:\n`)
    process.stdout.write(`    1st try:     ${formatNumber(stats.winDistribution[0], maxNumber)}\n`)
    process.stdout.write(`    2nd try:     ${formatNumber(stats.winDistribution[1], maxNumber)}\n`)
    process.stdout.write(`    3rd try:     ${formatNumber(stats.winDistribution[2], maxNumber)}\n`)
    process.stdout.write(`    4th try:     ${formatNumber(stats.winDistribution[3], maxNumber)}\n`)
    process.stdout.write(`    5th try:     ${formatNumber(stats.winDistribution[4], maxNumber)}\n`)
    process.stdout.write(`    6th try:     ${formatNumber(stats.winDistribution[5], maxNumber)}\n`)
    process.stdout.write(`    failed:      ${formatNumber(stats.winDistribution[6], maxNumber)}\n`)
    process.stdout.write(`Failed words: \n`)
    process.stdout.write(`Last game:\n`)
    process.stdout.write(`    Word:    ${stats.lastGame?.word || ""}\n`)
    process.stdout.write(`    Guesses: ${(stats.lastGame?.guesses || []).join(", ")}\n`)
    process.stdout.write(`    Bot ${stats.lastGame?.gameStatus === GameStatus.YOU_WON ? "won" : "lost"}!\n`)

}

function updateStats(stats: Stats) {
    const maxNumber = stats.totalGames || Number.MAX_SAFE_INTEGER
    const maxSymbol = stats.totalGames || "infinite"
    const botPercentage = Math.round(100 / stats.gamesPlayed * stats.botWins)
    const gamePercentage = Math.round(100 / stats.gamesPlayed * stats.gameWins)

    process.stdout.moveCursor(0, -15); // Move to first line of stats
    process.stdout.cursorTo(17); // Move to value of "Games played"
    process.stdout.clearLine(1); // Delete value of "Games played"
    process.stdout.write(`${formatNumber(stats.gamesPlayed, maxNumber)}/${maxSymbol}`)

    process.stdout.moveCursor(0, 1); // Move to "Bot wins/losses"
    process.stdout.cursorTo(17); // Move to value of "Bot wins/losses"
    process.stdout.clearLine(1); // Delete value of "Bot wins/losses"
    process.stdout.write(`${formatNumber(stats.botWins, maxNumber)}/${formatNumber(stats.gameWins, maxNumber, false)} - ${formatNumber(botPercentage, 100)}%/${gamePercentage}%`)

    process.stdout.moveCursor(0, 2); // Move to "1st try"
    process.stdout.cursorTo(17); // Move to value of "1st try"
    process.stdout.clearLine(1); // Delete value of "1st try"
    process.stdout.write(`${formatNumber(stats.winDistribution[0], maxNumber)}`)

    process.stdout.moveCursor(0, 1); // Move to "2st try"
    process.stdout.cursorTo(17); // Move to value of "2st try"
    process.stdout.clearLine(1); // Delete value of "2st try"
    process.stdout.write(`${formatNumber(stats.winDistribution[1], maxNumber)}`)

    process.stdout.moveCursor(0, 1); // Move to "3st try"
    process.stdout.cursorTo(17); // Move to value of "3st try"
    process.stdout.clearLine(1); // Delete value of "3st try"
    process.stdout.write(`${formatNumber(stats.winDistribution[2], maxNumber)}`)

    process.stdout.moveCursor(0, 1); // Move to "4st try"
    process.stdout.cursorTo(17); // Move to value of "4st try"
    process.stdout.clearLine(1); // Delete value of "4st try"
    process.stdout.write(`${formatNumber(stats.winDistribution[3], maxNumber)}`)

    process.stdout.moveCursor(0, 1); // Move to "5st try"
    process.stdout.cursorTo(17); // Move to value of "5st try"
    process.stdout.clearLine(1); // Delete value of "5st try"
    process.stdout.write(`${formatNumber(stats.winDistribution[4], maxNumber)}`)

    process.stdout.moveCursor(0, 1); // Move to "6st try"
    process.stdout.cursorTo(17); // Move to value of "6st try"
    process.stdout.clearLine(1); // Delete value of "6st try"
    process.stdout.write(`${formatNumber(stats.winDistribution[5], maxNumber)}`)

    process.stdout.moveCursor(0, 1); // Move to "failed"
    process.stdout.cursorTo(17); // Move to value of "failed"
    process.stdout.clearLine(1); // Delete value of "failed"
    process.stdout.write(`${formatNumber(stats.winDistribution[6], maxNumber)}`)

    process.stdout.moveCursor(0, 1); // Move to "Failed words"
    process.stdout.cursorTo(15); // Move to value of "Failed words"
    process.stdout.clearLine(1); // Delete value of "Failed words"
    process.stdout.write(`${stats.failedWords.join(", ")}`)

    process.stdout.moveCursor(0, 2); // Move to "Word"
    process.stdout.cursorTo(13); // Move to value of "Word"
    process.stdout.clearLine(1); // Delete value of "Word"
    process.stdout.write(`${stats.lastGame?.word || ""}`)

    process.stdout.moveCursor(0, 1); // Move to "Guesses"
    process.stdout.cursorTo(13); // Move to value of "Guesses"
    process.stdout.clearLine(1); // Delete value of "Guesses"
    process.stdout.write(`${(stats.lastGame?.guesses || []).join(", ")}`)

    process.stdout.moveCursor(0, 1); // Move to "Winner"
    process.stdout.cursorTo(8); // Move to value of "Winner"
    process.stdout.clearLine(1); // Delete value of "Winner"
    process.stdout.write(stats.lastGame?.gameStatus === GameStatus.YOU_WON ? "won!" : "lost!")

    process.stdout.moveCursor(0, 1); // Move to next line
}

function formatNumber(value: number, max: number, padStart = true): string {
    if (padStart) {
        return value.toString().padStart(max.toString().length, " ")
    } else {
        return value.toString().padEnd(max.toString().length, " ")
    }
}

function sleepFor(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
