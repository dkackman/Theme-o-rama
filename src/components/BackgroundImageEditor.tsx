import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { generateImage } from '@/lib/opeanai';
import { Image, MessageSquare, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useLocalStorage } from 'usehooks-ts';

interface BackgroundImageEditorProps {
  backgroundImageUrl: string | null;
  onBackgroundImageChange: (url: string | null) => void;
  selectedColor?: { r: number; g: number; b: number };
  backdropFilters?: boolean;
  onBackdropFiltersChange?: (enabled: boolean) => void;
  className?: string;
}

export function BackgroundImageEditor({
  backgroundImageUrl,
  onBackgroundImageChange,
  selectedColor,
  backdropFilters = true,
  onBackdropFiltersChange,
  className,
}: BackgroundImageEditorProps) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedImageModel, setSelectedImageModel] = useLocalStorage<string>(
    'theme-o-rama-image-model',
    'dall-e-3',
  );
  const [prompt, setPrompt] = useLocalStorage<string>(
    'theme-o-rama-design-prompt',
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
        onBackgroundImageChange(imageUrl);
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
    onBackgroundImageChange(null);
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
        onBackgroundImageChange(result);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='text-lg'>Background Image</CardTitle>
        <CardDescription>Generate or upload a background image</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='prompt'>Theme Description</Label>
          <Textarea
            id='prompt'
            placeholder='e.g., "A modern minimalist design with clean lines and subtle shadows"'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className='min-h-[80px]'
          />
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex-1'>
            <Select
              value={selectedImageModel}
              onValueChange={setSelectedImageModel}
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
          <div className='flex items-center space-x-2'>
            {onBackdropFiltersChange && (
              <>
                <Checkbox
                  id='backdropFilters'
                  checked={backdropFilters}
                  onCheckedChange={(checked) =>
                    onBackdropFiltersChange(checked === true)
                  }
                />
                <Label
                  htmlFor='backdropFilters'
                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  Backdrop filters
                </Label>
              </>
            )}
          </div>
          <div className='flex-1'>
            <Button
              onClick={handleGenerateImage}
              disabled={isGeneratingImage || !prompt.trim()}
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
              >
                <X className='h-3 w-3' />
              </Button>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
