import { FiSun } from 'react-icons/fi';
import { FaRegMoon } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ToggleTheme() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className='text-gray-300 hover:text-white p-2'
    >
      {theme === 'light' ? <FiSun size={25} /> : <FaRegMoon size={25} />}
    </button>
  );
}
