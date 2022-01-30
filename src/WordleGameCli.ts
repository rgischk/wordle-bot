import readLine from "readline";
import {question} from "./utils/readlineUtils";
import {GameStatus, GuessResult, MAX_AMOUNT_GUESSES, WORD_LENGTH, WordleError, WordleGame} from "./WordleGame";
import {PathLike} from "fs";
import {readWordList} from "./utils/wordlistUtils";
import {determineWordOfTheDay} from "./utils/wordOfTheDayUtil";

export async function wordleGameCli(wordlist: PathLike, validationWordlist: PathLike, count: number, words?: string[], validationWords?: string[], forcedWord?: string, wordOfTheDay?: boolean, ordered?: boolean, endless?: boolean, debug?: boolean) {
    console.log("")
    console.log("### Running Wordle Game...")
    if (debug) {
        console.log({words, validationWords, wordlist, validationWordlist, count, forcedWord, wordOfTheDay, ordered, endless, debug})
    }
    console.log("Result explanation:")
    console.log("    0 = Character not included in word")
    console.log("    1 = Character included in word, but in different position")
    console.log("    2 = Character is in correct position")
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

    const rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let remainingCount = count
    let gamesPlayed = 0
    while (endless || remainingCount > 0) {
        remainingCount -= 1

        if (ordered) {
            forcedWord = words[gamesPlayed % words.length]
        }

        if (wordOfTheDay) {
            forcedWord = determineWordOfTheDay(new Date(), words)
        }

        const game = new WordleGame(words, validationWords, forcedWord)
        if (debug) {
            console.log("Starting a new game...")
        }
        do {
            try {
                const questionDetails = ` (remaining tries: ${MAX_AMOUNT_GUESSES - game.guesses.length})`
                const questionText = `Enter your guess${debug ? questionDetails : ""}: `
                const guess = await question(rl, questionText)
                const guessResult = game.guess(guess)

                console.log(": ".padStart(questionText.length, " ") + stringifyGuessResult(guessResult))
            } catch (e) {
                if (e instanceof WordleError) {
                    console.log(e.message)
                } else {
                    console.log(e)
                }
            }
        } while (game.getGameStatus() === GameStatus.RUNNING)

        if (game.getGameStatus() === GameStatus.YOU_WON) {
            console.log("Congratulations, you WON!")
        } else if (game.getGameStatus() === GameStatus.YOU_LOST) {
            console.log(`I'm sorry, you LOST! The word was: ${game.word}`)
        }

        gamesPlayed += 1
    }

    rl.close()
}

function stringifyGuessResult(guessResult: GuessResult): string {
    let result = ""
    for (let index = 0; index < WORD_LENGTH; index++) {
        result += guessResult[index]
    }
    return result
}
