import { useEffect, useRef, useState } from "react";

import AgoraRTC from "agora-rtc-sdk-ng"

const client = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });

const options = {
  appId: process.env.REACT_APP_appId,
  token: process.env.REACT_APP_appToken,
};

const {appId, token} = options;

function App() {
  const videoPlayerRef = useRef(null);

  const [channel, setChannel] = useState('');
  const [joinState, setJoinState] = useState(false);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  
  useEffect(() => {
    if (!videoPlayerRef.current) return;
    
    localVideoTrack?.play(videoPlayerRef.current);
  }, [localVideoTrack, videoPlayerRef])
  
  useEffect(() => {
    localAudioTrack?.play();
  }, [localAudioTrack])

  const handleChange = (e) => {
    const {target: { value }} = e;

    setChannel(value);
  }

  const handleJoin = async () => {
    try {
      await client.join(appId, channel, token);

      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      setLocalAudioTrack(audioTrack);
      
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      setLocalVideoTrack(videoTrack);
      
      setJoinState(true);

      await client.publish([localAudioTrack, localVideoTrack]);
    } catch(error) {
      console.error(error);
    }
  };
  
  const handleLeave = async () => {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    
    if (localVideoTrack) {
      localVideoTrack.stop();
      localVideoTrack.close();
    }
    
    await client?.leave();
    setJoinState(false);
  };

  return (
    <>
    <div>
      <input type="text" onChange={handleChange} value={channel}/>
      <button type="button" onClick={handleJoin} disabled={joinState}>Join</button>
      <button type="button" onClick={handleLeave} disabled={!joinState}>Leave</button>
    </div>
    <div ref={videoPlayerRef} style={{ width: "320px", height: "240px"}}></div>
    </>
  );
}

export default App;
