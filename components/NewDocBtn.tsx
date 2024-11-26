"use client";

import { createDocument } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewDocBtn({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  const router = useRouter();
  const newDoc = async (userId: string, email: string) => {
    try {
      const room = await createDocument({ userId, email });
      if (room) router.push(`/documents/${room.id}`);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Button className="text-white" onClick={() => newDoc(userId, email)}>
      <Plus className="w-4 h-4 mr-1" />
      New document
    </Button>
  );
}
