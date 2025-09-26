import { PasteInput } from '@/components/PasteInput';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useWorkingThemeAutoApply } from '@/hooks/useWorkingThemeAutoApply';
import { useWorkingThemeState } from '@/hooks/useWorkingThemeState';
import { STORAGE_KEYS } from '@/lib/constants';
import { generateImage } from '@/lib/opeanai';
import { saveDataUriAsFile } from '@/lib/utils';
import { readClipboardText } from '@/lib/web-fallbacks';
import { Download, Link, Sparkles, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useLocalStorage } from 'usehooks-ts';

export function BackgroundImageEditor() {
  const { getThemeColor, getBackgroundImage, setBackgroundImage } =
    useWorkingThemeState();
  const { isWorkingThemeSelected } = useWorkingThemeAutoApply();

  const backgroundImageUrl = getBackgroundImage();
  const selectedColor = getThemeColor();
  const disabled = !isWorkingThemeSelected;
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedImageModel, setSelectedImageModel] = useLocalStorage<string>(
    STORAGE_KEYS.IMAGE_MODEL,
    'dall-e-3',
  );
  const [prompt, setPrompt] = useLocalStorage<string>(
    STORAGE_KEYS.DESIGN_PROMPT,
    '',
  );

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGeneratingImage(true);
    try {
      // Use the selected color if available, otherwise use a default
      const colorString = selectedColor
        ? `RGB(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b})`
        : 'RGB(27, 30, 51)'; // Default dark blue color
      const imageUrl = await generateImage(
        prompt,
        colorString,
        selectedImageModel,
      );

      if (imageUrl) {
        setBackgroundImage(imageUrl);
      } else {
        toast.error('Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Error generating image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleClearBackgroundImage = () => {
    setBackgroundImage(null);
    const fileInput = document.getElementById(
      'background-image-upload',
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBackgroundImage(result);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const handlePasteUrl = async () => {
    if (!imageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    try {
      // Validate URL format
      new URL(imageUrl);
      setBackgroundImage(imageUrl);
      setImageUrl(''); // Clear the input
    } catch (error) {
      console.error('Invalid URL:', error);
      toast.error('Please enter a valid image URL');
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await readClipboardText();

      if (text && text.trim()) {
        setImageUrl(text.trim());
      } else {
        toast.info('No text found in clipboard');
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      toast.error('Failed to read from clipboard');
    }
  };

  const handleSaveImage = () => {
    if (!backgroundImageUrl) {
      toast.error('No image to save');
      return;
    }

    try {
      // Generate a filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `background-image-${timestamp}.png`;

      saveDataUriAsFile(backgroundImageUrl, filename);
      toast.success('Image saved successfully!');
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error('Failed to save image');
    }
  };

  return (
    <div className='space-y-6'>
      {/* Current Image Preview */}
      {backgroundImageUrl && (
        <div className='space-y-3'>
          <Label className='text-sm font-medium'>
            Current Background Image
          </Label>
          <div className='flex justify-center'>
            <div className='relative'>
              <img
                src={backgroundImageUrl}
                alt='Background image'
                className='max-w-full h-auto max-h-32 rounded-lg border border-border shadow-sm'
              />
              <Button
                variant='destructive'
                size='sm'
                onClick={handleClearBackgroundImage}
                className='absolute -top-2 -right-2 h-6 w-6 rounded-full p-0'
                disabled={disabled}
              >
                <X className='h-3 w-3' />
              </Button>
            </div>
          </div>
          <div className='flex justify-center'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleSaveImage}
              disabled={disabled}
              className='flex items-center gap-2'
            >
              <Download className='h-4 w-4' />
              Download Image
            </Button>
          </div>
          <Separator />
        </div>
      )}

      {/* Three Ways to Add Image */}
      <div className='space-y-6'>
        <div className='text-center'>
          <p className='text-sm text-muted-foreground'>
            Choose one of these three methods
          </p>
        </div>

        {/* Method 1: Paste URL */}
        <div className='space-y-3 p-4 border rounded-lg'>
          <div className='flex items-center gap-2 mb-3'>
            <Link className='h-5 w-5 text-blue-500' />
            <Label className='text-base font-medium'>1. Paste Image URL</Label>
          </div>
          <div className='space-y-2'>
            <PasteInput
              placeholder='Paste or enter image URL here...'
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onEndIconClick={handlePasteFromClipboard}
              disabled={disabled}
            />
            <Button
              onClick={handlePasteUrl}
              disabled={disabled || !imageUrl.trim()}
              className='w-full'
            >
              <Link className='h-4 w-4 mr-2' />
              Apply Image URL
            </Button>
          </div>
        </div>

        {/* Method 2: Upload File */}
        <div className='space-y-3 p-4 border rounded-lg'>
          <div className='flex items-center gap-2 mb-3'>
            <Upload className='h-5 w-5 text-green-500' />
            <Label className='text-base font-medium'>
              2. Upload from Device
            </Label>
          </div>
          <div className='space-y-2'>
            <input
              type='file'
              accept='image/*'
              onChange={handleImageUpload}
              className='hidden'
              id='background-image-upload'
            />
            <Button
              variant='outline'
              onClick={() =>
                document.getElementById('background-image-upload')?.click()
              }
              disabled={disabled}
              className='w-full'
            >
              <Upload className='h-4 w-4 mr-2' />
              Choose File to Upload
            </Button>
          </div>
        </div>

        {/* Method 3: AI Generate */}
        <div className='space-y-3 p-4 border rounded-lg'>
          <div className='flex items-center gap-2 mb-3'>
            <Sparkles className='h-5 w-5 text-purple-500' />
            <Label className='text-base font-medium'>3. Generate with AI</Label>
          </div>
          <div className='space-y-3'>
            <div className='space-y-2'>
              <Label htmlFor='prompt' className='text-sm'>
                Describe your background image
              </Label>
              <Textarea
                id='prompt'
                placeholder='e.g., "A modern minimalist design with clean lines and subtle shadows"'
                value={prompt}
                onChange={
                  disabled ? () => undefined : (e) => setPrompt(e.target.value)
                }
                className='min-h-[80px]'
                disabled={disabled}
              />
            </div>
            <div className='flex gap-3'>
              <div className='flex-1'>
                <Select
                  value={selectedImageModel}
                  onValueChange={
                    disabled ? () => undefined : setSelectedImageModel
                  }
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select AI model' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='dall-e-3'>DALL-E 3</SelectItem>
                    <SelectItem value='gpt-image-1'>GPT Image 1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleGenerateImage}
                disabled={disabled || isGeneratingImage || !prompt.trim()}
                className='flex-1'
              >
                {isGeneratingImage ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className='h-4 w-4 mr-2' />
                    Generate Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
