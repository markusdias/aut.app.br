"server only";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { userUpdateProps } from "@/utils/types";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface UpdateError extends Error {
  message: string;
}

export const userUpdate = async ({
  email,
  first_name,
  last_name,
  profile_image_url,
  user_id,
}: userUpdateProps) => {
  try {
    const result = db.update(users).set({
      email,
      firstName: first_name,
      lastName: last_name,
      profileImageUrl: profile_image_url,
      userId: user_id,
    });

    return result;
  } catch (error) {
    const err = error as UpdateError;
    throw new Error(err.message);
  }
};
