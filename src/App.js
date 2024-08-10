import { useRoutes } from "react-router-dom";
import ThemeRoutes from "./routes/Router";
import './assets/scss/App.css';

const App = () => {
  const routing = useRoutes(ThemeRoutes);

  return <div className="dark">{routing}</div>;
};

export default App;