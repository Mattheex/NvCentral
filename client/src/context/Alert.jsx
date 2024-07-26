import React, {createContext, useContext, useState} from 'react';

const AlertContext = createContext()
export const useAlert = () => useContext(AlertContext)

export const AlertProvider = ({children}) => {
    const [alert, setAlert] = useState(null);

    const showAlert = (message, variant) => {
        setAlert({message, variant});
        console.log(alert)
        setTimeout(() => setAlert(null), 2000); // Clear the alert after 3 seconds
    };

    return (
        <AlertContext.Provider value={{alert, showAlert}}>
            {children}
        </AlertContext.Provider>
    )
};
