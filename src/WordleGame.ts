import {pickRandom} from "./utils/wordlistUtils";

export const MAX_AMOUNT_GUESSES = 6
export const WORD_LENGTH = 5

export class WordleGame {
    word: string
    guesses: string[]
    wordlist: string[]
    validationWordlist: string[]

    constructor(wordlist: string[], validationWordlist?: string[], word?: string) {
        this.word = word || pickRandom(wordlist)
        this.guesses = []
        this.wordlist = wordlist
        this.validationWordlist = validationWordlist || wordlist
    }

    guess(guess: string): GuessResult {
        guess = guess.toLowerCase()

        if (this.guesses.includes(this.word)) {
            throw new WordleError("You already won, no point in keeping to guess!")
        }
        if (this.guesses.length >= MAX_AMOUNT_GUESSES) {
            throw new WordleError("You exceeded the maximum amount of guesses!")
        }
        if (guess.length !== WORD_LENGTH) {
            throw new WordleError(`Guess must be ${WORD_LENGTH} characters long!`)
        }
        if (this.guesses.includes(guess)) {
            throw new WordleError("You already guessed ths word!")
        }
        if (!this.validationWordlist.includes(guess) && !this.wordlist.includes(guess)) {
            throw new WordleError("Word not in wordlist!")
        }

        this.guesses.push(guess)

        const guessResult: GuessResult = [];
        let remainingCharactersInWord = ""

        // First only check the exact matches:
        for (let index = 0; index < guess.length; index++) {
            const character = guess[index]

            if (this.word[index] === character) {
                guessResult[index] = Guess.RIGHT_CHAR_AND_POSITION
            } else {
                remainingCharactersInWord += this.word[index]
            }
        }

        // Then check the remaining characters:
        for (let index = 0; index < guess.length; index++) {
            if (!guessResult[index]) {
                const character = guess[index]

                if (remainingCharactersInWord.includes(character)) {
                    guessResult[index] = Guess.RIGHT_CHAR_WRONG_POSITION
                } else {
                    guessResult[index] = Guess.WRONG_CHAR_AND_WRONG_POSITION
                }
            }
        }

        return guessResult
    }

    getGameStatus(): GameStatus {
        if (this.guesses.includes(this.word)) {
            return GameStatus.YOU_WON
        }
        if (this.guesses.length >= MAX_AMOUNT_GUESSES) {
            return GameStatus.YOU_LOST
        }
        return GameStatus.RUNNING
    }
}

export enum Guess {
    WRONG_CHAR_AND_WRONG_POSITION,
    RIGHT_CHAR_WRONG_POSITION,
    RIGHT_CHAR_AND_POSITION
}

export type GuessResult = {
    [index: number]: Guess
}

export enum GameStatus {
    RUNNING,
    YOU_LOST,
    YOU_WON
}

export class WordleError extends Error {
}