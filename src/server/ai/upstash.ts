import { Index } from "@upstash/vector";
import { env } from "@/env";

export type FoodMetadata = {
  foodName: string;
  calories: number;
  type: "fruit" | "meat" | "pastry" | "dairy" | "other";
};

export const upstashIndex = new Index<FoodMetadata>({
  url: env.UPSTASH_URL,
  token: env.UPTASH_TOKEN,
});
