import React, { useState } from 'react';

export const fetchQuery = async (inputText) => {
  try {
    const formData = new FormData();
    formData.append('prompt', inputText);

    const response = await fetch('http://localhost:8080/rcms_query', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching query:', error);
    return { error: 'Failed to fetch query.' };
  }
};

// Chat component
export const ChatComponent = () => {
  const [chatLog, setChatLog] = useState([]);

  const handleFeedback = (feedback, index) => {
    const newChatLog = [...chatLog];
    newChatLog[index].feedback = feedback;
    setChatLog(newChatLog);

    const interactionId = newChatLog[index].interactionId; // Retrieve interaction ID from chat log

    fetch('http://localhost:8080/update_feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interactionId: interactionId, // Include interaction ID
        feedback: feedback,
      }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Feedback updated:', data);
      })
      .catch((error) => {
        console.error('Error updating feedback:', error);
      });
  };}
