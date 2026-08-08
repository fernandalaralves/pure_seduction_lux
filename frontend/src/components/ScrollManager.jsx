import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Keeps navigation feeling like a single page: clicking a header link that
// points at an anchor (e.g. "/#destaques") smooth-scrolls to that section
// instead of doing nothing, and switching to a normal route (no hash) resets
// the scroll to the top like a fresh page.
export default function ScrollManager() {
  const { pathname, hash } = useLocation();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const scrollToTarget = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return true;
        }
        return false;
      };
      if (!scrollToTarget()) {
        const timeout = setTimeout(scrollToTarget, 150);
        return () => clearTimeout(timeout);
      }
    } else if (prevPathname.current !== pathname) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    prevPathname.current = pathname;
  }, [pathname, hash]);

  return null;
}
