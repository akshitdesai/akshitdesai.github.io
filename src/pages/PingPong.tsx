import React from 'react';

type PingPongProps = {
  theme: 'light' | 'dark';
};

const PingPong: React.FC<PingPongProps> = ({ theme }) => {
  const paddleColor = theme === 'light' ? '#111' : '#fff';
  const ballColor = theme === 'light' ? '#a06be0' : '#00ff41';

  return (
    <div style={{
      position: 'relative',
      width: 360,
      minHeight: 220,
      marginLeft: '-10px', // moved slightly left
      marginTop: '1em',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start'
    }}>
      <div style={{ position: 'relative', width: '320px', height: '180px' }}>
        <style>
          {`
          .table,
          .ball,
          .paddle,
          .result {
            position: absolute;
          }
          .table {
            width: 320px;
            height: 180px;
            border-radius: 12px;
            top: 0;
            left: -5px; /* move table slightly left */
          }
          .ball {
            width: 16px;
            height: 16px;
            top: calc(50% - 8px);
            left: calc(50% - 8px);
            background-color: ${ballColor};
            border-radius: 50%;
            animation: ballMove 2.5s linear infinite;
          }
          .paddle {
            width: 8px; /* thinner paddle */
            height: 48px;
            background-color: ${paddleColor};
            border-radius: 6px;
          }
          .player {
            top: calc(50% - 24px);
            left: 16px;
            animation: playerPaddle 2.5s linear infinite;
          }
          .ai {
            top: calc(50% - 24px);
            right: 16px;
            animation: aiPaddle 2.5s linear infinite;
          }
          .result {
            width: 100%;
            left: 0;
            top: 10%;
            text-transform: uppercase;
            text-align: center;
            font-family: sans-serif;
            color: black;
            transform: scale(0);
            animation: showResult 1s 2.6s both;
            pointer-events: none;
          }
          @keyframes ballMove {
            0% {
              top: calc(50% - 8px);
              left: calc(50% - 8px);
            }
            20% {
              top: 140px;
              left: 270px;
            }
            29.6% {
              top: 170px;
              left: 210px;
            }
            60% {
              left: 32px;
              top: 40px;
            }
            88.7% {
              top: 0;
              left: 220px;
            }
            100% {
              top: 30px;
              left: 320px;
            }
          }
          @keyframes aiPaddle {
            20% { top: 120px; }
            29.6% { top: 140px; }
            60% { top: 80px; }
            88.7% { top: 40px; }
            100% { top: 20px; }
          }
          @keyframes playerPaddle {
            20% { top: 60px; }
            29.6% { top: 80px; }
            60% { top: 10px; }
            88.7% { top: 30px; }
            100% { top: 40px; }
          }
          @keyframes showResult {
            100% { transform: scale(2); }
          }
          `}
        </style>
        <div className="table">
          <div className="ball"></div>
          <div className="paddle player"></div>
          <div className="paddle ai"></div>
        </div>
        {/* Optionally, you can remove the result message or keep it hidden */}
        {/* <h1 className="result">wygrałeś!</h1> */}
      </div>
    </div>
  );
};

export default PingPong;