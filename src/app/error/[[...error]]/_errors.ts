import { NextRequest } from "next/server";
import { absoluteUrl } from "~/lib/utils";

export const ERRORS = {
  expired: {
    title: "Тази покана е изтекла",
    message: "Моля, свържете се с организатор, за да получите нова покана.",
  },
  "session-expired": {
    title: "Сесията е изтекла",
    message: "Моля, посетете линка към Вашата покана отново.",
  },
  "discord-error": {
    title: "Грешка с Discord",
    message: `Възникна неочаквана грешка при връзка с Discord.
Моля, посетете линка към Вашата покана отново.
Ако проблемът продължава, свържете се с организатор.
В случай, че сте член на 100 сървъра в Discord, необходимо е да напуснете един от тях, за да се присъедините към сървъра на Hack\u202fTUES\u202fX.`,
  },
  cancelled: {
    title: "Отказахте поканата",
    message: `Ако промените решението си, моля, посетете линка към Вашата покана отново.`,
  },
  unknown: {
    title: "Нещо се обърка!",
    message: `Възникна неочаквана грешка. Моля, посетете линка към Вашата покана отново.
Ако проблемът продължава, свържете се с организатор.`,
  },
} as const;

type Error = keyof typeof ERRORS;

export function relativeErrorUrl(error?: Error) {
  if (!error) {
    return "/error";
  }
  return `/error/${error}`;
}

export function errorUrl(req: NextRequest, error?: Error) {
  return absoluteUrl(relativeErrorUrl(error), req);
}

function isValidError(error: string): error is Error {
  return ERRORS.hasOwnProperty(error);
}

export function getError(error?: string) {
  return error && isValidError(error) ? ERRORS[error] : ERRORS.unknown;
}
