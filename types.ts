import React from 'react';

export enum Screen {
  Home = 'Početna',
  News = 'Novosti',
  Calendar = 'Kalendar',
  Chat = 'Chatbot',
  Report = 'Prijava',
  Info = 'Info',
  Documents = 'Dokumenti',
}

export interface NavItem {
  screen: Screen;
  // FIX: Use React.ReactElement instead of JSX.Element to avoid namespace errors in .ts files.
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface GroundingChunk {
  web?: {
    // FIX: Made uri and title optional to align with Gemini API response, fixing a type error.
    uri?: string;
    title?: string;
  };
  maps?: {
    // FIX: Made uri and title optional to align with Gemini API response, fixing a type error.
    uri?: string;
    title?: string;
    // FIX: Corrected the type of `placeAnswerSources` from an array of objects to a single object to align with the Gemini API's response structure.
    placeAnswerSources?: {
      reviewSnippets: {
        uri: string,
        reviewText: string
      }[];
    }
  }
}
