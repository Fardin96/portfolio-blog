'use client';
import React, { useEffect, useState } from 'react';
import SocialIcons from '../components/SocialIcons';
import { WebhookData } from '../public/types/webhookTypes';

type SetWebhookDataType = (data: WebhookData | null) => void;

async function fetchWebhookData(
  setWebhookData: SetWebhookDataType
): Promise<void> {
  try {
    const response = await fetch('/api/webhook/data');
    if (!response.ok) {
      throw new Error('Failed to fetch webhook data');
    }

    const data = await response.json();
    console.log('+--------------------main-page------------------+');
    console.log('response.json(): ', data);

    setWebhookData(data.webhookData || null);
  } catch (err) {
    console.error('Error fetching webhook data:', err);
  }
}

export default function Home(): React.ReactElement {
  const [webhookData, setWebhookData] = useState<WebhookData | null>(null);

  useEffect(() => {
    fetchWebhookData(setWebhookData);
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

      {/* <p>repository data: {JSON.stringify(webhookData, null, 2)}</p> */}

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
