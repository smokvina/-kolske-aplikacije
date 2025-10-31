import React, { useState, useRef, useEffect } from 'react';
import Card from '../components/Card';
import { analyzeImage, suggestCategory } from '../services/geminiService';
import { SparklesIcon, MicrophoneIcon } from '../components/Icons';
import { GoogleGenAI, LiveSession, Modality, Blob } from '@google/genai';
import { logReport } from '../services/googleSheetsService';

// Helper functions for Live API audio encoding
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const reportCategories = [
  'Hitna pomoć/Sigurnost',
  'Prijava tehničkog problema',
  'Prijedlog za unapređenje',
  'Opća prijava/Upit',
] as const;

type ReportCategory = typeof reportCategories[number];


const ReportScreen: React.FC = () => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportCategory | ''>('');
  const [image, setImage] = useState<{ file: File; base64: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [analyzingCategory, setAnalyzingCategory] = useState(false);
  const [suggestion, setSuggestion] = useState<{ category: ReportCategory; reason: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs for audio processing and Live API session
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);

  useEffect(() => {
    // Clear suggestion if the user changes the text or category
    setSuggestion(null);
  }, [description, category]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({ file, base64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    const base64Data = image.base64.split(',')[1];
    const prompt = "Opiši problem prikazan na ovoj slici u kontekstu školske okoline. Budi sažet i jasan.";
    const analysisResult = await analyzeImage(base64Data, image.file.type, prompt);
    setDescription(analysisResult);
    setLoading(false);
  };

  const stopRecording = async () => {
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.close();
      sessionPromiseRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
  };

  const startRecording = async () => {
    setIsRecording(true);
    setDescription(prev => (prev.trim() ? prev + ' ' : ''));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Fix: Cast 'window' to 'any' to access vendor-prefixed 'webkitAudioContext'.
      const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = context;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = context.createMediaStreamSource(stream);
            const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(context.destination);
          },
          onmessage: (message) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setDescription(prev => prev + text);
            }
          },
          onerror: (e) => {
            console.error('Live session error:', e);
            setDescription(prev => prev + '\n[Greška prilikom transkripcije]');
            stopRecording();
          },
          onclose: () => { /* Session closed */ },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
        },
      });

    } catch (err) {
      console.error("Error setting up audio recording:", err);
      setDescription(prev => prev + '\n[Nije moguće pristupiti mikrofonu.]');
      await stopRecording();
    }
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const handleAnalyzeCategory = async () => {
    setAnalyzingCategory(true);
    setSuggestion(null);
    const result = await suggestCategory(description, reportCategories);
    if (result && reportCategories.includes(result.suggestedCategory as ReportCategory)) {
        setSuggestion({
            category: result.suggestedCategory as ReportCategory,
            reason: result.reason
        });
    }
    setAnalyzingCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category) {
      logReport(category, description, image !== null);
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card className="text-center">
        <h2 className="text-xl font-bold text-green-600 dark:text-green-400">Prijava poslana!</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Hvala vam na doprinosu poboljšanju naše škole. Vaša prijava ({category}) je zaprimljena i bit će obrađena u najkraćem roku.</p>
        <button onClick={() => { setSubmitted(false); setDescription(''); setImage(null); setCategory(''); setSuggestion(null); }} className="mt-4 bg-[#003366] text-white px-4 py-2 rounded-md hover:bg-[#004488]">
          Nova prijava
        </button>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Brza Prijava / Prijedlog</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Imate problem za prijaviti ili ideju za poboljšanje? Javite nam!</p>
      </Card>

      <Card>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          1. Priložite fotografiju (opcionalno)
        </label>
        <div className="mt-2 flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Odaberi sliku
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          {image && <span className="text-sm text-gray-500 truncate">{image.file.name}</span>}
        </div>
        {image && (
          <div className="mt-4">
            <img src={image.base64} alt="Preview" className="max-h-48 rounded-md mx-auto" />
            <button
              type="button"
              onClick={handleAnalyzeImage}
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 rounded-md hover:bg-sky-200 disabled:opacity-50"
            >
              <SparklesIcon className="h-5 w-5" />
              {loading ? 'Analiziram...' : 'Analiziraj sliku s AI'}
            </button>
          </div>
        )}
      </Card>

      <Card>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          2. Opišite problem ili prijedlog
        </label>
        <textarea
          id="description"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-2 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-[#003366] outline-none"
          placeholder="Npr. 'Slomljena je klupa u školskom dvorištu.' ili 'Predlažem organiziranje filmske večeri.' ili kliknite na mikrofon za glasovni unos."
        />
        <button 
          type="button"
          onClick={handleRecordToggle}
          disabled={loading}
          className={`mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
        >
          <MicrophoneIcon className="h-5 w-5"/>
          {isRecording ? "Zaustavi snimanje" : "Snimi glasovni opis"}
        </button>
      </Card>

       <Card>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          3. Odaberite kategoriju
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ReportCategory)}
          className="mt-2 w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-[#003366] outline-none"
        >
          <option value="" disabled>Odaberite...</option>
          {reportCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
            type="button"
            onClick={handleAnalyzeCategory}
            disabled={!description.trim() || analyzingCategory}
            className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 rounded-md hover:bg-sky-200 disabled:opacity-50"
        >
            <SparklesIcon className="h-5 w-5"/>
            {analyzingCategory ? 'Analiziram...' : 'Predloži kategoriju s AI'}
        </button>
        {suggestion && (
            <div className="mt-3 p-3 bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700 rounded-md">
                <p className="text-sm text-sky-800 dark:text-sky-200">
                    <span className="font-semibold">AI Prijedlog:</span> {suggestion.reason}
                </p>
                 <button
                    type="button"
                    onClick={() => {
                        setCategory(suggestion.category);
                        setSuggestion(null);
                    }}
                    className="mt-2 text-sm bg-sky-600 text-white px-3 py-1 rounded-md hover:bg-sky-700"
                >
                    Prihvati prijedlog '{suggestion.category}'
                </button>
            </div>
        )}
      </Card>

      <button
        type="submit"
        className="w-full bg-[#003366] text-white font-bold py-3 px-4 rounded-md hover:bg-[#004488] disabled:bg-gray-400"
        disabled={(!description.trim() && !image) || !category || isRecording || analyzingCategory || loading}
      >
        Pošalji prijavu
      </button>
    </form>
  );
};

export default ReportScreen;