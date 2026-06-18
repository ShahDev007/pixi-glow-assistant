// Chat orchestrator (server-side only). Embeds + retrieves grounding context,
// calls Claude with the Section 7 system prompt and the five tools, runs the
// tool-use loop, logs every turn and event, and returns the final reply plus the
// structured UI artifacts (product cards, connector cards, escalation state).

import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, hasAnthropicKey, MODEL, MAX_TOKENS } from "@/lib/anthropic";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { retrieveContext } from "@/lib/retrieval";
import { TOOL_DEFS, executeTool, type UiArtifact } from "@/lib/tools";
import {
  ensureConversation,
  logMessage,
  logEvent,
  inferIntent,
} from "@/lib/logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ClientMessage {
  role: "user" | "assistant";
  content: string;
}

const MAX_TOOL_ROUNDS = 5;

export async function POST(req: Request) {
  if (!hasAnthropicKey()) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 503 }
    );
  }

  let body: { conversationId?: string | null; messages?: ClientMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const history = (body.messages ?? []).filter((m) => m.content?.trim());
  if (history.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }

  const latestUser = [...history].reverse().find((m) => m.role === "user");
  const userText = latestUser?.content ?? "";

  const conversationId = await ensureConversation(
    body.conversationId ?? null,
    null
  );

  // Retrieve grounding context for the latest user message.
  const { productsBlock, policiesBlock } = await retrieveContext(userText);
  const systemWithContext = `${SYSTEM_PROMPT}

=== REAL PIXI CATALOG (the only products you may name) ===
${productsBlock}

=== OFFICIAL PIXI POLICIES (answer care questions from these) ===
${policiesBlock}`;

  // Log the user's turn and a baseline intent (tools refine this).
  await logMessage(conversationId, "user", userText);
  await logEvent(conversationId, inferIntent(userText), []);

  const anthropic = getAnthropic();
  const messages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const artifacts: UiArtifact[] = [];
  let escalated = false;
  const started = Date.now();

  try {
    let finalText = "";
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemWithContext,
        tools: TOOL_DEFS,
        messages,
      });

      const textParts = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text);
      if (textParts.length) finalText = textParts.join("\n").trim();

      if (response.stop_reason !== "tool_use") break;

      // Execute every requested tool, collect results, feed them back.
      const toolUses = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );
      messages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const tu of toolUses) {
        const outcome = await executeTool(tu.name, tu.input, { conversationId });
        if (outcome.ui) {
          artifacts.push(outcome.ui);
          if (outcome.ui.kind === "escalation") escalated = true;
        }
        toolResults.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: outcome.forModel,
        });
      }
      messages.push({ role: "user", content: toolResults });
    }

    const latency = Date.now() - started;
    if (!finalText) {
      finalText =
        "I want to get this right for you. Could you tell me a little more about what you are looking for?";
    }
    await logMessage(conversationId, "assistant", finalText, latency);

    return NextResponse.json({
      conversationId,
      reply: finalText,
      artifacts,
      escalated,
    });
  } catch (err) {
    console.error("[chat] error:", err);
    return NextResponse.json(
      { error: "The assistant hit a snag. Please try again." },
      { status: 500 }
    );
  }
}
