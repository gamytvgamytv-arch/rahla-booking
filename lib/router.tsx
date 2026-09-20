import { createContext, useContext, useEffect, useState } from 'react';

type RouterContextValue = {
  path: string;
  navigate: (to: string) => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);

export function getPathOnly(path: string): string {
  return path.split('?')[0].split('#')[0] || '/';
}

export function parseQuery(path: string): Record<string, string> {
  const queryString = path.split('?')[1]?.split('#')[0] || '';
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

export function RouterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [path, setPath] = useState(
    window.location.pathname + window.location.search
  );

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname + window.location.search);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setPath(to);
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter(): RouterContextValue {
  const context = useContext(RouterContext);

  if (!context) {
    throw new Error('useRouter must be used inside RouterProvider');
  }

  return context;
}
