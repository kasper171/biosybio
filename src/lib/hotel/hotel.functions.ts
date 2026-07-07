import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { fetchHabboProfile } from "@/lib/hotel/habbo-service";
import { fetchHabbletProfile } from "@/lib/hotel/habblet-service";
import type { HotelFetchResult } from "@/lib/hotel/types";

const fetchHotelInput = z.object({
  platform: z.enum(["habbo", "habblet"]),
  username: z.string().min(1).max(64),
  hotelDomain: z.string().optional(),
});

export const fetchHotelProfileFn = createServerFn({ method: "POST" })
  .inputValidator(fetchHotelInput)
  .handler(async ({ data }): Promise<HotelFetchResult> => {
    if (data.platform === "habblet") {
      return fetchHabbletProfile(data.username);
    }
    return fetchHabboProfile(data.username, data.hotelDomain ?? "com");
  });
