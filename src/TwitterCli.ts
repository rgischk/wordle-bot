import {tweet} from "./utils/twitterUtil";
import {readWordList} from "./utils/wordlistUtils";
import {GameStatus, WordleGame} from "./WordleGame";
import {
    determineDayOffsetFromSeed,
    determineWordOfTheDayFromDayOffset
} from "./utils/wordOfTheDayUtil";
import {WordleBot} from "./WordleBot";

export async function twitterCli(debug?: boolean, fake?: boolean, date?: number, day?: number, startDate?: number, startDay?: number): Promise<void> {

    const wordlist = await readWordList("./wordlists/short.txt")
    const validationWordlist = await readWordList("./wordlists/long.txt")

    const endWordleNumber = day ? day : determineDayOffsetFromSeed(date ? new Date(date) : new Date())
    const startWordleNumber = startDay ? startDay : startDate ? determineDayOffsetFromSeed(new Date(startDate)) : endWordleNumber

    if (startWordleNumber !== endWordleNumber) {
        console.log(`Generating tweets from ${startWordleNumber} to ${endWordleNumber}...`)
    }

    let result = true
    for (let i = startWordleNumber ; i<= endWordleNumber ; i++) {
        const wordOfTheDay = determineWordOfTheDayFromDayOffset(i, wordlist)
        const game = new WordleGame(wordlist, validationWordlist, wordOfTheDay)
        const bot = new WordleBot(wordlist)

        let guess = bot.firstGuess()
        let guessResult = game.guess(guess)
        while (game.getGameStatus() === GameStatus.RUNNING) {
            guess = bot.nextGuess(guess, guessResult)
            guessResult = game.guess(guess)
        }

        const tries = game.getGameStatus() === GameStatus.YOU_WON ? game.guesses.length : "X"
        const resultAsString = game.getResultAsString()
        const tweetText = `Wordle ${i} ${tries}/6\n\n${resultAsString}`

        result &&= await tweet(tweetText, debug, fake)
    }

    if (result) {
        console.log("Successfully tweeted!")
    } else {
        console.log("Failed to tweet!")
    }



}