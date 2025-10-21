import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Lesson, QuizQuestion } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Utility Functions ---

// A utility function to add a timeout to any promise.
function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage = 'Request timed out.'): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, ms);

    promise
      .then(res => {
        clearTimeout(timeoutId);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timeoutId);
        reject(err);
      });
  });
}

// A utility function to extract JSON from a string that might be wrapped in markdown.
function extractJson(text: string): string {
  const match = text.match(/```(json)?\s*([\s\S]*?)\s*```/);
  if (match && match[2]) {
    return match[2].trim();
  }
  return text.trim();
}


// Decodes a base64 string into a Uint8Array.
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes raw PCM audio data into an AudioBuffer for playback.
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


// --- API Functions ---

export async function generateLesson(topic: string): Promise<Lesson> {
    const TIMEOUT = 60000; // 60 seconds
    const lessonPromise = (async () => {
        const prompt = `You are an expert educator creating an engaging lesson for a middle school student. The topic is "${topic}".
        Create an exciting lesson that sounds like an adventure.
        The lesson should have a clear title, be broken down into 2-3 short, easy-to-understand paragraphs.
        At the end, suggest three related but distinct topics for further exploration.
        Return the response as a JSON object with the keys "title", "content", and "relatedTopics" (an array of strings).`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    relatedTopics: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                    },
                    required: ['title', 'content', 'relatedTopics'],
                },
            },
        });

        const jsonText = extractJson(response.text);
        return JSON.parse(jsonText) as Lesson;
    })();
    return withTimeout(lessonPromise, TIMEOUT, 'Lesson generation took too long. Please try again.');
}

export async function generateQuiz(lessonContent: string): Promise<QuizQuestion[]> {
    const TIMEOUT = 60000; // 60 seconds
    const quizPromise = (async () => {
        const prompt = `Based on the following lesson content, create a multiple-choice quiz with 3 questions to test understanding. Each question should have 4 possible answers, with only one being correct. Ensure the correctAnswer exactly matches one of the strings in the options array.
        
        Lesson Content:
        ${lessonContent}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        },
                        correctAnswer: { type: Type.STRING },
                    },
                    required: ['question', 'options', 'correctAnswer'],
                    },
                },
            },
        });

        const jsonText = extractJson(response.text);
        return JSON.parse(jsonText) as QuizQuestion[];
    })();
    return withTimeout(quizPromise, TIMEOUT, 'Quiz generation took too long. Please try again.');
}

export async function generateSpeech(text: string): Promise<AudioBuffer> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say with a clear, engaging, and friendly tone: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data received from API.");
    }

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBytes = decode(base64Audio);
    return await decodeAudioData(audioBytes, outputAudioContext, 24000, 1);
}
