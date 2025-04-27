export interface BroadcastEvent {
  /** The data for this event */
  data: unknown;
  /** The connection id of the player who sent the event */
  connectionId: string; //
}
