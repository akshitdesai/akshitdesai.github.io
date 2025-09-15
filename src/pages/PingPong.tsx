import React, { useRef, useEffect, useState, useCallback, ReactNode } from "react";
import './PingPong.css';

interface PingPongProps {
  theme: 'light' | 'dark';
}

interface HintTextProps {
  show: boolean;
  theme: 'light' | 'dark';
  children: ReactNode;
}

const HintText = ({ show, theme, children }: HintTextProps) => {
  return (
    <div className={`ping-pong-hint ${theme} ${show ? 'show' : 'hide'}`}>
      {children}
    </div>
  );
};

const PingPong = ({ theme }: PingPongProps) => {
  const canvasRef = useRef(null);
  const [finished, setFinished] = useState(false);
  const [scoreLeft, setScoreLeft] = useState(0);
  const [scoreRight, setScoreRight] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [hasServedOnce, setHasServedOnce] = useState(false);
  const [showServeHint, setShowServeHint] = useState(true);
  const [leftScoreAnimating, setLeftScoreAnimating] = useState(false);
  const [rightScoreAnimating, setRightScoreAnimating] = useState(false);
  const [leftScoreOffset, setLeftScoreOffset] = useState(0);
  const [rightScoreOffset, setRightScoreOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const [dimensions, setDimensions] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return { width: 280, height: 158 };
    }
    return { width: 400, height: 225 };
  });
  
  const animationIdRef = useRef(0);
  
  // Game variables
  const windowWidth = dimensions.width;
  const windowHeight = dimensions.height;
  const scaleFactor = isMobile ? 0.7 : 1; // Scale down for mobile
  const paddleWidth = 10 * scaleFactor;
  const paddleHeight = 60 * scaleFactor;
  const paddleStep = windowHeight / 9;
  const borderOffset = 6;
  const diameter = 16 * scaleFactor;

  const xPaddleLeft = borderOffset;
  const yPaddleLeftRef = useRef(windowHeight / 2);
  const xPaddleRight = windowWidth - borderOffset - paddleWidth;
  const yPaddleRightRef = useRef(windowHeight / 2);
  
  // Initialize ball position based on current dimensions
  const rightServeXpos = windowWidth - borderOffset - paddleWidth - diameter/2;
  const rightServeYpos = windowHeight / 2;
  
  const ballRef = useRef({
    x: rightServeXpos,
    y: rightServeYpos,
    xSpeed: 4,
    ySpeed: 4
  });
   
  const gameStateRef = useRef({
    started: false,
    leftServe: false,
    rightServe: true,
    cpuSpeed: 8,
    diffCpuBall: 0
  });

  const cpuMoveRight = () => {
    const diff = ballRef.current.y - yPaddleRightRef.current - (paddleHeight / 2);
    const moveAmount = Math.sign(diff) * Math.min(Math.abs(diff), gameStateRef.current.cpuSpeed);
    yPaddleRightRef.current += moveAmount;
    
    // bound to play window
    if (yPaddleRightRef.current <= 0) {
      yPaddleRightRef.current = 0;
    }
    if (yPaddleRightRef.current + paddleHeight >= windowHeight) {
      yPaddleRightRef.current = windowHeight - paddleHeight;
    }
  };

  const cpuMove = () => {
    const diff = ballRef.current.y - yPaddleLeftRef.current - (paddleHeight / 2);
    const moveAmount = Math.sign(diff) * Math.min(Math.abs(diff), gameStateRef.current.cpuSpeed);
    yPaddleLeftRef.current += moveAmount;
    
    // bound to play window
    if (yPaddleLeftRef.current <= 0) {
      yPaddleLeftRef.current = 0;
    }
    if (yPaddleLeftRef.current + paddleHeight >= windowHeight) {
      yPaddleLeftRef.current = windowHeight - paddleHeight;
    }

    // Randomize CPU speed less frequently for smoother movement
    if (Math.random() < 0.1) { // Only 10% chance each frame
      const speedDiff = Math.floor(Math.random() * 2); // Smaller random changes
      gameStateRef.current.cpuSpeed += Math.random() <= 0.5 ? speedDiff : (speedDiff * -1);

      // bound the CPU speed change
      if (gameStateRef.current.cpuSpeed > 12) {
        gameStateRef.current.cpuSpeed = 12;
      }
      if (gameStateRef.current.cpuSpeed < 4) {
        gameStateRef.current.cpuSpeed = 4;
      }
    }
  };

  const resetCPUSpeed = () => {
    gameStateRef.current.cpuSpeed = 8;
  };

  const bounceTopBottom = () => {
    if (ballRef.current.y < diameter / 2 || ballRef.current.y > windowHeight - diameter) {
      ballRef.current.ySpeed *= -1;
    }
  };

  const cpuShouldAction = () => {
    gameStateRef.current.diffCpuBall = ballRef.current.y - yPaddleLeftRef.current;
    // Remove auto-serve for CPU - only move when ball is coming toward it
    if (gameStateRef.current.started && ballRef.current.xSpeed < 0) {
      cpuMove();
    }
    // On mobile, also move right paddle (CPU vs CPU)
    if (isMobile && gameStateRef.current.started && ballRef.current.xSpeed > 0) {
      cpuMoveRight();
    }
  };

  const boundToWindow = () => {
    if (yPaddleLeftRef.current <= 0) yPaddleLeftRef.current = 0;
    if (yPaddleLeftRef.current + paddleHeight >= windowHeight) yPaddleLeftRef.current = windowHeight - paddleHeight;
    if (yPaddleRightRef.current <= 0) yPaddleRightRef.current = 0;
    if (yPaddleRightRef.current + paddleHeight >= windowHeight) yPaddleRightRef.current = windowHeight - paddleHeight;
  };

  const drawStaticItems = (ctx: CanvasRenderingContext2D) => {
    // Draw middle line
    ctx.fillStyle = theme === 'light' ? '#ccc' : '#333';
    ctx.fillRect((windowWidth - paddleWidth) / 2, 0, paddleWidth / 2, windowHeight);    

    // Draw scores with slider animation
    ctx.font = `${18 * scaleFactor}px monospace`;
    ctx.textAlign = 'center';
    
    // Draw left score with offset animation
    const leftY = 25 * scaleFactor;
    
    if (leftScoreAnimating) {
      // Calculate fade progress (0 to 1)
      const fadeProgress = leftScoreOffset / (20 * scaleFactor);
      
      // Draw previous score sliding up with fading opacity
      const oldAlpha = 1 - fadeProgress;
      ctx.fillStyle = theme === 'light' ? `rgba(160, 107, 224, ${oldAlpha})` : `rgba(0, 255, 65, ${oldAlpha})`;
      ctx.fillText(
        ((scoreLeft - 1) < 10 ? "0" + (scoreLeft - 1) : (scoreLeft - 1).toString()), 
        windowWidth * (1/4), 
        leftY - leftScoreOffset
      );
      
      // Draw current score sliding up from below
      ctx.fillStyle = theme === 'light' ? '#a06be0' : '#00ff41';
      ctx.fillText(
        (scoreLeft < 10 ? "0" + scoreLeft : scoreLeft.toString()), 
        windowWidth * (1/4), 
        leftY + (20 * scaleFactor) - leftScoreOffset
      );
    } else {
      // Normal static score
      ctx.fillStyle = theme === 'light' ? '#111' : '#fff';
      ctx.fillText(
        (scoreLeft < 10 ? "0" + scoreLeft : scoreLeft.toString()), 
        windowWidth * (1/4), 
        leftY
      );
    }
    
    // Draw right score with offset animation
    const rightY = 25 * scaleFactor;
    
    if (rightScoreAnimating) {
      // Calculate fade progress (0 to 1)
      const fadeProgress = rightScoreOffset / (20 * scaleFactor);
      
      // Draw previous score sliding up with fading opacity
      const oldAlpha = 1 - fadeProgress;
      ctx.fillStyle = theme === 'light' ? `rgba(160, 107, 224, ${oldAlpha})` : `rgba(0, 255, 65, ${oldAlpha})`;
      ctx.fillText(
        ((scoreRight - 1) < 10 ? "0" + (scoreRight - 1) : (scoreRight - 1).toString()), 
        windowWidth * (3/4), 
        rightY - rightScoreOffset
      );
      
      // Draw current score sliding up from below
      ctx.fillStyle = theme === 'light' ? '#a06be0' : '#00ff41';
      ctx.fillText(
        (scoreRight < 10 ? "0" + scoreRight : scoreRight.toString()), 
        windowWidth * (3/4), 
        rightY + (20 * scaleFactor) - rightScoreOffset
      );
    } else {
      // Normal static score
      ctx.fillStyle = theme === 'light' ? '#111' : '#fff';
      ctx.fillText(
        (scoreRight < 10 ? "0" + scoreRight : scoreRight.toString()), 
        windowWidth * (3/4), 
        rightY
      );
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = theme === 'light' ? '#fff' : '#111';
    ctx.fillRect(0, 0, windowWidth, windowHeight);
    
    // Update ball position for serves (ball follows paddle)
    if (gameStateRef.current.leftServe) {
      ballRef.current.x = xPaddleLeft + paddleWidth + diameter/2;
      ballRef.current.y = yPaddleLeftRef.current + (0.5 * paddleHeight);
    }
    if (gameStateRef.current.rightServe) {
      ballRef.current.x = xPaddleRight - diameter/2;
      ballRef.current.y = yPaddleRightRef.current + (0.5 * paddleHeight);
    }
    
    // global pause - when not started or serve in progress
    if (gameStateRef.current.started) {
      ballRef.current.x += ballRef.current.xSpeed;
      ballRef.current.y += ballRef.current.ySpeed;
    }
    
    // Detect collision with left paddle
    if (
      ballRef.current.x <= 0 + xPaddleLeft + paddleWidth + borderOffset + (diameter / 2) &&
      ballRef.current.y < yPaddleLeftRef.current + paddleHeight &&
      ballRef.current.y >= yPaddleLeftRef.current
    ) {
      if (
        ballRef.current.y >= yPaddleLeftRef.current &&
        ballRef.current.y < (yPaddleLeftRef.current + (0.5 * paddleHeight))
      ) {
        ballRef.current.ySpeed = Math.abs(ballRef.current.ySpeed) * -1;
        ballRef.current.xSpeed = Math.abs(ballRef.current.xSpeed);
      }
      if (
        ballRef.current.y > (yPaddleLeftRef.current + (0.5 * paddleHeight)) &&
        ballRef.current.y <= (yPaddleLeftRef.current + paddleHeight)
      ) {
        ballRef.current.ySpeed = Math.abs(ballRef.current.ySpeed);
        ballRef.current.xSpeed = Math.abs(ballRef.current.xSpeed);
      }
    }
    // points only if behind left wall
    else if (ballRef.current.x < diameter / 2) {
      ballRef.current.xSpeed *= -1;
      const newScore = scoreRight + 1;
      setScoreRight(newScore);
      
      // Start slide animation
      setRightScoreAnimating(true);
      setRightScoreOffset(0);
      
      // Animate the slide with easing
      let startTime: number | null = null;
      const duration = 600; // Slower 600ms duration
      const targetOffset = 20 * scaleFactor;
      
      const animateSlide = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic function for smoother animation
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const newOffset = easeProgress * targetOffset;
        
        setRightScoreOffset(newOffset);
        
        if (progress < 1) {
          requestAnimationFrame(animateSlide);
        } else {
          setRightScoreAnimating(false);
          setRightScoreOffset(0);
        }
      };
      requestAnimationFrame(animateSlide);
      
      if (!isMobile && newScore === 5) {
        setFinished(true);
        return; // Stop drawing to prevent flickering
      }
      if (isMobile && newScore === 5) {
        // Reset scores for infinite play on mobile
        setScoreRight(0);
        setScoreLeft(0);
      }
      gameStateRef.current.started = false;
      // put ball for left serve
      ballRef.current.x = xPaddleLeft + paddleWidth + diameter/2;
      ballRef.current.y = yPaddleLeftRef.current + (0.5 * paddleHeight);
      gameStateRef.current.leftServe = true;
      gameStateRef.current.rightServe = false;
      resetCPUSpeed();
    }

    // Detect collision with right paddle
    if (
      ballRef.current.x >= windowWidth - borderOffset - paddleWidth - (diameter / 2) &&
      ballRef.current.y <= yPaddleRightRef.current + paddleHeight &&
      ballRef.current.y >= yPaddleRightRef.current
    ) {
      if (
        ballRef.current.y >= yPaddleRightRef.current &&
        ballRef.current.y < (yPaddleRightRef.current + (0.5 * paddleHeight))
      ) {
        ballRef.current.ySpeed = Math.abs(ballRef.current.ySpeed) * -1;
        ballRef.current.xSpeed = Math.abs(ballRef.current.xSpeed) * -1;
      }
      if (
        ballRef.current.y > (yPaddleRightRef.current + (0.5 * paddleHeight)) &&
        ballRef.current.y <= (yPaddleRightRef.current + paddleHeight)
      ) {
        ballRef.current.ySpeed = Math.abs(ballRef.current.ySpeed);
        ballRef.current.xSpeed = Math.abs(ballRef.current.xSpeed) * -1;
      }
    }
    // points if behind right wall
    else if (ballRef.current.x + diameter / 2 > windowWidth) {
      ballRef.current.xSpeed *= -1;
      const newScore = scoreLeft + 1;
      setScoreLeft(newScore);
      
      // Start slide animation
      setLeftScoreAnimating(true);
      setLeftScoreOffset(0);
      
      // Animate the slide with easing
      let startTime: number | null = null;
      const duration = 600; // Slower 600ms duration
      const targetOffset = 20 * scaleFactor;
      
      const animateSlide = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic function for smoother animation
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const newOffset = easeProgress * targetOffset;
        
        setLeftScoreOffset(newOffset);
        
        if (progress < 1) {
          requestAnimationFrame(animateSlide);
        } else {
          setLeftScoreAnimating(false);
          setLeftScoreOffset(0);
        }
      };
      requestAnimationFrame(animateSlide);
      
      if (!isMobile && newScore === 5) {
        setFinished(true);
        return; // Stop drawing to prevent flickering
      }
      if (isMobile && newScore === 5) {
        // Reset scores for infinite play on mobile
        setScoreRight(0);
        setScoreLeft(0);
      }
      gameStateRef.current.started = false;
      // put ball for right serve
      ballRef.current.x = xPaddleRight - diameter/2;
      ballRef.current.y = yPaddleRightRef.current + (0.5 * paddleHeight);
      gameStateRef.current.rightServe = true;
      gameStateRef.current.leftServe = false;
      setShowServeHint(true); // Show serve hint again for new serve
      resetCPUSpeed();
    }
    
    bounceTopBottom();

    // Draw paddle left (with rounded corners)
    ctx.fillStyle = theme === 'light' ? '#111' : '#fff';
    ctx.beginPath();
    ctx.roundRect(xPaddleLeft, yPaddleLeftRef.current, paddleWidth, paddleHeight, 4);
    ctx.fill();

    // Draw paddle right (with rounded corners)
    ctx.fillStyle = theme === 'light' ? '#111' : '#fff';
    ctx.beginPath();
    ctx.roundRect(xPaddleRight, yPaddleRightRef.current, paddleWidth, paddleHeight, 4);
    ctx.fill();

    drawStaticItems(ctx);
    
    // Draw ball (top layer)
    ctx.fillStyle = theme === 'light' ? '#a06be0' : '#00ff41';
    ctx.beginPath();
    ctx.arc(ballRef.current.x, ballRef.current.y, diameter/2, 0, Math.PI * 2);
    ctx.fill();
    
    cpuShouldAction();
  }, [theme, scoreLeft, scoreRight, leftScoreAnimating, rightScoreAnimating, leftScoreOffset, rightScoreOffset]);

  const keyPressed = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      e.stopPropagation();
      
      // If game is finished, restart it
      if (finished) {
        setFinished(false);
        setScoreLeft(0);
        setScoreRight(0);
        setHasServedOnce(false);
        setShowServeHint(true);
        setShowInstructions(false);
        
        // Reset game state
        gameStateRef.current.started = false;
        gameStateRef.current.leftServe = false;
        gameStateRef.current.rightServe = true;
        resetCPUSpeed();
        
        // Reset ball position
        ballRef.current.x = windowWidth - borderOffset - paddleWidth - diameter/2;
        ballRef.current.y = windowHeight / 2;
        ballRef.current.xSpeed = 4;
        ballRef.current.ySpeed = 4;
        
        // Reset paddle positions
        yPaddleLeftRef.current = windowHeight / 2;
        yPaddleRightRef.current = windowHeight / 2;
        
        return;
      }
      
      // Hide serve hint immediately when space is pressed
      setShowServeHint(false);
      
      gameStateRef.current.started = true;
      if (gameStateRef.current.leftServe) {
        ballRef.current.xSpeed = Math.abs(ballRef.current.xSpeed);
      }
      if (gameStateRef.current.rightServe) {
        ballRef.current.xSpeed = Math.abs(ballRef.current.xSpeed) * -1;
        
        // Show instructions for 3 seconds after first serve by user
        if (!hasServedOnce) {
          setHasServedOnce(true);
          setShowInstructions(true);
          setTimeout(() => setShowInstructions(false), 3000);
        }
      }
      gameStateRef.current.leftServe = false;
      gameStateRef.current.rightServe = false;
    }
    if (e.code === 'ArrowUp') {
      yPaddleRightRef.current -= paddleStep;
    }
    if (e.code === 'ArrowDown') {
      yPaddleRightRef.current += paddleStep;
    }

    boundToWindow();
  }, [paddleStep, hasServedOnce]);

  const animate = useCallback(() => {
    draw();
    
    // Auto-serve on mobile (CPU vs CPU)
    if (isMobile && !gameStateRef.current.started && (gameStateRef.current.leftServe || gameStateRef.current.rightServe)) {
      setTimeout(() => {
        gameStateRef.current.started = true;
        if (gameStateRef.current.leftServe) {
          ballRef.current.xSpeed = Math.abs(ballRef.current.xSpeed);
        }
        if (gameStateRef.current.rightServe) {
          ballRef.current.xSpeed = Math.abs(ballRef.current.xSpeed) * -1;
        }
        gameStateRef.current.leftServe = false;
        gameStateRef.current.rightServe = false;
      }, 1000); // Auto-serve after 1 second
    }
    
    animationIdRef.current = requestAnimationFrame(animate);
  }, [draw, isMobile]);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
      
      if (isMobileDevice) {
        // Use constant dimensions for mobile to ensure consistent experience
        const mobileWidth = 280;
        const mobileHeight = 158; // Maintains 400:225 aspect ratio (280 * 225 / 400)
        
        setDimensions({ width: mobileWidth, height: mobileHeight });
      } else {
        setDimensions({ width: 400, height: 225 });
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update paddle and ball positions when dimensions change
  useEffect(() => {
    yPaddleLeftRef.current = windowHeight / 2;
    yPaddleRightRef.current = windowHeight / 2;
    
    // Reset ball position for serve
    const newRightServeXpos = windowWidth - borderOffset - paddleWidth - diameter/2;
    const newRightServeYpos = windowHeight / 2;
    
    ballRef.current.x = newRightServeXpos;
    ballRef.current.y = newRightServeYpos;
  }, [windowWidth, windowHeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = windowWidth;
      canvas.height = windowHeight;
    }
    
    animate();
    window.addEventListener('keydown', keyPressed);
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('keydown', keyPressed);
    };
  }, [animate, keyPressed]);

  if (finished) {
    return (
      <div className="ping-pong-container">
        <div className={`ping-pong-finished ${theme}`}>
          <>
            {scoreLeft === 5 ? (
              <span style={{ color: theme === 'light' ? '#a06be0' : '#00ff41' }}>I won,</span>
            ) : (
              <span style={{ color: theme === 'light' ? '#a06be0' : '#00ff41' }}>I am</span>
            )}
            &nbsp;Noob!
          </>
        </div>
        
        <HintText 
          show={true}
          theme={theme}
        >
          Press <span style={{ color: theme === 'light' ? '#a06be0' : '#00ff41' }}>SPACE</span> to replay
        </HintText>
      </div>
    );
  }

  return (
    <div className="ping-pong-container">
      <div className={`ping-pong-game ${theme}`}>
        <canvas
          ref={canvasRef}
          className={`ping-pong-canvas ${theme}`}
          style={{ border: 'none' }}
        />
      </div>
      
      <HintText 
        show={isMobile || (!isMobile && ((showServeHint && !gameStateRef.current.started && gameStateRef.current.rightServe) || showInstructions))}
        theme={theme}
      >
        {isMobile 
          ? <>Switch to desktop, <span style={{ color: theme === 'light' ? '#a06be0' : '#00ff41' }}>noob!</span></>
          : showInstructions 
            ? <>Use <span style={{ color: theme === 'light' ? '#a06be0' : '#00ff41' }}>↑</span> and <span style={{ color: theme === 'light' ? '#a06be0' : '#00ff41' }}>↓</span> arrows to move the paddle</>
            : (showServeHint && !gameStateRef.current.started && gameStateRef.current.rightServe)
              ? <>Press <span style={{ color: theme === 'light' ? '#a06be0' : '#00ff41' }}>SPACE</span> to serve!</>
              : ''}
      </HintText>
    </div>
  );
};

export { PingPong };
export default PingPong;