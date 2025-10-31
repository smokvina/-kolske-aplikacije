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
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets: {
        uri: string,
        reviewText: string
      }[];
    }[]
  }
}
