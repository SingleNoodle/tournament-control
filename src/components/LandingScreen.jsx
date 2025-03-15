import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import GlobalStyle from '../styles/GlobalStyle';
import styled, { keyframes } from 'styled-components';
import Clock from './Clock';
import MenuScreen from './MenuScreen';
import YouTubeEmbed from './YoutubeEmbed';


const gradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const LandingScreen = () => {
  const [backgroundImage, setBackgroundImage] = useState('');
  const [videoId, setVideoId] = useState(''); // Add this state

  useEffect(() => {
    const fetchBackground = async () => {
      try {
        const response = await fetch(`${API_URL}/api/background`);
        const data = await response.json();
        setBackgroundImage(data.backgroundImage);
      } catch (error) {
        console.error('Failed to fetch background:', error);
      }
    };

    fetchBackground();

    const bgInterval = setInterval(fetchBackground, 1000);

    const fetchVideo = async () => {
        try {
          const response = await fetch(`${API_URL}/api/video`);
          const data = await response.json();
          setVideoId(data.videoId);
        } catch (error) {
          console.error('Failed to fetch video:', error);
        }
      };
  
      fetchVideo();

      const videoInterval = setInterval(fetchVideo, 1000);
  
    return () => {
    clearInterval(bgInterval);
    clearInterval(videoInterval);
    };
  }, []);

  return (
    <>
    <GlobalStyle />
    <Container $backgroundImage={backgroundImage}>
    <Clock />
    <ContentWrapper>
    <DefaultText $hasVideo={!!videoId}>
        Welcome to The Trading Gallery 
        <br />
        <span className="japanese">トレーディングギャラリーへようこそ</span>
        </DefaultText>
        {videoId && <YouTubeEmbed videoId={videoId} />}
        </ContentWrapper>
      <MenuScreen />
    </Container>
  </>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${props => props.$backgroundImage ? `url(${props.$backgroundImage})` : '#000000'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const DefaultText = styled.h1`
  position: absolute;
  top: ${props => props.$hasVideo ? '10%' : '50%'};
  transform: translateY(-50%);
  margin: 0;
  z-index: 1;

  color: transparent;
  font-size: 3.5rem;
  font-family: 'DM Sans', sans-serif;

  .japanese {
    font-family: 'Noto Sans JP', sans-serif;
    font-size: 3.2rem;
  }

  text-align: center;
  letter-spacing: 2px;
  line-height: 1.5;
  padding: 20px;
  border-radius: 10px;
  text-shadow: 
    0 0 7px rgba(255,255,255,0.2),
    0 0 10px rgba(255,255,255,0.2),
    0 0 21px rgba(255,255,255,0.2),
    0 0 42px rgba(255,255,255,0.3),
    0 0 82px rgba(255,255,255,0.1);

  background: linear-gradient(
    300deg,
    #ffdf00,
    #ffffff
  );
  background-size: 300% 300%;
  animation: ${gradient} 12s ease infinite;
  -webkit-background-clip: text;
  background-clip: text;

  br {
    margin: 10px 0;
  }

  transition: top 0.5s ease-in-out;
`;

const slideUp = keyframes`
  from {
    top: 50%;
    transform: translateY(-50%);
  }
  to {
    top: 5%;
    transform: translateY(-50%);
  }
`;

export default LandingScreen;