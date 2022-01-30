import {Guess, GuessResult, WordleGame} from "./WordleGame";

describe("WordleGame", () => {
    test("sores for solar returns 22100", async () => {
        const game = new WordleGame()
        await game.start()
        game.word = "solar"

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