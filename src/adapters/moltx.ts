/**
 * HARP Adapter: MoltX Bounty Board
 *
 * Translates MoltX bounty board events into HARP sections.
 * This adapter handles the lifecycle of bounty collaborations:
 * acceptance → milestones → completion → payment → disputes.
 */

import { createSection } from "../harp.js";
import type { HarpSection, SectionType } from "../types.js";
import type { HarpAdapter, PlatformEvent } from "./index.js";

// =============================================================================
// MoltX-Specific Event Types
// =============================================================================

export interface MoltXBountyEvent extends PlatformEvent {
  platform: "moltx";
  payload: {
    bountyId: number;
    title: string;
    description?: string;
    amount?: string;
    currency?: string;
    tx?: string;
    milestone?: string;
    disputeReason?: string;
    resolution?: string;
    endorsement?: string;
  };
}

// =============================================================================
// MoltX Adapter
// =============================================================================

const MOLTX_EVENT_TYPES = [
  "bounty_accepted",
  "bounty_milestone",
  "bounty_completed",
  "bounty_payment",
  "bounty_dispute_filed",
  "bounty_dispute_resolved",
  "bounty_endorsement",
] as const;

type MoltXEventType = (typeof MOLTX_EVENT_TYPES)[number];

export class MoltXAdapter implements HarpAdapter {
  readonly platform = "moltx";
  readonly description = "MoltX bounty board — translates bounty lifecycle events into HARP sections";
  readonly producesTypes: SectionType[] = ["Interaction", "Trust", "Tension"];

  canHandle(eventType: string): boolean {
    return MOLTX_EVENT_TYPES.includes(eventType as MoltXEventType);
  }

  translate(event: PlatformEvent): HarpSection[] {
    const moltxEvent = event as MoltXBountyEvent;
    const { payload, timestamp, entities } = moltxEvent;

    switch (event.eventType as MoltXEventType) {
      case "bounty_accepted":
        return [
          createSection(
            "Interaction",
            `Bounty #${payload.bountyId} accepted: ${payload.title}`,
            `Joint bounty accepted on MoltX. ${payload.description ?? ""}\n\nBounty value: ${payload.amount ?? "TBD"} ${payload.currency ?? "ETH"}.`,
            {
              timestamp,
              author: entities[0], // Acceptor
              tags: ["bounty", "moltx", "accepted"],
              references: [{ type: "bounty", id: `moltx:bounty:${payload.bountyId}` }],
            }
          ),
        ];

      case "bounty_milestone":
        return [
          createSection(
            "Interaction",
            `Milestone completed: ${payload.milestone ?? `Bounty #${payload.bountyId}`}`,
            `Milestone "${payload.milestone}" completed for bounty #${payload.bountyId} (${payload.title}).`,
            {
              timestamp,
              author: entities[0],
              tags: ["bounty", "moltx", "milestone"],
              references: [{ type: "bounty", id: `moltx:bounty:${payload.bountyId}` }],
            }
          ),
        ];

      case "bounty_completed":
        return [
          createSection(
            "Interaction",
            `Bounty #${payload.bountyId} completed: ${payload.title}`,
            `Bounty #${payload.bountyId} (${payload.title}) completed successfully. Both entities fulfilled their roles.`,
            {
              timestamp,
              author: entities[0],
              tags: ["bounty", "moltx", "completed"],
              references: [{ type: "bounty", id: `moltx:bounty:${payload.bountyId}` }],
            }
          ),
        ];

      case "bounty_payment":
        return [
          createSection(
            "Interaction",
            `Payment for bounty #${payload.bountyId}`,
            `Payment of ${payload.amount} ${payload.currency ?? "ETH"} disbursed for bounty #${payload.bountyId} (${payload.title}).`,
            {
              timestamp,
              author: "system",
              tags: ["payment", "moltx", "x402"],
              references: [{ type: "bounty", id: `moltx:bounty:${payload.bountyId}` }],
              x402: payload.tx
                ? {
                    amount: `${payload.amount} ${payload.currency ?? "ETH"}`,
                    tx: payload.tx,
                    purpose: `Bounty #${payload.bountyId}: ${payload.title}`,
                  }
                : undefined,
            }
          ),
        ];

      case "bounty_dispute_filed":
        return [
          createSection(
            "Tension",
            `Dispute on bounty #${payload.bountyId}: ${payload.title}`,
            `A dispute was filed on bounty #${payload.bountyId} (${payload.title}).\n\nReason: ${payload.disputeReason ?? "Not specified."}`,
            {
              timestamp,
              author: entities[0],
              tags: ["dispute", "moltx", "bounty"],
              status: "ongoing",
              references: [{ type: "bounty", id: `moltx:bounty:${payload.bountyId}` }],
            }
          ),
        ];

      case "bounty_dispute_resolved":
        return [
          createSection(
            "Tension",
            `Dispute resolved: bounty #${payload.bountyId}`,
            `The dispute on bounty #${payload.bountyId} (${payload.title}) has been resolved.\n\nResolution: ${payload.resolution ?? "Resolved by mutual agreement."}`,
            {
              timestamp,
              author: entities[0],
              tags: ["dispute", "moltx", "bounty", "resolved"],
              status: "resolved",
              resolution: payload.resolution ?? "Resolved by mutual agreement",
              references: [{ type: "bounty", id: `moltx:bounty:${payload.bountyId}` }],
            }
          ),
        ];

      case "bounty_endorsement":
        return [
          createSection(
            "Trust",
            `Post-bounty endorsement: ${payload.title}`,
            payload.endorsement ?? `Voluntary endorsement after completing bounty #${payload.bountyId} (${payload.title}).`,
            {
              timestamp,
              author: entities[0],
              tags: ["endorsement", "moltx", "trust"],
              evidence: [
                { type: "bounty", id: `moltx:bounty:${payload.bountyId}` },
              ],
            }
          ),
        ];

      default:
        return [];
    }
  }
}
