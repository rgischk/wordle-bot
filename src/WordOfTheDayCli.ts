import {PathLike} from "fs";
import {readWordList} from "./utils/wordlistUtils";
import {determineWordOfTheDay} from "./utils/wordOfTheDayUtil";

export async function wordOfTheDayCli(wordlist: PathLike, words?: string[], dateInMs?: number) {
    if (!words) {
        words = await readWordList(wordlist)
    }
    const date = dateInMs ? new Date(dateInMs) : new Date()

    const wordOfTheDay = determineWordOfTheDay(date, words)

    console.log("")
    console.log("### Spoiling you...")
    console.log("")
    console.log("The word of the day is:", wordOfTheDay)
}