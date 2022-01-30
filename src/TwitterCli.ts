import {tweet} from "./utils/twitterUtil";
import {readWordList} from "./utils/wordlistUtils";
import {GameStatus, WordleGame} from "./WordleGame";
import {determineDayOffsetFromSeed, determineWordOfTheDay} from "./utils/wordOfTheDayUtil";
import {WordleBot} from "./WordleBot";

export async function twitterCli(debug?: boolean): Promise<void> {

    const wordlist = await readWordList("./wordlists/short.txt")
    const validationWordlist = await readWordList("./wordlists/long.txt")
    const wordleNumber = determineDayOffsetFromSeed(new Date())
    const wordOfTheDay = determineWordOfTheDay(new Date(), wordlist)
    const game = new WordleGame(wordlist, validationWordlist, wordOfTheDay)
    const bot = new WordleBot(wordlist)

    let guess = bot.firstGuess()
    let guessResult = game.guess(guess)
    while (game.getGameStatus() === GameStatus.RUNNING) {
        guess = bot.nextGuess(guess, guessResult)
        guessResult = game.guess(guess)
    }

    const tries = game.guesses.length
    const resultAsString = game.getResultAsString()
    const tweetText = `Wordle ${wordleNumber} ${tries}/6\n\n${resultAsString}`

    const result = await tweet(tweetText)

    if (result) {
        console.log("Successfully tweeted!")
    } else {
        console.log("Failed to tweet!")
    }
}