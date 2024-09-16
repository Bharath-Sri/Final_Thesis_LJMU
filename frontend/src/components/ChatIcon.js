import React from 'react';
import Lottie from 'lottie-react';
import animationData from './chat_icon.json';

const ChatIcon = ({ onClick }) => {
  const handleAnimationClick = () => {
    onClick(); 
  };

  return (
    <div style={{ position: 'fixed', bottom: '1px', right: '20px' }}>
      <div onClick={handleAnimationClick} style={{ cursor: 'pointer' }}>
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={{ width: 200, height: 300 }} 
        />
      </div>
    </div>
  );
};

export default ChatIcon;




// import { Box, Button } from 'grommet';
// import { Chat } from 'grommet-icons';
// import { motion } from 'framer-motion';


// const ChatIcon = ({ onClick }) => (
//   <Box
//     style={{ position: 'fixed', bottom: '20px', right: '20px' }}
//     as={motion.div}
//     initial={{ scale: 0 }}
//     animate={{ scale: 1 }}
//     transition={{ duration: 0.5 }}
//   >
//     <Button icon={<Chat />} onClick={onClick} primary />
//   </Box>
// );

// export default ChatIcon;


