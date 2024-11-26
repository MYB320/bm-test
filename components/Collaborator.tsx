import Image from "next/image";
import React, { useState } from "react";
import UserTypeSelector from "./UserTypeSelector";
import { Button } from "./ui/button";
import { removeCollaborator, updateDocumentAccess } from "@/app/actions";

const Collaborator = ({
  roomId,
  creatorId,
  collaborator,
  email,
  user,
}: any) => {
  const [userType, setUserType] = useState(collaborator.userType || "viewer");
  const [loading, setLoading] = useState(false);

  const shareDocumentHandler = async (type: string) => {
    setLoading(true);

    await updateDocumentAccess({
      roomId,
      email,
      userType: type,
      updatedBy: user,
    });

    setLoading(false);
  };

  const removeCollaboratorHandler = async (email: string) => {
    setLoading(true);

    await removeCollaborator({ roomId, email });

    setLoading(false);
  };

  return (
    <li className="flex items-center justify-between gap-2 py-3">
      <div className="flex gap-2">
        <p className="line-clamp-1 text-sm font-semibold leading-4 text-white">
          {collaborator.email}
          <span className="text-10-regular pl-2 text-blue-100">
            {loading && "updating..."}
          </span>
        </p>
      </div>

      {creatorId === collaborator.id ? (
        <p className="text-sm text-blue-100">Owner</p>
      ) : (
        <div className="flex items-center">
          <UserTypeSelector
            userType={userType}
            setUserType={setUserType || "viewer"}
            onClickHandler={shareDocumentHandler}
          />
          <Button
            type="button"
            onClick={() => removeCollaboratorHandler(collaborator.email)}
          >
            Remove
          </Button>
        </div>
      )}
    </li>
  );
};

export default Collaborator;
