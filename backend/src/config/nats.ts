import { connect, type NatsConnection, type JetStreamClient } from 'nats';
import { env } from './env.js';

let nc: NatsConnection | null = null;
let js: JetStreamClient | null = null;

export async function connectNats(): Promise<void> {
  nc = await connect({ servers: env.NATS_URL });
  console.log('NATS connected.');

  const jsm = await nc.jetstreamManager();

  // Ensure the EVENTS stream exists
  try {
    await jsm.streams.info('EVENTS');
  } catch {
    await jsm.streams.add({
      name: 'EVENTS',
      subjects: ['events.>'],
    });
    console.log('NATS JetStream: created EVENTS stream.');
  }

  js = nc.jetstream();
}

export function getJetStream(): JetStreamClient | null {
  return js;
}

export function getNatsConnection(): NatsConnection | null {
  return nc;
}
