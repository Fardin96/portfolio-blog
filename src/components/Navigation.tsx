'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import '../app/globals.css';
import ToggleTheme from './ToggleTheme';

export default function Navigation(): React.ReactElement {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <nav className='bg-[var(--navbar-bg)] w-full'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex-shrink-0'>
            <Link href='/' className='text-white font-bold text-xl'>
              Farabi
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <ToggleTheme />

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className='text-gray-300 hover:text-white p-2'
            >
              {isMenuOpen ? (
                <svg
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              ) : (
                <svg
                  className='h-6 w-6'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className='hidden md:flex md:items-center'>
            <div className='flex space-x-1'>
              <Link
                href='/projects'
                className='text-white hover:text-gray-300 px-3 py-2'
              >
                Projects
              </Link>

              <div className='border-r border-gray-600 h-6 self-center'></div>

              <Link
                href='/blogs'
                className='text-white hover:text-gray-300 px-3 py-2'
              >
                Blogs
              </Link>
            </div>

            <div className='flex space-x-1'>
              <ToggleTheme />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className='md:hidden'>
          <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
            <Link
              href='/projects'
              className='text-white block px-3 py-2 rounded-md text-base font-medium'
              onClick={() => setIsMenuOpen(false)}
            >
              Projects
            </Link>

            <Link
              href='/blogs'
              className='text-white block px-3 py-2 rounded-md text-base font-medium'
              onClick={() => setIsMenuOpen(false)}
            >
              Blogs
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
