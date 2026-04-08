// const readline = require("node:readline");
import { createInterface } from "node:readline";
import readline from "node:readline";
import { stdin, stdout } from "node:process";

export interface AskOptions {
  defaultAnswer?: string | undefined;
  validator?: ((s: string) => boolean) | undefined;
}

export interface Choice {
  label: string;
  value: string;
}

export const openInteractionManager = () => {
  const rl = createInterface({ input: stdin, output: stdout });
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  const ask: (
    question: string,
    options?: AskOptions,
  ) => Promise<string | undefined> = async (
    question: string,
    options?: AskOptions,
  ) => {
    const { defaultAnswer, validator } = options || {};
    return new Promise((resolve,reject) => {
      rl.question(
        question + `${defaultAnswer ? "(" + defaultAnswer + ")" : ""}: `,
        (answer: string) => {
          if (validator && !validator(answer)) {
            console.log("Invalid Input, Enter a valid Input!");
            resolve(ask(question, { defaultAnswer, validator }));
          }
          resolve(answer || defaultAnswer);
        },
      );
      const onClose = () => {
        cleanup();
        resolve(("Input cancelled"));
      };

      const cleanup = () => {
        rl.off("close", onClose);
      };

      rl.on("close", onClose);
    });
  };
  const choose: (
    question: string,
    choices: Choice[],
    optional?: boolean,
  ) => Promise<Choice | undefined> = async (
    question: string,
    choices: Choice[],
    optional,
  ) => {
    console.log(question);
    choices.forEach((choice) => {
      console.log(`${choice.value}. ${choice.label}`);
    });
    const choice = await ask("Please your choice", {
      validator: (input) => {
        if (optional && input.trim() === "") {
          return true;
        }
        return choices.some((choice) => choice.value === input);
      },
    });
    return choices!.find((c) => c.value === choice);
  };

  const close = () => {
    rl.close();
  };
  return {
    ask,
    choose,
    close,
  };
};
