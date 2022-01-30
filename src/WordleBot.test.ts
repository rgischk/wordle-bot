import {GuessState, updateGuessState} from "./WordleBot";
import {Guess, GuessResult} from "./WordleGame";

describe("WordleBot", () => {
    test("guess solar, second guess", async () => {
        const oldState: GuessState = {
            amountGuesses: 1,
            includedCharacters: "r",
            excludedCharacters: "es",
            correctCharacters: [ "s", "o"],
            incorrectCharacters: ["", "", "r", "", ""],
            remainingWordlist: ["sofar", "sohur", "solar", "sonar", "sopor", "sopra", "sowar"]
        }
        const guess: string = "sofar"
        const guessResult: GuessResult = [
            Guess.RIGHT_CHAR_AND_POSITION,
            Guess.RIGHT_CHAR_AND_POSITION,
            Guess.WRONG_CHAR_AND_WRONG_POSITION,
            Guess.RIGHT_CHAR_AND_POSITION,
            Guess.RIGHT_CHAR_AND_POSITION
        ]

        const updatedGuessState = updateGuessState(oldState, guess, guessResult)

        const expectedNewState: GuessState = {
            amountGuesses: 2,
            includedCharacters: "",
            excludedCharacters: "esf",
            correctCharacters: ["s", "o", null, "a", "r"],
            incorrectCharacters: ["", "", "r", "", ""],
            remainingWordlist: ["solar", "sonar", "sowar"]
        }

        expect(updatedGuessState).toEqual(expectedNewState)
    })
})