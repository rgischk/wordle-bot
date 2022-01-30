import * as fs from "fs"
import {PathLike} from "fs"
import readLine from "readline"

export function pickRandom(wordlist: string[]): string {
    return wordlist[Math.floor(Math.random() * wordlist.length)]
}

export async function sortWordlist(inputFile: PathLike, outputFile: PathLike) {
    readWordList(inputFile).then(lines => lines.sort()).then(sortedLines => writeWordList(sortedLines, outputFile))
}

export async function readWordList(inputFile: PathLike): Promise<string[]> {
    const lines = readLine.createInterface({
        input: fs.createReadStream(inputFile),
        crlfDelay: Infinity
    })

    const linesArray = []
    for await (const line of lines) {
        linesArray.push(line)
    }
    return linesArray
}

export async function writeWordList(wordList: string[], outputFile: PathLike) {
    const writeStream = fs.createWriteStream(outputFile)
    wordList.forEach(line => writeStream.write(line + "\n"))
}