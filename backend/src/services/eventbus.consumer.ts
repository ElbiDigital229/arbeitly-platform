import { StringCodec, type JsMsg } from 'nats';
import { getJetStream } from '../config/nats.js';

const sc = StringCodec();

type EventHandler = (data: Record<string, unknown>) => Promise<void>;

const consumers: Array<{ subject: string; handler: EventHandler }> = [];

export function registerConsumer(subject: string, handler: EventHandler): void {
  consumers.push({ subject, handler });
}

// --- Built-in consumers ---

registerConsumer('events.user.registered', async (data) => {
  console.log('[event] User registered:', data.email);
  // Future: send welcome email, create analytics profile, etc.
});

registerConsumer('events.cv.parsed', async (data) => {
  console.log('[event] CV parsed:', data.cvId);
  // Future: index for search, trigger quality score, etc.
});

registerConsumer('events.cv.created', async (data) => {
  console.log('[event] CV created:', data.cvId);
});

registerConsumer('events.application.statusChanged', async (data) => {
  console.log('[event] Application status changed:', data.applicationId, '→', data.newStatus);
  // Future: send notification, update analytics, etc.
});

/**
 * Start all registered consumers. Call once at startup after NATS connects.
 */
export async function startConsumers(): Promise<void> {
  const js = getJetStream();
  if (!js) return;

  for (const { subject, handler } of consumers) {
    try {
      const consumer = await js.consumers.get('EVENTS', { filterSubjects: [subject] });

      // Process messages in background
      (async () => {
        const messages = await consumer.consume();
        for await (const msg of messages) {
          try {
            const data = JSON.parse(sc.decode(msg.data));
            await handler(data);
            msg.ack();
          } catch (err: any) {
            console.error(`[event] Error processing ${subject}:`, err.message);
            msg.nak();
          }
        }
      })();
    } catch (err: any) {
      // Consumer may not exist yet — create an ephemeral one
      try {
        const consumer = await js.consumers.get('EVENTS');
        const messages = await consumer.consume();
        (async () => {
          for await (const msg of messages) {
            if (msg.subject !== subject) {
              msg.ack();
              continue;
            }
            try {
              const data = JSON.parse(sc.decode(msg.data));
              await handler(data);
              msg.ack();
            } catch (err: any) {
              console.error(`[event] Error processing ${subject}:`, err.message);
              msg.nak();
            }
          }
        })();
      } catch {
        console.warn(`[event] Could not start consumer for ${subject}`);
      }
    }
  }

  console.log(`NATS consumers started (${consumers.length} handlers).`);
}
