"use client";

import { ReactNode } from "react";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { LoaderCircle } from "lucide-react";

export function Room({
  id,
  metadata,
  children,
}: {
  id: string;
  metadata: any;
  children: ReactNode;
}) {
  return (
    <RoomProvider id={id}>
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
    </RoomProvider>
  );
}
