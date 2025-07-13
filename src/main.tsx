import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import mixpanel from 'mixpanel-browser'

// Initialize Mixpanel
mixpanel.init("f82219815700c2d312d0d19df40964c9", {
  debug: true,
  track_pageview: true,
  persistence: "localStorage",
});

createRoot(document.getElementById("root")!).render(<App />);
