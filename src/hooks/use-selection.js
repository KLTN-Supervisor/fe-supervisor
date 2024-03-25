import { useCallback, useEffect } from "react";

export const useSelection = (items = [], setUsersSelected) => {
  useEffect(() => {
    setUsersSelected([]);
  }, [items]);

  const handleSelectAll = useCallback(() => {
    setUsersSelected([...items]);
  }, [items]);

  const handleSelectOne = useCallback((item) => {
    setUsersSelected((prevState) => [...prevState, item]);
  }, []);

  const handleDeselectAll = useCallback(() => {
    setUsersSelected([]);
  }, []);

  const handleDeselectOne = useCallback((item) => {
    setUsersSelected((prevState) => {
      return prevState.filter((_item) => _item !== item);
    });
  }, []);

  return {
    handleDeselectAll,
    handleDeselectOne,
    handleSelectAll,
    handleSelectOne,
  };
};
