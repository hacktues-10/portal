import { decodeMentor } from "~/lib/mentors";
import { relativeErrorUrl } from "~/app/error/[[...error]]/_errors";
import { redirect } from "next/navigation";
import { ActiveJoinPage } from "~/app/join/_components/active-join-page";

export const metadata = {
  title: "Присъединете се към Discord сървъра на Hack TUES X",
  description:
    "Присъединете се към Discord сървъра на Hack TUES X и бъдете част от десетото юбилейно издание!",
  openGraph: {
    title: "Присъединете се към Discord сървъра на Hack TUES X",
    description:
      "Присъединете се към Discord сървъра на Hack TUES X и бъдете част от десетото юбилейно издание!",
  },
};

export default async function MentorJoinPage({
  params,
}: {
  params: { token: string };
}) {
  const token = await decodeMentor(params.token);
  if (!token.success) {
    return redirect(relativeErrorUrl("expired"));
  }
  return <ActiveJoinPage payload={token.payload} />;
}
