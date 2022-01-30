import {PathLike} from "fs"
import {BotError, WordleBot} from "./WordleBot";
import readLine from "readline";
import {question} from "./utils/readlineUtils";
import {Guess, GuessResult, WORD_LENGTH} from "./WordleGame";
import {readWordList} from "./utils/wordlistUtils";

export async function wordleBotCli(wordlist: PathLike, count: number, words?: string[], endless?: boolean, debug?: boolean) {
    console.log("")
    console.log("### Running Wordle Bot...")
    if (debug) {
        console.log({words, wordlist, count, endless, debug})
    }
    console.log("Result explanation:")
    console.log("    0 = Character not included in word")
    console.log("    1 = Character included in word, but in different position")
    console.log("    2 = Character is in correct position")
    console.log("")

    if (!words) {
        words = await readWordList(wordlist)
    }

    const rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let remainingCount = count
    while (endless || remainingCount > 0) {
        remainingCount -= 1

        let bot
        try {

            bot = new WordleBot(words)
            if (debug) {
                console.log("Starting a new game...")
            }

            const questionDetails = " (Five digits with the following values: 0 = wrong, 1 = right character, 2 = right character + position)"
            const questionText = `Enter the guess result${debug ? questionDetails : ""}: `

            let guess = bot.firstGuess()
            console.log("Bots first guess is: ".padStart(questionText.length, " ") + guess)
            let guessResult = parseGuessResult(await question(rl, questionText))

            do {
                guess = bot.nextGuess(guess, guessResult, debug)
                if (debug) {
                    console.log(bot.state)
                }
                console.log("Bots next guess is: ".padStart(questionText.length, " ") + guess)

                guessResult = parseGuessResult(await question(rl, questionText))
            } while (!isAllRight(guessResult))

        } catch (e) {
            if (e instanceof BotError && bot) {
                console.log(e.message, bot.state)
            } else {
                if (bot) {
                    console.log(e, bot.state)
                } else {
                    console.log(e)
                }
            }
        }


    }

    rl.close()
}

function isAllRight(guessResult: GuessResult): boolean {
    for (let index = 0; index < WORD_LENGTH; index++) {
        if (guessResult[index] !== Guess.RIGHT_CHAR_AND_POSITION) {
            return false
        }
    }
    return true
}

function parseGuessResult(string: string): GuessResult {
    const result: GuessResult = []

    for (let index = 0; index < WORD_LENGTH; index++) {
        const character = string[index]
        if (character === "0") {
            result[index] = Guess.WRONG_CHAR_AND_WRONG_POSITION
        } else if (character === "1") {
            result[index] = Guess.RIGHT_CHAR_WRONG_POSITION
        } else if (character === "2") {
            result[index] = Guess.RIGHT_CHAR_AND_POSITION
        } else {
            throw new BotError("Invalid guess result!")
        }
    }

    return result
}
