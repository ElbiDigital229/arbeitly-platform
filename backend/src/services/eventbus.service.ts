import { StringCodec } from 'nats';
import { getJetStream } from '../config/nats.js';

const sc = StringCodec();

export type EventSubject =
  | 'events.user.registered'
  | 'events.cv.parsed'
  | 'events.cv.created'
  | 'events.application.statusChanged';

/**
 * Publish a typed event to NATS JetStream.
 * No-op if NATS is not connected (graceful degradation).
 */
export async function publishEvent(subject: EventSubject, payload: Record<string, unknown>): Promise<void> {
  const js = getJetStream();
  if (!js) return;

  try {
    await js.publish(subject, sc.encode(JSON.stringify(payload)));
  } catch (err: any) {
    console.error(`Failed to publish ${subject}:`, err.message);
  }
}
