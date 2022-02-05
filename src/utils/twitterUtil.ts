import TwitterApi from "twitter-api-v2";


export async function tweet(text: string, debug?: boolean, fake?: boolean): Promise<boolean> {
    const appKey = process.env.WORDLE_BOT_API_KEY
    const appSecret = process.env.WORDLE_BOT_API_KEY_SECRET
    const accessToken = process.env.WORDLE_BOT_ACCESS_TOKEN
    const accessSecret = process.env.WORDLE_BOT_ACCESS_TOKEN_SECRET

    if (fake) {
        console.log("This would have been the tweet text:")
        console.log(text)
        return true
    }

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
        console.log("The necessary environment variables are not set. Tweet cannot be send!")
        console.log("This would have been the tweet text:")
        console.log(text)
        return false
    }

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