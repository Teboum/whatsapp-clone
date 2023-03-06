import Axios from './axios';
import React, { useEffect, useState } from 'react';
import { ChatState } from './context/CharProvider';

const Audio = ({ message }) => {
  const { user } = ChatState();
  console.log(message, 'odio');
  return (
    <audio
      className="chat__audio"
      style={{
        marginLeft: message.sender === user._id ? 'auto' : null,
      }}
      src={'/getAudio?_id=' + message.message}
      controls
    />
  );
};

export default Audio;
