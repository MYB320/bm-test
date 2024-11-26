import { getDocument, getSBUsers } from "@/app/actions";
import { Editor } from "@/components/editor/Editor";
import { Room } from "@/components/RoomProvider";
import TitleBar from "@/components/TitleBar";
import { createClient } from "@/utils/supabase/server";
import { RoomData } from "@liveblocks/node";
import { aw } from "@liveblocks/react/dist/room-t_BUxm1-";
import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export default async function ProtectedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const room: RoomData = await getDocument({
    roomId: id,
    userId: user?.email as string,
  });

  const userIds = Object.keys(room.usersAccesses);
  const users = await getSBUsers({ userIds });

  const usersData = users.map((user: User) => ({
    ...user,
    userType: room.usersAccesses[user.email as string]?.includes(
      "room:write" as never,
    )
      ? "editor"
      : "viewer",
  }));

  const currentUserType = room.usersAccesses[user?.email as string]?.includes(
    "room:write" as never,
  )
    ? "editor"
    : "viewer";

  if (!user || !room) {
    return redirect("/documents");
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <Room id={id} metadata={room.metadata}>
        <TitleBar
          roomId={id}
          metadata={room.metadata}
          currentUserType={currentUserType}
          users={usersData}
        />
        <Editor roomId={id} currentUserType={currentUserType} />
      </Room>
    </div>
  );
}
