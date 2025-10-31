
import React from 'react';
import Card from '../components/Card';

const mockEvents = [
  { date: '21.06.', title: 'Završetak nastavne godine', description: 'Posljednji dan nastave za sve učenike.' },
  { date: '24.06.', title: 'Sjednica Nastavničkog vijeća', description: 'Zaključivanje ocjena i uspjeha učenika.' },
  { date: '01.07.', title: 'Početak ljetnih praznika', description: 'Uživajte u zasluženom odmoru!' },
  { date: '26.08.', title: 'Popravni ispiti', description: 'Početak jesenskog roka popravnih ispita.' },
  { date: '02.09.', title: 'Početak nove školske godine', description: 'Prvi dan nastave u novoj školskoj godini.' },
];

const CalendarScreen: React.FC = () => {
  return (
    <div className="space-y-4">
      {mockEvents.map((event, index) => (
        <Card key={index} className="flex items-start space-x-4">
          <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg flex flex-col items-center">
            <span className="text-[#003366] dark:text-gray-100 font-bold text-lg">{event.date.split('.')[0]}</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">.{event.date.split('.')[1]}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100">{event.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{event.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CalendarScreen;