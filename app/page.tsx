'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [visible, setVisible] = useState(false);

  return (
    <div className='flex flex-col items-center py-8'>
      <h1 className='text-4xl font-bold mb-2'>👋🏼 This is Farabi</h1>

      <h2 className='text-2xl mb-6'>Muslim & Dreamer😴💭</h2>

      <h3 className='text-2xl mb-6'>
        Writes code & loves everything about CLIs, Linux, and automation!
      </h3>

      <p className='text-lg max-w-2xl text-center mb-6'></p>

      <button
        onClick={() => setVisible(!visible)}
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4'
      >
        {visible ? 'Hide image ❌' : 'Show image ✅'}
      </button>

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
      </div>
    </div>
  );
}
