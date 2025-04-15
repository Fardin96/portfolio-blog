'use client';
import Image from 'next/image';
import { useState } from 'react';

export default function Page() {
  const [visible, setVisible] = useState(false);

  return (
    <div className='flex items-center justify-center h-screen'>
      <h1>Farabi</h1>

      <button onClick={() => setVisible(!visible)}>
        {visible ? 'Hide image' : 'Show image'}
      </button>

      <div className='flex flex-col items-center justify-center'>
        {visible && (
          <Image
            src='/demo-farabi-pp.jpg'
            alt='Profile'
            width={500}
            height={750}
          />
        )}
      </div>
    </div>
  );
}
