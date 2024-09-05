import React, { createContext, useState, useContext } from 'react';

const ExcelConverterContext = createContext();

export const useExcelConverter = () => useContext(ExcelConverterContext);

export const ExcelConverterProvider = ({ children }) => {
  const [jsonResult, setJsonResult] = useState("");

  const resetState = () => {
    setJsonResult("");
  };

  return (
    <ExcelConverterContext.Provider
      value={{
        jsonResult,
        setJsonResult,
        resetState,
      }}
    >
      {children}
    </ExcelConverterContext.Provider>
  );
};