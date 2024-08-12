import React, { createContext, useState, useContext } from 'react';

const ExcelConverterContext = createContext();

// 上下文对象，可以在组件树的任意位置被使用来共享数据
export const useExcelConverter = () => useContext(ExcelConverterContext);

// 提供者组件, 用于将数据传递给需要访问它的子组件
export const ExcelConverterProvider = ({ children }) => {
  const [jsonResult, setJsonResult] = useState("");

  return (
    <ExcelConverterContext.Provider
      // Provider 会将状态（jsonResult）和修改它的方法（setJsonResult）传递给提供者的 value 属性
      value={{
        jsonResult,
        setJsonResult
      }}
    >
      {children}
    </ExcelConverterContext.Provider>
  );
};