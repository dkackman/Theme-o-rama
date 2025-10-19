import OpenAI from 'openai';

let openai: OpenAI | null = null;

if (import.meta.env.MODE === 'development') {
  // This will fail in prod by design to prevent API key leakage
  // because we'll never set the VITE_OPENAI_API_KEY in production
  try {
    openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  } catch (error) {
    console.error('Error initializing OpenAI', error);
    openai = null;
  }
} else {
  openai = null;
}

export async function generateImage(
  prompt: string,
  color: string,
  model: string,
) {
  if (openai === null) {
    throw new Error('OpenAI is not initialized');
  }

  const actualPrompt = `Create an image using a broad color palette centered around the color ${color}. 
    The image should be a single subject. It should be centered.
    should not have any border, frame or empty space around the edges. It
    should have no text. There should be no logo. 
    The prompt describing the subject of the image is:
     ${prompt} `;

  const result = await openai.images.generate({
    model: model,
    prompt: actualPrompt,
    size: '1024x1024',
    ...(model !== 'gpt-image-1' ? { response_format: 'b64_json' } : {}),
  });
  if (!result.data) {
    throw new Error('No image data returned');
  }
  const imageData = result.data[0].b64_json;
  return `data:image/png;base64,${imageData}`;
}
