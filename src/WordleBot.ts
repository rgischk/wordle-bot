import {Guess, GuessResult} from "./WordleGame";

export class WordleBot {
    state: GuessState

    constructor(words: string[]) {
        this.state = {
            amountGuesses: 0,
            includedCharacters: "",
            excludedCharacters: "",
            correctCharacters: [],
            incorrectCharacters: [],
            remainingWordlist: words
        }
    }

    firstGuess(): string {
        return generateNextGuess(this.state)
    }

    nextGuess(previousGuess: string, guessResult: GuessResult, debug = false): string {
        this.state = updateGuessState(this.state, previousGuess, guessResult)
        return generateNextGuess(this.state, debug)
    }
}

export function generateNextGuess(state: GuessState, debug = false): string {
    const probabilityMap = buildProbabilityMap(state.remainingWordlist);
    let guesses: string[] = []
    let score = 0

    state.remainingWordlist.forEach(word => {
        const wordScore = calculateWordScore(word, probabilityMap)
        if (wordScore > score) {
            guesses = [word]
            score = wordScore
        } else if (wordScore === score) {
            guesses.push(word)
        }
    })

    if (guesses.length === 0) {
        throw new BotError("Unable to generate a guess.")
    }

    const guess = guesses[0]

    if (guesses.length > 1 && debug) {
        console.log(`Multiple possible guesses: ${guesses} - Picked: ${guess}`)
    }
    return guess
}

export function buildProbabilityMap(wordList: string[]): ProbabilityMap {
    const probabilityMap: ProbabilityMap = []

    wordList.forEach(word => {
        for (let index = 0; index < word.length; index++) {
            const character = word[index]
            if (!probabilityMap[index]) {
                probabilityMap[index] = {}
            }
            if (!probabilityMap[index][character]) {
                probabilityMap[index][character] = 0
            }
            probabilityMap[index][character] += 1
        }
    })

    return probabilityMap
}

function calculateWordScore(word: string, probabilityMap: ProbabilityMap): number {
    let score = 0
    for (let index = 0; index < word.length; index++) {
        const character = word[index]
        score += probabilityMap[index][character]
    }
    return score
}

export function updateGuessState(oldState: GuessState, guess: string, guessResult: GuessResult): GuessState {
    const newState = JSON.parse(JSON.stringify(oldState)) as GuessState

    const indexOfGuess = newState.remainingWordlist.indexOf(guess)
    if (indexOfGuess >= 0) {
        newState.remainingWordlist.splice(indexOfGuess, 1)
    }

    for (let index = 0; index < guess.length; index++) {
        const character = guess[index]
        const characterResult = guessResult[index]

        if (characterResult === Guess.RIGHT_CHAR_WRONG_POSITION) {
            if (!newState.includedCharacters.includes(character)) {
                newState.includedCharacters += character
            }
        }
        if (characterResult === Guess.WRONG_CHAR_AND_WRONG_POSITION) {
            if (!newState.excludedCharacters.includes(character)) {
                newState.excludedCharacters += character
            }
        }

        if (characterResult === Guess.RIGHT_CHAR_AND_POSITION) {
            newState.correctCharacters[index] = character
            // Since the character was now guessed correctly, there might not be another one included:
            const includedCharacterIndex = newState.includedCharacters.indexOf(character)
            if (includedCharacterIndex >= 0) {
                newState.includedCharacters = newState.includedCharacters.replace(character, "")
            }
        } else {
            newState.correctCharacters[index] = null
        }

        if (characterResult === Guess.RIGHT_CHAR_WRONG_POSITION) {
            let incorrectCharactersAtIndex = newState.incorrectCharacters[index] || ""
            if (!incorrectCharactersAtIndex.includes(character)) {
                incorrectCharactersAtIndex += character
            }
            newState.incorrectCharacters[index] = incorrectCharactersAtIndex
        }
    }

    newState.remainingWordlist = newState.remainingWordlist
        .filter(remainingWord => isValidGuess(
            remainingWord,
            newState.excludedCharacters,
            newState.includedCharacters,
            newState.correctCharacters,
            newState.incorrectCharacters
        ))

    newState.amountGuesses += 1

    return newState
}

function isValidGuess(guess: string, excludedCharacters: string, includedCharacters: string, correctCharacters: (string | null)[], incorrectCharacters: string[]): boolean {
    const notYetGuessedCharacters = [...guess].filter((character, index) => !correctCharacters[index])

    for (let i = 0; i < correctCharacters.length; i++) {
        if (correctCharacters[i]) {
            const correctCharacter = correctCharacters[i]
            const guessCharacter = guess[i]
            if (correctCharacter !== guessCharacter) {
                return false
            }
        }
    }
    for (let i = 0; i < excludedCharacters.length; i++) {
        const excludedCharacter = excludedCharacters[i]
        if (notYetGuessedCharacters.includes(excludedCharacter)) {
            return false
        }
    }

    for (let i = 0; i < includedCharacters.length; i++) {
        const includedCharacter = includedCharacters[i]
        if (!notYetGuessedCharacters.includes(includedCharacter)) {
            return false
        }
    }

    for (let i = 0; i < incorrectCharacters.length; i++) {
        const incorrectCharactersAtIndex = incorrectCharacters[i] || ""
        for (let j = 0; j < incorrectCharactersAtIndex.length; j++) {
            const incorrectCharacterAtIndex = incorrectCharactersAtIndex[j]
            if (guess[i] === incorrectCharacterAtIndex) {
                return false
            }
        }
    }

    return true
}

export type GuessState = {
    /**
     * The amount of guesses that have already been made.
     */
    amountGuesses: number
    /**
     * The characters that are for sure included in the remaining characters of the word.
     */
    includedCharacters: string
    /**
     * The characters that are for sure not included in the word.
     */
    excludedCharacters: string
    /**
     * The correct characters at the correct position. (Array may contain gaps!)
     */
    correctCharacters: (string | null)[]
    /**
     * The incorrect characters at each position. (Array may contain gaps!)
     */
    incorrectCharacters: string[]
    /**
     * The words that are still possible based on the previous guesses and guess results.
     */
    remainingWordlist: string[]
}

export type ProbabilityMap = {
    [index: number]: {
        [character: string]: number
    }
}

export class BotError extends Error {
}