"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Liveblocks } from "@liveblocks/node";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { getAccessType, parseStringify } from "@/lib/utils";
import { User } from "@supabase/supabase-js";

export const signUpAction = async (formData: FormData) => {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  if (!name || !email || !password) {
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email and password are required",
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        name,
      },
    },
  });

  if (error) {
    console.error(error.code + " " + error.message);
    return encodedRedirect("error", "/sign-up", error.message);
  } else {
    return encodedRedirect(
      "success",
      "/sign-up",
      "Thanks for signing up! Please check your email for a verification link.",
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect("error", "/sign-in", error.message);
  }

  return redirect("/documents");
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/documents/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/documents/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/documents/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/documents/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/documents/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const getSBUsers = async ({ userIds }: { userIds: string[] }) => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.log(error);
    }
    const users = data.users.filter((user) =>
      userIds.includes(user.email as string),
    );
    const newUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.email,
    }));
    const sortedUsers = userIds.map((email) =>
      newUsers.find((user) => user.email === email),
    );
    return parseStringify(sortedUsers);
  } catch (error) {
    console.log(error);
  }
};

export const getDocumentUsers = async ({
  roomId,
  currentUser,
  text,
}: {
  roomId: string;
  currentUser: string;
  text: string;
}) => {
  const liveblocks = new Liveblocks({
    secret: process.env.NEXT_PUBLIC_LIVEBLOCKS_API_KEY as string,
  });

  try {
    const room = await liveblocks.getRoom(roomId);
    const users = Object.keys(room.usersAccesses).filter(
      (email) => email !== currentUser,
    );
    if (text.length) {
      const lowerCaseTxt = text.toLowerCase();
      const filteredUsers = users.filter((email) =>
        email.toLowerCase().includes(lowerCaseTxt),
      );
      return parseStringify(filteredUsers);
    }
    return parseStringify(users);
  } catch (err) {
    console.log("Error Fetching document users:", err);
  }
};

export const createDocument = async ({
  userId,
  email,
}: {
  email: string;
  userId: string;
}) => {
  const roomId = uuidv4();

  const liveblocks = new Liveblocks({
    secret: process.env.NEXT_PUBLIC_LIVEBLOCKS_API_KEY as string,
  });

  try {
    const metadata = {
      creatorId: userId,
      email,
      title: "Untitled",
    };

    const usersAccesses: { [key: string]: any } = {
      [email]: ["room:write"],
    };

    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      defaultAccesses: [],
    });

    revalidatePath("/");

    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while creating a room: ${error}`);
  }
};

export const getDocument = async ({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) => {
  const liveblocks = new Liveblocks({
    secret: process.env.NEXT_PUBLIC_LIVEBLOCKS_API_KEY as string,
  });

  try {
    const room = await liveblocks.getRoom(roomId);

    const hasAccess = Object.keys(room.usersAccesses).includes(userId);

    if (!hasAccess) {
      throw new Error("You do not have access to this document");
    }

    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while getting a room: ${error}`);
  }
};
export const getDocuments = async (userId: string) => {
  const liveblocks = new Liveblocks({
    secret: process.env.NEXT_PUBLIC_LIVEBLOCKS_API_KEY as string,
  });

  try {
    const rooms = await liveblocks.getRooms({ userId });
    return parseStringify(rooms);
  } catch (error) {
    console.log(`Error happened while getting a rooms: ${error}`);
  }
};
export const UpdateDocument = async (roomId: string, title: string) => {
  const liveblocks = new Liveblocks({
    secret: process.env.NEXT_PUBLIC_LIVEBLOCKS_API_KEY as string,
  });
  try {
    const updatedRoom = liveblocks.updateRoom(roomId, {
      metadata: {
        title,
      },
    });
    revalidatePath(`documents/${roomId}`);
    return parseStringify(updatedRoom);
  } catch (err) {
    console.log("Erro happened while updating a room:", err);
  }
};
export const updateDocumentAccess = async ({
  roomId,
  email,
  userType,
  updatedBy,
}: {
  roomId: string;
  email: string;
  userType: string;
  updatedBy: any;
}) => {
  const liveblocks = new Liveblocks({
    secret: process.env.NEXT_PUBLIC_LIVEBLOCKS_API_KEY as string,
  });
  try {
    const usersAccesses: any = {
      [email]: getAccessType(userType),
    };

    const room = await liveblocks.updateRoom(roomId, {
      usersAccesses,
    });

    revalidatePath(`/documents/${roomId}`);
    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while updating a room access: ${error}`);
  }
};
export const removeCollaborator = async ({
  roomId,
  email,
}: {
  roomId: string;
  email: string;
}) => {
  const liveblocks = new Liveblocks({
    secret: process.env.NEXT_PUBLIC_LIVEBLOCKS_API_KEY as string,
  });
  try {
    const room = await liveblocks.getRoom(roomId);

    if (room.metadata.email === email) {
      throw new Error("You cannot remove yourself from the document");
    }

    const updatedRoom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null,
      },
    });
    revalidatePath(`/documents/${roomId}`);
    return parseStringify(updatedRoom);
  } catch (error) {
    console.log(`Error happened while removing a collaborator: ${error}`);
  }
};

export const deleteDocument = async (roomId: string) => {
  const liveblocks = new Liveblocks({
    secret: process.env.NEXT_PUBLIC_LIVEBLOCKS_API_KEY as string,
  });
  try {
    await liveblocks.deleteRoom(roomId);
    revalidatePath("/documents");
    redirect("/documents");
  } catch (error) {
    console.log(`Error happened while deleting a room: ${error}`);
  }
};
