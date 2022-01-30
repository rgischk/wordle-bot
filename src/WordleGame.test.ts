import {Guess, GuessResult, WordleGame} from "./WordleGame";
import {readWordList} from "./utils/wordlistUtils";

describe("WordleGame", () => {
    test("sores for solar returns 22100", async () => {
        const wordlist = await readWordList("./wordlists/short.txt")
        const validationWordlist = await readWordList("./wordlists/long.txt")
        const game = new WordleGame(wordlist, validationWordlist, "solar")

        const guessResult = game.guess("sores")

        const expectedGuessResult: GuessResult = [
            Guess.RIGHT_CHAR_AND_POSITION,
            Guess.RIGHT_CHAR_AND_POSITION,
            Guess.RIGHT_CHAR_WRONG_POSITION,
            Guess.WRONG_CHAR_AND_WRONG_POSITION,
            Guess.WRONG_CHAR_AND_WRONG_POSITION
        ]

        expect(guessResult).toEqual(expectedGuessResult)
    })
})