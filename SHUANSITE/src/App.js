import "./index.css";
import "./App.css";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Player from "@vimeo/player";
import { FaBars } from "react-icons/fa";

console.log("App.js loaded! (SHUANSITE/src/App.js)");

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

function App() {
  const isMobile = useIsMobile();
  
  const videoRef = useRef(null);
  const heroRef = useRef(null);
  const revealVideoRef = useRef(null);
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
  const [videosLoaded, setVideosLoaded] = useState({
    lock: false,
    lining: false,
    backpack: false,
    backpackRight: false
  });

  // --- Custom YouTube Player State ---
  // Removing unused variables to fix ESLint warnings
  // const [isPlaying, setIsPlaying] = useState(false);
  // const [showControls, setShowControls] = useState(false);
  // const [isMuted, setIsMuted] = useState(false);
  // const [volume, setVolume] = useState(1);
  // const [duration, setDuration] = useState(0);
  // const [progress, setProgress] = useState(0);

  const lockingRef = useRef(null);
  const cutRef = useRef(null);
  const liningRef = useRef(null);
  const preorderRef = useRef(null);
  const backpackRef = useRef(null);

  const { scrollY } = useScroll();
  const fadeOut = useTransform(scrollY, [0, 300], [1, 0]);

  const sectionRefs = useMemo(
    () => ({
      locking: lockingRef,
      cut: cutRef,
      lining: liningRef,
      preorder: preorderRef,
      backpack: backpackRef,
    }),
    []
  );

  // Generic HTML5 Video management functions (keep for other videos)
  const playVideo = useCallback((videoElement) => {
    if (videoElement) {
      videoElement
        .play()
        .catch((error) => console.error("Error playing video:", error));
    }
  }, []);

  const handleVideoError = useCallback(
    (videoElement, error) => {
      console.error(`Video error for ${videoElement?.src}:`, error);
      if (videoElement) {
        videoElement.load();
        setTimeout(() => playVideo(videoElement), 1000);
      }
    },
    [playVideo]
  );

  const handleVideoEnded = useCallback(
    (videoElement) => {
      if (videoElement) {
        videoElement.currentTime = 0;
        playVideo(videoElement);
      }
    },
    [playVideo]
  );

  const handleVideoLoaded = useCallback(
    (videoElement) => {
      if (videoElement) {
        console.log("Video loaded:", videoElement.src);
        playVideo(videoElement);
      }
    },
    [playVideo]
  );

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

  // Clean and robust scroll function
  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 80;
      // Use isMobile from component scope
      const extraOffset = isMobile ? 4 : 8; // Smaller offset on mobile
      const elementPosition = element.offsetTop - headerHeight - extraOffset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  }, [isMobile]);

  // Custom Video Player Controls
  // const [isPlaying, setIsPlaying] = useState(false); // REMOVE DUPLICATE
  // const [showControls, setShowControls] = useState(false); // REMOVE DUPLICATE

  useEffect(() => {
    const video = revealVideoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration > 0) {
        const progress = (video.currentTime / video.duration) * 100;
        const progressBar = document.getElementById('video-progress');
        if (progressBar) {
          progressBar.style.width = `${progress}%`;
        }
      }
    };

    const updateVolumeDisplay = () => {
      const volumeBar = document.getElementById('volume-progress');
      if (volumeBar) {
        volumeBar.style.width = `${video.volume * 100}%`;
      }
    };

    // Remove unused event handlers
    // const handlePlay = () => setIsPlaying(true);
    // const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('volumechange', updateVolumeDisplay);
    video.addEventListener('loadedmetadata', updateVolumeDisplay);
    // video.addEventListener('play', handlePlay);
    // video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('volumechange', updateVolumeDisplay);
      video.removeEventListener('loadedmetadata', updateVolumeDisplay);
      // video.removeEventListener('play', handlePlay);
      // video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Custom video player is now fully implemented

  useEffect(() => {
    const initializeVideos = () => {
      const videos = [
        { ref: videoRef, name: "background" },
      // { ref: revealVideoRef, name: "reveal" }, // YouTube iframe - handled separately
        { ref: backpackVideoRef, name: "backpack" },
        { ref: lockVideoRef, name: "lock" },
        { ref: liningVideoRef, name: "lining" },
        { ref: backpackRightVideoRef, name: "backpack-right" },
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
      // revealVideoRef.current, // YouTube iframe - handled by YouTube
        backpackVideoRef.current,
        lockVideoRef.current,
        liningVideoRef.current,
        backpackRightVideoRef.current,
      ];
      videos.forEach((video) => playVideo(video));
    };

    initializeVideos();
    playAllVideos();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        playAllVideos();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [handleVideoEnded, handleVideoError, handleVideoLoaded, playVideo]);

  // Intersection Observer for lazy loading videos
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const videoType = entry.target.dataset.videoType;
          if (videoType && !videosLoaded[videoType]) {
            setVideosLoaded(prev => ({ ...prev, [videoType]: true }));
            
            // Load the video when it comes into view
            const video = entry.target.querySelector('video');
            if (video && video.preload === 'metadata') {
              video.preload = 'auto';
              video.load();
            }
          }
        }
      });
    }, observerOptions);

    // Observe video containers
    const videoContainers = document.querySelectorAll('[data-video-type]');
    videoContainers.forEach(container => observer.observe(container));

    return () => {
      videoContainers.forEach(container => observer.unobserve(container));
    };
  }, [videosLoaded]);

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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionRefs, visibleSection]);

  // (Background video fade-out is handled by scroll-based opacity below)

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
            y: visibleSection === id && !isScrolling ? 0 : 20,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.3,
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
    name: "",
    email: "",
    company: "",
    message: "",
    subject: "Retailer Partnership Inquiry",
  });
  const [formStatus, setFormStatus] = useState({ status: "", message: "" }); // For form submission feedback

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ status: "sending", message: "Sending..." });

    const functionUrl =
      "https://sendmail-psqg2yc2xq-uc.a.run.app";

    try {
      console.log('Submitting form data:', formData);
      console.log('Function URL:', functionUrl);
      
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response URL:', response.url);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Success response:', responseData);
        
        setFormStatus({
          status: "success",
          message: "Message sent successfully!",
        });
        setFormData({
          name: "",
          email: "",
          company: "",
          message: "",
          subject: "Retailer Partnership Inquiry",
        });
        setTimeout(() => setShowContactModal(false), 2000); // Close modal after 2 seconds
      } else {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        
        console.error('Error response:', response.status, errorMessage);
        setFormStatus({
          status: "error",
          message: `Failed to send message: ${errorMessage}`,
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      let errorMessage = "Network error occurred";
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = "Unable to connect to server. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setFormStatus({
        status: "error",
        message: errorMessage,
      });
    }
  };

  const [showMobileNav, setShowMobileNav] = useState(false);

  // YouTube modal state for reveal section
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isYouTubeModalOpen) setIsYouTubeModalOpen(false);
    };
    if (isYouTubeModalOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isYouTubeModalOpen]);

  // --- BEGIN REWRITE: Vimeo Modal Logic ---
  const [isVimeoModalOpen, setIsVimeoModalOpen] = useState(false);
  const [vimeoPlaying, setVimeoPlaying] = useState(false);
  const [vimeoVolume, setVimeoVolume] = useState(0);
  const [vimeoDuration, setVimeoDuration] = useState(0);
  const [vimeoCurrent, setVimeoCurrent] = useState(0);
  const vimeoIframeRef = useRef(null);
  const vimeoPlayerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Vimeo Player API setup - Simplified
  useEffect(() => {
    if (!isVimeoModalOpen || !vimeoIframeRef.current) return;

    const initPlayer = async () => {
      try {
        console.log('Initializing Vimeo player...');
        
        if (!vimeoIframeRef.current) return;
        
        console.log('Creating Vimeo player instance...');
        vimeoPlayerRef.current = new Player(vimeoIframeRef.current);
        
        // Set up event listeners
        vimeoPlayerRef.current.on('play', () => {
          console.log('Vimeo play event');
          setVimeoPlaying(true);
        });
        
        vimeoPlayerRef.current.on('pause', () => {
          console.log('Vimeo pause event');
          setVimeoPlaying(false);
        });
        
        vimeoPlayerRef.current.on('timeupdate', (data) => {
          setVimeoCurrent(data.seconds);
        });
        
        vimeoPlayerRef.current.on('loaded', (data) => {
          console.log('Vimeo loaded, duration:', data.duration);
          setVimeoDuration(data.duration);
          // Ensure video starts muted
          setVimeoVolume(0);
        });
        
        // Get initial state
        const duration = await vimeoPlayerRef.current.getDuration();
        const current = await vimeoPlayerRef.current.getCurrentTime();
        
        setVimeoDuration(duration);
        setVimeoCurrent(current);
        // Ensure video starts muted
        setVimeoVolume(0);
        
      } catch (error) {
        console.error('Error setting up Vimeo event listeners:', error);
      }
    };
    
    initPlayer().catch(error => {
      console.error('Error initializing Vimeo player:', error);
    });
    
    return () => {
      if (vimeoPlayerRef.current) {
        try {
          vimeoPlayerRef.current.unload();
        } catch (error) {
          console.error('Error unloading Vimeo player:', error);
        }
        vimeoPlayerRef.current = null;
      }
    };
  }, [isVimeoModalOpen]);

  // Controls auto-hide logic - Simplified
  useEffect(() => {
    if (!isVimeoModalOpen) return;
    
    console.log('Setting up controls auto-hide...');
    
    const showControls = () => {
      setControlsVisible(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        console.log('Hiding controls...');
        setControlsVisible(false);
      }, 2000);
    };
    
    const handleMouseMove = () => showControls();
    const handleTouchStart = () => showControls();
    
    // Show controls initially
    showControls();
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isVimeoModalOpen]);

  // Real-time timeline/volume updates - Simplified
  useEffect(() => {
    if (!isVimeoModalOpen || !vimeoPlayerRef.current) return;
    
    console.log('Setting up real-time updates...');
    
    const updateProgress = async () => {
      if (vimeoPlayerRef.current) {
        try {
          const current = await vimeoPlayerRef.current.getCurrentTime();
          const duration = await vimeoPlayerRef.current.getDuration();
          
          setVimeoCurrent(current);
          setVimeoDuration(duration);
        } catch (error) {
          console.error('Error updating progress:', error);
        }
      }
    };
    
    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, [isVimeoModalOpen]);

  // Play/pause handler - Simplified
  const handleVimeoPlayPause = (e) => {
    if (e) e.stopPropagation();
    console.log('Play/pause clicked, player ref:', !!vimeoPlayerRef.current, 'currently playing:', vimeoPlaying);
    
    if (!vimeoPlayerRef.current) {
      console.log('No player ref available');
      return;
    }
    
    try {
      if (vimeoPlaying) {
        console.log('Attempting to pause...');
        vimeoPlayerRef.current.pause().then(() => {
          console.log('Pause successful');
        }).catch(err => {
          console.error('Pause failed:', err);
        });
      } else {
        console.log('Attempting to play...');
        vimeoPlayerRef.current.play().then(() => {
          console.log('Play successful');
        }).catch(err => {
          console.error('Play failed:', err);
        });
      }
    } catch (error) {
      console.error('Error in play/pause:', error);
    }
  };
  
  // Volume handler - Simplified
  const handleVimeoVolume = (volumeLevel) => {
    console.log('Volume change:', volumeLevel);
    if (!vimeoPlayerRef.current) return;
    
    try {
      const newVolume = Math.max(0, Math.min(1, volumeLevel));
      vimeoPlayerRef.current.setVolume(newVolume);
      setVimeoVolume(newVolume);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };
  
  // Timeline seek handler - Simplified
  const handleVimeoTimelineSeek = (timePosition) => {
    console.log('Timeline seek:', timePosition);
    if (!vimeoPlayerRef.current) return;
    
    try {
      const newTime = Math.max(0, Math.min(vimeoDuration, timePosition));
      vimeoPlayerRef.current.setCurrentTime(newTime);
      setVimeoCurrent(newTime);
    } catch (error) {
      console.error('Error seeking timeline:', error);
    }
  };
  
  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- END REWRITE: Vimeo Modal Logic ---

  // Modal ESC close and body blur
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isVimeoModalOpen) setIsVimeoModalOpen(false);
    };
    
    if (isVimeoModalOpen) {
      document.addEventListener("keydown", handleEsc);
      // Don't manipulate body styles at all - let the modal handle itself
    } else {
      document.removeEventListener("keydown", handleEsc);
    }
    
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isVimeoModalOpen]);

  // Removed unused handleVideoAreaClick function

  return (
    <div 
      className="relative w-full min-h-screen text-white overflow-x-hidden scroll-smooth scroll-snap-y snap-mandatory"
      style={{ backgroundColor: 'black' }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isVimeoModalOpen ? 0 : 1, y: isVimeoModalOpen ? -20 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/20 shadow-lg"
        style={{
          display: isVimeoModalOpen ? 'none' : 'block',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-1"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight font-brand">
                SHUAN
              </h1>
              <span className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-400 font-light font-mono">
                GEAR
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-10">
              <button
                onClick={() => scrollToSection('reveal')}
                className="text-sm sm:text-base md:text-lg text-gray-300 hover:text-white transition-colors duration-200"
              >
                Reveal
              </button>
              <button
                onClick={() => scrollToSection('locking')}
                className="text-sm sm:text-base md:text-lg text-gray-300 hover:text-white transition-colors duration-200"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('backpack')}
                className="text-sm sm:text-base md:text-lg text-gray-300 hover:text-white transition-colors duration-200"
              >
                Hidden Straps
              </button>
              <button
                onClick={() => scrollToSection('preorder')}
                className="text-sm sm:text-base md:text-lg text-gray-300 hover:text-white transition-colors duration-200"
              >
                Partnership
              </button>
            </nav>

            {/* Hamburger for Mobile */}
            <button
              className="md:hidden p-2 sm:p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 hover:bg-white/10 active:bg-white/20"
              onClick={() => setShowMobileNav((v) => !v)}
              aria-label="Open navigation menu"
              aria-expanded={showMobileNav}
              aria-controls="mobile-nav-menu"
            >
              <FaBars className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>
        </div>
        {/* Mobile Nav Dropdown */}
        {showMobileNav && (
          <div 
            id="mobile-nav-menu"
            className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-md border-b border-white/10 shadow-2xl z-50"
          >
            <nav className="flex flex-col items-center py-4 sm:py-6 space-y-1 sm:space-y-2">
              <button
                onClick={() => {
                  const element = document.getElementById('reveal');
                  if (element) {
                    const header = document.querySelector('header');
                    const headerHeight = header ? header.offsetHeight : 80;
                    const elementPosition = element.offsetTop - headerHeight - 4;
                    window.scrollTo({
                      top: elementPosition,
                      behavior: 'smooth'
                    });
                  }
                  setShowMobileNav(false);
                }}
                className="w-full text-center py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-lg text-gray-100 hover:text-white hover:bg-white/5 transition-all duration-200 rounded-lg mx-2 sm:mx-4"
              >
                Reveal
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('locking');
                  if (element) {
                    const header = document.querySelector('header');
                    const headerHeight = header ? header.offsetHeight : 80;
                    const elementPosition = element.offsetTop - headerHeight - 4;
                    window.scrollTo({
                      top: elementPosition,
                      behavior: 'smooth'
                    });
                  }
                  setShowMobileNav(false);
                }}
                className="w-full text-center py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-lg text-gray-100 hover:text-white hover:bg-white/5 transition-all duration-200 rounded-lg mx-2 sm:mx-4"
              >
                Features
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('backpack');
                  if (element) {
                    const header = document.querySelector('header');
                    const headerHeight = header ? header.offsetHeight : 80;
                    const elementPosition = element.offsetTop - headerHeight - 4;
                    window.scrollTo({
                      top: elementPosition,
                      behavior: 'smooth'
                    });
                  }
                  setShowMobileNav(false);
                }}
                className="w-full text-center py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-lg text-gray-100 hover:text-white hover:bg-white/5 transition-all duration-200 rounded-lg mx-2 sm:mx-4"
              >
                Hidden Straps
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('preorder');
                  if (element) {
                    const header = document.querySelector('header');
                    const headerHeight = header ? header.offsetHeight : 80;
                    const elementPosition = element.offsetTop - headerHeight - 4;
                    window.scrollTo({
                      top: elementPosition,
                      behavior: 'smooth'
                    });
                  }
                  setShowMobileNav(false);
                }}
                className="w-full text-center py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-lg text-gray-100 hover:text-white hover:bg-white/5 transition-all duration-200 rounded-lg mx-2 sm:mx-4"
              >
                Partnership
              </button>
            </nav>
          </div>
        )}
      </motion.header>

      {/* 🎥 Background Video - fades out smoothly with scroll */}
      <motion.div
        initial={{ opacity: 1 }}
        style={{ 
          opacity: fadeOut,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
        className="fixed top-0 left-0 w-screen h-screen z-0 overflow-hidden pointer-events-none"
      >
        <video
          ref={videoRef}
          src={`${process.env.PUBLIC_URL}/looped.mp4`}
          className="absolute top-0 left-0 w-screen h-screen object-contain"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
          style={{
            width: "100vw",
            height: "100vh",
            objectFit: "contain",
            objectPosition: "center",
            background: "black",
            position: "absolute",
            top: 0,
            left: 0,
            minWidth: "100vw",
            minHeight: "100vh"
          }}
          onError={(e) => {
            console.error("Video loading error:", e);
            if (videoRef.current) {
              videoRef.current.src = `${process.env.PUBLIC_URL}/looped1.mp4`;
              videoRef.current.load();
            }
          }}
        />
      </motion.div>

      {/* ✨ Hero Section */}
      <motion.div
        style={{ opacity: fadeOut }}
        ref={heroRef}
        className="relative z-30 w-full min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center pointer-events-none space-y-4 sm:space-y-6 lg:space-y-8 snap-start pt-14 sm:pt-16 md:pt-20 lg:pt-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showHeroText ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformOrigin: "center" }}
          className="space-y-3 sm:space-y-4 lg:space-y-6"
        >
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tight leading-tight font-brand"
            style={{}}
          >
            SHUAN
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl mx-auto text-gray-300 leading-relaxed font-light px-2">
            The sleekest helmet storage solution for naked and sport motorbikes
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showSecondLine ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformOrigin: "center" }}
          className="space-y-2 sm:space-y-3 lg:space-y-4"
        >
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold leading-tight">
            Built for urban riders
          </h2>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-400 leading-relaxed max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl mx-auto font-light px-2">
            Designed to keep your gear secure and your motorbike looking sharp
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={
            showArrow && !isScrolling
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0, scale: 0.5, y: 20 }
          }
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.3,
          }}
          style={{ transformOrigin: "center" }}
          className="absolute bottom-8 sm:bottom-12 lg:bottom-16 left-1/2 -translate-x-1/2 pointer-events-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 animate-bounce cursor-pointer hover:text-gray-300 transition-colors duration-200"
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
        {["reveal", "locking", "cut", "lining", "backpack", "preorder"].map(
          (id) => (
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
                  ease: "easeOut",
                },
              }}
              exit={{
                opacity: 0,
                y: -20,
                transition: {
                  duration: 0.3,
                  ease: "easeIn",
                },
              }}
              style={{ transformOrigin: "center" }}
              className={`relative z-40 w-full bg-black text-white px-4 sm:px-6 py-6 sm:py-8 md:py-12 text-center snap-start flex flex-col justify-center items-center gap-3 sm:gap-4 md:gap-6 ${
                id === "preorder" ? "pb-6 sm:pb-8 md:pb-10" : ""
              }`}
            >
              {(() => {
                switch (id) {
                  case "reveal":
                    return (
                      <div className="mv-video-section">
                        <div className="mv-video-content">
                          <div className="space-y-2 sm:space-y-3 md:space-y-4">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-tight text-center font-display" style={{fontWeight: 'normal'}}>
                              Introducing:
                            </h2>
                            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal leading-tight text-center font-display" style={{fontWeight: 'normal'}}>
                              Your Helmet's New Home
                            </h3>
                          </div>
                          
                          {/* Spacing between text and video */}
                          <div className="mt-12 sm:mt-16 md:mt-20"></div>
                          
                          {/* Video Thumbnail/Player - click to open modal */}
                          <div 
                            className="w-full max-w-4xl mx-auto rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg sm:shadow-xl lg:shadow-2xl overflow-hidden relative group cursor-pointer"
                            style={{ aspectRatio: '16/9', maxHeight: '50vh' }}
                            onClick={() => setIsVimeoModalOpen(true)}
                          >
                            <iframe
                              src="https://player.vimeo.com/video/1085267809?background=0&autoplay=0&controls=0&title=0&byline=0&portrait=0"
                              className="absolute inset-0 w-full h-full"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                              title="SHUAN Product Reveal Vimeo Video"
                              tabIndex={-1}
                              style={{ pointerEvents: 'none', zIndex: 5 }}
                            />
                            {/* Play overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition z-20">
                              <button className="bg-white/80 hover:bg-white rounded-full p-6 shadow-lg transition" aria-label="Play video">
                                <svg className="w-12 h-12 text-black" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          {/* Modal Lightbox for Vimeo */}
                          <AnimatePresence>
                            {isVimeoModalOpen && (
                              <>
                                {/* Full screen blur overlay */}
                                <motion.div 
                                  className="fixed inset-0 z-[9998]"
                                  style={{
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                    backgroundColor: 'rgba(0,0,0,0.3)'
                                  }}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                />
                                
                                {/* Video modal container */}
                                <motion.div 
                                  className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  onClick={() => {
                                    console.log('Modal overlay clicked, closing...');
                                    setIsVimeoModalOpen(false);
                                  }}
                                >
                                                                <motion.div
                                  className="relative w-full max-w-6xl aspect-video rounded-xl overflow-hidden shadow-2xl"
                                  onClick={e => e.stopPropagation()}
                                  id="vimeo-modal-container"
                                  initial={{ scale: 0.8, opacity: 0, y: 50 }}
                                  animate={{ scale: 1, opacity: 1, y: 0 }}
                                  exit={{ scale: 0.8, opacity: 0, y: 50 }}
                                  transition={{ 
                                    duration: 0.4,
                                    ease: [0.25, 0.46, 0.45, 0.94]
                                  }}
                                  style={{
                                    maxHeight: '80vh',
                                    width: '100%',
                                    maxWidth: '12000px',
                                    minHeight: '400px',
                                    backgroundColor: 'transparent',
                                    zIndex: 10001,
                                    position: 'relative',
                                    isolation: 'isolate',
                                    backdropFilter: 'none',
                                    WebkitBackdropFilter: 'none'
                                  }}
                                >
                                {/* Close Button */}
                                <button 
                                  className={`absolute top-2 right-2 sm:top-4 sm:right-4 z-50 w-8 h-8 sm:w-10 sm:h-10 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10 ${
                                    controlsVisible ? 'opacity-100' : 'opacity-0'
                                  }`}
                                  onClick={() => {
                                    console.log('Close button clicked');
                                    setIsVimeoModalOpen(false);
                                  }} 
                                  aria-label="Close video"
                                >
                                  <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                                
                                {/* Vimeo Iframe or Video for Modal */}
                                {isMobile ? (
                                  <iframe
                                    ref={vimeoIframeRef}
                                    src="https://player.vimeo.com/video/1085267809?autoplay=1&controls=1&title=0&byline=0&portrait=0&fullscreen=1&pip=1&dnt=1&transparent=0&logo=0&color=ffffff&muted=1"
                                    className="absolute inset-0 w-full h-full border-0 rounded-xl"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                    title="SHUAN Product Reveal Vimeo Video Modal"
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      minHeight: '200px',
                                      backgroundColor: 'transparent',
                                      zIndex: 1,
                                      pointerEvents: 'auto',
                                      touchAction: 'manipulation'
                                    }}
                                    onLoad={() => console.log('Vimeo iframe loaded successfully')}
                                    onError={(e) => console.error('Vimeo iframe error:', e)}
                                  />
                                ) : (
                                  <iframe
                                    ref={vimeoIframeRef}
                                    src="https://player.vimeo.com/video/1085267809?h=1080&w=1920&autoplay=1&controls=0&title=0&byline=0&portrait=0&fullscreen=0&pip=0&dnt=1&transparent=0&logo=0&color=ffffff&background=1&muted=1&player_id=0&app_id=122963&autopause=0&badge=0&keyboard=0&playsinline=1&responsive=1&sidedock=0&pip=0&dnt=1&transparent=0&logo=0&color=ffffff&background=1&muted=1&h=1080&w=1920"
                                    className="absolute inset-0 w-full h-full border-0 rounded-xl"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                    title="SHUAN Product Reveal Vimeo Video Modal"
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      minHeight: '400px',
                                      backgroundColor: 'transparent',
                                      zIndex: 1,
                                      pointerEvents: 'auto',
                                      touchAction: 'manipulation'
                                    }}
                                    onLoad={() => console.log('Vimeo iframe loaded successfully')}
                                    onError={(e) => console.error('Vimeo iframe error:', e)}
                                  />
                                )}
                                
                                {/* Fallback content if iframe fails */}
                                <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none opacity-0">
                                  <div className="text-center">
                                    <p className="text-lg mb-2">Loading video...</p>
                                  </div>
                                </div>
                                
                                {/* Video Area Click Handler - Desktop Only */}
                                {!isMobile && (
                                  <div 
                                    className="absolute inset-0 z-10 cursor-pointer" 
                                    onClick={(e) => {
                                      console.log('Video area clicked');
                                      handleVimeoPlayPause(e);
                                    }}
                                  />
                                )}
                                
                                {/* Controls Bar - Desktop Only */}
                                {!isMobile && (
                                  <div 
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 sm:p-4 z-20"
                                  >
                                    {/* Top Controls Row */}
                                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                                      {/* Left: Play/Pause + Time */}
                                      <div className="flex items-center space-x-2 sm:space-x-3">
                                        <button 
                                          onClick={handleVimeoPlayPause} 
                                          className="w-8 h-8 sm:w-12 sm:h-12 text-white rounded-full flex items-center justify-center transition-colors hover:bg-white/10 active:bg-white/20" 
                                          aria-label={vimeoPlaying ? 'Pause' : 'Play'}
                                        >
                                          {vimeoPlaying ? (
                                            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                                            </svg>
                                          ) : (
                                            <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M8 5v14l11-7z"/>
                                            </svg>
                                          )}
                                        </button>
                                        
                                        <span className="text-white text-xs sm:text-base font-mono">
                                          {formatTime(vimeoCurrent)} / {formatTime(vimeoDuration)}
                                        </span>
                                      </div>
                                      
                                      {/* Right: Volume + Fullscreen */}
                                      <div className="flex items-center space-x-2 sm:space-x-3">
                                        {/* Volume Control */}
                                        <div className="flex items-center space-x-2 sm:space-x-2">
                                          {vimeoVolume === 0 ? (
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                                            </svg>
                                          ) : vimeoVolume < 0.5 ? (
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                                            </svg>
                                          ) : (
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                            </svg>
                                          )}
                                          
                                          <div
                                            className="w-12 h-1 sm:w-16 sm:h-1 bg-white/30 rounded-full cursor-pointer relative"
                                            onClick={e => {
                                              const rect = e.currentTarget.getBoundingClientRect();
                                              const x = e.clientX - rect.left;
                                              const volumeLevel = Math.max(0, Math.min(1, x / rect.width));
                                              console.log('Volume clicked:', volumeLevel);
                                              handleVimeoVolume(volumeLevel);
                                            }}
                                          >
                                            <div 
                                              className="absolute left-0 top-0 h-full bg-white rounded-full transition-all"
                                              style={{ width: `${vimeoVolume * 100}%` }}
                                            />
                                          </div>
                                        </div>
                                        
                                        {/* Fullscreen Button */}
                                        <button 
                                          onClick={() => {
                                            const container = document.getElementById('vimeo-modal-container');
                                            if (container) {
                                              if (document.fullscreenElement) {
                                                document.exitFullscreen();
                                              } else {
                                                container.requestFullscreen().catch(err => {
                                                  console.error('Error entering fullscreen:', err);
                                                });
                                              }
                                            }
                                          }} 
                                          className="w-6 h-6 sm:w-10 sm:h-10 text-white rounded flex items-center justify-center transition-colors hover:bg-white/10 active:bg-white/20" 
                                          aria-label="Fullscreen"
                                        >
                                          <svg className="w-3 h-3 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0l9 9m0 0v-4.5m0 4.5h-4.5m4.5 0l-9-9"/>
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {/* Timeline Bar */}
                                    <div
                                      className="w-full bg-white/30 rounded-full cursor-pointer relative"
                                      style={{ height: '8px' }}
                                      onClick={e => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const x = e.clientX - rect.left;
                                        const timePosition = (x / rect.width) * (vimeoDuration || 1);
                                        console.log('Timeline clicked:', timePosition);
                                        handleVimeoTimelineSeek(timePosition);
                                      }}
                                    >
                                      <div 
                                        className="absolute left-0 top-0 h-full bg-white rounded-full transition-all"
                                        style={{ width: `${vimeoDuration ? (vimeoCurrent / vimeoDuration) * 100 : 0}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                        
                        {/* Description text after video */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          viewport={{ once: true, margin: "-100px" }}
                          className="mt-8 sm:mt-12 md:mt-16"
                        >
                          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-300 text-center leading-relaxed max-w-4xl mx-auto px-4">
                            <span className="font-brand text-white">SHUAN</span>'s
                            cut-resistant, lockable, under-seat mounted helmet
                            storage<br />
                            is built for riders who care about security and style
                          </p>
                        </motion.div>
                        
                        {/* Arrow after video section */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, y: 20 }}
                          animate={{
                            opacity: visibleSection === "reveal" && !isScrolling ? 1 : 0,
                            scale: visibleSection === "reveal" && !isScrolling ? 1 : 0.5,
                            y: visibleSection === "reveal" && !isScrolling ? 0 : 20,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            duration: 0.3,
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
                      </div>
                    );
                  case "locking":
                    return (
                      <div className="max-w-7xl mx-auto">
                        {/* Flex row for features on md+ screens, stacked on mobile */}
                        <div className="flex flex-col md:flex-row md:justify-between md:gap-6 lg:gap-8 xl:gap-12 space-y-6 md:space-y-0">
                          <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6 min-w-0">
                            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight font-display text-center">
                            Secure Locking System
                          </h2>
                            <div className="relative w-full rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl lg:shadow-2xl" data-video-type="lock">
                              <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                          <video
                            ref={lockVideoRef}
                            src={`${process.env.PUBLIC_URL}/lock-loop.mp4`}
                                  className="absolute inset-0 w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            controls={false}
                          />
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-400 text-center md:text-left leading-relaxed">
                            Built-in under-seat locking system that connects
                            directly to your motorbike's frame or latch.
                          </p>
                          {isMobile && (
                            <div className="text-xs sm:text-sm text-gray-500 font-mono text-center md:text-left space-y-1 mt-2">
                              <span className="block">Lock Type: Stainless Steel</span>
                              <span className="block">Security Rating: Grade 8</span>
                            </div>
                          )}
                          </div>
                          <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6 min-w-0">
                            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight font-display text-center">
                            Layered Cut-Resistance
                          </h2>
                            <div className="relative w-full rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl lg:shadow-2xl">
                              <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                          <motion.img
                            src={`${process.env.PUBLIC_URL}/5555-optimized.png`}
                                  className="absolute inset-0 w-full h-full object-cover"
                            alt="Steel Protection"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            loading="lazy"
                          />
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-400 text-center md:text-left leading-relaxed">
                            Dyneema® exterior reinforced with internal stainless
                            steel makes slashing and cutting nearly impossible.
                          </p>
                          {isMobile && (
                            <div className="text-xs sm:text-sm text-gray-500 font-mono text-center md:text-left space-y-1 mt-2">
                              <span className="block">Material: Dyneema® + Steel</span>
                              <span className="block">Cut Resistance: Level 5</span>
                            </div>
                          )}
                          </div>
                          <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6 min-w-0">
                            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight font-display text-center">
                            Removable Inner Lining
                          </h2>
                            <div className="relative w-full rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl lg:shadow-2xl" data-video-type="lining">
                              <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                          <video
                            ref={liningVideoRef}
                            src={`${process.env.PUBLIC_URL}/innerlining.mp4`}
                                  className="absolute inset-0 w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            controls={false}
                            onError={(e) => {
                              console.error("Innerlining video error:", e);
                              if (liningVideoRef.current) {
                                console.log(
                                  "Current video source:",
                                  liningVideoRef.current.src
                                );
                                console.log(
                                  "Video error code:",
                                  liningVideoRef.current.error?.code
                                );
                                console.log(
                                  "Video error message:",
                                  liningVideoRef.current.error?.message
                                );
                              }
                            }}
                          />
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-400 text-center md:text-left leading-relaxed">
                            Stay fresh. The inside lining is machine-washable
                            and easily removable.
                          </p>
                          {isMobile && (
                            <div className="text-xs sm:text-sm text-gray-500 font-mono text-center md:text-left space-y-1 mt-2">
                              <span className="block">Lining: Removable</span>
                              <span className="block">Care: Machine Washable</span>
                            </div>
                          )}
                          </div>
                        </div>
                        {!isMobile && (
                          <div className="flex flex-col md:flex-row md:justify-between md:gap-6 lg:gap-8 xl:gap-12 mt-6 md:mt-8 space-y-4 md:space-y-0">
                            <div className="flex-1 text-xs sm:text-sm text-gray-500 font-mono text-center md:text-left space-y-1">
                              <span className="block">Lock Type: Stainless Steel</span>
                              <span className="block">Security Rating: Grade 8</span>
                            </div>
                            <div className="flex-1 text-xs sm:text-sm text-gray-500 font-mono text-center md:text-left space-y-1">
                              <span className="block">Material: Dyneema® + Steel</span>
                              <span className="block">Cut Resistance: Level 5</span>
                            </div>
                            <div className="flex-1 text-xs sm:text-sm text-gray-500 font-mono text-center md:text-left space-y-1">
                              <span className="block">Lining: Removable</span>
                              <span className="block">Care: Machine Washable</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  case "backpack":
                    return (
                      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-center px-4">
                          Wear it when you need it. Tuck it when you don't
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
                          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                            <div className="relative w-full rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl lg:shadow-2xl" data-video-type="backpack">
                              <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                            <video
                              ref={backpackVideoRef}
                              src={`${process.env.PUBLIC_URL}/backpack-animation1.mp4`}
                                  className="absolute inset-0 w-full h-full object-cover"
                              autoPlay
                              muted
                              loop
                              playsInline
                              preload="metadata"
                              controls={false}
                              onEnded={() => {
                                setTimeout(() => {
                                  if (backpackVideoRef.current) {
                                    backpackVideoRef.current.play();
                                  }
                                }, 4000);
                              }}
                            />
                          </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                            <div className="relative w-full rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl lg:shadow-2xl" data-video-type="backpackRight">
                              <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                            <video
                              ref={backpackRightVideoRef}
                              src={`${process.env.PUBLIC_URL}/backpack23-animation-loop.mp4`}
                                  className="absolute inset-0 w-full h-full object-cover"
                              autoPlay
                              muted
                              loop
                              playsInline
                              preload="metadata"
                              controls={false}
                            />
                          </div>
                        </div>
                          </div>
                        </div>
                        
                        <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-400 text-center max-w-xs sm:max-w-md lg:max-w-2xl xl:max-w-3xl mx-auto leading-relaxed px-4">
                          From your motorbike to your back in seconds. Straps
                          deploy when needed, vanish when not.
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
          )
        )}
      </AnimatePresence>

      {/* Partner Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col items-center space-y-6 sm:space-y-8 mt-12 sm:mt-16 px-4 sm:px-6"
      >
        <div className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-white font-brand">
            Partner With SHUAN
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
            Be among the first to offer the most secure helmet storage solution
            for modern riders.
          </p>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
            We're currently inviting select distributors and gear retailers to
            join our early launch network.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowContactModal(true)}
          className="px-10 py-4 sm:px-12 sm:py-5 bg-white text-black text-lg sm:text-xl font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Form Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 font-brand">
                  Partner With SHUAN
                </h3>
                <p className="text-gray-400 text-sm sm:text-base">
                  Join our early launch network
                </p>
              </div>

              {/* Contact Form */}
              {formStatus.status === "success" ? (
                <div className="text-center py-10">
                  <p className="text-lg sm:text-xl text-green-400">{formStatus.message}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label
                      htmlFor="name"
                        className="block text-sm sm:text-base font-medium text-gray-300 mb-2 sm:mb-3"
                    >
                        Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base sm:text-lg"
                      placeholder="Your name"
                      required
                        aria-required="true"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                        className="block text-sm sm:text-base font-medium text-gray-300 mb-2 sm:mb-3"
                    >
                        Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base sm:text-lg"
                      placeholder="your@email.com"
                      required
                        aria-required="true"
                    />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm sm:text-base font-medium text-gray-300 mb-2 sm:mb-3"
                    >
                      Company *
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base sm:text-lg"
                      placeholder="Your company name"
                      required
                      aria-required="true"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm sm:text-base font-medium text-gray-300 mb-2 sm:mb-3"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg sm:rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base sm:text-lg resize-none"
                      placeholder="Tell us about your interest in partnering with SHUAN"
                      required
                      aria-required="true"
                      rows="4"
                      style={{ minHeight: '120px' }}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-white text-black font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed text-base sm:text-lg"
                    disabled={formStatus.status === "sending"}
                    aria-label="Send partnership inquiry"
                  >
                    {formStatus.status === "sending"
                      ? "Sending..."
                      : "Send Message"}
                  </motion.button>
                  {formStatus.status === "error" && (
                    <p className="text-sm sm:text-base text-red-500 text-center">
                      {formStatus.message}
                    </p>
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
            <p className="text-sm text-gray-400 whitespace-nowrap">
                              © 2025 <span className="font-brand text-lg">SHUAN</span> Inc. All
              rights reserved.
            </p>
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
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-brand">
                  SHUAN Privacy Policy
                </h3>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4 text-gray-300 text-sm sm:text-base">
                <p>Effective Date: March 2024</p>
                <p>
                  <span className="font-brand">SHUAN</span> respects your
                  privacy. This Privacy Policy explains how we collect, use, and
                  protect your personal information when you visit our website
                  (shuangear.com), contact us, or engage with our services.
                </p>

                <h4 className="text-white font-semibold mt-6">
                  1. Information We Collect
                </h4>
                <p>
                  Personal Information: Name, email address, company name,
                  country, and any information you voluntarily submit via our
                  forms.
                </p>
                <p>
                  Usage Data: IP address, browser type, time zone, pages
                  visited, and time spent on site (via cookies and analytics
                  tools).
                </p>

                <h4 className="text-white font-semibold mt-6">
                  2. How We Use Your Information
                </h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>To respond to inquiries and partnership requests.</li>
                  <li>To improve our website and services.</li>
                  <li>
                    To communicate with you about updates, offerings, or
                    opportunities (with your consent).
                  </li>
                </ul>

                <h4 className="text-white font-semibold mt-6">
                  3. Sharing Your Information
                </h4>
                <p>
                  We do not sell, rent, or trade your personal information. We
                  may share it only:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    With service providers assisting us (e.g., hosting,
                    analytics) under confidentiality.
                  </li>
                  <li>When legally required (e.g., by law enforcement).</li>
                </ul>

                <h4 className="text-white font-semibold mt-6">
                  4. Data Security
                </h4>
                <p>
                  We implement reasonable technical and organizational
                  safeguards to protect your data.
                </p>

                <h4 className="text-white font-semibold mt-6">
                  5. International Users
                </h4>
                <p>
                  If you are visiting from outside the European Union or other
                  regions with laws governing data collection, your information
                  may be transferred to and processed in countries where our
                  servers are located.
                </p>

                <h4 className="text-white font-semibold mt-6">
                  6. Your Rights
                </h4>
                <p>
                  Depending on your location, you may have the right to access,
                  correct, or delete your personal data. Contact us at:
                  privacy@shuangear.com
                </p>

                <h4 className="text-white font-semibold mt-6">7. Updates</h4>
                <p>
                  This policy may be updated from time to time. Any changes will
                  be posted on this page.
                </p>
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
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-brand">
                  SHUAN Terms of Use
                </h3>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4 text-gray-300 text-sm sm:text-base">
                <p>Effective Date: March 2024</p>
                <p>
                  Welcome to shuangear.com. By accessing or using our website,
                  you agree to these Terms of Use.
                </p>

                <h4 className="text-white font-semibold mt-6">
                  1. Use of Site
                </h4>
                <p>
                  This website is provided for informational and business
                  purposes only. You may not use it for any unlawful or
                  unauthorized activity.
                </p>

                <h4 className="text-white font-semibold mt-6">
                  2. Intellectual Property
                </h4>
                <p>
                  All content on this site — including logos, text, graphics,
                  and images — is the property of{" "}
                  <span className="font-brand">SHUAN</span> and protected by
                  applicable intellectual property laws.
                </p>

                <h4 className="text-white font-semibold mt-6">
                  3. Third-Party Links
                </h4>
                <p>
                  Our site may contain links to third-party websites. We are not
                  responsible for their content or practices.
                </p>

                <h4 className="text-white font-semibold mt-6">
                  4. Limitation of Liability
                </h4>
                <p>
                  We are not liable for any indirect, incidental, or
                  consequential damages arising from your use of the site.
                </p>

                <h4 className="text-white font-semibold mt-6">
                  5. Modifications
                </h4>
                <p>
                  We may update these Terms at any time. Continued use
                  constitutes acceptance of changes.
                </p>
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
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white font-brand">
                  SHUAN Legal Disclaimer
                </h3>
                <button
                  onClick={() => setShowLegalModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4 text-gray-300 text-sm sm:text-base">
                <p>Last Updated: March 2024</p>
                <p>
                  The information provided on this website is for general
                  informational purposes only.{" "}
                  <span className="font-brand">SHUAN</span> makes no warranties
                  regarding the accuracy or completeness of any information.
                </p>
                <p>
                  Use of this website does not create any legal relationship
                  between <span className="font-brand">SHUAN</span> and the
                  user. For legal advice, please consult a qualified
                  professional.
                </p>
                <p>
                  All product visuals and descriptions are conceptual and may
                  evolve prior to launch. Any early access or interest shown
                  does not constitute a binding agreement.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
