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
export const ChatComponent = async (feedback, index) => {
  try {
    // Create a FormData object to hold the feedback and index
    const formData = new FormData();
    formData.append('feedback', feedback);
    formData.append('index', index);

    // Send the POST request with the form data
    const response = await fetch('http://localhost:8080/update_feedback', {
      method: 'POST',
      body: formData,
    });

    // Check if the response was successful
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // Parse the JSON data from the response
    const data = await response.json();

    // Return the parsed data
    return data;
  } catch (error) {
    // Log the error and return a default error message
    console.error('Error submitting feedback:', error);
    return { error: 'Failed to submit feedback.' };
  }
};

