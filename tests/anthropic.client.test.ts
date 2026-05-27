import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { AnthropicClient } from "@/domains/platform/infra/ai/anthropic.client";

describe("AnthropicClient", () => {
  it("parses validated JSON responses", async () => {
    vi.spyOn(AnthropicClient, "completeText").mockResolvedValue(
      '```json\n{"status":"ok","count":2}\n```',
    );

    const result = await AnthropicClient.completeJson(
      { prompt: "Return a result" },
      z.object({
        status: z.literal("ok"),
        count: z.number(),
      }),
    );

    expect(result).toEqual({ status: "ok", count: 2 });
  });
});
