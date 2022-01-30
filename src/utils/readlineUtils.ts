import readLine from "readline";

export function question(rl: readLine.Interface, prompt: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(prompt, (input) => resolve(input));
    });
}