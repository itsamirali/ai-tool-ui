"use server";

import { createAI, getMutableAIState, streamUI } from "ai/rsc";
import { openaiModel } from "@/server/ai";
import type { ReactNode } from "react";
import { generateId } from "ai";
import { SystemMessage } from "@/components/chat/SystemMessage";
import { z } from "zod";
import { CreateFood } from "@/components/foods/CreateFood";
import { SearchFood } from "@/components/foods/SearchFood";
export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

export async function continueConversation(
  input: string,
): Promise<ClientMessage> {
  "use server";

  const history = getMutableAIState<typeof AI>();

  const result = await streamUI({
    model: openaiModel,
    messages: [...history.get(), { role: "user", content: input }],
    text: ({ content, done }) => {
      if (done) {
        const nMessages: {
          role: "user" | "assistant";
          content: string;
        }[] = [...history.get(), { role: "assistant", content }];
        history.done(nMessages);
      }
      return <SystemMessage message={content} />;
    },
    tools: {
      addFood: {
        description: "add or create a food to the user database of foods",
        parameters: z.object({}),
        generate: async () => {
          return <CreateFood />;
        },
      },
      searchFood: {
        description: "searcg food from the user database of food",

        parameters: z.object({
          foodName: z.string(),
        }),
        generate: async ({ foodName }) => {
          return <SearchFood foodName={foodName} />;
        },
      },
    },
  });

  return {
    id: generateId(),
    role: "assistant",
    display: result.value,
  };
}

export const AI = createAI<
  ServerMessage[],
  ClientMessage[],
  { continueConversation: typeof continueConversation }
>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
});
