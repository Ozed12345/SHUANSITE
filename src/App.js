import "./index.css";
import { useEffect, useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function App() {
  const videoRef = useRef(null);
  const heroRef = useRef(null);
  const backpackVideoRef = useRef(null);
  const [showHeroText, setShowHeroText] = useState(false);
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [showArrow, setShowArrow] = useState(false);
  const [visibleSection, setVisibleSection] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const revealRef = useRef(null);
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
    reveal: revealRef,
    locking: lockingRef,
    cut: cutRef,
    lining: liningRef,
    preorder: preorderRef,
    backpack: backpackRef,
  }), []);

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(window.scrollTimeout);
      window.scrollTimeout = setTimeout(() => setIsScrolling(false), 150);

      const scrollMiddle = window.scrollY + window.innerHeight / 2;
      for (const [key, ref] of Object.entries(sectionRefs)) {
        if (ref.current) {
          const top = ref.current.offsetTop;
          const height = ref.current.offsetHeight;
          if (scrollMiddle > top && scrollMiddle < top + height) {
            setVisibleSection(key);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionRefs]);

  const renderArrow = (id) => (
    id !== "preorder" && (
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ 
          opacity: visibleSection === id && !isScrolling ? 1 : 0,
          scale: visibleSection === id && !isScrolling ? 1 : 0.5
        }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 3,
          opacity: { duration: 0.05 }  // Super fast fade
        }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 text-white pointer-events-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-10 h-10 animate-bounce"
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

  return (
    <div className="relative w-full min-h-screen bg-black text-white overflow-x-hidden scroll-smooth scroll-snap-y snap-mandatory">
      {/* 🎥 Background Video */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        style={{ filter: blurValue, opacity: videoOpacity }}
        className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none"
      >
        <video
          ref={videoRef}
          src="/looped.mp4"
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/80 via-black/30 to-transparent z-10" />
      </motion.div>

      {/* ✨ Hero Section */}
      <motion.div
        style={{ opacity: fadeOut }}
        ref={heroRef}
        className="relative z-30 w-full h-screen flex flex-col justify-center items-center px-6 text-center pointer-events-none space-y-16 snap-start"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showHeroText ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 3 }}
          className="space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">SHUAN</h1>
          <p className="text-base md:text-lg max-w-xl mx-auto text-gray-300 leading-relaxed">
            The sleekest helmet storage solution for naked and sport motorbikes
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showSecondLine ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 3 }}
          className="space-y-3"
        >
          <h2 className="text-lg md:text-2xl font-semibold">Built for urban riders</h2>
          <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-xl mx-auto">
            Designed to keep your gear secure and your motorbike looking sharp
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={showArrow && !isScrolling ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.5,
            opacity: { duration: 0.05 }  // Super fast fade
          }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-8 h-8 animate-bounce"
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
      {["reveal", "locking", "cut", "lining", "backpack", "preorder"].map((id) => (
        <section
          key={id}
          ref={sectionRefs[id]}
          id={id}
          className={`relative z-40 w-full bg-black text-white px-6 py-24 text-center snap-start flex flex-col justify-center items-center gap-8 ${id === "preorder" ? "pb-10" : ""}`}
        >
          {renderArrow(id)}
          {(() => {
            switch (id) {
              case "reveal":
                return (
                  <div className="max-w-3xl mx-auto space-y-6">
                    <h2 className="text-3xl md:text-5xl font-bold leading-tight">The Bag. Reimagined.</h2>
                    <p className="text-lg text-gray-400">
                      SHUAN's cut-resistant, lockable, under-seat mounted helmet storage is built for riders who care about style and security.
                    </p>
                    <iframe
                      src="https://www.youtube.com/embed/xPF1dHsPmqQ?autoplay=0&controls=0&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&playsinline=1&enablejsapi=1&origin=http://localhost:3000"
                      className="w-full rounded-xl shadow-xl aspect-video mt-10"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ border: 'none' }}
                    />
                  </div>
                );
              case "locking":
                return (
                  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-6">
                      <h2 className="text-2xl md:text-3xl font-bold leading-tight">Secure Locking System</h2>
                      <video src="/lock-loop.mp4" className="w-full rounded-xl shadow-xl" autoPlay muted loop playsInline />
                      <p className="text-lg text-gray-400">
                        Built-in under-seat locking system that connects directly to your motorbike's frame or latch.
                      </p>
                    </div>
                    <div className="space-y-6">
                      <h2 className="text-2xl md:text-3xl font-bold leading-tight">Layered Cut-Resistance</h2>
                      <img src="/5555.png" className="w-full rounded-xl shadow-xl object-cover" alt="Steel Protection" />
                      <p className="text-lg text-gray-400">
                        Dyneema® exterior reinforced with internal stainless steel makes slashing and cutting nearly impossible.
                      </p>
                    </div>
                    <div className="space-y-6">
                      <h2 className="text-2xl md:text-3xl font-bold leading-tight">Removable Inner Lining</h2>
                      <video src="/innerlining.mp4" className="w-full rounded-xl shadow-xl object-cover" autoPlay muted loop playsInline />
                      <p className="text-lg text-gray-400">
                        Stay fresh. The inside lining is machine-washable and easily removable.
                      </p>
                    </div>
                  </div>
                );
              case "backpack":
                return (
                  <div className="max-w-7xl mx-auto space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight text-center">Wear it when you need it. Tuck it when you don't</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <video 
                          ref={backpackVideoRef}
                          src="/backpack-animation1.mp4" 
                          className="w-full rounded-xl shadow-xl" 
                          autoPlay 
                          muted 
                          playsInline
                          onEnded={() => {
                            setTimeout(() => {
                              if (backpackVideoRef.current) {
                                backpackVideoRef.current.play();
                              }
                            }, 4000);
                          }}
                        />
                      </div>
                      <div className="space-y-4">
                        <video 
                          src="/backpack23-animation-loop.mp4" 
                          className="w-full rounded-xl shadow-xl" 
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                        />
                      </div>
                    </div>
                    <p className="text-lg text-gray-400 text-center max-w-2xl mx-auto">
                      From your motorbike to your back in seconds. Straps deploy when needed, vanish when not.
                    </p>
                  </div>
                );
              case "preorder":
                return (
                  <div className="w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-200/20 to-white/30 -z-10" />
                    <div className="max-w-[500px] mx-auto space-y-12 py-48">
                      <h2 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">Pre-order SHUAN now</h2>
                      <p className="text-lg text-gray-300">
                        Be among the first to own the future of motorbike gear.
                      </p>
                      <div className="flex flex-col items-center space-y-8">
                        <button className="px-8 py-4 text-lg font-semibold bg-white text-black rounded-full shadow-xl hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                          Pre-order Now
                          <div className="text-sm font-light text-gray-600 mt-1">$10 today — save 30% at launch</div>
                        </button>
                        <div className="space-y-2 text-center">
                          <p className="text-sm font-medium text-gray-300">Only 100 early-access spots available.</p>
                          <p className="text-sm font-light text-gray-400">Don't miss your chance.</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-60">© 2025 SHUAN. All rights reserved.</div>
                    </div>
                  </div>
                );
              default:
                return null;
            }
          })()}
        </section>
      ))}
    </div>
  );
}

export default App;