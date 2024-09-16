import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Layer, Text, TextInput, Grommet, Tip } from 'grommet';
import { Close, Send, Attachment, Moon, Sun, Clipboard } from 'grommet-icons';
import { lightTheme, darkTheme } from './themes';
import { fetchQuery } from './api/api';
import interactions from './interactions.json';
import { motion } from 'framer-motion';
import '../App.css';

const TypingIndicator = () => (
  <Box direction="row" align="center" gap="small">
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
    >
      <Text className="gradient-indicator" weight='bold'>thinking</Text>
    </motion.div>
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
    >
      <Box direction="row" align="center" gap="xsmall">
        <Text>.</Text>
        <Text>.</Text>
        <Text>.</Text>
      </Box>
    </motion.div>
  </Box>
);

const ChatPopup = ({ onClose }) => {
  const [conversations, setConversations] = useState([{ sender: 'bot', text: interactions.rules[0].responses[0].text }]);
  const [inputValue, setInputValue] = useState('');
  const [themeMode, setThemeMode] = useState('dark');
  const [isLoadingSend, setIsLoadingSend] = useState(false);
  const [isTextPopupOpen, setIsTextPopupOpen] = useState(false);
  const [popupText, setPopupText] = useState('');
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversations]);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      setIsLoadingSend(true);
  
      const newConversations = [...conversations, { sender: 'user', text: inputValue }];
      setConversations(newConversations);
      setInputValue('');
  
      try {  
        const matchedRule = interactions.rules.find(rule =>
          rule.keywords.some(keyword => inputValue.toLowerCase().includes(keyword.toLowerCase()))
        );
  
        if (matchedRule) {
          const botResponse = matchedRule.responses[0];
          setConversations(prevConversations => [...prevConversations, { sender: 'bot', ...botResponse }]);
        } else {
          const response = await fetchQuery(inputValue);
          const botResponse = { sender: 'bot', text: response.result.output };
          setConversations(prevConversations => [...prevConversations, botResponse]);
        }
      } catch (error) {
        console.error('Error fetching query:', error);
        const errorResponse = { sender: 'bot', text: 'Sorry 🙁🙁 there was an error. Please try again.' };
        setConversations(prevConversations => [...prevConversations, errorResponse]);
      } finally {
        setIsLoadingSend(false);
      }
    }
  };
  
  
  
  // const handleSendMessage = async () => {
  //   if (inputValue.trim()) {
  //     setIsLoadingSend(true);

  //     const newConversations = [...conversations, { sender: 'user', text: inputValue }];
  //     setConversations(newConversations);
  //     setInputValue('');

  //     try {
  //       const matchedRule = interactions.rules.find(rule =>
  //         rule.keywords.some(keyword => inputValue.toLowerCase().includes(keyword.toLowerCase()))
  //       );

  //       if (matchedRule) {
  //         const botResponse = matchedRule.responses[0];
  //         setConversations(prevConversations => [...prevConversations, { sender: 'bot', ...botResponse }]);
  //       } else {
  //         const response = await fetchQuery(inputValue);
  //         const botResponse = { sender: 'bot', text: response.result.output };
  //         setConversations(prevConversations => [...prevConversations, botResponse]);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching query:', error);
  //     } finally {
  //       setIsLoadingSend(false);
  //     }
  //   }
  // };

  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file);
    }
  };

  const toggleThemeMode = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !isLoadingSend) {
      handleSendMessage();
    }
  };

  const handleBoxClick = (text) => {
    setPopupText(text);
    setIsTextPopupOpen(true);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(popupText);
  };

  const handleClosePopup = () => {
    setIsTextPopupOpen(false);
    setPopupText('');
  };

  return (
    <Grommet theme={themeMode === 'dark' ? darkTheme : lightTheme} full>
      <Layer className="blur-background" flex onEsc={onClose} onClickOutside={onClose} modal>
        <Box
          elevation='large'
          direction="row"
          width="500px"
          height="600px"
          pad="25px"
          gap="small"
          className="blur-background"
          round="small"
        >
          <Box flex direction="column" gap="small">
            <Box direction="row" justify="between" align="center">
              <Button
                icon={themeMode === 'dark' ? <Sun /> : <Moon />}
                onClick={toggleThemeMode}
                plain
              />
            </Box>
            <Text className="gradient-heading-bot" weight="bold" size="large" alignSelf="center">CodeAstra</Text>
            <Box className="blur-background"
              elevation="large"
              flex
              overflow="auto"
              pad="small"
              background={themeMode === 'dark' ? '#333333' : ''}
              round="small"
              style={{ maxHeight: 'calc(100% - 100px)', flexShrink: 0 }}
              ref={chatContainerRef}
            >
              {conversations.map((message, index) => (
                <Box
                  overflow="auto"
                  key={index}
                  direction='column'
                  align={message.sender === 'user' ? 'end' : 'start'}
                  pad="large"
                  round
                  onClick={() => handleBoxClick(message.text)}
                  style={{
                    maxWidth: '80%',
                    wordWrap: 'break-word',
                    alignSelf: message.sender === 'user' ? 'end' : 'start',
                    background: message.sender === 'user' ? (themeMode === 'dark' ? '#02B388' : 'brand') : 'transparent',
                    marginLeft: message.sender === 'user' ? 'auto' : 'initial',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '4%',
                    margin: "2%"
                  }}
                >
                  {message.sender === 'user' && (
                    <Text>{message.text}</Text>
                  )}
                  {message.sender === 'bot' && (
                    <Box
                      className="blur-background"
                      elevation="large"
                      pad="medium"
                      background={themeMode === 'dark' ? '#222222' : '#ffffff'}
                      round
                      margin={{ vertical: 'small' }}
                      style={{ maxHeight: '300%', overflowY: 'auto' }}
                      gap="small"
                    >
                      <Text dangerouslySetInnerHTML={{ __html: message.text }} />
                    </Box>
                  )}
                </Box>
              ))}
              {(isLoadingSend) && (
                <Box align="center" margin={{ vertical: 'small' }}>
                  <TypingIndicator />
                </Box>
              )}
            </Box>
            <Box direction="row" align="center" gap="small">
              <TextInput
                placeholder="Type a message..."
                value={inputValue}
                onChange={event => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                flex
                disabled={isLoadingSend}
              />
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
                disabled={isLoadingSend}
              />
              <Button icon={<Attachment />} onClick={handleAttachmentClick} disabled={isLoadingSend} />
              <Button icon={<Send />} onClick={handleSendMessage} primary disabled={isLoadingSend} />
            </Box>
          </Box>
          <Button icon={<Close />} onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px' }} />
        </Box>
      </Layer>
      {isTextPopupOpen && (
        <Layer className="blur-background" onEsc={handleClosePopup} onClickOutside={handleClosePopup}>
          <Box overflow='auto' flex direction='column' pad="medium" gap="medium" width="medium" round="small" elevation="medium"
            style={{ maxHeight: '80vh', maxWidth: '80vw', overflow: 'auto' }}>
            <Text dangerouslySetInnerHTML={{ __html: popupText }} />
            <Tip content="Copy" dropProps={{ align: { left: 'right' } }}>
              <Button icon={<Clipboard />} justify="center" alignSelf="center" onClick={handleCopyText} />
            </Tip>
            <Button label="Close" onClick={handleClosePopup} />
          </Box>
        </Layer>
      )}
    </Grommet>
  );
};

export default ChatPopup;


// import React, { useState, useRef, useEffect } from 'react';
// import { Box, Button, Layer, Text, TextInput, Grommet, Tip } from 'grommet';
// import { Close, Send, Attachment, Moon, Sun, Clipboard } from 'grommet-icons';
// import { lightTheme, darkTheme } from './themes';
// import { fetchQuery } from './api/api';
// import interactions from './interactions.json';
// import { motion } from 'framer-motion';
// import '../App.css';

// const TypingIndicator = () => (
//   <Box direction="row" align="center" gap="small">
//     <motion.div
//       animate={{ scale: [1, 1.2, 1] }}
//       transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
//     >
//       <Text className="gradient-indicator" weight='bold'>thinking</Text>
//     </motion.div>
//     <motion.div
//       animate={{ scale: [1, 1.2, 1] }}
//       transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
//     >
//       <Box direction="row" align="center" gap="xsmall">
//         <Text>.</Text>
//         <Text>.</Text>
//         <Text>.</Text>
//       </Box>
//     </motion.div>
//   </Box>
// );

// const ChatPopup = ({ onClose }) => {
//   const [conversations, setConversations] = useState([[{ sender: 'bot', text: interactions.rules[0].responses[0].text }]]);
//   const [inputValue, setInputValue] = useState('');
//   const [themeMode, setThemeMode] = useState('dark');
//   const [isLoadingSend, setIsLoadingSend] = useState(false);
//   const [isTextPopupOpen, setIsTextPopupOpen] = useState(false);
//   const [popupText, setPopupText] = useState('');
//   const fileInputRef = useRef(null);
//   const chatContainerRef = useRef(null);

//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//     }
//   }, [conversations]);

//   const handleSendMessage = async () => {
//     if (inputValue.trim()) {
//       setIsLoadingSend(true);

//       const newConversations = [...conversations];
//       newConversations.push({ sender: 'user', text: inputValue });
//       setConversations(newConversations);
//       setInputValue('');

//       try {
//         const matchedRule = interactions.rules.find(rule =>
//           rule.keywords.some(keyword => inputValue.toLowerCase().includes(keyword.toLowerCase()))
//         );

//         if (matchedRule) {
//           const botResponse = matchedRule.responses[0];
//           newConversations.push({ sender: 'bot', ...botResponse });
//         } else {
//           const response = await fetchQuery(inputValue);
//           const botResponse = { sender: 'bot', text: response.result.output };
//           newConversations.push(botResponse);
//         }
//       } catch (error) {
//         console.error('Error fetching query:', error);
//       } finally {
//         setIsLoadingSend(false);
//       }
//     }
//   };

//   const handleAttachmentClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileInputChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       console.log('Selected file:', file);
//     }
//   };

//   const toggleThemeMode = () => {
//     setThemeMode(themeMode === 'light' ? 'dark' : 'light');
//   };

//   const handleKeyDown = (event) => {
//     if (event.key === 'Enter') {
//       handleSendMessage();
//     }
//   };

//   const handleBoxClick = (text) => {
//     setPopupText(text);
//     setIsTextPopupOpen(true);
//   };

//   const handleCopyText = () => {
//     navigator.clipboard.writeText(popupText);
//   };

//   const handleClosePopup = () => {
//     setIsTextPopupOpen(false);
//     setPopupText('');
//   };

//   return (
//     <Grommet theme={themeMode === 'dark' ? darkTheme : lightTheme} full>
//       <Layer className="blur-background" flex onEsc={onClose} onClickOutside={onClose} modal>
//         <Box
//           elevation='large'
//           direction="row"
//           width="500px"
//           height="600px"
//           pad="25px"
//           gap="small"
//           className="blur-background"
//           round="small"
//         >
//           <Box flex direction="column" gap="small">
//             <Box direction="row" justify="between" align="center">
//               <Button
//                 icon={themeMode === 'dark' ? <Sun /> : <Moon />}
//                 onClick={toggleThemeMode}
//                 plain
//               />
//             </Box>
//             <Text className="gradient-heading-bot" weight="bold" size="large" alignSelf="center">CodeAstra</Text>
//             <Box className="blur-background"
//               elevation="large"
//               flex
//               overflow="auto"
//               pad="small"
//               background={themeMode === 'dark' ? '#333333' : ''}
//               round="small"
//               style={{ maxHeight: 'calc(100% - 100px)', flexShrink: 0 }}
//               ref={chatContainerRef}
//             >
//               {conversations.map((message, index) => (
//                 <Box
//                   overflow="auto"
//                   key={index}
//                   direction='column'
//                   align={message.sender === 'user' ? 'end' : 'start'}
//                   pad="large"
//                   round
//                   onClick={() => handleBoxClick(message.text)}
//                   style={{
//                     maxWidth: '80%',
//                     wordWrap: 'break-word',
//                     alignSelf: message.sender === 'user' ? 'end' : 'start',
//                     background: message.sender === 'user' ? (themeMode === 'dark' ? '#02B388' : 'brand') : 'transparent',
//                     marginLeft: message.sender === 'user' ? 'auto' : 'initial',
//                     cursor: 'pointer',
//                     display:'flex',
//                     justifyContent:'center',
//                     padding:'4%',
//                     margin:"2%"                    
//                   }}
//                 >
//                   {message.sender === 'user' && (
//                     <Text>{message.text}</Text>
//                   )}
//                   {message.sender === 'bot' && (
//                     <Box
//                       className="blur-background"
//                       elevation="large"
//                       pad="medium"
//                       background={themeMode === 'dark' ? '#222222' : '#ffffff'}
//                       round
//                       margin={{ vertical: 'small' }}
//                       style={{ maxHeight: '300%', overflowY: 'auto' }}
//                       gap="small"
//                     >
//                       <Text dangerouslySetInnerHTML={{ __html: message.text }} />
//                     </Box>
//                   )}
//                 </Box>
//               ))}
//               {(isLoadingSend) && (
//                 <Box align="center" margin={{ vertical: 'small' }}>
//                   <TypingIndicator />
//                 </Box>
//               )}
//             </Box>
//             <Box direction="row" align="center" gap="small">
//               <TextInput
//                 placeholder="Type a message..."
//                 value={inputValue}
//                 onChange={event => setInputValue(event.target.value)}
//                 onKeyDown={handleKeyDown}
//                 flex
//               />
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 onChange={handleFileInputChange}
//               />
//               <Button icon={<Attachment />} onClick={handleAttachmentClick} />
//               <Button icon={<Send />} onClick={handleSendMessage} primary disabled={isLoadingSend} />
//             </Box>
//           </Box>
//           <Button icon={<Close />} onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px' }} />
//         </Box>
//       </Layer>
//       {isTextPopupOpen && (
//         <Layer className="blur-background" onEsc={handleClosePopup} onClickOutside={handleClosePopup}>
//           <Box overflow='auto' flex direction='column' pad="medium" gap="medium" width="medium" round="small" elevation="medium"
//           style={{ maxHeight: '80vh', maxWidth: '80vw', overflow: 'auto' }}>
//             <Text dangerouslySetInnerHTML={{ __html: popupText }} />
//             <Tip content="Copy" dropProps={{ align: { left: 'right' } }}>
//             <Button icon={<Clipboard />} justify="center" alignSelf="center" onClick={handleCopyText} />
//             </Tip>
//             <Button label="Close" onClick={handleClosePopup} />
//           </Box>
//         </Layer>
//       )}
//     </Grommet>
//   );
// };

// export default ChatPopup;


// import React, { useState, useRef, useEffect } from 'react';
// import { Box, Button, Layer, Text, TextInput, List, Grommet, Tip } from 'grommet';
// import { Close, Chat, Send, Attachment, Sidebar, Moon, Sun, Trash, Clipboard, Vulnerability } from 'grommet-icons';
// import { lightTheme, darkTheme } from './themes';
// import { fetchQuery } from './api/api';
// import interactions from './interactions.json';
// import { motion } from 'framer-motion';
// import '../App.css';

// const TypingIndicator = () => (
//   <Box direction="row" align="center" gap="small">
//     <motion.div
//       animate={{ scale: [1, 1.2, 1] }}
//       transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
//     >
//       <Text className="gradient-indicator" weight='bold'>thinking</Text>
//     </motion.div>
//     <motion.div
//       animate={{ scale: [1, 1.2, 1] }}
//       transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
//     >
//       <Box direction="row" align="center" gap="xsmall">
//         <Text>.</Text>
//         <Text>.</Text>
//         <Text>.</Text>
//       </Box>
//     </motion.div>
//   </Box>
// );

// const ChatPopup = ({ onClose }) => {
//   const [conversations, setConversations] = useState(() => {
//     const savedConversations = localStorage.getItem('conversations');
//     return savedConversations ? JSON.parse(savedConversations) : [[]];
//   });
//   const [currentConversation, setCurrentConversation] = useState(0);
//   const [inputValue, setInputValue] = useState('');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [themeMode, setThemeMode] = useState('dark');
//   const [isLoadingSend, setIsLoadingSend] = useState(false);
//   const [isTextPopupOpen, setIsTextPopupOpen] = useState(false);
//   const [popupText, setPopupText] = useState('');
//   const fileInputRef = useRef(null);
//   const chatContainerRefs = useRef([]);

//   useEffect(() => {
//     chatContainerRefs.current = conversations.map(() => React.createRef());
//   }, [conversations]);

//   useEffect(() => {
//     const chatRef = chatContainerRefs.current[currentConversation];
//     if (chatRef && chatRef.current) {
//       chatRef.current.scrollTop = chatRef.current.scrollHeight;
//     }
//   }, [conversations, currentConversation]);

//   useEffect(() => {
//     if (conversations.length === 1 && conversations[0].length === 0) {
//       const initialBotMessage = interactions.rules[0].responses[0];
//       setConversations([[{ sender: 'bot', ...initialBotMessage }]]);
//     }
//   }, [conversations]);

//   useEffect(() => {
//     localStorage.setItem('conversations', JSON.stringify(conversations));
//   }, [conversations]);

//   const handleSendMessage = async () => {
//     if (inputValue.trim()) {
//       setIsLoadingSend(true);

//       const newConversations = [...conversations];
//       newConversations[currentConversation].push({ sender: 'user', text: inputValue });
//       setConversations(newConversations);
//       setInputValue('');

//       try {
//         const matchedRule = interactions.rules.find(rule =>
//           rule.keywords.some(keyword => inputValue.toLowerCase().includes(keyword.toLowerCase()))
//         );

//         if (matchedRule) {
//           const botResponse = matchedRule.responses[0];
//           newConversations[currentConversation].push({ sender: 'bot', ...botResponse });
//         } else {
//           const response = await fetchQuery(inputValue);
//           const botResponse = { sender: 'bot', text: response.result.output };
//           newConversations[currentConversation].push(botResponse);
//         }
//       } catch (error) {
//         console.error('Error fetching query:', error);
//       } finally {
//         setIsLoadingSend(false);
//       }
//     }
//   };
  
//   const handleNewConversation = () => {
//     let newConversations;
//     if (inputValue.trim()) {
//       newConversations = [...conversations, [{ sender: 'user', text: inputValue }]];
//     } else {
//       newConversations = [...conversations, []];
//     }

//     if (newConversations[newConversations.length - 1].length === 0) {
//       const initialBotMessage = interactions.rules[0].responses[0];
//       newConversations[newConversations.length - 1].push({
//         sender: 'bot',
//         text: initialBotMessage.text,
//         buttons: initialBotMessage.buttons
//       });
//     }

//     setConversations(newConversations);
//     setCurrentConversation(newConversations.length - 1);
//     setInputValue('');
//   };

//   const handleToggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   const handleAttachmentClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileInputChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       console.log('Selected file:', file);
//     }
//   };

//   const toggleThemeMode = () => {
//     setThemeMode(themeMode === 'light' ? 'dark' : 'light');
//   };

//   const handleRemoveConversation = (index) => {
//     const updatedConversations = conversations.filter((_, i) => i !== index);
//     setConversations(updatedConversations);
//     if (index === currentConversation && updatedConversations.length > 0) {
//       setCurrentConversation(0);
//     } else if (updatedConversations.length === 0) {
//       setCurrentConversation(null);
//     } else if (index < currentConversation) {
//       setCurrentConversation(currentConversation - 1);
//     }
//   };

//   const handleKeyDown = (event) => {
//     if (event.key === 'Enter') {
//       handleSendMessage();
//     }
//   };

//   const handleBoxClick = (text) => {
//     setPopupText(text);
//     setIsTextPopupOpen(true);
//   };

//   const handleCopyText = () => {
//     navigator.clipboard.writeText(popupText);
//   };

//   const handleClosePopup = () => {
//     setIsTextPopupOpen(false);
//     setPopupText('');
//   };

//   return (
//     <Grommet theme={themeMode === 'dark' ? darkTheme : lightTheme} full>
//       <Layer className="blur-background" flex onEsc={onClose} onClickOutside={onClose} modal>
//         <Box
//           elevation='large'
//           direction="row"
//           width="large"
//           height="large"
//           pad="medium"
//           gap="medium"
//           className="blur-background"
//           round="small"
//         >
//           {/* {isSidebarOpen && (
//             <Box className="blur-background" overflow="auto" width="small"  pad="small" elevation="large" round="small">
//               <Text className="gradient-text" weight="bold" margin={{ bottom: 'small' }}>Chat History</Text>
//               <List 
//                 data={conversations.map((conv, index) => ({
//                   name: conv[0] ? `New Chat` : `New chat`,
//                   index
//                 }))}
//                 itemProps={{
//                   [currentConversation]: {
//                     background: themeMode === 'dark' ? '#02B388' : 'brand',
//                     round: 'small'
//                   }
//                 }}
//                 onClickItem={event => setCurrentConversation(event.index)}
//                 primaryKey="name"
//               >
//                 {(datum, index) => (
//                   <Box direction="row" justify="between" align="center" pad="1px" round>
//                     <Text weight="bold">{datum.name}</Text>
//                     <Button icon={<Trash />} onClick={() => handleRemoveConversation(index)} />
//                   </Box>
//                 )}
//               </List>
//             </Box>
//           )} */}
//           <Box flex direction="column" gap="small">
//             <Box direction="row" justify="between" align="center">
//               <Tip content="New Chat">
//                 <Button icon={<Chat />} onClick={handleNewConversation} />
//               </Tip>
//               <Button
//                 icon={themeMode === 'dark' ? <Sun /> : <Moon />}
//                 onClick={toggleThemeMode}
//                 plain
//               />
//             </Box>
//             <Text className="gradient-heading-bot" weight="bold" size="large" alignSelf="center">CodeAstra</Text>
//             <Box className="blur-background"
//               elevation="large"
//               flex
//               overflow="auto"
//               pad="small"
//               background={themeMode === 'dark' ? '#333333' : ''}
//               round="small"
//               style={{ maxHeight: 'calc(100% - 100px)', flexShrink: 0 }}
//               ref={chatContainerRefs.current[currentConversation]}
//             >
//               {conversations[currentConversation]?.map((message, index) => (
//                 <Box
//                   overflow="auto"
//                   key={index}
//                   direction='column'
//                   align={message.sender === 'user' ? 'end' : 'start'}
//                   pad="small"
//                   round
//                   onClick={() => handleBoxClick(message.text)}
//                   // style={{
//                   //   maxWidth: '80%',
//                   //   wordWrap: 'break-word',
//                   //   alignSelf: message.sender === 'user' ? 'end' : 'start',
//                   //   background: message.sender === 'user' ? (themeMode === 'dark' ? '#02B388' : 'brand') : 'transparent',
//                   //   marginLeft: message.sender === 'user' ? 'auto' : 'initial',
//                   //   cursor: 'pointer',
//                   // }}
//                   style={{
//                     maxWidth: '80%',
//                     wordWrap: 'break-word',
//                     alignSelf: message.sender === 'user' ? 'end' : 'start',
//                     background: message.sender === 'user' ? (themeMode === 'dark' ? '#02B388' : 'brand') : 'transparent',
//                     marginLeft: message.sender === 'user' ? 'auto' : 'initial',
//                     cursor: 'pointer',
//                     display:'flex',
//                     justifyContent:'center',
//                     padding:'4%',
//                     margin:"2%"                    

//                   }}
//                 >
//                   {message.sender === 'user' && (
//                     <Text>{message.text}</Text>
//                   )}
//                   {message.sender === 'bot' && (
//                     <Box
//                       className="blur-background"
//                       elevation="large"
//                       pad="medium"
//                       background={themeMode === 'dark' ? '#222222' : '#ffffff'}
//                       round
//                       margin={{ vertical: 'small' }}
//                       style={{ maxHeight: '300%', overflowY: 'auto' }}
//                       gap="small"
//                     >
//                       <Text dangerouslySetInnerHTML={{ __html: message.text }} />
//                     </Box>
//                   )}
//                 </Box>
//               ))}
//               {(isLoadingSend) && (
//                 <Box align="center" margin={{ vertical: 'small' }}>
//                   <TypingIndicator />
//                 </Box>
//               )}
//             </Box>
//             <Box direction="row" align="center" gap="small">
//               <TextInput
//                 placeholder="Type a message..."
//                 value={inputValue}
//                 onChange={event => setInputValue(event.target.value)}
//                 onKeyDown={handleKeyDown}
//                 flex
//               />
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 onChange={handleFileInputChange}
//               />
//               <Button icon={<Attachment />} onClick={handleAttachmentClick} />
//               <Button icon={<Send />} onClick={handleSendMessage} primary disabled={isLoadingSend} />
//             </Box>
//           </Box>
//           <Button icon={<Close />} onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px' }} />
//         </Box>
//       </Layer>
//       {isTextPopupOpen && (
//         <Layer className="blur-background" onEsc={handleClosePopup} onClickOutside={handleClosePopup}>
//           <Box overflow='auto' flex direction='column' pad="medium" gap="medium" width="medium" round="small" elevation="medium"
//           style={{ maxHeight: '80vh', maxWidth: '80vw', overflow: 'auto' }}>
//             <Text dangerouslySetInnerHTML={{ __html: popupText }} />
//             <Tip content="Copy" dropProps={{ align: { left: 'right' } }}>
//             <Button icon={<Clipboard />} justify="center" alignSelf="center" onClick={handleCopyText} />
//             </Tip>
//             <Button label="Close" onClick={handleClosePopup} />
//           </Box>
//         </Layer>
//       )}
//     </Grommet>
//   );
// };

// export default ChatPopup;














// Fully funtional with all changes code ********************************
// import React, { useState, useRef, useEffect } from 'react';
// import { Box, Button, Layer, Text, TextInput, List, Grommet, Tip } from 'grommet';
// import { Close, Chat, Send, Attachment, Sidebar, Moon, Sun, Trash } from 'grommet-icons';
// import { lightTheme, darkTheme } from './themes';
// import { fetchQuery, fetchRecommendation, fetchSummarization } from './api/api';
// import interactions from './interactions.json';
// import { motion } from 'framer-motion';


// const TypingIndicator = () => (
//   <Box direction="row" align="center" gap="small">
//       <motion.div
//         animate={{ scale: [1, 1.2, 1] }}
//         transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
//       >
//         <Text className="gradient-indicator" weight='bold'>thinking</Text>
//       </motion.div>
//       <motion.div
//         animate={{ scale: [1, 1.2, 1] }}
//         transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
//       >
//         <Box direction="row" align="center" gap="xsmall">
//           <Text>.</Text>
//           <Text>.</Text>
//           <Text>.</Text>
//         </Box>
//       </motion.div>
//     </Box>
  
// );

// const ChatPopup = ({ onClose }) => {
//   const [conversations, setConversations] = useState(() => {
//     const savedConversations = localStorage.getItem('conversations');
//     return savedConversations ? JSON.parse(savedConversations) : [[]];
//   });
//   const [currentConversation, setCurrentConversation] = useState(0);
//   const [inputValue, setInputValue] = useState('');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [themeMode, setThemeMode] = useState('dark');
//   const [isLoadingSend, setIsLoadingSend] = useState(false);
//   const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
//   const [isLoadingSummarization, setIsLoadingSummarization] = useState(false);
//   const fileInputRef = useRef(null);
//   const chatContainerRefs = useRef([]);

//   useEffect(() => {
//     chatContainerRefs.current = conversations.map(() => React.createRef());
//   }, [conversations]);

//   useEffect(() => {
//     const chatRef = chatContainerRefs.current[currentConversation];
//     if (chatRef && chatRef.current) {
//       chatRef.current.scrollTop = chatRef.current.scrollHeight;
//     }
//   }, [conversations, currentConversation]);

//   useEffect(() => {
//     if (conversations.length === 1 && conversations[0].length === 0) {
//       const initialBotMessage = interactions.rules[0].responses[0];
//       setConversations([[{ sender: 'bot', ...initialBotMessage }]]);
//     }
//   }, [conversations]);

//   useEffect(() => {
//     localStorage.setItem('conversations', JSON.stringify(conversations));
//   }, [conversations]);

//   const handleSendMessage = async () => {
//     if (inputValue.trim()) {
//       setIsLoadingSend(true);

//       const newConversations = [...conversations];
//       newConversations[currentConversation].push({ sender: 'user', text: inputValue });
//       setConversations(newConversations);
//       setInputValue('');

//       try {
//         const matchedRule = interactions.rules.find(rule =>
//           rule.keywords.some(keyword => inputValue.toLowerCase().includes(keyword.toLowerCase()))
//         );

//         if (matchedRule) {
//           const botResponse = matchedRule.responses[0];
//           newConversations[currentConversation].push({ sender: 'bot', ...botResponse });
//         } else {
//           const response = await fetchQuery(inputValue);
//           const botResponse = { sender: 'bot', text: response.result };
//           newConversations[currentConversation].push(botResponse);
//         }
//       } catch (error) {
//         console.error('Error fetching query:', error);
//       } finally {
//         setIsLoadingSend(false);
//       }
//     }
//   };

//   const handleNewConversation = () => {
//     let newConversations;
//     if (inputValue.trim()) {
//       newConversations = [...conversations, [{ sender: 'user', text: inputValue }]];
//     } else {
//       newConversations = [...conversations, []];
//     }

//     if (newConversations[newConversations.length - 1].length === 0) {
//       const initialBotMessage = interactions.rules[0].responses[0];
//       newConversations[newConversations.length - 1].push({
//         sender: 'bot',
//         text: initialBotMessage.text,
//         buttons: initialBotMessage.buttons
//       });
//     }

//     setConversations(newConversations);
//     setCurrentConversation(newConversations.length - 1);
//     setInputValue('');
//   };

//   const handleToggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   const handleAttachmentClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileInputChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       console.log('Selected file:', file);
//     }
//   };

//   const toggleThemeMode = () => {
//     setThemeMode(themeMode === 'light' ? 'dark' : 'light');
//   };

//   const handleRemoveConversation = (index) => {
//     const updatedConversations = conversations.filter((_, i) => i !== index);
//     setConversations(updatedConversations);
//     if (index === currentConversation && updatedConversations.length > 0) {
//       setCurrentConversation(0);
//     } else if (updatedConversations.length === 0) {
//       setCurrentConversation(null);
//     } else if (index < currentConversation) {
//       setCurrentConversation(currentConversation - 1);
//     }
//   };

//   const handleRecommendation = async () => {
//     setIsLoadingRecommendation(true);

//     try {
//       const response = await fetchRecommendation();

//       if (response.error) {
//         throw new Error(response.error);
//       }

//       const botResponse = `<strong>Recommendation:</strong><br/><strong>Tool:</strong> ${response.tool}<br/><strong>Solution:</strong> ${response.solution}`;
//       const updatedConversations = [...conversations];
//       updatedConversations[currentConversation].push({ sender: 'bot', text: botResponse });
//       setConversations(updatedConversations);
//     } catch (error) {
//       console.error('Error handling recommendation:', error);
//     } finally {
//       setIsLoadingRecommendation(false);
//     }
//   };

//   const handleSummarization = async () => {
//     setIsLoadingSummarization(true);

//     try {
//       const response = await fetchSummarization();

//       if (response.error) {
//         throw new Error(response.error);
//       }

//       const botResponse = `<strong>Summary:</strong><br/><strong>Tool:</strong> ${response.tool}<br/><strong>Solution:</strong> ${response.solution}`;
//       const updatedConversations = [...conversations];
//       updatedConversations[currentConversation].push({ sender: 'bot', text: botResponse });
//       setConversations(updatedConversations);
//     } catch (error) {
//       console.error('Error handling summarization:', error);
//     } finally {
//       setIsLoadingSummarization(false);
//     }
//   };

//   const handleKeyDown = (event) => {
//     if (event.key === 'Enter') {
//       handleSendMessage();
//     }
//   };

//   return (
//     <Grommet theme={themeMode === 'dark' ? darkTheme : lightTheme} full>
//       <Layer className="blur-background" flex onEsc={onClose} onClickOutside={onClose} modal>
//         <Box
//           direction="row"
//           width="large"
//           height="large"
//           pad="medium"
//           gap="medium"
//           className="blur-background"
//           round="small"
//         >
//           {isSidebarOpen && (
//             <Box className="blur-background" overflow="auto" width="small"  pad="small" elevation="large" round="small">
//               <Text className="gradient-text" weight="bold" margin={{ bottom: 'small' }}>Chat History</Text>
//               <List 
//                 data={conversations.map((conv, index) => ({
//                   name: conv[0] ? `New Chat` : `New chat`,
//                   index
//                 }))}
//                 itemProps={{
//                   [currentConversation]: {
//                     background: themeMode === 'dark' ? '#02B388' : 'brand',
//                     round: 'small'
//                   }
//                 }}
//                 onClickItem={event => setCurrentConversation(event.index)}
//                 primaryKey="name"
//               >
//                 {(datum, index) => (
//                   <Box direction="row" justify="between" align="center" pad="1px" round>
//                     <Text weight="bold">{datum.name}</Text>
//                     <Button icon={<Trash />} onClick={() => handleRemoveConversation(index)} />
//                   </Box>
//                 )}
//               </List>
//             </Box>
//           )}
//           <Box flex direction="column" gap="small">
//             <Box direction="row" justify="between" align="center">
//               <Tip content="Chat History">
//                 <Button icon={<Sidebar />} onClick={handleToggleSidebar} />
//               </Tip>
//               <Tip content="New Chat">
//                 <Button icon={<Chat />} onClick={handleNewConversation} />
//               </Tip>
//               <Button
//                 icon={themeMode === 'dark' ? <Sun /> : <Moon />}
//                 onClick={toggleThemeMode}
//                 plain
//               />
//             </Box>
//             <Text className="gradient-heading-bot" weight="bold" size="large" alignSelf="center">Z+SecureBot</Text>
//             <Box className="blur-background"
//               flex
//               overflow="auto"
//               pad="small"
//               background={themeMode === 'dark' ? '#333333' : 'light-3'}
//               round="small"
//               style={{ maxHeight: 'calc(100% - 100px)', flexShrink: 0 }}
//               ref={chatContainerRefs.current[currentConversation]}
//             >
//               {conversations[currentConversation]?.map((message, index) => (
//                 <Box
//                   key={index}
//                   direction='column'
//                   align={message.sender === 'user' ? 'end' : 'start'}
//                   pad="small"
//                   round
//                   style={{
//                     maxWidth: '80%',
//                     wordWrap: 'break-word',
//                     alignSelf: message.sender === 'user' ? 'end' : 'start',
//                     background: message.sender === 'user' ? (themeMode === 'dark' ? '#02B388' : 'brand') : 'transparent',
//                     marginLeft: message.sender === 'user' ? 'auto' : 'initial',
//                   }}
//                 >
//                   {message.sender === 'user' && (
//                     <Text>{message.text}</Text>
//                   )}
//                   {message.sender === 'bot' && (
//                     <Box
//                       elevation="large"
//                       pad="medium"
//                       background={themeMode === 'dark' ? '#222222' : '#ffffff'}
//                       round
//                       margin={{ vertical: 'small' }}
//                       style={{ maxHeight: '200px', overflowY: 'auto' }}
//                       gap="small"
//                     >
//                       <Text dangerouslySetInnerHTML={{ __html: message.text }} />
//                       {message.buttons && message.buttons.map((button, i) => (
//                         <Tip
//                           content={`This will give ${button.label === 'Summarization' ? 'Summarization' : 'Recommendation'} for the latest tool discovered in the Z+ tool`}
//                           dropProps={{ align: { left: 'right' } }}
//                           truncate={false}
//                           key={i}
//                         >
//                           <Button
//                             primary
//                             label={button.label}
//                             onClick={button.action === 'recommendation' ? handleRecommendation : handleSummarization}
//                             disabled={button.action === 'recommendation' ? isLoadingRecommendation : isLoadingSummarization}
//                           />
//                         </Tip>
//                       ))}
//                     </Box>
//                   )}
//                 </Box>
//               ))}
//               {(isLoadingSend || isLoadingRecommendation || isLoadingSummarization) && (
//                 <Box align="center" margin={{ vertical: 'small' }}>
//                   <TypingIndicator />
//                 </Box>
//               )}
//             </Box>
//             <Box direction="row" align="center" gap="small">
//               <TextInput
//                 placeholder="Type a message..."
//                 value={inputValue}
//                 onChange={event => setInputValue(event.target.value)}
//                 onKeyDown={handleKeyDown}
//                 flex
//               />
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 onChange={handleFileInputChange}
//               />
//               <Button icon={<Attachment />} onClick={handleAttachmentClick} />
//               <Button icon={<Send />} onClick={handleSendMessage} primary disabled={isLoadingSend} />
//             </Box>
//           </Box>
//           <Button icon={<Close />} onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px' }} />
//         </Box>
//       </Layer>
//     </Grommet>
//   );
// };

// export default ChatPopup;






















































// import React, { useState, useRef, useEffect } from 'react';
// import { Box, Button, Layer, Text, TextInput, List, Grommet, Tip, Spinner } from 'grommet';
// import { Close, Chat, Send, Attachment, Sidebar, Moon, Sun, Trash } from 'grommet-icons';
// import { lightTheme, darkTheme } from './themes';
// import { fetchQuery, fetchRecommendation, fetchSummarization } from './api/api';
// import interactions from './interactions.json';

// const ChatPopup = ({ onClose }) => {
//   const [conversations, setConversations] = useState(() => {
//     const savedConversations = localStorage.getItem('conversations');
//     return savedConversations ? JSON.parse(savedConversations) : [[]];
//   });
//   const [currentConversation, setCurrentConversation] = useState(0);
//   const [inputValue, setInputValue] = useState('');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [themeMode, setThemeMode] = useState('dark');
//   const [isLoadingSend, setIsLoadingSend] = useState(false);
//   const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
//   const [isLoadingSummarization, setIsLoadingSummarization] = useState(false);
//   const fileInputRef = useRef(null);
//   const chatContainerRefs = useRef([]);

//   useEffect(() => {
//     chatContainerRefs.current = conversations.map(() => React.createRef());
//   }, [conversations]);

//   useEffect(() => {
//     const chatRef = chatContainerRefs.current[currentConversation];
//     if (chatRef && chatRef.current) {
//       chatRef.current.scrollTop = chatRef.current.scrollHeight;
//     }
//   }, [conversations, currentConversation]);

//   useEffect(() => {
//     if (conversations.length === 1 && conversations[0].length === 0) {
//       const initialBotMessage = interactions.rules[0].responses[0];
//       setConversations([[{ sender: 'bot', ...initialBotMessage }]]);
//     }
//   }, [conversations]);

//   useEffect(() => {
//     localStorage.setItem('conversations', JSON.stringify(conversations));
//   }, [conversations]);

//   const handleSendMessage = async () => {
//     if (inputValue.trim()) {
//       setIsLoadingSend(true);

//       const newConversations = [...conversations];
//       newConversations[currentConversation].push({ sender: 'user', text: inputValue });
//       setConversations(newConversations);
//       setInputValue('');

//       try {
//         const matchedRule = interactions.rules.find(rule =>
//           rule.keywords.some(keyword => inputValue.toLowerCase().includes(keyword.toLowerCase()))
//         );

//         if (matchedRule) {
//           const botResponse = matchedRule.responses[0];
//           newConversations[currentConversation].push({ sender: 'bot', ...botResponse });
//         } else {
//           const response = await fetchQuery(inputValue);
//           const botResponse = { sender: 'bot', text: response.result };
//           newConversations[currentConversation].push(botResponse);
//         }
//       } catch (error) {
//         console.error('Error fetching query:', error);
//       } finally {
//         setIsLoadingSend(false);
//       }
//     }
//   };

//   const handleNewConversation = () => {
//     let newConversations;
//     if (inputValue.trim()) {
//       newConversations = [...conversations, [{ sender: 'user', text: inputValue }]];
//     } else {
//       newConversations = [...conversations, []];
//     }

//     if (newConversations[newConversations.length - 1].length === 0) {
//       const initialBotMessage = interactions.rules[0].responses[0];
//       newConversations[newConversations.length - 1].push({
//         sender: 'bot',
//         text: initialBotMessage.text,
//         buttons: initialBotMessage.buttons
//       });
//     }

//     setConversations(newConversations);
//     setCurrentConversation(newConversations.length - 1);
//     setInputValue('');
//   };

//   const handleToggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   const handleAttachmentClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileInputChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       console.log('Selected file:', file);
//     }
//   };

//   const toggleThemeMode = () => {
//     setThemeMode(themeMode === 'light' ? 'dark' : 'light');
//   };

//   const handleRemoveConversation = (index) => {
//     const updatedConversations = conversations.filter((_, i) => i !== index);
//     setConversations(updatedConversations);
//     if (index === currentConversation && updatedConversations.length > 0) {
//       setCurrentConversation(0);
//     } else if (updatedConversations.length === 0) {
//       setCurrentConversation(null);
//     } else if (index < currentConversation) {
//       setCurrentConversation(currentConversation - 1);
//     }
//   };

//   const handleRecommendation = async () => {
//     setIsLoadingRecommendation(true);

//     try {
//       const response = await fetchRecommendation();

//       if (response.error) {
//         throw new Error(response.error);
//       }

//       const botResponse = `<strong>Recommendation:</strong><br/><strong>Tool:</strong> ${response.tool}<br/><strong>Solution:</strong> ${response.solution}`;
//       const updatedConversations = [...conversations];
//       updatedConversations[currentConversation].push({ sender: 'bot', text: botResponse });
//       setConversations(updatedConversations);
//     } catch (error) {
//       console.error('Error handling recommendation:', error);
//     } finally {
//       setIsLoadingRecommendation(false);
//     }
//   };

//   const handleSummarization = async () => {
//     setIsLoadingSummarization(true);

//     try {
//       const response = await fetchSummarization();

//       if (response.error) {
//         throw new Error(response.error);
//       }

//       const botResponse = `<strong>Summary:</strong><br/><strong>Tool:</strong> ${response.tool}<br/><strong>Solution:</strong> ${response.solution}`;
//       const updatedConversations = [...conversations];
//       updatedConversations[currentConversation].push({ sender: 'bot', text: botResponse });
//       setConversations(updatedConversations);
//     } catch (error) {
//       console.error('Error handling summarization:', error);
//     } finally {
//       setIsLoadingSummarization(false);
//     }
//   };

//   const handleKeyDown = (event) => {
//     if (event.key === 'Enter') {
//       handleSendMessage();
//     }
//   };

//   return (
//     <Grommet theme={themeMode === 'dark' ? darkTheme : lightTheme} full>
//       <Layer className="blur-background" flex onEsc={onClose} onClickOutside={onClose} modal>
//         <Box
//           direction="row"
//           width="large"
//           height="large"
//           pad="medium"
//           gap="medium"
//           className="blur-background"
//           round="small"
//         >
//           {isSidebarOpen && (
//             <Box className="blur-background" overflow="auto" width="small"  pad="small" elevation="large" round="small">
//               <Text className="gradient-text" weight="bold" margin={{ bottom: 'small' }}>Chat History</Text>
//               <List 
//                 data={conversations.map((conv, index) => ({
//                   name: conv[0] ? `New Chat` : `New chat`,
//                   index
//                 }))}
//                 itemProps={{
//                   [currentConversation]: {
//                     background: themeMode === 'dark' ? '#02B388' : 'brand',
//                     round: 'small'
//                   }
//                 }}
//                 onClickItem={event => setCurrentConversation(event.index)}
//                 primaryKey="name"
//               >
//                 {(datum, index) => (
//                   <Box direction="row" justify="between" align="center" pad="1px" round>
//                     <Text>{datum.name}</Text>
//                     <Button icon={<Trash />} onClick={() => handleRemoveConversation(index)} />
//                   </Box>
//                 )}
//               </List>
//             </Box>
//           )}
//           <Box flex direction="column" gap="small">
//             <Box direction="row" justify="between" align="center">
//               <Tip content="Chat History">
//                 <Button icon={<Sidebar />} onClick={handleToggleSidebar} />
//               </Tip>
//               <Tip content="New Chat">
//                 <Button icon={<Chat />} onClick={handleNewConversation} />
//               </Tip>
//               <Button
//                 icon={themeMode === 'dark' ? <Sun /> : <Moon />}
//                 onClick={toggleThemeMode}
//                 plain
//               />
//             </Box>
//             <Text className="gradient-heading-bot" weight="bold" size="large" alignSelf="center">Z+SecureBot</Text>
//             <Box className="blur-background"
//               flex
//               overflow="auto"
//               pad="small"
//               background={themeMode === 'dark' ? '#333333' : 'light-3'}
//               round="small"
//               style={{ maxHeight: 'calc(100% - 100px)', flexShrink: 0 }}
//               ref={chatContainerRefs.current[currentConversation]}
//             >
//               {conversations[currentConversation]?.map((message, index) => (
//                 <Box
//                   key={index}
//                   direction='column'
//                   align={message.sender === 'user' ? 'end' : 'start'}
//                   pad="small"
//                   round
//                   style={{
//                     maxWidth: '80%',
//                     wordWrap: 'break-word',
//                     alignSelf: message.sender === 'user' ? 'end' : 'start',
//                     background: message.sender === 'user' ? (themeMode === 'dark' ? '#02B388' : 'brand') : 'transparent',
//                     marginLeft: message.sender === 'user' ? 'auto' : 'initial',
//                   }}
//                 >
//                   {message.sender === 'user' && (
//                     <Text>{message.text}</Text>
//                   )}
//                   {message.sender === 'bot' && (
//                     <Box
//                       elevation="large"
//                       pad="medium"
//                       background={themeMode === 'dark' ? '#222222' : '#ffffff'}
//                       round
//                       margin={{ vertical: 'small' }}
//                       style={{ maxHeight: '200px', overflowY: 'auto' }}
//                       gap="small"
//                     >
//                       <Text dangerouslySetInnerHTML={{ __html: message.text }} />
//                       {message.buttons && message.buttons.map((button, i) => (
//                         <Tip
//                           content={`This will give ${button.label === 'Summarization' ? 'Summarization' : 'Recommendation'} for the latest tool discovered in the Z+ tool`}
//                           dropProps={{ align: { left: 'right' } }}
//                           truncate={false}
//                           key={i}
//                         >
//                           <Button
//                             primary
//                             label={button.label}
//                             onClick={button.action === 'recommendation' ? handleRecommendation : handleSummarization}
//                             disabled={button.action === 'recommendation' ? isLoadingRecommendation : isLoadingSummarization}
//                           />
//                         </Tip>
//                       ))}
//                     </Box>
//                   )}
//                 </Box>
//               ))}
//               {isLoadingSend && (
//                 <Box align="center" margin={{ vertical: 'small' }}>
//                   <Spinner size="medium" />
//                 </Box>
//               )}
//               {(isLoadingRecommendation || isLoadingSummarization) && (
//                 <Box align="center" margin={{ vertical: 'small' }}>
//                   <Spinner size="medium" />
//                 </Box>
//               )}
//             </Box>
//             <Box direction="row" align="center" gap="small">
//               <TextInput
//                 placeholder="Type a message..."
//                 value={inputValue}
//                 onChange={event => setInputValue(event.target.value)}
//                 onKeyDown={handleKeyDown}
//                 flex
//               />
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 onChange={handleFileInputChange}
//               />
//               <Button icon={<Attachment />} onClick={handleAttachmentClick} />
//               <Button icon={<Send />} onClick={handleSendMessage} primary disabled={isLoadingSend} />
//             </Box>
//           </Box>
//           <Button icon={<Close />} onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px' }} />
//         </Box>
//       </Layer>
//     </Grommet>
//   );
// };

// export default ChatPopup;




//  Latest functional code #########################################################
// import React, { useState, useRef, useEffect } from 'react';
// import { Box, Button, Layer, Text, TextInput, List, Grommet, Tip } from 'grommet';
// import { Close, Chat, Send, Attachment, Sidebar, Moon, Sun, Trash } from 'grommet-icons';
// import { lightTheme, darkTheme } from './themes';
// import { fetchQuery, fetchRecommendation, fetchSummarization } from './api/api';
// import interactions from './interactions.json';

// const ChatPopup = ({ onClose }) => {
//   const [conversations, setConversations] = useState(() => {
//     const savedConversations = localStorage.getItem('conversations');
//     return savedConversations ? JSON.parse(savedConversations) : [[]];
//   });
//   const [currentConversation, setCurrentConversation] = useState(0);
//   const [inputValue, setInputValue] = useState('');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [themeMode, setThemeMode] = useState('dark');
//   const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
//   const [isLoadingSummarization, setIsLoadingSummarization] = useState(false);
//   const [isLoadingSend, setIsLoadingSend] = useState(false);
//   const fileInputRef = useRef(null);
//   const chatContainerRefs = useRef([]);

//   useEffect(() => {
//     chatContainerRefs.current = conversations.map(() => React.createRef());
//   }, [conversations]);

//   useEffect(() => {
//     const chatRef = chatContainerRefs.current[currentConversation];
//     if (chatRef && chatRef.current) {
//       chatRef.current.scrollTop = chatRef.current.scrollHeight;
//     }
//   }, [conversations, currentConversation]);

//   useEffect(() => {
//     if (conversations.length === 1 && conversations[0].length === 0) {
//       const initialBotMessage = interactions.rules[0].responses[0];
//       setConversations([[{ sender: 'bot', ...initialBotMessage }]]);
//     }
//   }, [conversations]);

//   useEffect(() => {
//     localStorage.setItem('conversations', JSON.stringify(conversations));
//   }, [conversations]);

//   const handleSendMessage = async () => {
//     if (inputValue.trim()) {
//       setIsLoadingSend(true);

//       const newConversations = [...conversations];
//       newConversations[currentConversation].push({ sender: 'user', text: inputValue });
//       setConversations(newConversations);
//       setInputValue('');

//       try {
//         const matchedRule = interactions.rules.find(rule =>
//           rule.keywords.some(keyword => inputValue.toLowerCase().includes(keyword.toLowerCase()))
//         );

//         if (matchedRule) {
//           const botResponse = matchedRule.responses[0];
//           newConversations[currentConversation].push({ sender: 'bot', ...botResponse });
//         } else {
//           const response = await fetchQuery(inputValue);
//           const botResponse = { sender: 'bot', text: response.result };
//           newConversations[currentConversation].push(botResponse);
//         }
//       } catch (error) {
//         console.error('Error fetching query:', error);
//       } finally {
//         setIsLoadingSend(false);
//       }
//     }
//   };

//   const handleNewConversation = () => {
//     let newConversations;
//     if (inputValue.trim()) {
//       newConversations = [...conversations, [{ sender: 'user', text: inputValue }]];
//     } else {
//       newConversations = [...conversations, []];
//     }

//     if (newConversations[newConversations.length - 1].length === 0) {
//       const initialBotMessage = interactions.rules[0].responses[0];
//       newConversations[newConversations.length - 1].push({
//         sender: 'bot',
//         text: initialBotMessage.text,
//         buttons: initialBotMessage.buttons
//       });
//     }

//     setConversations(newConversations);
//     setCurrentConversation(newConversations.length - 1);
//     setInputValue('');
//   };

//   const handleToggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   const handleAttachmentClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileInputChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       console.log('Selected file:', file);
//     }
//   };

//   const toggleThemeMode = () => {
//     setThemeMode(themeMode === 'light' ? 'dark' : 'light');
//   };

//   const handleRemoveConversation = (index) => {
//     const updatedConversations = conversations.filter((_, i) => i !== index);
//     setConversations(updatedConversations);
//     if (index === currentConversation && updatedConversations.length > 0) {
//       setCurrentConversation(0);
//     } else if (updatedConversations.length === 0) {
//       setCurrentConversation(null);
//     } else if (index < currentConversation) {
//       setCurrentConversation(currentConversation - 1);
//     }
//   };

//   const handleRecommendation = async () => {
//     setIsLoadingRecommendation(true);

//     try {
//       const response = await fetchRecommendation();

//       if (response.error) {
//         throw new Error(response.error);
//       }

//       const botResponse = `<strong>Recommendation:</strong><br/><strong>Tool:</strong> ${response.tool}<br/><strong>Solution:</strong> ${response.solution}`;
//       const updatedConversations = [...conversations];
//       updatedConversations[currentConversation].push({ sender: 'bot', text: botResponse });
//       setConversations(updatedConversations);
//     } catch (error) {
//       console.error('Error handling recommendation:', error);
//     } finally {
//       setIsLoadingRecommendation(false);
//     }
//   };

//   const handleSummarization = async () => {
//     setIsLoadingSummarization(true);

//     try {
//       const response = await fetchSummarization();

//       if (response.error) {
//         throw new Error(response.error);
//       }

//       const botResponse = `<strong>Summary:</strong><br/><strong>Tool:</strong> ${response.tool}<br/><strong>Solution:</strong> ${response.solution}`;
//       const updatedConversations = [...conversations];
//       updatedConversations[currentConversation].push({ sender: 'bot', text: botResponse });
//       setConversations(updatedConversations);
//     } catch (error) {
//       console.error('Error handling summarization:', error);
//     } finally {
//       setIsLoadingSummarization(false);
//     }
//   };

//   const handleKeyDown = (event) => {
//     if (event.key === 'Enter') {
//       handleSendMessage();
//     }
//   };

//   return (
//     <Grommet theme={themeMode === 'dark' ? darkTheme : lightTheme} full>
//       <Layer className="blur-background" flex onEsc={onClose} onClickOutside={onClose} modal>
//         <Box
//           direction="row"
//           width="large"
//           height="large"
//           pad="medium"
//           gap="medium"
//           className="blur-background"
//           round="small"
//         >
//           {isSidebarOpen && (
//             <Box className="blur-background" overflow="auto" width="small"  pad="small" elevation="large" round="small">
//               <Text className="gradient-text" weight="bold" margin={{ bottom: 'small' }}>Chat History</Text>
//               <List 
//                 data={conversations.map((conv, index) => ({
//                   name: conv[0] ? `New Chat` : `New chat`,
//                   index
//                 }))}
//                 itemProps={{
//                   [currentConversation]: {
//                     background: themeMode === 'dark' ? '#02B388' : 'brand',
//                     round: 'small'
//                   }
//                 }}
//                 onClickItem={event => setCurrentConversation(event.index)}
//                 primaryKey="name"
//               >
//                 {(datum, index) => (
//                   <Box direction="row" justify="between" align="center" pad="1px" round>
//                     <Text>{datum.name}</Text>
//                     <Button icon={<Trash />} onClick={() => handleRemoveConversation(index)} />
//                   </Box>
//                 )}
//               </List>
//             </Box>
//           )}
//           <Box flex direction="column" gap="small">
//             <Box direction="row" justify="between" align="center">
//               <Tip content="Chat History">
//                 <Button icon={<Sidebar />} onClick={handleToggleSidebar} />
//               </Tip>
//               <Tip content="New Chat">
//                 <Button icon={<Chat />} onClick={handleNewConversation} />
//               </Tip>
//               <Button
//                 icon={themeMode === 'dark' ? <Sun /> : <Moon />}
//                 onClick={toggleThemeMode}
//                 plain
//               />
//             </Box>
//             <Text className="gradient-heading-bot" weight="bold" size="large" alignSelf="center">Z+SecureBot</Text>
//             <Box className="blur-background"
//               flex
//               overflow="auto"
//               pad="small"
//               background={themeMode === 'dark' ? '#333333' : 'light-3'}
//               round="small"
//               style={{ maxHeight: 'calc(100% - 100px)', flexShrink: 0 }}
//               ref={chatContainerRefs.current[currentConversation]}
//             >
//               {conversations[currentConversation]?.map((message, index) => (
//                 <Box
//                   key={index}
//                   direction='column'
//                   align={message.sender === 'user' ? 'end' : 'start'}
//                   pad="small"
//                   round
//                   style={{
//                     maxWidth: '80%',
//                     wordWrap: 'break-word',
//                     alignSelf: message.sender === 'user' ? 'end' : 'start',
//                     background: message.sender === 'user' ? (themeMode === 'dark' ? '#02B388' : 'brand') : 'transparent',
//                     marginLeft: message.sender === 'user' ? 'auto' : 'initial',
//                   }}
//                 >
//                   {message.sender === 'user' ? (
//                     <Text>{message.text}</Text>
//                   ) : (
//                     <Box
//                       elevation="large"
//                       pad="medium"
//                       background={themeMode === 'dark' ? '#222222' : '#ffffff'}
//                       round
//                       margin={{ vertical: 'small' }}
//                       style={{ maxHeight: '200px', overflowY: 'auto' }}
//                       gap="small"
//                     >
//                       <Text dangerouslySetInnerHTML={{ __html: message.text }} />
//                       {message.buttons && message.buttons.map((button, i) => (
//                         <Tip
//                           content={`This will give ${button.label === 'Summarization' ? 'Summarization' : 'Recommendation'} for the latest tool discovered in the Z+ tool`}
//                           dropProps={{ align: { left: 'right' } }}
//                           truncate={false}
//                           key={i}
//                         >
//                           <Button
//                             primary
//                             label={button.label}
//                             onClick={button.action === 'recommendation' ? handleRecommendation : handleSummarization}
//                             disabled={button.action === 'recommendation' ? isLoadingRecommendation : isLoadingSummarization}
//                           />
//                         </Tip>
//                       ))}
//                     </Box>
//                   )}
//                 </Box>
//               ))}
//             </Box>
//             <Box direction="row" align="center" gap="small">
//               <TextInput
//                 placeholder="Type a message..."
//                 value={inputValue}
//                 onChange={event => setInputValue(event.target.value)}
//                 onKeyDown={handleKeyDown}
//                 flex
//               />
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 onChange={handleFileInputChange}
//               />
//               <Button icon={<Attachment />} onClick={handleAttachmentClick} />
//               <Button icon={<Send />} onClick={handleSendMessage} primary disabled={isLoadingSend} />
//             </Box>
//           </Box>
//           <Button icon={<Close />} onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px' }} />
//         </Box>
//       </Layer>
//     </Grommet>
//   );
// };

// export default ChatPopup;





//Working code **********************************************************************


// import React, { useState, useRef, useEffect } from 'react';
// import { Box, Button, Layer, Text, TextInput, List, Grommet, Tip } from 'grommet';
// import { Close, Chat, Send, Attachment, Sidebar, Moon, Sun, Trash } from 'grommet-icons';
// import { lightTheme, darkTheme } from './themes';
// import { fetchQuery, fetchRecommendation, fetchSummarization } from './api/api';
// import interactions from './interactions.json';

// const ChatPopup = ({ onClose }) => {
//   const [conversations, setConversations] = useState(() => {
//     const savedConversations = localStorage.getItem('conversations');
//     return savedConversations ? JSON.parse(savedConversations) : [[]];
//   });
//   const [currentConversation, setCurrentConversation] = useState(0);
//   const [inputValue, setInputValue] = useState('');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [themeMode, setThemeMode] = useState('dark');
//   const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
//   const [isLoadingSummarization, setIsLoadingSummarization] = useState(false);
//   const [isLoadingSend, setIsLoadingSend] = useState(false);
//   const fileInputRef = useRef(null);
//   const chatContainerRefs = useRef([]);

//   useEffect(() => {
//     chatContainerRefs.current = conversations.map(() => React.createRef());
//   }, [conversations]);

//   useEffect(() => {
//     const chatRef = chatContainerRefs.current[currentConversation];
//     if (chatRef && chatRef.current) {
//       chatRef.current.scrollTop = chatRef.current.scrollHeight;
//     }
//   }, [conversations, currentConversation]);

//   useEffect(() => {
//     if (conversations.length === 1 && conversations[0].length === 0) {
//       const initialBotMessage = interactions.rules[0].responses[0];
//       setConversations([[{ sender: 'bot', ...initialBotMessage }]]);
//     }
//   }, [conversations]);

//   useEffect(() => {
//     localStorage.setItem('conversations', JSON.stringify(conversations));
//   }, [conversations]);

//   const handleSendMessage = async () => {
//     if (inputValue.trim()) {
//       setIsLoadingSend(true);

//       const newConversations = [...conversations];
//       newConversations[currentConversation].push({ sender: 'user', text: inputValue });
//       setConversations(newConversations);
//       setInputValue('');

//       try {
//         const matchedRule = interactions.rules.find(rule =>
//           rule.keywords.some(keyword => inputValue.toLowerCase().includes(keyword.toLowerCase()))
//         );

//         if (matchedRule) {
//           const botResponse = matchedRule.responses[0];
//           newConversations[currentConversation].push({ sender: 'bot', ...botResponse });
//         } else {
//           const response = await fetchQuery(inputValue);
//           const botResponse = { sender: 'bot', text: response.result };
//           newConversations[currentConversation].push(botResponse);
//         }
//       } catch (error) {
//         console.error('Error fetching query:', error);
//       } finally {
//         setIsLoadingSend(false);
//       }
//     }
//   };

//   const handleNewConversation = () => {
//     let newConversations;
//     if (inputValue.trim()) {
//       newConversations = [...conversations, [{ sender: 'user', text: inputValue }]];
//     } else {
//       newConversations = [...conversations, []];
//     }

//     if (newConversations[newConversations.length - 1].length === 0) {
//       const initialBotMessage = interactions.rules[0].responses[0];
//       newConversations[newConversations.length - 1].push({
//         sender: 'bot',
//         text: initialBotMessage.text,
//         buttons: initialBotMessage.buttons
//       });
//     }

//     setConversations(newConversations);
//     setCurrentConversation(newConversations.length - 1);
//     setInputValue('');
//   };

//   const handleToggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   const handleAttachmentClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileInputChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       console.log('Selected file:', file);
//     }
//   };

//   const toggleThemeMode = () => {
//     setThemeMode(themeMode === 'light' ? 'dark' : 'light');
//   };

//   const handleRemoveConversation = (index) => {
//     const updatedConversations = conversations.filter((_, i) => i !== index);
//     setConversations(updatedConversations);
//     if (index === currentConversation && updatedConversations.length > 0) {
//       setCurrentConversation(0);
//     } else if (updatedConversations.length === 0) {
//       setCurrentConversation(null);
//     } else if (index < currentConversation) {
//       setCurrentConversation(currentConversation - 1);
//     }
//   };

//   const handleRecommendation = async () => {
//     setIsLoadingRecommendation(true);

//     try {
//       const response = await fetchRecommendation();

//       if (response.error) {
//         throw new Error(response.error);
//       }

//       const botResponse = `<strong>Recommendation:</strong><br/><strong>Tool:</strong> ${response.tool}<br/><strong>Solution:</strong> ${response.solution}`;
//       const updatedConversations = [...conversations];
//       updatedConversations[currentConversation].push({ sender: 'bot', text: botResponse });
//       setConversations(updatedConversations);
//     } catch (error) {
//       console.error('Error handling recommendation:', error);
//     } finally {
//       setIsLoadingRecommendation(false);
//     }
//   };

//   const handleSummarization = async () => {
//     setIsLoadingSummarization(true);

//     try {
//       const response = await fetchSummarization();

//       if (response.error) {
//         throw new Error(response.error);
//       }

//       const botResponse = `<strong>Summary:</strong><br/><strong>Tool:</strong> ${response.tool}<br/><strong>Solution:</strong> ${response.solution}`;
//       const updatedConversations = [...conversations];
//       updatedConversations[currentConversation].push({ sender: 'bot', text: botResponse });
//       setConversations(updatedConversations);
//     } catch (error) {
//       console.error('Error handling summarization:', error);
//     } finally {
//       setIsLoadingSummarization(false);
//     }
//   };

//   const handleKeyDown = (event) => {
//     if (event.key === 'Enter') {
//       handleSendMessage();
//     }
//   };

//   return (
//     <Grommet theme={themeMode === 'dark' ? darkTheme : lightTheme} full>
//       <Layer flex onEsc={onClose} onClickOutside={onClose} modal>
//         <Box
//           direction="row"
//           width="large"
//           height="large"
//           pad="medium"
//           gap="medium"
//           className="blur-background"
//           round="small"
//         >
//           {isSidebarOpen && (
//             <Box overflow="auto" width="small" background={themeMode === 'dark' ? '#222222' : '#ffffff'} pad="small" elevation="large" round="small">
//               <Text weight="bold" margin={{ bottom: 'small' }}>Chat History</Text>
//               <List
//                 data={conversations.map((conv, index) => ({
//                   name: conv[0] ? `New Chat` : `New chat`,
//                   index
//                 }))}
//                 itemProps={{
//                   [currentConversation]: {
//                     background: themeMode === 'dark' ? '#02B388' : 'brand',
//                     round: 'small'
//                   }
//                 }}
//                 onClickItem={event => setCurrentConversation(event.index)}
//                 primaryKey="name"
//               >
//                 {(datum, index) => (
//                   <Box direction="row" justify="between" align="center" pad="1px" round>
//                     <Text>{datum.name}</Text>
//                     <Button icon={<Trash />} onClick={() => handleRemoveConversation(index)} />
//                   </Box>
//                 )}
//               </List>
//             </Box>
//           )}
//           <Box flex direction="column" gap="small">
//             <Box direction="row" justify="between" align="center">
//               <Tip content="Chat History">
//                 <Button icon={<Sidebar />} onClick={handleToggleSidebar} />
//               </Tip>
//               <Tip content="New Chat">
//                 <Button icon={<Chat />} onClick={handleNewConversation} />
//               </Tip>
//               <Button
//                 icon={themeMode === 'dark' ? <Sun /> : <Moon />}
//                 onClick={toggleThemeMode}
//                 plain
//               />
//             </Box>
//             <Text weight="bold" size="large" alignSelf="center">Z+SecureBot</Text>
//             <Box
//               flex
//               overflow="auto"
//               pad="small"
//               background={themeMode === 'dark' ? '#333333' : 'light-3'}
//               round="small"
//               style={{ maxHeight: 'calc(100% - 100px)', flexShrink: 0 }}
//               ref={chatContainerRefs.current[currentConversation]}
//             >
//               {conversations[currentConversation]?.map((message, index) => (
//                 <Box
//                   key={index}
//                   direction='column'
//                   align={message.sender === 'user' ? 'end' : 'start'}
//                   pad="small"
//                   round
//                   style={{
//                     maxWidth: '80%',
//                     wordWrap: 'break-word',
//                     alignSelf: message.sender === 'user' ? 'end' : 'start',
//                     background: message.sender === 'user' ? (themeMode === 'dark' ? '#02B388' : 'brand') : 'transparent',
//                     marginLeft: message.sender === 'user' ? 'auto' : 'initial',
//                   }}
//                 >
//                   {message.sender === 'user' ? (
//                     <Text>{message.text}</Text>
//                   ) : (
//                     <Box
//                       elevation="large"
//                       pad="medium"
//                       background={themeMode === 'dark' ? '#222222' : '#ffffff'}
//                       round
//                       margin={{ vertical: 'small' }}
//                       style={{ maxHeight: '200px', overflowY: 'auto' }}
//                       gap="small"
//                     >
//                       <Text dangerouslySetInnerHTML={{ __html: message.text }} />
//                       {message.buttons && message.buttons.map((button, i) => (
//                         <Tip
//                           content={`This will give ${button.label === 'Summarization' ? 'Summarization' : 'Recommendation'} for the latest tool discovered in the Z+ tool`}
//                           dropProps={{ align: { left: 'right' } }}
//                           truncate={false}
//                           key={i}
//                         >
//                           <Button
//                             primary
//                             label={button.label}
//                             onClick={button.action === 'recommendation' ? handleRecommendation : handleSummarization}
//                             disabled={button.action === 'recommendation' ? isLoadingRecommendation : isLoadingSummarization}
//                           />
//                         </Tip>
//                       ))}
//                     </Box>
//                   )}
//                 </Box>
//               ))}
//             </Box>
//             <Box direction="row" align="center" gap="small">
//               <TextInput
//                 placeholder="Type a message..."
//                 value={inputValue}
//                 onChange={event => setInputValue(event.target.value)}
//                 onKeyDown={handleKeyDown}
//                 flex
//               />
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 onChange={handleFileInputChange}
//               />
//               <Button icon={<Attachment />} onClick={handleAttachmentClick} />
//               <Button icon={<Send />} onClick={handleSendMessage} primary disabled={isLoadingSend} />
//             </Box>
//           </Box>
//           <Button icon={<Close />} onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px' }} />
//         </Box>
//       </Layer>
//     </Grommet>
//   );
// };

// export default ChatPopup;


// import React, { useState, useRef, useEffect } from 'react';
// import { Box, Button, Layer, Text, TextInput, List, Grommet, Tip } from 'grommet';
// import { Close, Chat, Send, Attachment, Sidebar, Moon, Sun, Trash } from 'grommet-icons';
// import { lightTheme, darkTheme } from './themes';
// import { fetchQuery, fetchRecommendation, fetchSummarization } from './api/api';
// import interactions from './interactions.json';

// const ChatPopup = ({ onClose }) => {
//   const [conversations, setConversations] = useState(() => {
//     const savedConversations = localStorage.getItem('conversations');
//     return savedConversations ? JSON.parse(savedConversations) : [[]];
//   });
//   const [currentConversation, setCurrentConversation] = useState(0);
//   const [inputValue, setInputValue] = useState('');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [themeMode, setThemeMode] = useState('dark');
//   const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
//   const [isLoadingSummarization, setIsLoadingSummarization] = useState(false);
//   const [isLoadingSend, setIsLoadingSend] = useState(false);
//   const fileInputRef = useRef(null);
//   const chatContainerRefs = useRef([]);

//   useEffect(() => {
//     chatContainerRefs.current = conversations.map(() => React.createRef());
//   }, [conversations]);

//   useEffect(() => {
//     const chatRef = chatContainerRefs.current[currentConversation];
//     if (chatRef && chatRef.current) {
//       chatRef.current.scrollTop = chatRef.current.scrollHeight;
//     }
//   }, [conversations, currentConversation]);

//   useEffect(() => {
//     if (conversations.length === 1 && conversations[0].length === 0) {
//       const initialBotMessage = interactions.rules[0].responses[0];
//       setConversations([[{ sender: 'bot', ...initialBotMessage }]]);
//     }
//   }, [conversations]);

//   useEffect(() => {
//     localStorage.setItem('conversations', JSON.stringify(conversations));
//   }, [conversations]);

//   const handleSendMessage = async () => {
//     if (inputValue.trim()) {
//       setIsLoadingSend(true);

//       const newConversations = [...conversations];
//       newConversations[currentConversation].push({ sender: 'user', text: inputValue });
//       setConversations(newConversations);
//       setInputValue('');

//       try {
//         const matchedRule = interactions.rules.find(rule =>
//           rule.keywords.some(keyword => inputValue.toLowerCase().includes(keyword.toLowerCase()))
//         );

//         if (matchedRule) {
//           const botResponse = matchedRule.responses[0];
//           newConversations[currentConversation].push({ sender: 'bot', ...botResponse });
//         } else {
//           const response = await fetchQuery(inputValue);
//           const botResponse = { sender: 'bot', text: response.result };
//           newConversations[currentConversation].push(botResponse);
//         }
//       } catch (error) {
//         console.error('Error fetching query:', error);
//       } finally {
//         setIsLoadingSend(false);
//       }
//     }
//   };

//   const handleNewConversation = () => {
//     let newConversations;
//     if (inputValue.trim()) {
//       newConversations = [...conversations, [{ sender: 'user', text: inputValue }]];
//     } else {
//       newConversations = [...conversations, []];
//     }

//     if (newConversations[newConversations.length - 1].length === 0) {
//       const initialBotMessage = interactions.rules[0].responses[0];
//       newConversations[newConversations.length - 1].push({
//         sender: 'bot',
//         text: initialBotMessage.text,
//         buttons: initialBotMessage.buttons
//       });
//     }

//     setConversations(newConversations);
//     setCurrentConversation(newConversations.length - 1);
//     setInputValue('');
//   };

//   const handleToggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   const handleAttachmentClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileInputChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       console.log('Selected file:', file);
//     }
//   };

//   const toggleThemeMode = () => {
//     setThemeMode(themeMode === 'light' ? 'dark' : 'light');
//   };

//   const handleRemoveConversation = (index) => {
//     const updatedConversations = conversations.filter((_, i) => i !== index);
//     setConversations(updatedConversations);
//     if (index === currentConversation && updatedConversations.length > 0) {
//       setCurrentConversation(0);
//     } else if (updatedConversations.length === 0) {
//       setCurrentConversation(null);
//     } else if (index < currentConversation) {
//       setCurrentConversation(currentConversation - 1);
//     }
//   };

//   const handleRecommendation = async () => {
//     setIsLoadingRecommendation(true);

//     try {
//       const response = await fetchRecommendation();

//       if (response.error) {
//         throw new Error(response.error);
//       }

//       const botResponse = `<strong>Recommendation:</strong><br/><strong>Tool:</strong> ${response.tool}<br/><strong>Solution:</strong> ${response.solution}`;
//       const updatedConversations = [...conversations];
//       updatedConversations[currentConversation].push({ sender: 'bot', text: botResponse });
//       setConversations(updatedConversations);
//     } catch (error) {
//       console.error('Error handling recommendation:', error);
//     } finally {
//       setIsLoadingRecommendation(false);
//     }
//   };

//   const handleSummarization = async () => {
//     setIsLoadingSummarization(true);

//     try {
//       const response = await fetchSummarization();

//       if (response.error) {
//         throw new Error(response.error);
//       }

//       const botResponse = `<strong>Summary:</strong><br/><strong>Tool:</strong> ${response.tool}<br/><strong>Solution:</strong> ${response.solution}`;
//       const updatedConversations = [...conversations];
//       updatedConversations[currentConversation].push({ sender: 'bot', text: botResponse });
//       setConversations(updatedConversations);
//     } catch (error) {
//       console.error('Error handling summarization:', error);
//     } finally {
//       setIsLoadingSummarization(false);
//     }
//   };

//   return (
//     <Grommet theme={themeMode === 'dark' ? darkTheme : lightTheme} full>
//       <Layer flex onEsc={onClose} onClickOutside={onClose} modal>
//         <Box direction="row" width="large" height="large" pad="medium" gap="medium" background={themeMode === 'dark' ? '#222222' : '#ffffff'} round="small">
//           {isSidebarOpen && (
//             <Box overflow="auto" width="small" background={themeMode === 'dark' ? '#222222' : '#ffffff'} pad="small" elevation="large" round="small">
//               <Text weight="bold" margin={{ bottom: 'small' }}>Chat History</Text>
//               <List
//                 data={conversations.map((conv, index) => ({
//                   name: conv[0] ? `New Chat` : `New chat`,
//                   index
//                 }))}
//                 itemProps={{
//                   [currentConversation]: {
//                     background: themeMode === 'dark' ? '#02B388' : 'brand',
//                     round: 'small'
//                   }
//                 }}
//                 onClickItem={event => setCurrentConversation(event.index)}
//                 primaryKey="name"
//               >
//                 {(datum, index) => (
//                   <Box direction="row" justify="between" align="center" pad="1px" round>
//                     <Text>{datum.name}</Text>
//                     <Button icon={<Trash />} onClick={() => handleRemoveConversation(index)} />
//                   </Box>
//                 )}
//               </List>
//             </Box>
//           )}
//           <Box flex direction="column" gap="small">
//             <Box direction="row" justify="between" align="center">
//               <Tip content="Chat History">
//                 <Button icon={<Sidebar />} onClick={handleToggleSidebar} />
//               </Tip>
//               <Tip content="New Chat">
//                 <Button icon={<Chat />} onClick={handleNewConversation} />
//               </Tip>
//               <Button
//                 icon={themeMode === 'dark' ? <Sun /> : <Moon />}
//                 onClick={toggleThemeMode}
//                 plain
//               />
//             </Box>
//             <Text weight="bold" size="large" alignSelf="center">Z+SecureBot</Text>
//             <Box
//               flex
//               overflow="auto"
//               pad="small"
//               background={themeMode === 'dark' ? '#333333' : 'light-3'}
//               round="small"
//               style={{ maxHeight: 'calc(100% - 100px)', flexShrink: 0 }}
//               ref={chatContainerRefs.current[currentConversation]}
//             >
//               {conversations[currentConversation]?.map((message, index) => (
//                 <Box
//                   key={index}
//                   direction='column'
//                   align={message.sender === 'user' ? 'end' : 'start'}
//                   pad="small"
//                   round
//                   style={{
//                     maxWidth: '80%',
//                     wordWrap: 'break-word',
//                     alignSelf: message.sender === 'user' ? 'end' : 'start',
//                     background: message.sender === 'user' ? (themeMode === 'dark' ? '#02B388' : 'brand') : 'transparent',
//                     marginLeft: message.sender === 'user' ? 'auto' : 'initial',
//                   }}
//                 >
//                   {message.sender === 'user' ? (
//                     <Text>{message.text}</Text>
//                   ) : (
//                     <Box
//                       elevation="large"
//                       pad="medium"
//                       background={themeMode === 'dark' ? '#222222' : '#ffffff'}
//                       round
//                       margin={{ vertical: 'small' }}
//                       style={{ maxHeight: '200px', overflowY: 'auto' }}
//                       gap="small"
//                     >
//                       <Text dangerouslySetInnerHTML={{ __html: message.text }} />
//                       {message.buttons && message.buttons.map((button, i) => (
//                         <Tip
//                           content={`This will give ${button.label === 'Summarization' ? 'Summarization' : 'Recommendation'} for the latest tool discovered in the Z+ tool`}
//                           dropProps={{ align: { left: 'right' } }}
//                           truncate={false}
//                           key={i}
//                         >
//                           <Button
//                             primary
//                             label={button.label}
//                             onClick={button.action === 'recommendation' ? handleRecommendation : handleSummarization}
//                             disabled={button.action === 'recommendation' ? isLoadingRecommendation : isLoadingSummarization}
//                           />
//                         </Tip>
//                       ))}
//                     </Box>
//                   )}
//                 </Box>
//               ))}
//             </Box>
//             <Box direction="row" align="center" gap="small">
//               <TextInput
//                 placeholder="Type a message..."
//                 value={inputValue}
//                 onChange={event => setInputValue(event.target.value)}
//                 flex
//               />
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 onChange={handleFileInputChange}
//               />
//               <Button icon={<Attachment />} onClick={handleAttachmentClick} />
//               <Button icon={<Send />} onClick={handleSendMessage} primary disabled={isLoadingSend} />
//             </Box>
//           </Box>
//           <Button icon={<Close />} onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px' }} />
//         </Box>
//       </Layer>
//     </Grommet>
//   );
// };

// export default ChatPopup;

// import React, { useState, useRef, useEffect } from 'react';
// import { Box, Button, Layer, Text, TextInput, List, Grommet, Tip } from 'grommet';
// import { Close, Chat, Send, Attachment, Sidebar, Moon, Sun, Trash } from 'grommet-icons';
// import { lightTheme, darkTheme } from './themes';
// import { fetchRecommendation, fetchSummarization } from './api/api';
// import interactions from './interactions.json';

// const ChatPopup = ({ onClose }) => {
//   const [conversations, setConversations] = useState(() => {
//     const savedConversations = localStorage.getItem('conversations');
//     return savedConversations ? JSON.parse(savedConversations) : [[]];
//   });
//   const [currentConversation, setCurrentConversation] = useState(0);
//   const [inputValue, setInputValue] = useState('');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [themeMode, setThemeMode] = useState('dark');
//   const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
//   const [isLoadingSummarization, setIsLoadingSummarization] = useState(false);
//   const fileInputRef = useRef(null);
//   const chatContainerRefs = useRef([]);

//   useEffect(() => {
//     chatContainerRefs.current = conversations.map(() => React.createRef());
//   }, [conversations]);

//   useEffect(() => {
//     const chatRef = chatContainerRefs.current[currentConversation];
//     if (chatRef && chatRef.current) {
//       chatRef.current.scrollTop = chatRef.current.scrollHeight;
//     }
//   }, [conversations, currentConversation]);

//   useEffect(() => {
//     if (conversations.length === 1 && conversations[0].length === 0) {
//       const initialBotMessage = interactions.rules[0].responses[0];
//       setConversations([[{ sender: 'bot', ...initialBotMessage }]]);
//     }
//   }, [conversations]);

//   useEffect(() => {
//     localStorage.setItem('conversations', JSON.stringify(conversations));
//   }, [conversations]);

//   const handleSendMessage = () => {
//     if (inputValue.trim()) {
//       const newConversations = [...conversations];
//       newConversations[currentConversation].push({ sender: 'user', text: inputValue });
//       setConversations(newConversations);
//       setInputValue('');
//       checkInteractionRules(inputValue, newConversations);
//     }
//   };

//   const checkInteractionRules = (message, newConversations) => {
//     interactions.rules.forEach(rule => {
//       rule.keywords.forEach(keyword => {
//         if (message.toLowerCase().includes(keyword)) {
//           rule.responses.forEach(response => {
//             const updatedConversations = [...newConversations];
//             const botResponse = { sender: 'bot', text: response.text, buttons: response.buttons };
//             updatedConversations[currentConversation].push(botResponse);
//             setConversations(updatedConversations);
//           });
//         }
//       });
//     });
//   };  
//   const handleNewConversation = () => {
//     let newConversations;
//     if (inputValue.trim()) {
//       newConversations = [...conversations, [{ sender: 'user', text: inputValue }]];
//     } else {
//       newConversations = [...conversations, []];
//     }

//     if (newConversations[newConversations.length - 1].length === 0) {
//       const initialBotMessage = interactions.rules[0].responses[0];
//       newConversations[newConversations.length - 1].push({
//         sender: 'bot',
//         text: initialBotMessage.text,
//         buttons: initialBotMessage.buttons
//       });
//     }

//     setConversations(newConversations);
//     setCurrentConversation(newConversations.length - 1);
//     setInputValue('');
//   };

//   const handleToggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   const handleAttachmentClick = () => {
//     fileInputRef.current.click();
//   };

//   const handleFileInputChange = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       console.log('Selected file:', file);
//     }
//   };

//   const toggleThemeMode = () => {
//     setThemeMode(themeMode === 'light' ? 'dark' : 'light');
//   };

//   const handleRemoveConversation = (index) => {
//     const updatedConversations = conversations.filter((_, i) => i !== index);
//     setConversations(updatedConversations);
//     if (index === currentConversation && updatedConversations.length > 0) {
//       setCurrentConversation(0);
//     } else if (updatedConversations.length === 0) {
//       setCurrentConversation(null);
//     } else if (index < currentConversation) {
//       setCurrentConversation(currentConversation - 1);
//     }
//   };
  
  
//   const handleRecommendation = async () => {
//     setIsLoadingRecommendation(true);
  
//     try {
//       const response = await fetchRecommendation();
  
//       if (response.error) {
//         throw new Error(response.error);
//       }
      
//       const botResponse = `<strong>Recommendation:</strong><br/><strong>Tool:</strong> ${response.tool}<br/><strong>Solution:</strong> ${response.solution}`;
//       const updatedConversations = [...conversations];
//       updatedConversations[currentConversation].push({ sender: 'bot', text: botResponse });
//       setConversations(updatedConversations);
//     } catch (error) {
//       console.error('Error handling recommendation:', error);
//     } finally {
//       setIsLoadingRecommendation(false);
//     }
//   };
  
//   const handleSummarization = async () => {
//     setIsLoadingSummarization(true);
  
//     try {
//       const response = await fetchSummarization();
  
//       if (response.error) {
//         throw new Error(response.error); 
//       }
  
//       const botResponse = `<strong>Summary:</strong><br/><strong>Tool:</strong> ${response.tool}<br/><strong>Solution:</strong> ${response.solution}`;
//       const updatedConversations = [...conversations];
//       updatedConversations[currentConversation].push({ sender: 'bot', text: botResponse });
//       setConversations(updatedConversations);
//     } catch (error) {
//       console.error('Error handling summarization:', error);
//     } finally {
//       setIsLoadingSummarization(false);
//     }
//   };
  

//   return (
//     <Grommet theme={themeMode === 'dark' ? darkTheme : lightTheme} full>
//       <Layer flex onEsc={onClose} onClickOutside={onClose} modal>
//         <Box direction="row" width="large" height="large" pad="medium" gap="medium" background={themeMode === 'dark' ? '#222222' : '#ffffff'} round="small">
//           {isSidebarOpen && (
//             <Box overflow="auto" width="small" background={themeMode === 'dark' ? '#222222' : '#ffffff'} pad="small" elevation="large" round="small">
//               <Text weight="bold" margin={{ bottom: 'small' }}>Chat History</Text>
//               <List
//                 data={conversations.map((conv, index) => ({
//                   name: conv[0] ? `New Chat` : `New chat`,
//                   index
//                 }))}
//                 itemProps={{
//                   [currentConversation]: {
//                     background: themeMode === 'dark' ? '#02B388' : 'brand',
//                     round: 'small'
//                   }
//                 }}
//                 onClickItem={event => setCurrentConversation(event.index)}
//                 primaryKey="name"
//               >
//                 {(datum, index) => (
//                   <Box direction="row" justify="between" align="center" pad="1px" round>
//                     <Text>{datum.name}</Text>
//                     <Button icon={<Trash />} onClick={() => handleRemoveConversation(index)} />
//                   </Box>
//                 )}
//               </List>
//             </Box>
//           )}
//           <Box flex direction="column" gap="small">
//             <Box direction="row" justify="between" align="center">
//               <Tip content="Chat History">
//                 <Button icon={<Sidebar />} onClick={handleToggleSidebar} />
//               </Tip>
//               <Tip content="New Chat">
//                 <Button icon={<Chat />} onClick={handleNewConversation} />
//               </Tip>
//               <Button
//                 icon={themeMode === 'dark' ? <Sun /> : <Moon />}
//                 onClick={toggleThemeMode}
//                 plain
//               />
//             </Box>
//             <Text weight="bold" size="large" alignSelf="center">Z+SecureBot</Text>
//             <Box flex overflow="auto" pad="small" background={themeMode === 'dark' ? '#333333' : 'light-3'} 
//             round="small" 
//             style={{ maxHeight: 'calc(100% - 100px)', flexShrink: 0 }}
//             ref={chatContainerRefs.current[currentConversation]}>
//               {conversations[currentConversation]?.map((message, index) => (
//                 <Box
//                   key={index}
//                   direction='column'
//                   align={message.sender === 'user' ? 'end' : 'start'}
//                   pad="small"
//                   round
//                   style={{
//                     maxWidth: '80%',
//                     wordWrap: 'break-word',
//                     alignSelf: message.sender === 'user' ? 'end' : 'start',
//                     background: message.sender === 'user' ? (themeMode === 'dark' ? '#02B388' : 'brand') : 'transparent',
//                     marginLeft: message.sender === 'user' ? 'auto' : 'initial',
//                   }}
//                 >
//                   {message.sender === 'user' ? (
//                     <Text>{message.text}</Text>
//                   ) : (
//                     <Box
//                       elevation="large"
//                       pad="medium"
//                       background={themeMode === 'dark' ? '#222222' : '#ffffff'}
//                       round
//                       margin={{ vertical: 'small' }}
//                       style={{ maxHeight: '200px', overflowY: 'auto' }}
//                       gap="small"
//                     >
//                       <Text dangerouslySetInnerHTML={{ __html: message.text }} />
//                       {message.buttons && message.buttons.map((button, i) => (
//                         <Tip content={`This will give ${button.label === 'Summarization' ? 'Summarization' : 'Recommendation'} for the latest tool discovered in the Z+ tool`} dropProps={{ align: { left: 'right' } }} truncate={false}>
//                         <Button
//                           key={i}
//                           primary
//                           label={button.label}
//                           onClick={button.action === 'recommendation' ? handleRecommendation : handleSummarization}
//                           disabled={button.action === 'recommendation' ? isLoadingRecommendation : isLoadingSummarization}
//                         />
//                         </Tip>
//                       ))}
//                     </Box>
//                   )}
//                 </Box>
//               ))}
//             </Box>
//             <Box direction="row" align="center" gap="small">
//               <TextInput
//                 placeholder="Type a message..."
//                 value={inputValue}
//                 onChange={event => setInputValue(event.target.value)}
//                 flex
//               />
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 style={{ display: 'none' }}
//                 onChange={handleFileInputChange}
//               />
//               <Button icon={<Attachment />} onClick={handleAttachmentClick} />
//               <Button icon={<Send />} onClick={handleSendMessage} primary />
//             </Box>
//           </Box>
//           <Button icon={<Close />} onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px' }} />
//         </Box>
//       </Layer>
//     </Grommet>
//   );
// };

// export default ChatPopup;




