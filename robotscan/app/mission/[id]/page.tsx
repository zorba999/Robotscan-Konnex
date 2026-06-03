import { redirect } from "next/navigation";

export default async function MissionRedirect() {
  redirect("/escrows");
}
