import { getModel } from '@mariozechner/pi-ai';
import {
  createAgentSession,
  SessionManager,
  AuthStorage,
  ModelRegistry,
} from '@mariozechner/pi-coding-agent';

export type GCRSession = Awaited<ReturnType<typeof createAgentSession>>['session'];

// ── Session lifecycle ─────────────────────────────────────────────────────────

export async function createSession(modelId: string, region: string): Promise<GCRSession> {
  if (!process.env.AWS_REGION && !process.env.AWS_DEFAULT_REGION) {
    process.env.AWS_REGION = region;
  }

  const model = getModel('amazon-bedrock', modelId as any);
  if (!model) {
    throw new Error(
      `Model not found: ${modelId}\n` +
      `Check agent.model in .gcr/config.json\n` +
      `Example: "anthropic.claude-3-5-sonnet-20241022-v2:0"`
    );
  }

  const authStorage = AuthStorage.create();
  const modelRegistry = ModelRegistry.create(authStorage);

  const { session } = await createAgentSession({
    model,
    sessionManager: SessionManager.inMemory(),
    authStorage,
    modelRegistry,
  });

  return session;
}

export function closeSession(session: GCRSession): void {
  session.dispose();
}

// ── Prompting ─────────────────────────────────────────────────────────────────

export async function prompt(
  session: GCRSession,
  promptText: string,
  onDelta: (text: string) => void,
): Promise<string> {
  let fullResponse = '';

  const unsubscribe = session.subscribe((event: any) => {
    if (
      event.type === 'message_update' &&
      event.assistantMessageEvent?.type === 'text_delta'
    ) {
      const delta: string = event.assistantMessageEvent.delta;
      fullResponse += delta;
      onDelta(delta);
    }
  });

  await session.prompt(promptText);
  unsubscribe();

  return fullResponse;
}
