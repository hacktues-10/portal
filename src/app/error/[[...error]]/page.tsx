import { ERRORS, getError } from "~/app/error/[[...error]]/_errors";
import { Metadata } from "next";
import { cn } from "~/lib/utils";
import { HourglassIcon } from "~/app/_components/hourglass-icon";

type Props = {
  params: {
    error?: string[];
  };
};

export function generateMetadata({ params }: Props): Metadata {
  const { title, message: description } = getError(params.error?.at(0));
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export function generateStaticParams() {
  return [
    ...Object.keys(ERRORS).map((error) => ({ error: [error] })),
    { error: [] },
  ];
}

export default function ErrorPage({ params }: Props) {
  const error = getError(params.error?.at(0));
  const isMultiLine = error.message.includes("\n");
  return (
    <div className={cn("space-y-3", !isMultiLine && "text-center")}>
      <div className="flex gap-3 items-center">
        {isMultiLine && (
          <div className="w-1/4">
            <HourglassIcon />
          </div>
        )}
        <h1 className="text-3xl font-extrabold flex-1">{error.title}</h1>
      </div>
      {error.message.split("\n").map((line, i) => (
        <p key={i} className="text-muted-foreground">
          {line}
        </p>
      ))}
    </div>
  );
}
