import { deepMerge } from 'grommet/utils';
import { hpe } from 'grommet-theme-hpe';

const lightTheme = hpe;
const darkTheme = deepMerge(hpe, {
  global: {
    colors: {
      background: '#1a1a1a',  
      text: '#ffffff',        
      brand: '#ffffff',       
      highlight: '#ffffff',   
    },
  },
  sidebar: {
    background: {
      color: '#222222',
    },
    listItem: {
      pad: 'small',
      color: '#ffffff'
    },
  },
  button: {
    border: {
      color: '#ffffff',
    },
    color: '#ffffff',
  },
});

export { lightTheme, darkTheme };
