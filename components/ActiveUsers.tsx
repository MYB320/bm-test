"use client";

import { useOthers } from "@liveblocks/react";
import { Plus, User, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const ActiveUsers = () => {
  const others = useOthers();
  const activeUsers = others.filter((user) => user.info);
  if (activeUsers.length == 0) return null;
  return (
    <Popover>
      <PopoverTrigger>
        <div className="flex flex-row gap-2 items-center px-4 py-2 hover:bg-accent rounded-lg cursor-pointer">
          <Users className="w-4 h-4" />
          <p className="text-base">{activeUsers.length}</p>
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <ul>
          {activeUsers.map((user) => (
            <li
              key={user.id}
              className="flex flex-row items-center justify-between"
            >
              <div className="flex flex-row items-center">
                <User className="w-4 h-4 mr-1" />
                {user.info.email}
              </div>
              <div
                className={"w-4 h-4 rounded-full"}
                style={{ backgroundColor: user.info.color }}
              />
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

export default ActiveUsers;
