import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import './App.css';

//hardkodet siden vi har bare en kanal
const source = 'http://localhost:8080/channels/channel/master.m3u8';

function App() {
  const videoRef = useRef(null);
  const [assetTitle, setAssetTitle] = useState(null);
  const [hls, setHls] = useState(null);

  useEffect(() => {
    if (Hls.isSupported()) {
      const hlsInstance = new Hls();
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(videoRef.current);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        videoRef.current.play();
      });
      setHls(hlsInstance);
      
    } 
  }, []);

  //henter ut tittelen fra endepunktet i serveren
  useEffect(() => {
    const fetchCurrentTitle = async () => {
      try {
        const response = await fetch('http://localhost:8081/current-title');
        const data = await response.json();
        setAssetTitle(data.title);
      } catch (error) {
        console.error('Error fetching current title:', error);
      }
    };
  //oppdaterer tittel når ny video starter
    if (hls) {
      hls.on(Hls.Events.FRAG_CHANGED, fetchCurrentTitle);
      return () => {

        hls.off(Hls.Events.FRAG_CHANGED, fetchCurrentTitle);

      };
    }
  }, [hls]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Linear Channel Player</h1>
        <h3>Now playig: {assetTitle}</h3>
        <video ref={videoRef} controls style={{ width: '80%', maxWidth: '800px' }} />
      </header>
    </div>
  );
}

export default App;
