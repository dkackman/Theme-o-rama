import Header from '@/components/Header';
import Layout from '@/components/Layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useErrors } from '@/hooks/useErrors';
import { useWorkingTheme } from '@/hooks/useWorkingTheme';
import { validateThemeJson } from '@/lib/themes';
import { Check, Info, Loader2, Upload } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'theme-o-rama';

export default function JsonEditor() {
  const { workingThemeJson, updateWorkingThemeFromJson } = useWorkingTheme();

  const { addError } = useErrors();
  const { setCustomTheme } = useTheme();

  // JSON editor state - only loads working theme on page navigation
  const [jsonEditorValue, setJsonEditorValue] = useState('');
  const [isApplyingJson, setIsApplyingJson] = useState(false);
  const [hasLoadedInitialTheme, setHasLoadedInitialTheme] = useState(false);
  const [validationState, setValidationState] = useState<
    'none' | 'valid' | 'invalid'
  >('none');

  // Handler for applying JSON editor changes - completely replaces working theme
  const handleApplyJsonTheme = useCallback(() => {
    if (!jsonEditorValue || !jsonEditorValue.trim()) {
      addError({
        kind: 'invalid',
        reason: 'Please enter theme JSON',
      });
      return;
    }

    setIsApplyingJson(true);

    try {
      // First validate the JSON
      validateThemeJson(jsonEditorValue);

      // Apply the theme to the UI
      const success = setCustomTheme(jsonEditorValue);
      if (!success) {
        addError({
          kind: 'invalid',
          reason: 'Failed to apply theme. Please check your JSON format.',
        });
        return;
      }

      // Replace the working theme completely with the JSON content
      updateWorkingThemeFromJson(jsonEditorValue);

      // Reset validation state after successful apply
      setValidationState('none');
    } catch (err) {
      addError({
        kind: 'invalid',
        reason: `Invalid JSON format: ${err instanceof Error ? err.message : err}`,
      });
      console.error('Error applying theme:', err);
    } finally {
      setIsApplyingJson(false);
    }
  }, [jsonEditorValue, setCustomTheme, addError, updateWorkingThemeFromJson]);

  // Handler for validating JSON editor content
  const handleValidateJson = useCallback(() => {
    if (!jsonEditorValue || !jsonEditorValue.trim()) {
      setValidationState('invalid');
      addError({
        kind: 'invalid',
        reason: 'Please enter theme JSON to validate',
      });
      return;
    }

    try {
      validateThemeJson(jsonEditorValue);
      setValidationState('valid');
    } catch (err) {
      setValidationState('invalid');
      addError({
        kind: 'invalid',
        reason: `Invalid JSON format. Please check your syntax. ${err}`,
      });
    }
  }, [jsonEditorValue, addError]);

  // Handler for when user edits JSON
  const handleJsonEditorChange = useCallback((value: string) => {
    setJsonEditorValue(value);
    // Reset validation state when user makes changes
    setValidationState('none');
  }, []);

  // Load working theme JSON only once when component mounts or when workingThemeJson changes from null to a value
  useEffect(() => {
    if (!hasLoadedInitialTheme && workingThemeJson) {
      setJsonEditorValue(workingThemeJson);
      setHasLoadedInitialTheme(true);
    }
  }, [workingThemeJson, hasLoadedInitialTheme]);

  try {
    return (
      <Layout>
        <Header title='JSON Editor' />

        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6 space-y-6'>
            {/* JSON Editor */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>JSON Editor</CardTitle>
                <CardDescription>
                  Edit your theme directly in JSON format. Changes are applied
                  when you click Apply.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='theme-json'>Theme JSON</Label>
                  <div className='flex items-center gap-2'>
                    <Button
                      onClick={handleValidateJson}
                      variant='outline'
                      disabled={!jsonEditorValue?.trim()}
                      className={`flex items-center gap-2 ${
                        validationState === 'valid'
                          ? 'border-green-500 text-green-600 hover:bg-green-50'
                          : validationState === 'invalid'
                            ? 'border-red-500 text-red-600 hover:bg-red-50'
                            : ''
                      }`}
                    >
                      <Check className='h-4 w-4' />
                      Validate
                    </Button>
                    <Button
                      onClick={handleApplyJsonTheme}
                      disabled={isApplyingJson || !jsonEditorValue?.trim()}
                      className='flex items-center gap-2'
                    >
                      {isApplyingJson ? (
                        <>
                          <Loader2 className='h-4 w-4 animate-spin' />
                          Applying...
                        </>
                      ) : (
                        <>
                          <Upload className='h-4 w-4' />
                          Apply Theme
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <Textarea
                  id='theme-json'
                  value={jsonEditorValue}
                  onChange={(e) => handleJsonEditorChange(e.target.value)}
                  className='w-full min-h-[calc(100vh-300px)] p-3 border border-gray-300 rounded font-mono text-sm bg-gray-50 resize-none'
                  style={{
                    fontFamily:
                      'Monaco, Menlo, Ubuntu Mono, Consolas, source-code-pro, monospace',
                    tabSize: 4,
                    MozTabSize: 4,
                    fontSize: 14,
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    whiteSpace: 'pre',
                    height: 'calc(100vh - 300px)',
                  }}
                  spellCheck={false}
                  autoComplete='off'
                  autoCorrect='off'
                  autoCapitalize='off'
                  placeholder={
                    workingThemeJson
                      ? ''
                      : 'No working theme available. Create or select a theme first.'
                  }
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  } catch (error) {
    console.error('Error rendering JSON editor:', error);
    return (
      <Layout>
        <Header title='JSON Editor' />
        <div className='flex-1 overflow-auto'>
          <div className='container mx-auto p-6'>
            <Alert variant='destructive'>
              <Info className='h-4 w-4' />
              <AlertDescription>
                Error rendering JSON editor:{' '}
                {error instanceof Error ? error.message : 'Unknown error'}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </Layout>
    );
  }
}
