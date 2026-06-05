import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Book } from '../lib/types';

type State = { books: Book[]; loading: boolean; error: string | null };

export function useBooks() {
  const [state, setState] = useState<State>({ books: [], loading: true, error: null });

  useEffect(() => {
    supabase
      .from('books')
      .select('*')
      .eq('status', 'published')
      .order('id')
      .then(({ data, error }) => {
        if (error) setState({ books: [], loading: false, error: error.message });
        else setState({ books: (data as Book[]) ?? [], loading: false, error: null });
      });
  }, []);

  return state;
}
