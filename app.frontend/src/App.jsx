import React from 'react';
import HereMap from './components/HereMap';

const App = () => {
  const hereApiKey = 'vUy21Puu_rrwuDxBOnpQl73KylaQF1O6aFzyXeBsUWg'; // Înlocuiește cu cheia ta reală

  return (
    <div className="app">
      <h1>Sistem GPS cu HERE Maps</h1>
      <HereMap apiKey={hereApiKey} />
    </div>
  );
};

export default App;
