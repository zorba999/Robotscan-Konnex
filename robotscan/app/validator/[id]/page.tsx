import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function ValidatorRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/robot/${id}`);
}
