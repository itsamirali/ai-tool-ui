import { embed } from "ai";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { openAIEmbeddingsModel } from "@/server/ai";
import { upstashIndex } from "@/server/ai/upstash";
import { nanoid } from "nanoid";

export const foodsRouter = createTRPCRouter({
  searchFood: publicProcedure
    .input(
      z.object({
        query: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { embedding } = await embed({
        model: openAIEmbeddingsModel,
        value: input.query,
      });
      const results = await upstashIndex.query({
        vector: embedding,
        topK: 10,
        includeMetadata: true,
      });
      const foundFood: {
        id: string;
        foodName: string;
        calories: number;
        type: "fruit" | "meat" | "pastry" | "dairy" | "other";
      }[] = [];
      for (const result of results) {
        if (result.metadata) {
          foundFood.push({
            id: result.id as string,
            foodName: result.metadata.foodName,
            calories: result.metadata.calories,
            type: result.metadata.type,
          });
        }
      }
      return foundFood;
    }),
  createFood: publicProcedure
    .input(
      z.object({
        foodName: z.string(),
        calories: z.number(),
        type: z.enum(["fruit", "meat", "pastry", "dairy", "other"]),
      }),
    )
    .mutation(async ({ input }) => {
      const { embedding } = await embed({
        model: openAIEmbeddingsModel,
        value: input.foodName,
      });
      const id = nanoid();
      await upstashIndex.upsert({
        id,
        vector: embedding,
        metadata: {
          foodName: input.foodName,
          calories: input.calories,
          type: input.type,
        },
      });
      return { id };
    }),
});
