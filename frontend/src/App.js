import React, { useState } from 'react';
import { Grommet } from 'grommet';
import ChatIcon from './components/ChatIcon';
import ChatPopup from './components/ChatPopup';
import { darkTheme } from './components/themes';
import './App.css';

const theme = {
  global: {
    colors: {
      brand: '#007bff',
    },
    font: {
      family: 'Arial',
      size: '18px',
      height: '20px',
    },
  },
};

function App() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <Grommet theme={darkTheme} full>
      <div className="heading-container ">  
        <h1 className="gradient-heading">CodeAstra</h1>
      </div>
      <div className={`App ${isPopupOpen ? 'blurred' : ''}`}>
        <ChatIcon onClick={togglePopup} />
        {isPopupOpen && <ChatPopup onClose={togglePopup} />}
      </div>
    </Grommet>
  );
}

export default App;
