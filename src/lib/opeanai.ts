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

export async function generateImage(prompt: string, color: string) {
  if (openai === null) {
    throw new Error('OpenAI is not initialized');
  }

  const actualPrompt = `Create an image using a color palette centered around the RGB color ${color}. The image
    should not have any border, frame or empty space around the edges. Ir is going to be used as a background image for an application,
    so it should not have any text or logo nor should it have sharp edges or lines.
     ${prompt} `;

  const result = await openai.images.generate({
    model: 'dall-e-3',
    prompt: actualPrompt,
    size: '1024x1024',
  });
  console.log(result);
  return result.data?.[0]?.url;
}
// const result = await openai.images.generate({
//     model: "gpt-image-1",
//     prompt: actualPrompt,
// });
