import "./index.css";
import "./App.css";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Player from '@vimeo/player';
import { FaBars } from 'react-icons/fa';



// MV Agusta Style Video Player Component
const MVAgustaVideoPlayer = ({ src, title }) => {
  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const modalIframeRef = useRef(null);
  const playerRef = useRef(null);
  const modalPlayerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalReady, setIsModalReady] = useState(false);

  const getCurrentPlayer = useCallback(() => {
    return isModalOpen ? modalPlayerRef.current : playerRef.current;
  }, [isModalOpen]);

  const togglePlay = useCallback(async () => {
    const player = getCurrentPlayer();
    if (!player) return;

    try {
      if (isPlaying) {
        await player.pause();
      } else {
        await player.play();
      }
    } catch (error) {
      console.error('Error toggling play:', error);
    }
  }, [isPlaying, getCurrentPlayer]);

  const toggleMute = useCallback(async () => {
    const player = getCurrentPlayer();
    if (!player) return;

    try {
      if (isMuted || volume === 0) {
        await player.setVolume(1);
      } else {
        await player.setVolume(0);
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  }, [isMuted, volume, getCurrentPlayer]);

  const handleVolumeChange = useCallback(async (e) => {
    const newVolume = parseFloat(e.target.value);
    const player = getCurrentPlayer();
    if (!player) return;
    
    try {
      await player.setVolume(newVolume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }, [getCurrentPlayer]);

  const handleProgressClick = useCallback(async (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    const player = getCurrentPlayer();
    if (!player) return;

    try {
      await player.setCurrentTime(newTime);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, [duration, getCurrentPlayer]);

  const openModal = useCallback(async () => {
    setIsModalOpen(true);
    setIsModalReady(false);
    
    // Pause main video if it's playing when modal opens
    if (playerRef.current && isPlaying) {
      await playerRef.current.pause();
    }
  }, [isPlaying]);

  const closeModal = useCallback(async () => {
    setIsModalOpen(false);
    setIsModalReady(false);

    // Pause modal video when closing
    if (modalPlayerRef.current && isPlaying) {
      await modalPlayerRef.current.pause();
    }
  }, [isPlaying]);

  const toggleFullscreen = useCallback(async () => {
    if (isModalOpen) {
      // In modal mode, toggle fullscreen on modal container
      const modalContainer = document.querySelector('.mv-modal-container');
      if (modalContainer) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          modalContainer.requestFullscreen();
        }
      }
    } else {
      // Open modal instead of fullscreen
      openModal();
    }
  }, [isModalOpen, openModal]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, closeModal]);

  // --- Helper to initialize a Vimeo Player instance ---
  const initializeVimeoPlayer = useCallback((iframeElement, isModal = false) => {
    if (!iframeElement) {
      console.warn(`${isModal ? 'Modal ' : 'Main '}iframe element not found`);
      return null;
    }

    console.log(`${isModal ? 'Modal ' : 'Main '}Initializing Vimeo Player for:`, iframeElement);
    
    try {
      const playerInstance = new Player(iframeElement);
      console.log(`${isModal ? 'Modal ' : 'Main '}Player instance created:`, playerInstance);



      playerInstance.on('play', () => {
        setIsPlaying(true);
      });

      playerInstance.on('pause', () => {
        setIsPlaying(false);
      });

      playerInstance.on('timeupdate', (data) => {
        setCurrentTime(data.seconds);
      });

      playerInstance.on('volumechange', (data) => {
        setVolume(data.volume);
        setIsMuted(data.volume === 0);
      });

      playerInstance.on('ended', async () => {
        setIsPlaying(false);
        if (!isModal) {
          await playerInstance.setCurrentTime(0);
          await playerInstance.play();
        }
      });

      playerInstance.on('error', (error) => {
        console.error(`${isModal ? 'Modal ' : 'Main '}Vimeo Player error:`, error);
      });

      // Add a timeout to detect if ready event never fires
      const readyTimeout = setTimeout(() => {
        console.warn(`${isModal ? 'Modal ' : 'Main '}Vimeo Player ready event did not fire within 10 seconds`);
      }, 10000);

      playerInstance.on('ready', async () => {
        clearTimeout(readyTimeout); // Clear the timeout when ready fires
        console.log(`${isModal ? 'Modal ' : 'Main '}Vimeo Player ready.`);
        
        try {
          // Test basic API functionality
          const title = await playerInstance.getVideoTitle();
          console.log(`${isModal ? 'Modal ' : 'Main '}Video title:`, title);
          
          if (isModal) {
            setIsModalReady(true);
            // Ensure modal player starts muted if that's the desired initial state
            if (playerRef.current) {
              const mainVol = await playerRef.current.getVolume();
              await playerInstance.setVolume(mainVol);
              setVolume(mainVol);
              setIsMuted(mainVol === 0);
            } else {
              await playerInstance.setVolume(0);
              setVolume(0);
              setIsMuted(true);
            }
          } else {
            await playerInstance.setVolume(0);
            setVolume(0);
            setIsMuted(true);
          }
          
          const dur = await playerInstance.getDuration();
          console.log(`${isModal ? 'Modal ' : 'Main '}Video duration:`, dur);
          setDuration(dur);
          
        } catch (error) {
          console.error(`${isModal ? 'Modal ' : 'Main '}Error in ready handler:`, error);
        }
      });

      return playerInstance;
    } catch (error) {
      console.error(`${isModal ? 'Modal ' : 'Main '}Error creating Player instance:`, error);
      return null;
    }
  }, []);

  // --- Initialize main player on component mount ---
  useEffect(() => {
    const initializeMainPlayer = () => {
      // Only initialize if iframe exists AND player hasn't been initialized yet
      if (iframeRef.current && !playerRef.current) {
        console.log('Main useEffect: Initializing main player with iframe:', iframeRef.current);
        playerRef.current = initializeVimeoPlayer(iframeRef.current, false);
      } else if (playerRef.current) {
        console.log('Main useEffect: Player already initialized, skipping.');
      } else {
        console.log('Main useEffect: Iframe ref not yet available.');
      }
    };

    initializeMainPlayer(); // Attempt immediate initialization

    // The onload on the iframe itself is generally more reliable
    // You can remove this specific timeout if the iframe.onload works reliably
    // const timer = setTimeout(initializeMainPlayer, 1000);

    return () => {
      console.log('Main useEffect cleanup: Attempting to destroy main player if it exists.');
      if (playerRef.current) {
        playerRef.current.destroy().then(() => {
          console.log('Main Vimeo player destroyed successfully.');
        }).catch(err => console.error("Error destroying main Vimeo player:", err));
        playerRef.current = null;
      }
    };
  }, [initializeVimeoPlayer]); // Depend on initializeVimeoPlayer

  // --- Initialize modal player when modal opens ---
  useEffect(() => {
    const initializeModalPlayer = () => {
      if (isModalOpen && modalIframeRef.current && !modalPlayerRef.current) {
        console.log('Modal useEffect: Initializing modal player with iframe:', modalIframeRef.current);
        modalPlayerRef.current = initializeVimeoPlayer(modalIframeRef.current, true);
      } else if (modalPlayerRef.current) {
        console.log('Modal useEffect: Modal player already initialized, skipping.');
      } else if (!isModalOpen) {
        console.log('Modal useEffect: Modal not open, skipping initialization.');
      } else {
        console.log('Modal useEffect: Modal iframe ref not yet available.');
      }
    };

    if (isModalOpen) {
      initializeModalPlayer();
    }
    
    // Cleanup for modal player
    return () => {
      console.log('Modal useEffect cleanup: Attempting to destroy modal player if it exists.');
      if (modalPlayerRef.current) {
        modalPlayerRef.current.destroy().then(() => {
          console.log('Modal Vimeo player destroyed successfully.');
        }).catch(err => console.error("Error destroying modal Vimeo player:", err));
        modalPlayerRef.current = null;
      }
    };
  }, [isModalOpen, initializeVimeoPlayer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div 
        className="mv-video-container"
        ref={containerRef}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onClick={togglePlay}
      >
        <div className="mv-video-wrapper">
          <iframe
            ref={iframeRef}
            src={`${src.split('?')[0]}?dnt=1&api=1&player_id=main-vimeo-player&controls=0&title=0&byline=0&portrait=0&h=614c8d51f4`}
            className="mv-video-iframe"
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            id="main-vimeo-player"
            onLoad={() => {
              console.log('Main iframe loaded');
              // Try to initialize player after iframe loads
              setTimeout(() => {
                if (iframeRef.current && !playerRef.current) {
                  console.log('Initializing player after iframe load');
                  playerRef.current = initializeVimeoPlayer(iframeRef.current, false);
                }
              }, 500);
            }}
            onError={(e) => console.error('Main iframe error:', e)}
          />
        </div>

        {/* Play Button - MV Agusta Style */}
        <button 
          className={`mv-play-button ${!isPlaying ? 'paused' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          <svg viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>

        {/* Controls - MV Agusta Style */}
        <div className="mv-controls" style={{ opacity: showControls ? 1 : 0 }}>
          <div className="mv-progress-container" onClick={handleProgressClick}>
            <div 
              className="mv-progress-bar" 
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          
          <div className="mv-controls-row">
            <div className="mv-control-button" onClick={togglePlay}>
              {isPlaying ? (
                <svg viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </div>
            
            <div className="mv-volume-container">
              <div className="mv-control-button" onClick={toggleMute}>
                {isMuted || volume === 0 ? (
                  <svg viewBox="0 0 24 24">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </div>
              <input
                type="range"
                className="mv-volume-slider"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <span className="mv-time-display">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            
            <div className="mv-control-button mv-fullscreen-button" onClick={openModal}>
              <svg viewBox="0 0 24 24">
                <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Video Player */}
      <div className={`mv-modal-overlay ${isModalOpen ? 'active' : ''}`} onClick={closeModal}>
        <div className="mv-modal-container" onClick={(e) => e.stopPropagation()}>
          {/* Focus Indicator */}
          <div className="mv-modal-focus-indicator"></div>
          
                     {/* Loading Animation */}
           {!isModalReady && (
             <div className="mv-modal-loading-overlay">
               <div className="mv-modal-loading-spinner"></div>
             </div>
           )}
          
          <button className="mv-modal-close" onClick={closeModal}>
            <svg viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>

          <div className="mv-modal-video-wrapper">
            <iframe
              ref={modalIframeRef}
              src={`${src.split('?')[0]}?dnt=1&api=1&player_id=modal-vimeo-player&controls=0&title=0&byline=0&portrait=0&h=614c8d51f4`}
              className="mv-modal-iframe"
              title={title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              id="modal-vimeo-player"
              onLoad={() => {
                console.log('Modal iframe loaded');
                // Try to initialize player after iframe loads
                setTimeout(() => {
                  if (modalIframeRef.current && !modalPlayerRef.current) {
                    console.log('Initializing modal player after iframe load');
                    modalPlayerRef.current = initializeVimeoPlayer(modalIframeRef.current, true);
                  }
                }, 500);
              }}
              onError={(e) => console.error('Modal iframe error:', e)}
            />
          </div>

          {/* Modal Play Button */}
          <button 
            className={`mv-modal-play-button ${isPlaying ? 'playing' : 'paused'} ${isModalReady ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>

          {/* Modal Controls */}
          <div className="mv-modal-controls">
            <div className="mv-modal-progress-container" onClick={handleProgressClick}>
              <div 
                className="mv-modal-progress-bar" 
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            
            <div className="mv-modal-controls-row">
              <div className="mv-modal-control-button" onClick={togglePlay}>
                {isPlaying ? (
                  <svg viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </div>
              
              <div className="mv-modal-volume-container">
                <div className="mv-modal-control-button" onClick={toggleMute}>
                  {isMuted || volume === 0 ? (
                    <svg viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  )}
                </div>
                <input
                  type="range"
                  className="mv-modal-volume-slider"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              <span className="mv-modal-time-display">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              
              <div className="mv-modal-control-button mv-modal-fullscreen-button" onClick={toggleFullscreen}>
                <svg viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

function App() {
  const videoRef = useRef(null);
  const heroRef = useRef(null);
  const backpackVideoRef = useRef(null);
  const lockVideoRef = useRef(null);
  const liningVideoRef = useRef(null);
  const backpackRightVideoRef = useRef(null);

  const [showHeroText, setShowHeroText] = useState(false);
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [showLockingArrow, setShowLockingArrow] = useState(true);
  const [visibleSection, setVisibleSection] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const lockingRef = useRef(null);
  const cutRef = useRef(null);
  const liningRef = useRef(null);
  const preorderRef = useRef(null);
  const backpackRef = useRef(null);

  const { scrollY } = useScroll();
  const fadeOut = useTransform(scrollY, [0, 300], [1, 0]);
  const blurValue = useTransform(scrollY, [0, 300], ["blur(0px)", "blur(12px)"]);
  const videoOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const sectionRefs = useMemo(() => ({
    locking: lockingRef,
    cut: cutRef,
    lining: liningRef,
    preorder: preorderRef,
    backpack: backpackRef,
  }), []);

  // Generic HTML5 Video management functions (keep for other videos)
  const playVideo = useCallback((videoElement) => {
    if (videoElement) {
      videoElement.play().catch(error => console.error("Error playing video:", error));
    }
  }, []);

  const handleVideoError = useCallback((videoElement, error) => {
    console.error(`Video error for ${videoElement?.src}:`, error);
    if (videoElement) {
      videoElement.load();
      setTimeout(() => playVideo(videoElement), 1000);
    }
  }, [playVideo]);

  const handleVideoEnded = useCallback((videoElement) => {
    if (videoElement) {
      videoElement.currentTime = 0;
      playVideo(videoElement);
    }
  }, [playVideo]);

  const handleVideoLoaded = useCallback((videoElement) => {
    if (videoElement) {
      console.log('Video loaded:', videoElement.src);
      playVideo(videoElement);
    }
  }, [playVideo]);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowHeroText(true), 2500);
    const timer2 = setTimeout(() => setShowSecondLine(true), 5000);
    const timer3 = setTimeout(() => setShowArrow(true), 5500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Custom video player is now fully implemented

  useEffect(() => {
    const initializeVideos = () => {
      const videos = [
        { ref: videoRef, name: 'background' },
        { ref: backpackVideoRef, name: 'backpack' },
        { ref: lockVideoRef, name: 'lock' },
        { ref: liningVideoRef, name: 'lining' },
        { ref: backpackRightVideoRef, name: 'backpack-right' }
      ];

      videos.forEach(({ ref, name }) => {
        if (ref.current) {
          ref.current.onerror = (e) => handleVideoError(ref.current, e);
          ref.current.onended = () => handleVideoEnded(ref.current);
          ref.current.onloadeddata = () => handleVideoLoaded(ref.current);
        }
      });
    };

    const playAllVideos = () => {
      const videos = [
        videoRef.current,
        backpackVideoRef.current,
        lockVideoRef.current,
        liningVideoRef.current,
        backpackRightVideoRef.current
      ];
      videos.forEach(video => playVideo(video));
    };

    initializeVideos();
    playAllVideos();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        playAllVideos();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVideoEnded, handleVideoError, handleVideoLoaded, playVideo]);

  // Handle section visibility for video playback (for HTML5 videos)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(window.scrollTimeout);
      window.scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 100);

      const scrollPosition = window.scrollY + window.innerHeight / 2;
      let currentSection = null;

      Object.entries(sectionRefs).forEach(([id, ref]) => {
        if (ref.current) {
          const { top, bottom } = ref.current.getBoundingClientRect();
          const sectionTop = top + window.scrollY;
          const sectionBottom = bottom + window.scrollY;

          if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
            currentSection = id;
          }
        }
      });

      if (currentSection !== visibleSection) {
        setVisibleSection(currentSection);
        // Reset locking arrow visibility when entering the section
        if (currentSection === "locking") {
          setShowLockingArrow(true);
          // Hide after 2 seconds
          setTimeout(() => {
            setShowLockingArrow(false);
          }, 2000);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionRefs, visibleSection]);

  const renderArrow = (id) => {
    // Remove arrow for the third section (cut)
    if (id === "cut") return null;
    
    // For the second section (locking), use the showLockingArrow state
    if (id === "locking" && !showLockingArrow) return null;

    return (
      id !== "preorder" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{
            opacity: visibleSection === id && !isScrolling ? 1 : 0,
            scale: visibleSection === id && !isScrolling ? 1 : 0.5,
            y: visibleSection === id && !isScrolling ? 0 : 20
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.3
          }}
          style={{ transformOrigin: "center" }}
          className="mt-8 sm:mt-12 text-white pointer-events-none flex justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 sm:w-10 sm:h-10 animate-bounce"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25L12 15.75 4.5 8.25"
            />
          </svg>
        </motion.div>
      )
    );
  };

  const [showContactModal, setShowContactModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    subject: 'Retailer Partnership Inquiry'
  });
  const [formStatus, setFormStatus] = useState({ status: '', message: '' }); // For form submission feedback

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ status: 'sending', message: 'Sending...' });

    // Replace 'your-project-id' with your actual Firebase project ID.
    // You can find it in your .firebaserc file or Firebase console.
    const functionUrl = 'https://us-central1-shuan-40912.cloudfunctions.net/sendMail';

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormStatus({ status: 'success', message: 'Message sent successfully!' });
        setFormData({
          name: '',
          email: '',
          company: '',
          message: '',
          subject: 'Retailer Partnership Inquiry'
        });
        setTimeout(() => setShowContactModal(false), 2000); // Close modal after 2 seconds
      } else {
        const errorText = await response.text();
        setFormStatus({ status: 'error', message: `Failed to send message. ${errorText}` });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setFormStatus({ status: 'error', message: 'An unexpected error occurred.' });
    }
  };

  const [showMobileNav, setShowMobileNav] = useState(false);

  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-x-hidden scroll-smooth scroll-snap-y snap-mandatory">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-brand">SHUAN</h1>
              <span className="text-xs sm:text-sm text-gray-400 font-light font-mono">GEAR</span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#reveal" className="text-sm text-gray-300 hover:text-white transition-colors duration-200">Product</a>
              <a href="#locking" className="text-sm text-gray-300 hover:text-white transition-colors duration-200">Features</a>
              <a href="#backpack" className="text-sm text-gray-300 hover:text-white transition-colors duration-200">Design</a>
              <a href="#preorder" className="text-sm text-gray-300 hover:text-white transition-colors duration-200">Partnership</a>
            </nav>

            {/* Hamburger for Mobile */}
            <button
              className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => setShowMobileNav((v) => !v)}
              aria-label="Open navigation menu"
            >
              <FaBars className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
        {/* Mobile Nav Dropdown */}
        {showMobileNav && (
          <div className="md:hidden absolute top-full left-0 w-full bg-black/95 border-b border-white/10 shadow-lg z-50">
            <nav className="flex flex-col items-center py-4 space-y-4">
              <a href="#reveal" className="text-base text-gray-100 hover:text-white" onClick={() => setShowMobileNav(false)}>Product</a>
              <a href="#locking" className="text-base text-gray-100 hover:text-white" onClick={() => setShowMobileNav(false)}>Features</a>
              <a href="#backpack" className="text-base text-gray-100 hover:text-white" onClick={() => setShowMobileNav(false)}>Design</a>
              <a href="#preorder" className="text-base text-gray-100 hover:text-white" onClick={() => setShowMobileNav(false)}>Partnership</a>
            </nav>
          </div>
        )}
      </motion.header>

      {/* 🎥 Background Video */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ filter: blurValue, opacity: videoOpacity }}
        className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none"
      >
        <video
          ref={videoRef}
          src={`${process.env.PUBLIC_URL}/looped.mp4`}
          className="absolute top-0 left-0 w-full h-full object-contain"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            background: 'black'
          }}
          onError={(e) => {
            console.error('Video loading error:', e);
            if (videoRef.current) {
              videoRef.current.src = `${process.env.PUBLIC_URL}/looped1.mp4`;
              videoRef.current.load();
            }
          }}
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/80 via-black/30 to-transparent z-10" />
      </motion.div>

      {/* ✨ Hero Section */}
      <motion.div
        style={{ opacity: fadeOut }}
        ref={heroRef}
        className="relative z-30 w-full h-screen flex flex-col justify-center items-center px-4 sm:px-6 text-center pointer-events-none space-y-8 sm:space-y-16 snap-start pt-16 sm:pt-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showHeroText ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformOrigin: "center" }}
          className="space-y-3 sm:space-y-4"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-brand">SHUAN</h1>
          <p className="text-sm sm:text-base md:text-lg max-w-xs sm:max-w-xl mx-auto text-gray-300 leading-relaxed font-light">
            The sleekest helmet storage solution for naked and sport motorbikes
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showSecondLine ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformOrigin: "center" }}
          className="space-y-2 sm:space-y-3"
        >
          <h2 className="text-base sm:text-lg md:text-2xl font-semibold font-display">Built for urban riders</h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-400 leading-relaxed max-w-xs sm:max-w-xl mx-auto font-light">
            Designed to keep your gear secure and your motorbike looking sharp
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={showArrow && !isScrolling ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.5, y: 20 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.3
          }}
          style={{ transformOrigin: "center" }}
          className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 sm:w-8 sm:h-8 animate-bounce"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25L12 15.75 4.5 8.25"
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Dynamic Sections */}
      <AnimatePresence mode="wait">
        {["reveal", "locking", "cut", "lining", "backpack", "preorder"].map((id) => (
          <motion.section
            key={id}
            ref={sectionRefs[id]}
            id={id}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.5,
                ease: "easeOut"
              }
            }}
            exit={{
              opacity: 0,
              y: -20,
              transition: {
                duration: 0.3,
                ease: "easeIn"
              }
            }}
            style={{ transformOrigin: "center" }}
            className={`relative z-40 w-full bg-black text-white px-4 sm:px-6 py-8 sm:py-12 text-center snap-start flex flex-col justify-center items-center gap-4 sm:gap-6 ${id === "preorder" ? "pb-8 sm:pb-10" : ""}`}
          >
            {(() => {
              switch (id) {
                case "reveal":
                  return (
                    <div className="mv-video-section">
                      <div className="mv-video-content">
                        <h2 className="mv-video-title font-display">
                          The Bag. Reimagined.
                        </h2>
                        <p className="mv-video-description font-light">
                          <span className="font-brand">SHUAN</span>'s cut-resistant, lockable, under-seat mounted helmet storage is built for riders who care about style and security.
                        </p>
                        
                        {/* Video Player - MV Agusta Style */}
                        <MVAgustaVideoPlayer
                          src="https://player.vimeo.com/video/1085267809?h=614c8d51f4&controls=0&title=0&byline=0&portrait=0&muted=1&autoplay=0"
                          title="vimeo-player"
                        />
                      </div>
                    </div>
                  );
                case "locking":
                  return (
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      <div className="space-y-4 sm:space-y-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight font-display">Secure Locking System</h2>
                        <video
                          ref={lockVideoRef}
                          src={`${process.env.PUBLIC_URL}/lock-loop.mp4`}
                          className="w-full rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl"
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                          controls={false}
                          style={{ width: '100%', height: 'auto' }}
                        />
                        <p className="text-sm sm:text-base md:text-lg text-gray-400">
                          Built-in under-seat locking system that connects directly to your motorbike's frame or latch.
                        </p>
                        <div className="text-xs text-gray-500 font-mono">
                          <span className="block">Lock Type: Stainless Steel</span>
                          <span className="block">Security Rating: Grade 8</span>
                        </div>
                      </div>
                      <div className="space-y-4 sm:space-y-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight font-display">Layered Cut-Resistance</h2>
                        <motion.img
                          src={`${process.env.PUBLIC_URL}/5555.png`}
                          className="w-full rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl object-cover"
                          alt="Steel Protection"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5 }}
                          style={{ width: '100%', height: 'auto' }}
                        />
                        <p className="text-sm sm:text-base md:text-lg text-gray-400">
                          Dyneema® exterior reinforced with internal stainless steel makes slashing and cutting nearly impossible.
                        </p>
                        <div className="text-xs text-gray-500 font-mono">
                          <span className="block">Material: Dyneema® + Steel</span>
                          <span className="block">Cut Resistance: Level 5</span>
                        </div>
                      </div>
                      <div className="space-y-4 sm:space-y-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight font-display">Removable Inner Lining</h2>
                        <video
                          ref={liningVideoRef}
                          src={`${process.env.PUBLIC_URL}/innerlining.mp4`}
                          className="w-full rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="auto"
                          controls={false}
                          style={{ width: '100%', height: 'auto' }}
                          onError={(e) => {
                            console.error('Innerlining video error:', e);
                            if (liningVideoRef.current) {
                              console.log('Current video source:', liningVideoRef.current.src);
                              console.log('Video error code:', liningVideoRef.current.error?.code);
                              console.log('Video error message:', liningVideoRef.current.error?.message);
                            }
                          }}
                        />
                        <p className="text-sm sm:text-base md:text-lg text-gray-400">
                          Stay fresh. The inside lining is machine-washable and easily removable.
                        </p>
                        <div className="text-xs text-gray-500 font-mono">
                          <span className="block">Lining: Removable</span>
                          <span className="block">Care: Machine Washable</span>
                        </div>
                      </div>
                    </div>
                  );
                case "backpack":
                  return (
                    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-center">Wear it when you need it. Tuck it when you don't</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <div className="space-y-3 sm:space-y-4">
                          <video
                            ref={backpackVideoRef}
                            src={`${process.env.PUBLIC_URL}/backpack-animation1.mp4`}
                            className="w-full rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            controls={false}
                            style={{ width: '100%', height: 'auto' }}
                            onEnded={() => {
                              setTimeout(() => {
                                if (backpackVideoRef.current) {
                                  backpackVideoRef.current.play();
                                }
                              }, 4000);
                            }}
                          />
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          <video
                            ref={backpackRightVideoRef}
                            src={`${process.env.PUBLIC_URL}/backpack23-animation-loop.mp4`}
                            className="w-full rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            controls={false}
                            style={{ width: '100%', height: 'auto' }}
                          />
                        </div>
                      </div>
                      <p className="text-sm sm:text-base md:text-lg text-gray-400 text-center max-w-xs sm:max-w-2xl mx-auto">
                        From your motorbike to your back in seconds. Straps deploy when needed, vanish when not.
                      </p>
                    </div>
                  );
                case "preorder":
                  return null;
                default:
                  return null;
              }
            })()}
            {renderArrow(id)}
          </motion.section>
        ))}
            </AnimatePresence>

      {/* Partner Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center space-y-6 sm:space-y-8 mt-12 sm:mt-16 px-4 sm:px-6"
      >
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-brand">
            Partner With SHUAN
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
            Be among the first to offer the most secure helmet storage solution for modern riders.
          </p>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
            We're currently inviting select distributors and gear retailers to join our early launch network.
          </p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowContactModal(true)}
          className="px-8 py-3 sm:px-10 sm:py-4 bg-white text-black text-base sm:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
        >
          <span className="relative z-10">Contact Us to Join the Launch</span>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.button>
      </motion.div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowContactModal(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Form Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-brand">Partner With SHUAN</h3>
                <p className="text-gray-400 text-sm sm:text-base">Join our early launch network</p>
              </div>

              {/* Contact Form */}
              {formStatus.status === 'success' ? (
                <div className="text-center py-10">
                  <p className="text-lg text-green-400">{formStatus.message}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                    <input
                      type="text"
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your company name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                      placeholder="Tell us about your interest in partnering with SHUAN"
                      required
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full px-6 py-3 bg-white text-black font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:bg-gray-400"
                    disabled={formStatus.status === 'sending'}
                  >
                    {formStatus.status === 'sending' ? 'Sending...' : 'Send Message'}
                  </motion.button>
                  {formStatus.status === 'error' && (
                    <p className="text-sm text-red-500 text-center">{formStatus.message}</p>
                  )}
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-40 w-full bg-black/50 backdrop-blur-sm py-8 mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-center sm:text-left">
            <p className="text-sm text-gray-400 whitespace-nowrap">© 2025 <span className="font-brand text-lg">SHUAN</span> Inc. All rights reserved.</p>
            <div className="flex flex-row flex-wrap gap-2 sm:gap-6">
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200 whitespace-nowrap"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setShowTermsModal(true)}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200 whitespace-nowrap"
              >
                Terms of Use
              </button>
              <button
                onClick={() => setShowLegalModal(true)}
                className="text-sm text-gray-400 hover:text-white transition-colors duration-200 whitespace-nowrap"
              >
                Legal
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPrivacyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white font-brand">SHUAN Privacy Policy</h3>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4 text-gray-300 text-sm sm:text-base">
                <p>Effective Date: March 2024</p>
                <p><span className="font-brand">SHUAN</span> respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you visit our website (shuangear.com), contact us, or engage with our services.</p>
                
                <h4 className="text-white font-semibold mt-6">1. Information We Collect</h4>
                <p>Personal Information: Name, email address, company name, country, and any information you voluntarily submit via our forms.</p>
                <p>Usage Data: IP address, browser type, time zone, pages visited, and time spent on site (via cookies and analytics tools).</p>

                <h4 className="text-white font-semibold mt-6">2. How We Use Your Information</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>To respond to inquiries and partnership requests.</li>
                  <li>To improve our website and services.</li>
                  <li>To communicate with you about updates, offerings, or opportunities (with your consent).</li>
                </ul>

                <h4 className="text-white font-semibold mt-6">3. Sharing Your Information</h4>
                <p>We do not sell, rent, or trade your personal information. We may share it only:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>With service providers assisting us (e.g., hosting, analytics) under confidentiality.</li>
                  <li>When legally required (e.g., by law enforcement).</li>
                </ul>

                <h4 className="text-white font-semibold mt-6">4. Data Security</h4>
                <p>We implement reasonable technical and organizational safeguards to protect your data.</p>

                <h4 className="text-white font-semibold mt-6">5. International Users</h4>
                <p>If you are visiting from outside the European Union or other regions with laws governing data collection, your information may be transferred to and processed in countries where our servers are located.</p>

                <h4 className="text-white font-semibold mt-6">6. Your Rights</h4>
                <p>Depending on your location, you may have the right to access, correct, or delete your personal data. Contact us at: privacy@shuangear.com</p>

                <h4 className="text-white font-semibold mt-6">7. Updates</h4>
                <p>This policy may be updated from time to time. Any changes will be posted on this page.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms of Use Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white font-brand">SHUAN Terms of Use</h3>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4 text-gray-300 text-sm sm:text-base">
                <p>Effective Date: March 2024</p>
                <p>Welcome to shuangear.com. By accessing or using our website, you agree to these Terms of Use.</p>

                <h4 className="text-white font-semibold mt-6">1. Use of Site</h4>
                <p>This website is provided for informational and business purposes only. You may not use it for any unlawful or unauthorized activity.</p>

                <h4 className="text-white font-semibold mt-6">2. Intellectual Property</h4>
                <p>All content on this site — including logos, text, graphics, and images — is the property of <span className="font-brand">SHUAN</span> and protected by applicable intellectual property laws.</p>

                <h4 className="text-white font-semibold mt-6">3. Third-Party Links</h4>
                <p>Our site may contain links to third-party websites. We are not responsible for their content or practices.</p>

                <h4 className="text-white font-semibold mt-6">4. Limitation of Liability</h4>
                <p>We are not liable for any indirect, incidental, or consequential damages arising from your use of the site.</p>

                <h4 className="text-white font-semibold mt-6">5. Modifications</h4>
                <p>We may update these Terms at any time. Continued use constitutes acceptance of changes.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legal Modal */}
      <AnimatePresence>
        {showLegalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowLegalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black/90 border border-white/10 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white font-brand">SHUAN Legal Disclaimer</h3>
                <button
                  onClick={() => setShowLegalModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4 text-gray-300 text-sm sm:text-base">
                <p>Last Updated: March 2024</p>
                <p>The information provided on this website is for general informational purposes only. <span className="font-brand">SHUAN</span> makes no warranties regarding the accuracy or completeness of any information.</p>
                <p>Use of this website does not create any legal relationship between <span className="font-brand">SHUAN</span> and the user. For legal advice, please consult a qualified professional.</p>
                <p>All product visuals and descriptions are conceptual and may evolve prior to launch. Any early access or interest shown does not constitute a binding agreement.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

