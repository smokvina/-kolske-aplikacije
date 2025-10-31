import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HomeScreen from './screens/HomeScreen';
import NewsScreen from './screens/NewsScreen';
import CalendarScreen from './screens/CalendarScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import ReportScreen from './screens/ReportScreen';
import InfoScreen from './screens/InfoScreen';
import DocumentsScreen from './screens/DocumentsScreen';
import { Screen } from './types';

// VAPID public key should be stored securely and retrieved from the server
// For this example, we'll define it here.
const VAPID_PUBLIC_KEY = 'BPhg-u29t_M7-g17m9-jUnv2m55i9w33-OUN_POuXf_nQ_GAd5cM2Z8kUqR1Lp-L-4q_uYJ-s_3D6-zXvY1ZJj8';


const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.Home);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => console.log('Service Worker registered with scope:', registration.scope))
        .catch(error => console.log('Service Worker registration failed:', error));
    }
  }, []);


  const renderScreen = () => {
    switch (activeScreen) {
      case Screen.Home:
        return <HomeScreen setActiveScreen={setActiveScreen} vapidPublicKey={VAPID_PUBLIC_KEY} />;
      case Screen.News:
        return <NewsScreen />;
      case Screen.Calendar:
        return <CalendarScreen />;
      case Screen.Chat:
        return <ChatbotScreen />;
      case Screen.Report:
        return <ReportScreen />;
      case Screen.Info:
        return <InfoScreen />;
      case Screen.Documents:
        return <DocumentsScreen />;
      default:
        return <HomeScreen setActiveScreen={setActiveScreen} vapidPublicKey={VAPID_PUBLIC_KEY} />;
    }
  };

  return (
    <Layout activeScreen={activeScreen} setActiveScreen={setActiveScreen}>
      {renderScreen()}
    </Layout>
  );
};

export default App;