import TwitterApi from "twitter-api-v2";


export async function tweet(text: string, debug?: boolean): Promise<boolean> {
    const appKey = process.env.WORDLE_BOT_API_KEY as string
    const appSecret = process.env.WORDLE_BOT_API_KEY_SECRET as string
    const accessToken = process.env.WORDLE_BOT_ACCESS_TOKEN as string
    const accessSecret = process.env.WORDLE_BOT_ACCESS_TOKEN_SECRET as string

    const userClient = new TwitterApi({
        appKey,
        appSecret,
        accessToken,
        accessSecret
    })

    try {
        const response = await userClient.v2.tweet(text)
        if (debug) {
            console.log(response)
        }
        return true
    } catch (e) {
        if (debug) {
            console.log(e)
        }
    }
    return false

}