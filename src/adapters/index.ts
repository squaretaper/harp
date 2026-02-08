/**
 * HARP Platform Adapter Interface
 *
 * Adapters translate platform-specific events into HARP sections.
 * Each platform (MoltX, AIRC, etc.) implements this interface to
 * automatically enrich HARP relational context from platform activity.
 */

import type { EntityId, HarpSection, SectionType } from "../types.js";

// =============================================================================
// Platform Event (Generic)
// =============================================================================

/**
 * A generic platform event that adapters translate into HARP sections.
 * Each platform defines its own event subtypes.
 */
export interface PlatformEvent {
  /** Platform identifier (e.g., "moltx", "airc", "clawnews") */
  platform: string;

  /** Event type (platform-specific) */
  eventType: string;

  /** ISO 8601 timestamp */
  timestamp: string;

  /** Entities involved in this event */
  entities: EntityId[];

  /** Platform-specific payload */
  payload: Record<string, unknown>;
}

// =============================================================================
// Adapter Interface
// =============================================================================

/**
 * The core adapter interface. Implementations translate platform events
 * into zero or more HARP sections.
 *
 * Why zero or more? Because:
 * - Some events aren't HARP-relevant (return [])
 * - Some events produce multiple sections (e.g., bounty completion
 *   produces both an Interaction and a Trust signal)
 */
export interface HarpAdapter {
  /** The platform this adapter handles */
  readonly platform: string;

  /** Human-readable description */
  readonly description: string;

  /** Section types this adapter can produce */
  readonly producesTypes: SectionType[];

  /**
   * Translate a platform event into HARP sections.
   * Returns an empty array if the event isn't HARP-relevant.
   */
  translate(event: PlatformEvent): HarpSection[];

  /**
   * Check if this adapter can handle a given event type.
   */
  canHandle(eventType: string): boolean;
}

// =============================================================================
// Adapter Registry
// =============================================================================

/**
 * Registry of platform adapters. Allows routing events to the correct adapter.
 */
export class AdapterRegistry {
  private adapters = new Map<string, HarpAdapter>();

  /**
   * Register an adapter for a platform.
   */
  register(adapter: HarpAdapter): void {
    this.adapters.set(adapter.platform, adapter);
  }

  /**
   * Get the adapter for a platform.
   */
  get(platform: string): HarpAdapter | undefined {
    return this.adapters.get(platform);
  }

  /**
   * Translate a platform event using the appropriate adapter.
   * Returns empty array if no adapter is registered for the platform.
   */
  translate(event: PlatformEvent): HarpSection[] {
    const adapter = this.adapters.get(event.platform);
    if (!adapter) return [];
    if (!adapter.canHandle(event.eventType)) return [];
    return adapter.translate(event);
  }

  /**
   * List all registered adapters.
   */
  list(): HarpAdapter[] {
    return Array.from(this.adapters.values());
  }
}
