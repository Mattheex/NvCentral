import React, { createContext, useContext, useState, useMemo, useCallback } from "react";

const AlertContext = createContext();
export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((message, variant, detail = undefined) => {
    if (detail) console.log(detail);
    setAlert({ message, variant });
    setTimeout(() => setAlert(null), 2000); // Clear the alert after 2 seconds
  }, []);

  const contextValue = useMemo(
    () => ({
      alert,
      showAlert,
    }),
    [alert, showAlert]
  );

  return <AlertContext.Provider value={contextValue}>{children}</AlertContext.Provider>;
};
