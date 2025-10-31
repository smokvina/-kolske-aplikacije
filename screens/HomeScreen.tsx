import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Screen } from '../types';
import { NewspaperIcon, CalendarIcon, ChatBubbleOvalLeftEllipsisIcon, DocumentPlusIcon, InformationCircleIcon, BellIcon, DocumentTextIcon } from '../components/Icons';

interface HomeScreenProps {
  setActiveScreen: (screen: Screen) => void;
  vapidPublicKey: string;
}

// This function is needed to convert the VAPID public key string to a Uint8Array.
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


const HomeScreen: React.FC<HomeScreenProps> = ({ setActiveScreen, vapidPublicKey }) => {
  const features = [
    { name: Screen.Report, icon: DocumentPlusIcon, description: "Prijavite problem ili prijedlog" },
    { name: Screen.Chat, icon: ChatBubbleOvalLeftEllipsisIcon, description: "Pitajte našeg AI asistenta" },
    { name: Screen.News, icon: NewspaperIcon, description: "Najnovije vijesti i obavijesti" },
    { name: Screen.Calendar, icon: CalendarIcon, description: "Školski kalendar i događanja" },
    { name: Screen.Documents, icon: DocumentTextIcon, description: "Školski dokumenti i obrasci" },
    { name: Screen.Info, icon: InformationCircleIcon, description: "Kontakt i informacije o školi" },
  ];

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      // Set initial permission status
      setNotificationPermission(Notification.permission);
      
      // Check for existing subscription
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub) {
            setIsSubscribed(true);
          }
          setSubscriptionLoading(false);
        });
      });
    } else {
      console.warn('Push notifications are not supported in this browser.');
      setSubscriptionLoading(false);
    }
  }, []);
  
  const handleSubscribe = async () => {
    if (notificationPermission === 'denied') {
      alert('Blokirali ste obavijesti. Morate ih omogućiti u postavkama preglednika.');
      return;
    }
    
    setSubscriptionLoading(true);
    const swRegistration = await navigator.serviceWorker.ready;
    const existingSubscription = await swRegistration.pushManager.getSubscription();

    if (existingSubscription) {
      // Unsubscribe
      await existingSubscription.unsubscribe();
      setIsSubscribed(false);
      console.log('User unsubscribed.');
    } else {
      // Subscribe
      try {
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        const newSubscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey
        });
        console.log('New subscription:', newSubscription);
        // In a real app, you would send this subscription object to your server
        // fetch('/api/subscribe', { method: 'POST', body: JSON.stringify(newSubscription), ... });
        setIsSubscribed(true);
      } catch (error) {
         console.error('Failed to subscribe the user: ', error);
         // This can happen if the user denies permission at the prompt
         if (Notification.permission === 'denied') {
             setNotificationPermission('denied');
         }
      }
    }
    setNotificationPermission(Notification.permission);
    setSubscriptionLoading(false);
  };
  
   const handleTestNotification = async () => {
    if (!isSubscribed) {
        alert("Morate biti pretplaćeni za testiranje obavijesti.");
        return;
    }
    const swRegistration = await navigator.serviceWorker.ready;
    swRegistration.showNotification('Testna Obavijest', {
        body: 'Ako vidite ovo, obavijesti rade ispravno!',
        icon: './icon.png'
    });
  };

  const getPermissionStatusText = () => {
    switch(notificationPermission) {
      case 'granted': return 'Dozvola odobrena';
      case 'denied': return 'Dozvola blokirana';
      default: return 'Čeka se dozvola';
    }
  }


  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Dobrodošli!</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Vaš centar za sve informacije o Srednjoj tehničkoj prometnoj školi Split.</p>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((feature) => (
          <Card key={feature.name} onClick={() => setActiveScreen(feature.name)} className="flex flex-col items-center text-center">
            <feature.icon className="h-10 w-10 text-[#003366] dark:text-sky-400 mb-2" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">{feature.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{feature.description}</p>
          </Card>
        ))}
      </div>

       <Card>
        <div className="flex items-center gap-3">
          <BellIcon className="h-8 w-8 text-[#003366] dark:text-sky-400" />
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">Push Obavijesti</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Status: <span className="font-medium">{getPermissionStatusText()}</span>
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
                onClick={handleSubscribe}
                disabled={subscriptionLoading || notificationPermission === 'denied'}
                className="flex-1 px-4 py-2 bg-[#003366] text-white rounded-md hover:bg-[#004488] disabled:bg-gray-400"
            >
                {subscriptionLoading ? 'Učitavam...' : (isSubscribed ? 'Odjavi me' : 'Pretplati me')}
            </button>
            <button
                onClick={handleTestNotification}
                disabled={!isSubscribed}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Testiraj obavijest
            </button>
        </div>
      </Card>
    </div>
  );
};

export default HomeScreen;