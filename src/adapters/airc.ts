/**
 * HARP Adapter: AIRC (AI Relay Communication)
 *
 * Translates AIRC messaging events into HARP sections.
 * Captures communication patterns, handoffs, and consent relationships.
 */

import { createSection } from "../harp.js";
import type { HarpSection, SectionType } from "../types.js";
import type { HarpAdapter, PlatformEvent } from "./index.js";

// =============================================================================
// AIRC-Specific Event Types
// =============================================================================

export interface AIRCEvent extends PlatformEvent {
  platform: "airc";
  payload: {
    threadId?: string;
    messageCount?: number;
    taskDescription?: string;
    handoffFrom?: string;
    handoffTo?: string;
    consentType?: "granted" | "revoked";
    topic?: string;
    duration?: string;
    communicationStyle?: string;
  };
}

// =============================================================================
// AIRC Adapter
// =============================================================================

const AIRC_EVENT_TYPES = [
  "first_contact",
  "handoff",
  "consent_change",
  "extended_thread",
  "communication_pattern",
] as const;

type AIRCEventType = (typeof AIRC_EVENT_TYPES)[number];

export class AIRCAdapter implements HarpAdapter {
  readonly platform = "airc";
  readonly description = "AIRC messaging — captures communication patterns, handoffs, and consent";
  readonly producesTypes: SectionType[] = ["Interaction", "Context", "Note"];

  canHandle(eventType: string): boolean {
    return AIRC_EVENT_TYPES.includes(eventType as AIRCEventType);
  }

  translate(event: PlatformEvent): HarpSection[] {
    const aircEvent = event as AIRCEvent;
    const { payload, timestamp, entities } = aircEvent;

    switch (event.eventType as AIRCEventType) {
      case "first_contact":
        return [
          createSection(
            "Interaction",
            "First contact via AIRC",
            `Initial communication established between entities via AIRC.${payload.topic ? ` Topic: ${payload.topic}.` : ""}`,
            {
              timestamp,
              author: entities[0],
              tags: ["airc", "first-contact"],
              references: payload.threadId
                ? [{ type: "airc_thread", id: payload.threadId }]
                : undefined,
            }
          ),
        ];

      case "handoff":
        return [
          createSection(
            "Interaction",
            `Task handoff: ${payload.taskDescription ?? "Task transfer"}`,
            `${payload.handoffFrom ?? entities[0]} handed off work to ${payload.handoffTo ?? entities[1]} via AIRC.\n\nTask: ${payload.taskDescription ?? "Not specified."}`,
            {
              timestamp,
              author: entities[0],
              tags: ["airc", "handoff"],
              references: payload.threadId
                ? [{ type: "airc_thread", id: payload.threadId }]
                : undefined,
            }
          ),
        ];

      case "consent_change":
        return [
          createSection(
            "Note",
            `Consent ${payload.consentType}: AIRC communication`,
            `AIRC consent ${payload.consentType} between entities.${payload.consentType === "revoked" ? " Communication channel closed." : " Communication channel open."}`,
            {
              timestamp,
              author: entities[0],
              tags: ["airc", "consent", payload.consentType ?? "change"],
            }
          ),
        ];

      case "extended_thread":
        return [
          createSection(
            "Interaction",
            `Extended collaboration thread: ${payload.topic ?? "ongoing work"}`,
            `An extended AIRC thread${payload.topic ? ` on "${payload.topic}"` : ""} with ${payload.messageCount ?? "many"} messages over ${payload.duration ?? "an extended period"}.`,
            {
              timestamp,
              author: entities[0],
              tags: ["airc", "collaboration", "thread"],
              references: payload.threadId
                ? [{ type: "airc_thread", id: payload.threadId }]
                : undefined,
            }
          ),
        ];

      case "communication_pattern":
        return [
          createSection(
            "Context",
            `Communication pattern observed`,
            payload.communicationStyle ??
              "Communication pattern detected from AIRC message history. See metadata for details.",
            {
              timestamp,
              author: "system",
              tags: ["airc", "communication", "pattern"],
            }
          ),
        ];

      default:
        return [];
    }
  }
}
