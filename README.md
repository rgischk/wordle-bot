# Wordle Bot

This is a bot that can solve [Wordle puzzles](https://www.powerlanguage.co.uk/wordle/).
It provides a command line interface for both playing and solving a Wordle puzzle.

The following commands are available by calling the `cli` yarn script:
* `help` - Display a help message.
* `play` - Starts an interactive game of Wordle.
* `solve` - Starts an interactive solver bot for Wordle.
* `spoil` - Spoils you by telling you the Wordle word of the day.
* `autoplay` - Automatically plays a game of Wordle.

Each of the commands supports a variety of different options.
You can use the `help` command for more details.

For example if you enter the command `yarn cli autoplay -oeqoe` the bot will solve all words in the original wordlist while displaying statistics about the results.

## How does the bot work?

The original Wordle game has a wordlist with just over 2000 words in it.
This bot uses that same word list to generate the guesses.
For each guess, it calculates the probability for every letter of the alphabet to occur on any position in the word, by just incrementing a counter for each letter.
From that probability, it then calculates a score for each word of the wordlist, that is still possible to be guessed.
It does that by just summing up the probability value for each letter in the word at each position.
It then picks the word with the highest score as the guess.

After a guess, it will update the wordlist by removing all words that are no longer possible due to the hints given by the game.
It will then repeat until the correct word was guessed, or all 6 tries are over.

## How good is this approach?

By lettings the bot solve all words from the original wordlist (with the command `yarn cli autoplay -oeqoe`), we get some interesting statistics about the results:

```
### Running Wordle Autoplay...

   Games played: 2315/2315
Bot wins/losses: 2302/13   -  99%/1%
Win distribution:
    1st try:        1
    2nd try:      146
    3rd try:      872
    4th try:      982
    5th try:      255
    6th try:       46
    failed:        13
Failed words:  joker, boxer, wound, right, baste, batch, stash, hound, vaunt, willy, match, catty, shave
Last game:
    Word:    shave
    Guesses: slate, share, shake, shame, shade, shape
    Bot lost!
Done in 11.94s.
```

As you can see, bot has a 99% win rate.
The majority of words are correctly guessed by the 4th try.

## Motivation

When I first heard of the game Wordle, I was curious and played one round.
I knew immediately, that I would have more fun writing a bot to solve the puzzle, than solving it myself.
So I started my work on it.

I am aware that I am not the first one to write such a bot.
Also, since the algorithm to determine the "word of the day" is implemented in JS on client side, we can actually predict the word for every.
Therefore we could actually implement a bot that guesses the right word on the first time 100% of the time.
But I am not interested in that, as I said before its mostly about the fun to write the bot. 

I picked typescript to write the bot, simply because that is what I am currently using at work.
It is probably not the best choice to write command line interfaces, but also not the worst.

## Future additions

I might add twitter integration to automatically tweet the bots result every day (as so many other people have done).
It would probably also be neat to generate the "copy & paste"-ready output containing the result of your game, as the original does.