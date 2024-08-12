import { useRoutes } from "react-router-dom";
import ThemeRoutes from "./routes/Router";
import './assets/scss/App.css';
import { ExcelConverterProvider } from './components/fileConverter/ExcelConverterContext';

const App = () => {
  const routing = useRoutes(ThemeRoutes);

  return (
    <ExcelConverterProvider>
      <div className="dark">
        {routing}
      </div>
    </ExcelConverterProvider>
  );
};

export default App;