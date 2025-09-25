import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useWorkingThemeState } from '@/hooks/useWorkingThemeState';
import { STORAGE_KEYS } from '@/lib/constants';
import { generateImage } from '@/lib/opeanai';
import { saveDataUriAsFile } from '@/lib/utils';
import { Image, MessageSquare, Save, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useLocalStorage } from 'usehooks-ts';

interface BackgroundImageEditorProps {
  disabled?: boolean;
}

export function BackgroundImageEditor({
  disabled = false,
}: BackgroundImageEditorProps) {
  const { getBackgroundImage, setBackgroundImage, getThemeColor } =
    useWorkingThemeState();

  // Get current values from the store
  const backgroundImageUrl = getBackgroundImage();
  const selectedColor = getThemeColor();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
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
    setBackgroundImage('');
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
    <>
      <div className='space-y-1'>
        <Label htmlFor='prompt'>Background image prompt</Label>
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

      <div className='flex items-center gap-3'>
        <div className='flex-1'>
          <Select
            value={selectedImageModel}
            onValueChange={disabled ? () => undefined : setSelectedImageModel}
            disabled={disabled}
          >
            <SelectTrigger id='imageModel'>
              <SelectValue placeholder='Select model' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='dall-e-3'>DALL-E 3</SelectItem>
              <SelectItem value='gpt-image-1'>GPT Image 1</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='flex-1'>
          <Button
            onClick={handleGenerateImage}
            disabled={disabled || isGeneratingImage || !prompt.trim()}
            className='w-full'
          >
            {isGeneratingImage ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2' />
                Generating Image...
              </>
            ) : (
              <>
                <MessageSquare className='h-4 w-4 mr-2' />
                Generate Image
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Image Preview */}
      {backgroundImageUrl && (
        <div className='space-y-3'>
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
        </div>
      )}

      {/* Image Upload Section */}
      <div className='border-t pt-4'>
        <div className='flex items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <input
                type='file'
                accept='image/*'
                onChange={handleImageUpload}
                className='hidden'
                id='background-image-upload'
              />
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  document.getElementById('background-image-upload')?.click()
                }
                disabled={disabled}
              >
                <Image className='mr-2 h-4 w-4' />
                Upload Image
              </Button>
            </div>

            {!backgroundImageUrl && (
              <span className='text-sm text-gray-500'>
                No background image set
              </span>
            )}
          </div>

          <Button
            variant='outline'
            size='sm'
            onClick={handleSaveImage}
            disabled={disabled || !backgroundImageUrl}
            className='flex items-center gap-2'
          >
            <Save className='h-4 w-4' />
            Save Image
          </Button>
        </div>
      </div>
    </>
  );
}
