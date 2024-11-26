"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  LiveblocksProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { LoaderCircle } from "lucide-react";
import { getDocumentUsers, getSBUsers } from "@/app/actions";
import { createClient } from "@/utils/supabase/client";

export function LbProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState("");
  useEffect(() => {
    (async () => {
      const supabase = await createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUser(user?.email as string);
    })();
  }, [currentUser]);
  return (
    <LiveblocksProvider
      authEndpoint="/auth/liveblocks"
      resolveUsers={async ({ userIds }) => {
        const users = getSBUsers({ userIds });
        return users;
      }}
      resolveMentionSuggestions={async ({ text, roomId }) => {
        const roomusers = await getDocumentUsers({
          roomId,
          text,
          currentUser,
        });
        return roomusers;
      }}
    >
      <ClientSideSuspense
        fallback={
          <div className="loader">
            <LoaderCircle className="h-12 w-12 animate-spin" />
            Loading...
          </div>
        }
      >
        {children}
      </ClientSideSuspense>
    </LiveblocksProvider>
  );
}
