import OpenAI from 'openai';

let openai: OpenAI | null = null;

if (import.meta.env.MODE === 'development') {
  // This will fail in prod by design to prevent API key leakage
  // because we'll never set the VITE_OPENAI_API_KEY in production
  openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });
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

  const actualPrompt = `Create an image using a color palette centered around the color ${color}. The image
    should not have any border, frame or empty space around the edges. It is going to be used as a background image for an application,
    so it should not have any text or logo. The prompt describing the subject of the image is:
     ${prompt} `;

  if (model === 'gpt-image-1') {
    const result = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: actualPrompt,
    });
    if (!result.data) {
      throw new Error('No image data returned');
    }
    const imageData = result.data[0].b64_json;
    return `data:image/png;base64,${imageData}`;
  }

  const result = await openai.images.generate({
    model: 'dall-e-3',
    prompt: actualPrompt,
    size: '1024x1024',
  });
  if (!result.data) {
    throw new Error('No image data returned');
  }
  return result.data[0].url;
}
