import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { classifyPhoto, isConfigured, isUnlocked, lock, unlock } from "./hobby-check.server";

export const getPhotoCheckStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { configured: isConfigured(), unlocked: await isUnlocked() };
});

export const unlockPhotoCheck = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ passcode: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => ({ ok: await unlock(data.passcode) }));

export const lockPhotoCheck = createServerFn({ method: "POST" }).handler(async () => {
  await lock();
  return { ok: true };
});

const MAX_DATA_URL = 10_000_000;

export const classifyHobbyPhoto = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        imageDataUrl: z
          .string()
          .max(MAX_DATA_URL)
          .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if (!(await isUnlocked())) return { ok: false as const, error: "Your session has ended. Enter the passcode again." };
    return classifyPhoto(data.imageDataUrl, getRequest().signal);
  });
