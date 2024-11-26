"use client";

import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "./ui/button";
import ActiveUsers from "./ActiveUsers";
import { useRouter } from "next/navigation";
import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { UpdateDocument } from "@/app/actions";
import ShareModal from "./ShareModal";

const TitleBar = ({ roomId, metadata, currentUserType, users }: any) => {
  const currentUser = "editor";
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(metadata.title);
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitle = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setLoading(true);
      try {
        if (title !== metadata.title) {
          const updateDocument = await UpdateDocument(roomId, title);
          if (updateDocument) {
            setEditing(false);
          }
        }
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const clickOutside = async (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setEditing(false);
        await UpdateDocument(roomId, title);
      }
    };
    document.addEventListener("mousedown", clickOutside as any);
    return () => {
      document.removeEventListener("mousedown", clickOutside as any);
    };
  }, [roomId, title]);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  return (
    <div className="flex flex-row items-center justify-between">
      <Button
        variant={"outline"}
        className="items-center"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back
      </Button>
      <div ref={containerRef}>
        {editing && !loading ? (
          <Input
            ref={inputRef}
            className="document-title-input"
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={updateTitle}
            disabled={!editing}
          />
        ) : (
          <div className="flex items-center">
            <p className="document-title">{title}</p>
            {currentUser === "editor" && !editing && (
              <Button
                variant={"link"}
                size={"icon"}
                onClick={() => setEditing(true)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
        {currentUser !== "editor" && !editing && (
          <p className="view-only-tag">View Only</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ActiveUsers />
        <ShareModal
          roomId={roomId}
          collaborators={users}
          creatorId={metadata.creatorId}
          currentUserType={currentUserType}
        />
      </div>
    </div>
  );
};
export default TitleBar;
