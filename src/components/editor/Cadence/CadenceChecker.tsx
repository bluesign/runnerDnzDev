import React, { createContext } from "react";
import useLanguageServer from "./useLanguageServer";

export const CadenceCheckerContext = createContext<any>(null);

const CadenceChecker = ({ newCadence, children }) => {
    // Connect project to cadence checker hook
    const cadenceChecker = useLanguageServer(newCadence);

    // render
    return (
        <CadenceCheckerContext.Provider value={cadenceChecker}>
            {children}
        </CadenceCheckerContext.Provider>
    );
};

export default CadenceChecker;
