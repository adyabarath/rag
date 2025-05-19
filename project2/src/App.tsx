import React from 'react';
import Layout from './components/Layout/Layout';
import { ChatProvider } from './context/ChatContext';
import './index.css';

function App() {
  return (
    <ChatProvider>
      <Layout />
    </ChatProvider>
  );
}

export default App;