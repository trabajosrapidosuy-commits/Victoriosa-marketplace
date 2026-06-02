import { redirect } from "next/navigation";

export default async function LegacyOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/order/${id}`);
}
