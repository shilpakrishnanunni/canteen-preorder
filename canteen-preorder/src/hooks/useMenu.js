import { useCallback, useEffect, useState } from 'react';
import { getCategories, getMenu } from '../api.js';
import { itemKey } from '../utils.js';

// Loads the categories, then the menu of every category
// (GET /menu?categorySlug=slug), and merges them into one list.
export default function useMenu() {
  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const cats = await getCategories();
      const lists = await Promise.all(cats.map((c) => getMenu(c.slug)));

      const seen = new Set();
      const merged = [];
      lists.forEach((list, i) => {
        list
          // keep only this category's items, even if the API returns more
          .filter((item) => item.categoryId === cats[i].id)
          .forEach((item) => {
            const key = itemKey(item);
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          });
      });

      setCategories(cats);
      setMenu(merged);
    } catch (e) {
      setError(e.message || 'Could not load the menu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, menu, loading, error, reload: load };
}
