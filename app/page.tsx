'use client';
import React, { useEffect, useState } from 'react';
import SocialIcons from '../components/SocialIcons';
import { WebhookData } from '../public/types/webhookTypes';

type SetWebhookDataType = (data: WebhookData[]) => void;

async function fetchWebhookData(
  setWebhookData: SetWebhookDataType
): Promise<void> {
  try {
    // setLoading(true);
    const response = await fetch('/api/webhook/data');
    if (!response.ok) {
      throw new Error('Failed to fetch webhook data');
    }

    // const data = (await response.json()) as WebhookData[];
    const data = await response.json();
    console.log('+--------------------main-page------------------+');
    console.log('response.json(): ', data);

    setWebhookData(data || []);
    // setError(null);
  } catch (err) {
    console.error('Error fetching webhook data:', err);
    // setError('Failed to load webhook data. Please try again later.');
  } finally {
    // setLoading(false);
  }
}

export default function Home(): React.ReactElement {
  // const [visible, setVisible] = useState(false);
  const [webhookData, setWebhookData] = useState<WebhookData[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);
  // const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    fetchWebhookData(setWebhookData);

    // Set up polling to refresh the data every 5 seconds
    // const intervalId = setInterval(() => {
    //   fetchWebhookData();
    // }, 5000);

    // Clean up the interval when the component unmounts
    // return () => clearInterval(intervalId);
  }, []);

  return (
    <div className='flex flex-col items-center justify-center py-8'>
      <h1 className='text-4xl font-bold mb-2'>👋🏼 This is Farabi</h1>

      <h2 className='text-2xl mb-6'>Muslim & Dreamer 😴💭</h2>

      <h3 className='text-2xl mb-6'>
        Writes code & loves everything about Linux and automation.
      </h3>

      <div className='mt-16 mb-6'>
        <SocialIcons />
      </div>

      <p>{JSON.stringify(webhookData, null, 2)}</p>

      {/* 
      <button
        onClick={() => setVisible(!visible)}
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4'
      >
        {visible ? 'Hide image ❌' : 'Show image ✅'}
      </button>

      <div>
        <p>{data}</p>
      </div> */}

      {/* 
      <div className='flex flex-col items-center justify-center'>
        {visible && (
          <Image
            src='/demo-farabi-pp.jpg'
            alt='Picture'
            width={500}
            height={750}
            className='rounded-lg shadow-lg'
          />
        )}
      </div> */}
    </div>
  );
}
