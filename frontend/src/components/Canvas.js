import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import useWebSocket from "react-use-websocket";

const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const canvas = useRef();
  let ctx = null;
  const [imgSrc, setImgSrc] = useState(null);
  const [face, setFace] = useState(null);
  const [socketUrl] = useState("ws://localhost:8000/face-detection");

  const { sendMessage, getWebSocket, lastMessage } = useWebSocket(socketUrl, {
    share: true,
  });

  useEffect(() => {
    if (getWebSocket() !== null && lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      const face = data.faces[0];
      if (face) {
        setFace(face);
      }
    }
  }, [imgSrc]);

  const drawFace = () => {
    const canvasEle = canvas.current;

    ctx = canvasEle.getContext("2d");
    ctx.clearRect(0, 0, canvasEle.width, canvasEle.height);
    ctx.strokeStyle = "green";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.rect(...face);
    ctx.stroke();
  };

  const handleClickSendMessage = async () => {
    const response = await fetch(imgSrc);
    const data = await response.blob();
    sendMessage(data);
    console.log(face);
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef, setImgSrc]);

  setInterval(() => {
    if (face !== null) {
      drawFace();
    }
  }, 20000);

  return (
    <>
      <div className="relative">
        <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
        <canvas
          id="canvas"
          className="absolute top-0 left-0"
          ref={canvas}
          width="640"
          height="480"
        ></canvas>
      </div>
      <button onClick={capture}>Capture photo</button>
      <button onClick={handleClickSendMessage}>Send Value</button>
      <button onClick={drawFace}>Draw Face</button>
      {imgSrc && <img src={imgSrc} />}
    </>
  );
};

export default WebcamCapture;
