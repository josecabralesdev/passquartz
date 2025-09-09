"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import {
  ClipboardCopy,
  RefreshCw,
  Lock,
  History,
  Sparkles,
  Smartphone,
  Eye,
  ShieldCheck,
  Trash,
} from 'lucide-react';
import { generatePronounceablePassword } from '@/ai/flows/generate-pronounceable-password';

type PasswordOptions = {
  useUppercase: boolean;
  useLowercase: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
};

type Strength = {
  value: number;
  label: string;
  color: string;
};

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState<PasswordOptions>({
    useUppercase: true,
    useLowercase: true,
    useNumbers: true,
    useSymbols: false,
  });
  const [isPronounceable, setIsPronounceable] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [strength, setStrength] = useState<Strength>({ value: 0, label: '', color: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const isAnyOptionSelected = useMemo(() => Object.values(options).some(Boolean), [options]);

  const calculateStrength = useCallback((pass: string): Strength => {
    let score = 0;
    if (!pass) return { value: 0, label: 'Too weak', color: 'bg-destructive' };

    const variety =
      Number(/[A-Z]/.test(pass)) +
      Number(/[a-z]/.test(pass)) +
      Number(/[0-9]/.test(pass)) +
      Number(/[^A-Za-z0-9]/.test(pass));

    score = (pass.length / 20) * 50 + (variety / 4) * 50;
    const value = Math.min(100, score);

    if (value < 40) return { value, label: 'Weak', color: 'bg-destructive' };
    if (value < 70) return { value, label: 'Medium', color: 'bg-warning' };
    return { value, label: 'Strong', color: 'bg-success' };
  }, []);
  
  const generateLocalPassword = useCallback((len: number, opts: PasswordOptions): string => {
    const charSets = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    };
  
    let availableChars = '';
    if (opts.useUppercase) availableChars += charSets.uppercase;
    if (opts.useLowercase) availableChars += charSets.lowercase;
    if (opts.useNumbers) availableChars += charSets.numbers;
    if (opts.useSymbols) availableChars += charSets.symbols;
  
    if (!availableChars) return '';
  
    let pass = '';
    for (let i = 0; i < len; i++) {
      pass += availableChars.charAt(Math.floor(Math.random() * availableChars.length));
    }
    return pass;
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!isAnyOptionSelected && !isPronounceable) {
      toast({
        variant: 'destructive',
        title: 'No options selected',
        description: 'Please select at least one character type.',
      });
      return;
    }
    setIsGenerating(true);
    try {
      let newPassword = '';
      const effectiveOptions = isPronounceable ? { useUppercase: true, useLowercase: true, useNumbers: true, useSymbols: true } : options;

      if (isPronounceable) {
        const result = await generatePronounceablePassword({
          length,
          ...options,
        });
        newPassword = result.password;
      } else {
        newPassword = generateLocalPassword(length, effectiveOptions);
      }

      setPassword(newPassword);
      setHistory(prev => [newPassword, ...prev].slice(0, 10));
    } catch (error) {
      console.error("Failed to generate password", error);
      toast({
        variant: 'destructive',
        title: 'AI Generation Error',
        description: 'The AI password generation service is currently unavailable. Please try again later.',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [length, options, isPronounceable, toast, generateLocalPassword, isAnyOptionSelected]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('passquartz_history');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
    handleGenerate();
  }, []); // Eslint-disable-line react-hooks/exhaustive-deps - run only once

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('passquartz_history', JSON.stringify(history));
    } else {
      localStorage.removeItem('passquartz_history');
    }
  }, [history]);

  useEffect(() => {
    setStrength(calculateStrength(password));
  }, [password, calculateStrength]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard!',
      description: 'Your new password is ready to use.',
    });
  };

  const handleDeleteFromHistory = (index: number) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
    toast({
      title: 'Password removed from history.',
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    toast({
      title: 'History cleared.',
    });
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 font-body sm:p-6 md:p-8">
      <div className="w-full max-w-2xl">
        <Card className="border-2 border-primary/10 shadow-2xl shadow-primary/5">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Lock className="h-10 w-10 shrink-0 text-primary" />
              <div>
                <CardTitle className="font-headline text-3xl font-extrabold tracking-tight text-foreground">
                  PassQuartZ
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your secure and stylish password generator
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password-output" className="font-semibold">Your Generated Password</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="password-output"
                  readOnly
                  value={password}
                  className="font-mono text-lg"
                  placeholder="Generating..."
                />
                <Button variant="outline" size="icon" onClick={() => handleCopyToClipboard(password)} aria-label="Copy password">
                  <ClipboardCopy className="h-5 w-5" />
                </Button>
                <Button size="icon" onClick={handleGenerate} disabled={isGenerating || (!isAnyOptionSelected && !isPronounceable)} aria-label="Generate new password">
                  <RefreshCw className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Label>Password Strength</Label>
                <span className="font-medium" style={{color: `hsl(var(--${strength.color.replace('bg-','')}))`}}>{strength.label}</span>
              </div>
              <Progress value={strength.value} className={`h-3 ${strength.color} transition-all duration-300`} />
            </div>

            <div className="space-y-4 rounded-lg border bg-card p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 space-y-2">
                    <Label htmlFor="length-slider">Password Length: <span className="font-bold text-primary">{length}</span></Label>
                    <Slider
                      id="length-slider"
                      min={6}
                      max={64}
                      step={1}
                      value={[length]}
                      onValueChange={(value) => setLength(value[0])}
                      disabled={isGenerating}
                    />
                </div>
                <div className="flex items-center space-x-2 pt-5">
                    <Switch id="pronounceable-switch" checked={isPronounceable} onCheckedChange={setIsPronounceable} disabled={isGenerating}/>
                    <Label htmlFor="pronounceable-switch" className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-primary" /> Pronounceable (AI)
                    </Label>
                </div>
              </div>
              
              {!isPronounceable && (
                <div className="grid grid-cols-2 gap-4 pt-4 sm:grid-cols-4">
                  {[
                    { id: 'useUppercase', label: 'Uppercase' },
                    { id: 'useLowercase', label: 'Lowercase' },
                    { id: 'useNumbers', label: 'Numbers' },
                    { id: 'useSymbols', label: 'Symbols' },
                  ].map(item => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.id}
                        checked={options[item.id as keyof PasswordOptions]}
                        onCheckedChange={(checked) =>
                          setOptions(prev => ({ ...prev, [item.id]: checked }))
                        }
                        disabled={isGenerating}
                      />
                      <Label htmlFor={item.id}>{item.label}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="history">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    <span className="font-semibold">Generation History</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {history.length > 0 ? (
                    <div className="space-y-4">
                      <ul className="space-y-2">
                        {history.map((histPass, index) => (
                          <li key={index} className="flex items-center justify-between gap-2 rounded-md bg-muted/50 p-2">
                            <span className="truncate font-mono text-sm">{histPass}</span>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleCopyToClipboard(histPass)} aria-label="Copy password from history">
                                <ClipboardCopy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-destructive/70 hover:text-destructive" onClick={() => handleDeleteFromHistory(index)} aria-label="Delete password from history">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <Button variant="outline" size="sm" className="w-full" onClick={handleClearHistory}>
                        <Trash className="mr-2 h-4 w-4" /> Clear History
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">No history yet.</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardFooter>
        </Card>

        <div className="w-full max-w-2xl mt-8">
          <Card className="border-2 border-primary/10 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                Why PassQuartZ?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Intuitive and Responsive Interface</h4>
                    <p className="text-muted-foreground">
                      Enjoy a seamless experience on any device, from desktops to smartphones.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Immediate Visual Feedback</h4>
                    <p className="text-muted-foreground">
                      Instantly see the strength of your password as you customize it.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Educational explanations about security</h4>
                    <p className="text-muted-foreground">
                      Learn what makes a password strong and how to protect yourself online.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
