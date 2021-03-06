import 'dotenv/config'
import { Command } from "commander"
import {WORD_LENGTH} from "./WordleGame";
import {wordleBotCli} from "./WordleBotCli";
import {wordleGameCli} from "./WordleGameCli";
import {autoplayCli} from "./AutoplayCli";
import {sortWordlist} from "./utils/wordlistUtils";
import {wordOfTheDayCli} from "./WordOfTheDayCli";
import {twitterCli} from "./TwitterCli";

const program = new Command();

program
    .version(
        '1.0.0',
        "-v --version",
        "Output the current version."
    )

program
    .command("play")
    .alias("p")
    .description("Starts an interactive game of Wordle.")
    .option(
        "-f, --force-word <word>",
        `Force the word to play. Make sure that the words is ${WORD_LENGTH} characters long and that the word is contained in the wordlist.`
    )
    .option(
        "-w, --words <words...>",
        `The words to pick from to guess. Make sure that the words are ${WORD_LENGTH} characters long. Will override the wordlist option if provided.`
    )
    .option(
        "-vw, --validation-words <words...>",
        `The additional words to use for input validation. Make sure that the words are ${WORD_LENGTH} characters long. Will override the validation-wordlist option if provided.`
    )
    .option(
        "-wl, --wordlist <file>",
        `The path to the word list file to pick words to guess from. Make sure that the words in the list are ${WORD_LENGTH} characters long.`,
        "./wordlists/short.txt"
    )
    .option(
        "-vwl, --validation-wordlist <file>",
        `The path to the word list file to additionally use for input validation. Make sure that the words in the list are ${WORD_LENGTH} characters long.`,
        "./wordlists/long.txt"
    )
    .option(
        "-c, --count <number>",
        "The amount of games that should be played.",
        "1"
    )
    .option(
        "-wotd, --word-of-the-day",
        "Play the word of the day."
    )
    .option(
        "-o, --ordered",
        "By default, words will be picked randomly. If this flag is set, the words will be picked in the provided order."
    )
    .option(
        "-e, --endless",
        "Play forever until command is interrupted. Will override the count option if provided."
    )
    .option(
        "-d, --debug",
        "Log details while executing the command."
    )
    .action((options) => {
        return wordleGameCli(options.wordlist, options.validationWordlist, options.count, options.words, options.validationWords, options.forceWord, options.wordOfTheDay, options.ordered, options.endless, options.debug)
    })

program
    .command("solve")
    .alias("s")
    .description("Starts an interactive solver bot for Wordle.")
    .option(
        "-w, --words <words...>",
        `The list of words that could be guessed. Make sure that the words are ${WORD_LENGTH} characters long. Will override the wordlist option if provided.`
    )
    .option(
        "-wl, --wordlist <file>",
        `The path to the word list file containing words that could be guessed. Make sure that the words in the list are ${WORD_LENGTH} characters long.`,
        "./wordlists/short.txt"
    )
    .option(
        "-c, --count <number>",
        "The amount of games that should be solved.",
        "1"
    )
    .option(
        "-e, --endless",
        "Solve forever until command is interrupted. Will override the count option if provided."
    )
    .option(
        "-d, --debug",
        "Log details while executing the command."
    )
    .action((options) => {
        return wordleBotCli(options.wordlist, options.count, options.words, options.endless, options.debug)
    })


program
    .command("spoil")
    .description("Spoils you by telling you the word of the day")
    .option(
        "-d, --date <number>",
        "The date of the day to spoil in ms. Will use today be default."
    )
    .option(
        "-w, --words <words...>",
        `The words to calculate the word of the day from. Make sure that the words are ${WORD_LENGTH} characters long. Will override the wordlist option if provided.`
    )
    .option(
        "-wl, --wordlist <file>",
        `The path to the word list file to calculate the word of the day from. Make sure that the words in the list are ${WORD_LENGTH} characters long.`,
        "./wordlists/short.txt"
    )
    .action((options) => {
        return wordOfTheDayCli(options.wordlist, options.words, parseOptionalInt(options.date))
    })


program
    .command("autoplay")
    .alias("a")
    .description("Automatically plays a game of Wordle.")
    .option(
        "-f, --force-word <word>",
        `Force the word to play. Make sure that the words is ${WORD_LENGTH} characters long and that the word is contained in the wordlist.`
    )
    .option(
        "-w, --words <words...>",
        `The words to pick from to guess. Make sure that the words are ${WORD_LENGTH} characters long. Will override the wordlist option if provided.`
    )
    .option(
        "-vw, --validation-words <words...>",
        `The additional words to use for input validation. Make sure that the words are ${WORD_LENGTH} characters long. Will override the validation-wordlist option if provided.`
    )
    .option(
        "-wl, --wordlist <file>",
        `The path to the word list file to pick words to guess from. Make sure that the words in the list are ${WORD_LENGTH} characters long.`,
        "./wordlists/short.txt"
    )
    .option(
        "-vwl, --validation-wordlist <file>",
        `The path to the word list file to additionally use for input validation. Make sure that the words in the list are ${WORD_LENGTH} characters long.`,
        "./wordlists/long.txt"
    )
    .option(
        "-c, --count <number>",
        "The amount of games that should be played.",
        "1"
    )
    .option(
        "-o, --ordered",
        "By default, words will be picked randomly. If this flag is set, the words will be picked in the provided order."
    )
    .option(
        "-e, --endless",
        "Play forever until command is interrupted. Will override the count option if provided."
    )
    .option(
        "-qoe, --quit-on-end",
        "Only relevant if ordered and endless flag are provided: Will quit when the end of the wordlist is reached."
    )
    .option(
        "-s, --sleep <ms>",
        "Sleep after every game. Duration in ms. Default is no sleep.",
    )
    .option(
        "-d, --debug",
        "Log details while executing the command."
    )
    .action((options) => {
        return autoplayCli(options.wordlist, options.validationWordlist, parseInt(options.count), options.words, options.validationWords, options.forceWord, options.ordered, options.endless, options.quitOnEnd, options.sleep, options.debug)
    })

program
    .command("tweet")
    .alias("t")
    .description("Plays the word of the day and tweets the result.")
    .option(
        "-d, --debug",
        "Log details while executing the command."
    )
    .option(
        "--fake",
        "Will only fake send tweets."
    )
    .option(
        "--date <number>",
        "The date of the day to tweet in ms. Will use today be default."
    )
    .option(
        "--day <number>",
        "The day to tweet. Will use today be default."
    )
    .option(
        "--startDate <number>",
        "The date of the day to start generating tweets for in ms. Will only tweet one wordle by default."
    )
    .option(
        "--startDay <number>",
        "The day to start generating tweets. Will only tweet one wordle by default."
    )
    .action((options) => {
        return twitterCli(options.debug, options.fake, parseOptionalInt(options.date), parseOptionalInt(options.day), parseOptionalInt(options.startDate), parseOptionalInt(options.startDay))
    })

program
    .command("sort <inputFile> <outputFile>")
    .description("Sorts a wordlist file.")
    .action((inputFile, outputFile) => {
        return sortWordlist(inputFile, outputFile)
    })

program.parseAsync(process.argv)

function parseOptionalInt(string?: string): number | undefined {
    if (string) {
        return parseInt(string)
    } else {
        return undefined
    }
}