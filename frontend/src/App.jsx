import { ThemeProvider } from '@mui/material/styles';
import { theme } from './styles/theme';
import CssBaseline from '@mui/material/CssBaseline';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">{/* Ваши компоненты здесь */}</div>
    </ThemeProvider>
  );
}

export default App;
