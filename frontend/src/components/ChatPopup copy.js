import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Layer, Text, TextInput, Grommet, Tip } from 'grommet';
import { Close, Send, Attachment, Moon, Sun, Clipboard, Like, Dislike } from 'grommet-icons'; 
import { lightTheme, darkTheme } from './themes';
import { fetchQuery, ChatComponent } from './api/api';
import interactions from './interactions.json';
import { motion } from 'framer-motion';
import '../App.css';

const TypingIndicator = () => (
  <Box direction="row" align="center" gap="small">
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
    >
      <Text className="gradient-indicator" weight="bold">thinking</Text>
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

  const handleFeedback = async (feedback) => {
    try {
      const response = await ChatComponent(feedback);

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      const result = await response.json();
      console.log('Feedback submitted:', result);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <Grommet theme={themeMode === 'dark' ? darkTheme : lightTheme} full>
      <Layer className="blur-background" flex onEsc={onClose} onClickOutside={onClose} modal>
        <Box
          elevation="large"
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
            <Box
              className="blur-background"
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
                <Box key={index} direction="column" align={message.sender === 'user' ? 'end' : 'start'} pad="small" gap="small">
                  <Box
                    overflow="auto"
                    direction="column"
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
                      margin: '2%',
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
                  {message.sender === 'bot' && (
                    <Box direction="row" gap="small" justify="end" align="center">
                      <Button icon={<Like />} onClick={() => handleFeedback('thumbsUp')} />
                      <Button icon={<Dislike />} onClick={() => handleFeedback('thumbsDown')} />
                    </Box>
                  )}
                </Box>
              ))}
              {isLoadingSend && (
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
          <Box
            overflow="auto"
            flex
            direction="column"
            pad="medium"
            gap="medium"
            width="medium"
            round="small"
            elevation="medium"
            style={{ maxHeight: '80vh', maxWidth: '80vw', overflow: 'auto' }}
          >
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
