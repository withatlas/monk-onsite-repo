import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const defaultModel = "claude-sonnet-4-20250514";

const inferenceRequestSchema = z.object({
  system: z.string().optional(),
  prompt: z.string().min(1),
  model: z.string().min(1).optional(),
  maxTokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(1).optional(),
  apiKey: z.string().min(1).optional(),
});

export type InferenceRequest = z.infer<typeof inferenceRequestSchema>;

export class AnthropicClient {
  private static clients = new Map<string, Anthropic>();

  static getClient(apiKey = process.env.ANTHROPIC_API_KEY): Anthropic {
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured.");
    }

    const existingClient = AnthropicClient.clients.get(apiKey);

    if (existingClient) {
      return existingClient;
    }

    const client = new Anthropic({ apiKey });
    AnthropicClient.clients.set(apiKey, client);
    return client;
  }

  static async completeText(input: InferenceRequest): Promise<string> {
    const parsed = inferenceRequestSchema.parse(input);
    const client = AnthropicClient.getClient(parsed.apiKey);
    const message = await client.messages.create({
      model: parsed.model ?? process.env.ANTHROPIC_MODEL ?? defaultModel,
      max_tokens: parsed.maxTokens ?? 1200,
      temperature: parsed.temperature ?? 0,
      system: parsed.system,
      messages: [{ role: "user", content: parsed.prompt }],
    });

    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!text) {
      throw new Error("Anthropic response did not include text.");
    }

    return text;
  }

  static async completeJson<T>(
    input: InferenceRequest,
    schema: z.ZodType<T>,
  ): Promise<T> {
    const text = await AnthropicClient.completeText({
      ...input,
      prompt: `${input.prompt}\n\nReturn only valid JSON.`,
    });

    return schema.parse(JSON.parse(extractJson(text)));
  }
}

function extractJson(value: string): string {
  const trimmed = value.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
}
