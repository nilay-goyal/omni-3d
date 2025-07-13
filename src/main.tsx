import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import mixpanel from 'mixpanel-browser'

// Initialize Mixpanel
mixpanel.init("YOUR_TOKEN", {
  debug: true,
  track_pageview: true,
  persistence: "localStorage",
});

createRoot(document.getElementById("root")!).render(<App />);
