import { Liveblocks } from "@liveblocks/node";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getUserColor } from "@/lib/utils";

export async function POST(request: Request) {
  const supabase = await createClient();

  const liveblocks = new Liveblocks({
    secret: process.env.NEXT_PUBLIC_LIVEBLOCKS_API_KEY as string,
  });

  const {
    data: { user: sbUser },
  } = await supabase.auth.getUser();

  if (!sbUser) {
    return redirect("/sign-in");
  }

  // Get the current user from your database
  const user = {
    id: sbUser.id,
    info: {
      id: sbUser.id,
      name: sbUser.email as string,
      email: sbUser.email as string,
      color: getUserColor(sbUser.email as string),
    },
  };

  // Identify the user and return the result
  const { status, body } = await liveblocks.identifyUser(
    {
      userId: user.info.email,
      groupIds: [],
    },
    { userInfo: user.info },
  );

  return new Response(body, { status });
}
