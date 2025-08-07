import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css'; // Certifique-se de que este caminho está correto para o seu CSS

const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) para TypeScript com não-nulo

root.render(<App />);