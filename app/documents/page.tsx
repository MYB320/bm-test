import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import NewDocBtn from "@/components/NewDocBtn";
import { getDocuments } from "../actions";
import { dateConverter } from "@/lib/utils";
import Link from "next/link";
import { DeleteModal } from "@/components/DeleteModel";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const roomDocuments = await getDocuments(user.email as string);
  return (
    <div className="flex-1 w-full max-w-4xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Welcome <span>{user.email}</span>
        </h1>
        <NewDocBtn userId={user.id} email={user.email as string} />
      </div>
      {roomDocuments.data.length == 0 ? (
        <div className="flex w-full flex-col items-center justify-center gap-5 rounded-lg bg-accent/45 px-10 py-8">
          <p className="text-center text-sm text-gray-300">
            You don't have any documents yet.
          </p>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-5">
          {roomDocuments.data.map(({ id, metadata, createdAt }: any) => (
            <div
              key={id}
              className="flex w-full justify-between gap-5 rounded-lg bg-accent/45 hover:bg-accent px-10 py-8"
            >
              <Link href={`/documents/${id}`}>
                <div className="w-full flex flex-col gap-2">
                  <h2 className="text-xl font-semibold">{metadata.title}</h2>
                  <p className="text-sm text-gray-300">
                    Created about {dateConverter(createdAt)}
                  </p>
                </div>
              </Link>

              <DeleteModal roomId={id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
