import { FiSun } from 'react-icons/fi';
import { FaRegMoon } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
import { UseThemeReturnType } from '../utils/types/types';

export default function ToggleTheme(): React.ReactElement | null {
  const { theme, setTheme } = useTheme() as UseThemeReturnType;
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className='text-gray-300 hover:text-white p-2 transition:all duration-200 hover:cursor-pointer hover:scale-120'
    >
      {theme === 'light' ? <FiSun size={25} /> : <FaRegMoon size={25} />}
    </button>
  );
}
