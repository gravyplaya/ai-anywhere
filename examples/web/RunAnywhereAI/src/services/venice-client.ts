interface VeniceChatOptions {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

interface VeniceTranscribeOptions {
  language?: string;
  timestamps?: boolean;
}

interface VeniceSynthesizeOptions {
  voice?: string;
  speed?: number;
  responseFormat?: 'mp3' | 'wav';
}

export async function chatStream(
  messages: Array<{ role: string; content: string }>,
  model: string,
  options?: VeniceChatOptions,
): Promise<ReadableStream<string>> {
  const body: Record<string, unknown> = {
    model,
    messages,
    stream: true,
    stream_options: { include_usage: true },
    temperature: options?.temperature ?? 0.7,
    top_p: options?.topP ?? 0.9,
    max_tokens: options?.maxTokens ?? 2048,
  };

  if (options?.systemPrompt) {
    const currentMessages = body.messages as Array<{ role: string; content: string }>;
    body.messages = [
      { role: 'system', content: options.systemPrompt },
      ...currentMessages,
    ];
  }

  const res = await fetch('/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Venice API error ${res.status}: ${err}`);
  }

  return parseSSEStream(res.body!);
}

export async function chatWithVision(
  messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }>,
  model: string,
  options?: VeniceChatOptions,
): Promise<ReadableStream<string>> {
  const body: Record<string, unknown> = {
    model,
    messages,
    stream: true,
    stream_options: { include_usage: true },
    temperature: options?.temperature ?? 0.7,
    top_p: options?.topP ?? 0.9,
    max_tokens: options?.maxTokens ?? 2048,
  };

  const res = await fetch('/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Venice API error ${res.status}: ${err}`);
  }

  return parseSSEStream(res.body!);
}

export async function transcribe(
  audioBlob: Blob,
  model: string = 'openai/whisper-large-v3',
  options?: VeniceTranscribeOptions,
): Promise<{ text: string }> {
  const form = new FormData();
  form.append('file', audioBlob, 'audio.wav');
  form.append('model', model);
  form.append('response_format', 'json');
  if (options?.language) form.append('language', options.language);
  if (options?.timestamps) form.append('timestamps', 'true');

  const res = await fetch('/api/v1/audio/transcriptions', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Venice API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return { text: data.text ?? '' };
}

export async function synthesize(
  text: string,
  model: string = 'tts-kokoro',
  options?: VeniceSynthesizeOptions,
): Promise<{ audioData: Float32Array; sampleRate: number }> {
  const body: Record<string, unknown> = {
    input: text,
    model,
    voice: options?.voice ?? 'af_sky',
    response_format: options?.responseFormat ?? 'mp3',
    speed: options?.speed ?? 1,
    streaming: false,
  };

  const res = await fetch('/api/v1/audio/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Venice API error ${res.status}: ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const audioContext = new AudioContext({ sampleRate: 24000 });
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  await audioContext.close();

  const channelData = audioBuffer.getChannelData(0);
  return {
    audioData: new Float32Array(channelData),
    sampleRate: audioBuffer.sampleRate,
  };
}

function parseSSEStream(body: ReadableStream<Uint8Array>): ReadableStream<string> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream<string>({
    async start(controller) {
      const reader = body.getReader();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;

            const data = trimmed.slice(6);
            if (data === '[DONE]') {
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(content);
              }
            } catch {
              // skip malformed SSE data
            }
          }
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

export function pcmToWavBlob(pcmFloat32: Float32Array, sampleRate: number): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const numSamples = pcmFloat32.length;
  const dataSize = numSamples * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, pcmFloat32[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
