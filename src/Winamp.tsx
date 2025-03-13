/**
 *
 * A Winamp clone built mostly with Claude, and some React and Tailwind CSS.
 *
 */
import { useState, useEffect, useRef } from 'react';

import { useWindows } from './WindowsContext';

export const WinampClone = ({ close }: { close: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [showEqualizer, setShowEqualizer] = useState(true);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [isOn, setIsOn] = useState(true);
  const [isAuto, setIsAuto] = useState(true);
  const [positions, setPositions] = useState({
    main: { x: 100, y: 50 },
    equalizer: { x: 100, y: 185 },
    playlist: { x: 100, y: 350 },
  });
  const [isDragging, setIsDragging] = useState({
    main: false,
    equalizer: false,
    playlist: false,
  });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [marqueePosition, setMarqueePosition] = useState(15);
  const [eqValues, setEqValues] = useState({
    preamp: 50,
    bands: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
  });
  // Volume and balance values
  const [volumeValue, setVolumeValue] = useState(50);
  const [balanceValue, setBalanceValue] = useState(50);
  const [activeSlider, setActiveSlider] = useState<{
    type: 'preamp' | 'band' | 'volume' | 'balance' | 'time';
    index?: number;
  } | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);
  const marqueeIntervalRef = useRef<number | undefined>(undefined);

  const songLength = 193; // 3:13 because Felix's anniversary is 3/13

  const playlist = [
    {
      id: 1,
      title: 'Happy 2 years Felix!!',
      length: '3:13',
    },
    {
      id: 2,
      title: "You're",
      length: '5:22',
    },
    {
      id: 3,
      title: 'Hella',
      length: '2:39',
    },
    {
      id: 4,
      title: 'Awesome',
      length: '1:05',
    },
    {
      id: 5,
      title: '- Henry',
      length: '2:01',
    },
  ];

  // Handle play/pause functionality
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime >= songLength) {
            return 0;
          }
          return prevTime + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying]);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const f = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return f;
  };

  // Marquee effect for song title
  useEffect(() => {
    marqueeIntervalRef.current = setInterval(() => {
      setMarqueePosition((prev) => {
        if (prev <= -160) return 190;
        return prev - 1;
      });
    }, 100);

    return () => clearInterval(marqueeIntervalRef.current);
  }, []);

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent, windowType: 'main' | 'equalizer' | 'playlist') => {
    setIsDragging({ ...isDragging, [windowType]: true });
    setDragOffset({
      x: e.clientX - positions[windowType].x,
      y: e.clientY - positions[windowType].y,
    });
    e.preventDefault();
  };

  const handleMouseUp = () => {
    setIsDragging({ main: false, equalizer: false, playlist: false });
    setActiveSlider(null);
  };

  // Handle starting to drag EQ sliders
  const handleSliderMouseDown = (
    e: React.MouseEvent,
    type: 'preamp' | 'band' | 'volume' | 'balance' | 'time',
    index?: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveSlider({ type, index });

    // Immediately update the slider position based on where it was clicked
    if (type === 'volume' || type === 'balance' || type === 'time') {
      // Handle horizontal sliders
      const sliderContainer = document.getElementById(
        type === 'volume' ? 'volume-slider' : type === 'balance' ? 'balance-slider' : 'time-slider',
      );
      if (sliderContainer) {
        const containerRect = sliderContainer.getBoundingClientRect();
        const sliderWidth = containerRect.width;

        // Calculate relative position (0-100) with 0 at left, 100 at right
        let posX = e.clientX - containerRect.left;
        posX = Math.max(0, Math.min(sliderWidth, posX));
        const valuePercent = (posX / sliderWidth) * 100;

        if (type === 'volume') {
          setVolumeValue(valuePercent);
        } else if (type === 'balance') {
          setBalanceValue(valuePercent);
        } else if (type === 'time') {
          setTime(Math.round((valuePercent / 100) * songLength));
        }
      }
    } else {
      // Handle vertical EQ sliders
      const eqContainer = document.getElementById('eq-sliders-container');
      if (eqContainer) {
        const containerRect = eqContainer.getBoundingClientRect();
        const sliderHeight = 64; // Height of slider in pixels

        // Calculate relative position (0-100) with 0 at bottom, 100 at top
        let posY = e.clientY - containerRect.top;
        posY = Math.max(0, Math.min(sliderHeight, posY));
        const valuePercent = 100 - (posY / sliderHeight) * 100;

        if (type === 'preamp') {
          setEqValues((prev) => ({
            ...prev,
            preamp: valuePercent,
          }));
        } else if (type === 'band' && index !== undefined) {
          setEqValues((prev) => {
            const newBands = [...prev.bands];
            newBands[index] = valuePercent;
            return {
              ...prev,
              bands: newBands,
            };
          });
        }
      }
    }
  };

  // Generate SVG path for EQ wave graph
  const getEQWavePath = () => {
    return `M 0,${15 - ((eqValues.bands[0] - 50) / 50) * 12} 
      C ${5},${15 - ((eqValues.bands[0] - 50) / 50) * 12} 
        ${10},${15 - ((eqValues.bands[1] - 50) / 50) * 12} 
        ${15},${15 - ((eqValues.bands[1] - 50) / 50) * 12}
      C ${20},${15 - ((eqValues.bands[1] - 50) / 50) * 12} 
        ${25},${15 - ((eqValues.bands[2] - 50) / 50) * 12} 
        ${30},${15 - ((eqValues.bands[2] - 50) / 50) * 12}
      C ${35},${15 - ((eqValues.bands[2] - 50) / 50) * 12} 
        ${40},${15 - ((eqValues.bands[3] - 50) / 50) * 12} 
        ${45},${15 - ((eqValues.bands[3] - 50) / 50) * 12}
      C ${50},${15 - ((eqValues.bands[3] - 50) / 50) * 12} 
        ${55},${15 - ((eqValues.bands[4] - 50) / 50) * 12} 
        ${60},${15 - ((eqValues.bands[4] - 50) / 50) * 12}
      C ${65},${15 - ((eqValues.bands[4] - 50) / 50) * 12} 
        ${70},${15 - ((eqValues.bands[5] - 50) / 50) * 12} 
        ${75},${15 - ((eqValues.bands[5] - 50) / 50) * 12}
      C ${80},${15 - ((eqValues.bands[5] - 50) / 50) * 12}
        ${85},${15 - ((eqValues.bands[6] - 50) / 50) * 12}
        ${90},${15 - ((eqValues.bands[7] - 50) / 50) * 12}
      C ${95},${15 - ((eqValues.bands[8] - 50) / 50) * 12}
        ${98},${15 - ((eqValues.bands[9] - 50) / 50) * 12}
        ${100},${15 - ((eqValues.bands[9] - 50) / 50) * 12}`;
  };

  // State for the EQ wave path
  const [eqWavePath, setEqWavePath] = useState(getEQWavePath());

  // Update EQ wave path when EQ values change
  useEffect(() => {
    setEqWavePath(getEQWavePath());
  }, [eqValues]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (isDragging.main) {
      setPositions({
        ...positions,
        main: {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        },
      });
    } else if (isDragging.equalizer) {
      setPositions({
        ...positions,
        equalizer: {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        },
      });
    } else if (isDragging.playlist) {
      setPositions({
        ...positions,
        playlist: {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        },
      });
    }

    // Handle slider movement (EQ, volume, balance)
    if (activeSlider) {
      if (
        activeSlider.type === 'volume' ||
        activeSlider.type === 'balance' ||
        activeSlider.type === 'time'
      ) {
        // Handle horizontal sliders (volume and balance)
        const sliderContainer = document.getElementById(
          activeSlider.type === 'volume'
            ? 'volume-slider'
            : activeSlider.type === 'balance'
              ? 'balance-slider'
              : 'time-slider',
        );
        if (sliderContainer) {
          const containerRect = sliderContainer.getBoundingClientRect();
          const sliderWidth = containerRect.width;

          // Calculate relative position (0-100) with 0 at left, 100 at right
          let posX = e.clientX - containerRect.left;
          posX = Math.max(0, Math.min(sliderWidth, posX));
          const valuePercent = (posX / sliderWidth) * 100;

          if (activeSlider.type === 'volume') {
            setVolumeValue(valuePercent);
          } else if (activeSlider.type === 'balance') {
            setBalanceValue(valuePercent);
          } else if (activeSlider.type === 'time') {
            setTime(Math.round((valuePercent / 100) * songLength));
          }
        }
      } else {
        // Handle vertical sliders (EQ)
        // Get the EQ slider element to calculate relative position
        const eqContainer = document.getElementById('eq-sliders-container');
        if (eqContainer) {
          const containerRect = eqContainer.getBoundingClientRect();
          const sliderHeight = 64; // Height of our slider (16 * 4)

          // Calculate relative position (0-100) with 0 at bottom, 100 at top
          let posY = e.clientY - containerRect.top;
          posY = Math.max(0, Math.min(sliderHeight, posY));
          const valuePercent = 100 - (posY / sliderHeight) * 100;

          if (activeSlider.type === 'preamp') {
            setEqValues((prev) => ({
              ...prev,
              preamp: valuePercent,
            }));
          } else if (activeSlider.type === 'band' && activeSlider.index !== undefined) {
            setEqValues((prev) => {
              const newBands = [...prev.bands];
              newBands[activeSlider.index!] = valuePercent;
              return {
                ...prev,
                bands: newBands,
              };
            });
          }
        }
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      {/* Main Winamp Window */}
      <div
        className="absolute select-none bg-[#292940]"
        style={{
          left: positions.main.x,
          top: positions.main.y,
          width: '350px',
        }}
      >
        <div className="border border-t-[#737388] border-b-[#1d1c2e] border-l-[#737388] border-r-[#1d1c2e] shadow-lg overflow-hidden">
          {/* Title Bar */}
          <div
            className="flex justify-between items-center px-1 py-1 bg-gradient-to-r cursor-move"
            onMouseDown={(e) => handleMouseDown(e, 'main')}
          >
            <div className="w-3 h-3 flex items-center justify-center">
              <svg viewBox="0 0 10 10" width="10" height="10">
                <path d="M1,1 L9,5 L1,9 Z" fill="#4BC94C" />
              </svg>
            </div>
            <div className="flex items-center justify-center w-full">
              <div className="h-px grow bg-[#886c3c] mx-1"></div>
              <span className="text-[#BCBCBC] text-[9px] font-bold tracking-wider uppercase">
                Winamp
              </span>
              <div className="h-px grow bg-[#886c3c] mx-1"></div>
            </div>
            <div className="flex space-x-1 items-center">
              <div className="w-2 h-2 bg-[#525252] rounded-sm"></div>
              <div className="w-2 h-2 bg-[#525252] rounded-sm"></div>
              <div
                className="w-4 h-4 flex items-center justify-center text-[9px] text-[#886c3c] px-1 cursor-pointer"
                onClick={close}
              >
                ×
              </div>
            </div>
          </div>

          <PixelBorder>
            {/* Player Body */}
            {/* Visualizer and Info Area */}
            <div className="mb-1 flex">
              {/* Time Display */}
              <div className="w-2/5 h-12 bg-black border border-t-[#1d1c2e] border-b-[#737388] border-l-[#1d1c2e] border-r-[#737388] flex flex-col relative p-2 winamp-screen">
                {/* Background grid pattern */}
                <div className="absolute inset-0 grid grid-cols-20 grid-rows-10 opacity-20">
                  {Array.from({ length: 200 }).map((_, i) => (
                    <div key={i} className="bg-black flex items-center justify-center">
                      <div className="w-[1px] h-[1px] bg-[#131313]"></div>
                    </div>
                  ))}
                </div>
                <div className="h-1/4 flex justify-end items-center pr-1 px-2 py-1 relative">
                  <div className="flex items-center gap-[3px]" style={{ zIndex: 1 }}>
                    {/* Play/Pause Indicator */}
                    <div className="mr-3">
                      <svg width="6" height="6" viewBox="0 0 6 6">
                        {isPlaying ? (
                          <>
                            <rect x="1" y="1" width="1.5" height="4" fill="#4BC94C" />
                            <rect x="3.5" y="1" width="1.5" height="4" fill="#4BC94C" />
                          </>
                        ) : (
                          <polygon points="1,1 5,3 1,5" fill="#4BC94C" />
                        )}
                      </svg>
                    </div>

                    {/* Digital Clock Display using LCD segments */}
                    <div className="flex items-center">
                      {/* Minutes */}
                      <DigitDisplay value={formatTime(time)[0]} dotted={true} />
                      <DigitDisplay value={formatTime(time)[1]} dotted={true} />

                      {/* Colon - using two dots */}
                      <div className="flex flex-col justify-between h-[14px] mx-[2px]">
                        <div className="w-[2px] h-[2px] bg-[#4BC94C] mb-[6px]"></div>
                        <div className="w-[2px] h-[2px] bg-[#4BC94C]"></div>
                      </div>

                      {/* Seconds */}
                      <DigitDisplay value={formatTime(time)[3]} dotted={true} />
                      <DigitDisplay value={formatTime(time)[4]} dotted={true} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-3/5 pl-1">
                {/* Song Title (Marquee) */}
                <div className="h-[16px] overflow-hidden bg-black relative winamp-screen border border-t-[#1d1c2e] border-b-[#737388] border-l-[#1d1c2e] border-r-[#737388]">
                  {activeSlider?.type === 'volume' || activeSlider?.type === 'balance' ? (
                    <div className="text-[#4BC94C] text-[9px] uppercase">
                      {activeSlider.type === 'volume'
                        ? `VOLUME ${Math.round(volumeValue)}%`
                        : `BALANCE ${Math.round(balanceValue)}%`}
                    </div>
                  ) : (
                    <div
                      className="text-[#4BC94C] whitespace-nowrap absolute text-[9px] uppercase"
                      style={{ left: `${marqueePosition}px` }}
                    >
                      {playlist[0].id}. {playlist[0].title}
                    </div>
                  )}
                </div>

                {/* Info Display */}
                <div className="flex justify-between mt-1">
                  <div className="flex items-center">
                    <div className="bg-black winamp-screen border border-t-[#1d1c2e] border-b-[#737388] border-l-[#1d1c2e] border-r-[#737388] text-[#4BC94C] font-bold text-[8px]">
                      192
                    </div>
                    <div className="text-[7px] text-[#BCBCBC] font-bold ml-[2px]">kbps</div>
                    <div className="bg-black winamp-screen border border-t-[#1d1c2e] border-b-[#737388] border-l-[#1d1c2e] border-r-[#737388] text-[#4BC94C] font-bold text-[8px] ml-2">
                      44
                    </div>
                    <div className="text-[7px] text-[#BCBCBC] font-bold ml-[2px]">kHz</div>
                  </div>
                  <div className="flex items-center gap-1 text-[8px]">
                    <div className="text-[#606060]">mono</div>
                    <div className="text-[#4BC94C] font-bold">stereo</div>
                  </div>
                </div>
                {/* Volume and Balance Controls */}
                <div className="flex justify-between mt-1">
                  {/* Volume Slider */}
                  <div className="flex items-center">
                    <div
                      id="volume-slider"
                      className="h-[8px] w-20 bg-[#121212] border-[1.5px] border-t-[#12121c] border-l-[#12121c] border-r-[#8d8e9d] border-b-[#8d8e9d] relative rounded-md"
                      style={{
                        backgroundColor:
                          volumeValue > 50
                            ? `rgb(${242 + ((volumeValue - 50) * 13) / 50}, ${Math.max(
                                0,
                                202 - ((volumeValue - 50) * 202) / 50,
                              )}, ${Math.max(0, 71 - ((volumeValue - 50) * 71) / 50)})`
                            : volumeValue < 50
                              ? `rgb(${Math.max(0, 242 - ((50 - volumeValue) * 142) / 50)}, ${
                                  202 + ((50 - volumeValue) * 53) / 50
                                }, ${Math.max(0, 71 - ((50 - volumeValue) * 71) / 50)})`
                              : '#F2CA47',
                      }}
                    >
                      {/* Slider thumb */}
                      <div
                        className="outline outline-[#12121c] absolute top-0 w-4 h-[10px] bg-[#bdced6] border border-t-[#efffff] border-l-[#efffff] border-r-[#7a8494] border-b-[#7a8494] transform -translate-x-1/2 -translate-y-[2px] cursor-pointer flex gap-[1px] items-center justify-center"
                        style={{
                          left: `${(volumeValue / 100) * (96 - 4) + 4}%`,
                        }}
                        onMouseDown={(e) => handleSliderMouseDown(e, 'volume')}
                      >
                        <div className="bg-[#737388] w-[1px] h-[6px]" />
                        <div className="bg-[#737388] w-[1px] h-[6px]" />
                        <div className="bg-[#737388] w-[1px] h-[6px]" />
                      </div>
                    </div>
                  </div>
                  {/* Balance Slider */}
                  <div className="flex items-center">
                    <div
                      id="balance-slider"
                      className="h-[8px] w-10 bg-[#121212] border-[1.5px] border-t-[#12121c] border-l-[#12121c] border-r-[#8d8e9d] border-b-[#8d8e9d] relative rounded-md"
                      style={{
                        backgroundColor:
                          balanceValue > 50
                            ? `rgb(${242 + ((balanceValue - 50) * 13) / 50}, ${Math.max(
                                0,
                                202 - ((balanceValue - 50) * 202) / 50,
                              )}, ${Math.max(0, 71 - ((balanceValue - 50) * 71) / 50)})`
                            : balanceValue < 50
                              ? `rgb(${Math.max(0, 242 - ((50 - balanceValue) * 142) / 50)}, ${
                                  202 + ((50 - balanceValue) * 53) / 50
                                }, ${Math.max(0, 71 - ((50 - balanceValue) * 71) / 50)})`
                              : '#F2CA47',
                      }}
                    >
                      {/* Slider thumb */}
                      <div
                        className="outline outline-[#12121c] absolute top-0 w-4 h-[10px] bg-[#bdced6] border border-t-[#efffff] border-l-[#efffff] border-r-[#7a8494] border-b-[#7a8494] transform -translate-x-1/2 -translate-y-[2px] cursor-pointer flex gap-[1px] items-center justify-center"
                        style={{
                          left: `${(balanceValue / 100) * (96 - 4) + 4}%`,
                        }}
                        onMouseDown={(e) => handleSliderMouseDown(e, 'balance')}
                      >
                        <div className="bg-[#737388] w-[1px] h-[6px]" />
                        <div className="bg-[#737388] w-[1px] h-[6px]" />
                        <div className="bg-[#737388] w-[1px] h-[6px]" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      className={`px-1 relative bg-[#bdced6] border-[2px] border-t-[#efffff] border-l-[#efffff] border-r-[#7a8494] border-b-[#7a8494] active:border-t-[#7a8494] active:border-l-[#7a8494] active:border-r-[#efffff] active:border-b-[#efffff] text-[#737388] text-[8px] font-bold cursor-pointer`}
                      onClick={() => setShowEqualizer(!showEqualizer)}
                    >
                      EQ
                      <div
                        className={`w-[3px] h-[3px] absolute top-0 left-0 ${
                          showEqualizer ? 'bg-[#4BC94C]' : 'bg-[#135b03]'
                        }`}
                      />
                    </div>
                    <div
                      className={`px-1 relative bg-[#bdced6] border-[2px] border-t-[#efffff] border-l-[#efffff] border-r-[#7a8494] border-b-[#7a8494] active:border-t-[#7a8494] active:border-l-[#7a8494] active:border-r-[#efffff] active:border-b-[#efffff] text-[#737388] text-[8px] font-bold cursor-pointer`}
                      onClick={() => setShowPlaylist(!showPlaylist)}
                    >
                      PL
                      <div
                        className={`w-[3px] h-[3px] absolute top-0 left-0 ${
                          showPlaylist ? 'bg-[#4BC94C]' : 'bg-[#135b03]'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Play Time Slider */}
            <div className="flex items-center mb-2">
              <div
                id="time-slider"
                className="h-[8px] w-full bg-[#26253a] border-[1.5px] border-t-[#12121c] border-l-[#12121c] border-r-[#8d8e9d] border-b-[#8d8e9d] relative"
              >
                {/* Slider thumb */}
                <div
                  className="outline outline-[#12121c] absolute top-[-2px] w-8 h-[10px] bg-[#f4eac7] border-[2px] border-t-[#dbcb9e] border-l-[#dbcb9e] border-r-[#8d753a] border-b-[#8d753a] transform -translate-x-1/2  cursor-pointer"
                  style={{ left: `${(time / songLength) * (96 - 4) + 4}%` }}
                  onMouseDown={(e) => handleSliderMouseDown(e, 'time')}
                >
                  <div className="w-full h-full border-[1px] border-t-[#8d753a] border-l-[#8d753a] border-r-[#dbcb9e] border-b-[#dbcb9e] flex flex-col items-center justify-center">
                    <div className="bg-[#755b21] w-6 h-[1px]" />
                    <div className="bg-[#af9861] w-6 h-[1px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Media Controls */}
            <div className=" grid grid-cols-6 gap-1 ">
              {/* Previous */}
              <PixelButton className="text-[#737388] active:text-[#495a6c]">
                <span className="block transform rotate-180">▶▶</span>
              </PixelButton>
              {/* Play */}
              <PixelButton
                className="text-[#737388] active:text-[#495a6c]"
                onClick={() => !isPlaying && setIsPlaying(true)}
              >
                <span>▶</span>
              </PixelButton>
              {/* Pause */}
              <PixelButton
                className="text-[#737388] active:text-[#495a6c]"
                onClick={() => isPlaying && setIsPlaying(false)}
              >
                <span>❚❚</span>
              </PixelButton>
              {/* Stop */}
              <PixelButton
                className="text-[#737388] active:text-[#495a6c]"
                onClick={() => setIsPlaying(false)}
              >
                <span>■</span>
              </PixelButton>
              {/* Next */}
              <PixelButton className="text-[#737388] active:text-[#495a6c]">
                <span>▶▶</span>
              </PixelButton>
              {/* Shuffle */}
              <PixelButton className="text-[#737388] active:text-[#495a6c]">
                <span className="text-[9px] uppercase">Shuffle</span>
              </PixelButton>
            </div>
          </PixelBorder>
        </div>
      </div>

      {/* Equalizer Window */}
      {showEqualizer && (
        <div
          className="absolute select-none bg-[#292940]"
          style={{
            left: positions.equalizer.x,
            top: positions.equalizer.y,
            width: '350px',
          }}
        >
          <div className="border border-t-[#737388] border-b-[#1d1c2e] border-l-[#737388] border-r-[#1d1c2e] shadow-lg overflow-hidden">
            <div
              className="flex justify-between items-center px-1 py-1 bg-gradient-to-r cursor-move "
              onMouseDown={(e) => handleMouseDown(e, 'equalizer')}
            >
              <div className="flex items-center justify-center w-full">
                <div className="h-px grow bg-[#886c3c] mx-1"></div>
                <span className="text-[#BCBCBC] text-[9px] font-bold tracking-wider uppercase">
                  Winamp Equalizer
                </span>
                <div className="h-px grow bg-[#886c3c] mx-1"></div>
              </div>
              <div>
                <div
                  className="w-4 h-4 flex items-center justify-center text-[9px] text-[#886c3c] px-1 cursor-pointer"
                  onClick={() => setShowEqualizer(false)}
                >
                  ×
                </div>
              </div>
            </div>

            <PixelBorder>
              <div>
                <div className=" flex justify-between">
                  <div>
                    <div
                      className={`px-1 relative bg-[#bdced6] border-[2px] border-t-[#efffff] border-l-[#efffff] border-r-[#7a8494] border-b-[#7a8494] active:border-t-[#7a8494] active:border-l-[#7a8494] active:border-r-[#efffff] active:border-b-[#efffff] text-[#737388] text-[8px] font-bold cursor-pointer `}
                      onClick={() => setIsOn(!isOn)}
                    >
                      ON
                      <div
                        className={`w-[3px] h-[3px] absolute top-0 left-0 ${
                          isOn ? 'bg-[#4BC94C]' : 'bg-[#135b03]'
                        }`}
                      />
                    </div>
                    <div
                      className={`px-1 relative bg-[#bdced6] border-[2px] border-t-[#efffff] border-l-[#efffff] border-r-[#7a8494] border-b-[#7a8494] active:border-t-[#7a8494] active:border-l-[#7a8494] active:border-r-[#efffff] active:border-b-[#efffff] text-[#737388] text-[8px] font-bold cursor-pointer`}
                      onClick={() => setIsAuto(!isAuto)}
                    >
                      AUTO
                      <div
                        className={`w-[3px] h-[3px] absolute top-0 left-0 ${
                          isAuto ? 'bg-[#4BC94C]' : 'bg-[#135b03]'
                        }`}
                      />
                    </div>
                  </div>
                  {/* EQ Wave Graph */}
                  <div className="h-6 w-32 flex items-center justify-center relative overflow-hidden ">
                    <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                      {/* Add horizontal center line */}
                      <line x1="0" y1="15" x2="100" y2="15" stroke="#bacbdd" strokeWidth="0.5" />

                      {/* Main wave path */}
                      <path d={eqWavePath} fill="none" stroke="#F2CA47" strokeWidth="1.5" />
                    </svg>
                    {/* Add a grid pattern in the background */}
                    <div className="absolute flex h-full w-full justify-between">
                      {Array.from({ length: 11 }).map((_, i) => (
                        <div key={i} className="border-[0.5px] border-[#717186]"></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <PixelButton className="mr-2 px-1">
                      <span className="text-[9px] text-[#737388] uppercase">Presets</span>
                    </PixelButton>
                  </div>
                </div>

                <div id="eq-sliders-container" className="p-1 flex justify-between mt-1">
                  {/* EQ Sliders */}
                  <div className="flex">
                    <div className="flex flex-col items-center">
                      <div
                        className="h-16 w-[8px] relative my-1 rounded-md  border-[1.5px] border-t-[#12121c] border-l-[#12121c] border-r-[#8d8e9d] border-b-[#8d8e9d]"
                        style={{
                          backgroundColor:
                            eqValues.preamp > 50
                              ? `rgb(${242 + ((eqValues.preamp - 50) * 13) / 50}, ${Math.max(
                                  0,
                                  202 - ((eqValues.preamp - 50) * 202) / 50,
                                )}, ${Math.max(0, 71 - ((eqValues.preamp - 50) * 71) / 50)})`
                              : eqValues.preamp < 50
                                ? `rgb(${Math.max(0, 242 - ((50 - eqValues.preamp) * 142) / 50)}, ${
                                    202 + ((50 - eqValues.preamp) * 53) / 50
                                  }, ${Math.max(0, 71 - ((50 - eqValues.preamp) * 71) / 50)})`
                                : '#F2CA47',
                        }}
                      >
                        {/* The slider thumb */}
                        <div
                          className="outline outline-[#12121c] absolute left-0 w-[10px] h-4 bg-[#bdced6] border-[1.5px] border-t-[#efffff] border-l-[#efffff] border-r-[#7a8494] border-b-[#7a8494] transform -translate-x-[2px] cursor-pointer flex flex-col gap-[1px] items-center justify-center "
                          style={{
                            top: `calc(${100 - eqValues.preamp}% - 8px)`,
                          }}
                          onMouseDown={(e) => handleSliderMouseDown(e, 'preamp')}
                        >
                          <div className="bg-[#737388] h-[1px] w-[6px]" />
                          <div className="bg-[#737388] h-[1px] w-[6px]" />
                        </div>
                      </div>
                      <span className="text-[7px] text-[#BCBCBC] mt-1">PREAMP</span>
                    </div>
                    <div className="flex flex-col justify-between">
                      <span className="text-[7px] text-[#F2CA47] mt-1">+12db</span>
                      <span className="text-[7px] text-[#F2CA47]">+0db</span>
                      <span className="text-[7px] text-[#F2CA47] mb-4">-12db</span>
                    </div>
                  </div>

                  {/* 10 Band EQ */}
                  {['60', '170', '310', '600', '1K', '3K', '6K', '12K', '14K', '16K'].map(
                    (freq, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div
                          className="h-16 w-[8px] relative my-1 rounded-md  border border-t-[#12121c] border-l-[#12121c] border-r-[#8d8e9d] border-b-[#8d8e9d]"
                          style={{
                            backgroundColor:
                              eqValues.bands[i] > 50
                                ? `rgb(${242 + ((eqValues.bands[i] - 50) * 13) / 50}, ${Math.max(
                                    0,
                                    202 - ((eqValues.bands[i] - 50) * 202) / 50,
                                  )}, ${Math.max(0, 71 - ((eqValues.bands[i] - 50) * 71) / 50)})`
                                : eqValues.bands[i] < 50
                                  ? `rgb(${Math.max(
                                      0,
                                      242 - ((50 - eqValues.bands[i]) * 142) / 50,
                                    )}, ${202 + ((50 - eqValues.bands[i]) * 53) / 50}, ${Math.max(
                                      0,
                                      71 - ((50 - eqValues.bands[i]) * 71) / 50,
                                    )})`
                                  : '#F2CA47',
                          }}
                        >
                          {/* The slider thumb */}
                          <div
                            className="outline outline-[#12121c] absolute left-0 w-[10px] h-4 bg-[#bdced6] border border-t-[#efffff] border-l-[#efffff] border-r-[#7a8494] border-b-[#7a8494] transform -translate-x-[2px] cursor-pointer flex flex-col gap-[1px] items-center justify-center "
                            style={{
                              top: `calc(${100 - eqValues.bands[i]}% - 8px)`,
                            }}
                            onMouseDown={(e) => handleSliderMouseDown(e, 'band', i)}
                          >
                            <div className="bg-[#737388] h-[1px] w-[6px]" />
                            <div className="bg-[#737388] h-[1px] w-[6px]" />
                          </div>
                        </div>
                        <span className="text-[7px] text-[#BCBCBC] mt-1">{freq}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </PixelBorder>
          </div>
        </div>
      )}

      {/* Playlist Window */}
      {showPlaylist && (
        <div
          className="absolute select-none bg-[#292940]"
          style={{
            left: positions.playlist.x,
            top: positions.playlist.y,
            width: '350px',
          }}
        >
          <div className="border border-t-[#737388] border-b-[#1d1c2e] border-l-[#737388] border-r-[#1d1c2e] shadow-lg overflow-hidden">
            <div
              className="flex justify-between items-center px-1 py-1 bg-gradient-to-r cursor-move"
              onMouseDown={(e) => handleMouseDown(e, 'playlist')}
            >
              <div className="flex items-center justify-center w-full">
                <div className="h-px grow bg-[#886c3c] mx-1"></div>
                <span className="text-[#BCBCBC] text-[9px] font-bold tracking-wider uppercase">
                  Winamp Playlist
                </span>
                <div className="h-px grow bg-[#886c3c] mx-1"></div>
              </div>
              <div>
                <div
                  className="w-4 h-4 flex items-center justify-center text-[9px] text-[#886c3c] px-1 cursor-pointer"
                  onClick={() => setShowPlaylist(false)}
                >
                  ×
                </div>
              </div>
            </div>

            <PixelBorder>
              <div className="p-1">
                <div className="h-32 bg-black overflow-y-auto p-1 winamp-screen border border-t-[#1d1c2e] border-b-[#737388] border-l-[#1d1c2e] border-r-[#737388]">
                  {playlist.map((song, index) => (
                    <div key={song.id} className="flex justify-between text-[9px]">
                      <div className="text-[#4BC94C]">
                        <span className="mr-1">{song.id}.</span>
                        <span
                          className={index === 1 ? 'text-[#4BC94C] font-bold' : 'text-[#4BC94C]'}
                        >
                          {song.title}
                        </span>
                      </div>
                      <div className={index === 1 ? 'text-[#4BC94C] font-bold' : 'text-[#4BC94C]'}>
                        {song.length}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-1">
                  <div className="flex gap-1">
                    <PixelButton>
                      <span className="text-[8px] px-1 text-[#737388] uppercase">Add</span>
                    </PixelButton>
                    <PixelButton>
                      <span className="text-[8px] px-1 text-[#737388] uppercase">Rem</span>
                    </PixelButton>
                    <PixelButton>
                      <span className="text-[8px] px-1 text-[#737388] uppercase">Sel</span>
                    </PixelButton>
                    <PixelButton>
                      <span className="text-[8px] px-1 text-[#737388] uppercase">Misc</span>
                    </PixelButton>
                  </div>
                  <div className="w-[80px] bg-black winamp-screen border border-t-[#1d1c2e] border-b-[#737388] border-l-[#1d1c2e] border-r-[#737388] text-[#4BC94C] font-bold text-[8px]">
                    0:00:13:37
                  </div>
                </div>
              </div>
            </PixelBorder>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinampClone;

interface PixelButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// Custom button component to maintain pixel art aesthetic
function PixelButton({ children, className = '', onClick }: PixelButtonProps) {
  return (
    <div
      className={`relative flex items-center justify-center bg-[#bdced6] border-[2px] border-t-[#efffff] border-l-[#efffff] border-r-[#7a8494] border-b-[#7a8494] active:border-t-[#7a8494] active:border-l-[#7a8494] active:border-r-[#efffff] active:border-b-[#efffff] font-bold cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function PixelBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-1 mb-1 border border-t-[#1d1c2e] border-b-[#737388] border-l-[#1d1c2e] border-r-[#737388]">
      <div className="border p-1  border-t-[#737388] border-b-[#1d1c2e] border-l-[#737388] border-r-[#1d1c2e]">
        {children}
      </div>
    </div>
  );
}

// LCD Digit Component for the time display
interface DigitDisplayProps {
  value: string;
  color?: string;
  dotted?: boolean;
}

function DigitDisplay({ value, color = '#4BC94C' }: DigitDisplayProps) {
  // Determine which segments to light up based on the digit
  const segmentMap: Record<string, boolean[]> = {
    '0': [true, true, true, false, true, true, true], // 0 lights up segments 0,1,2,4,5,6
    '1': [false, false, true, false, false, true, false], // 1 lights up segments 2,5
    '2': [true, false, true, true, true, false, true], // 2 lights up segments 0,2,3,4,6
    '3': [true, false, true, true, false, true, true], // 3 lights up segments 0,2,3,5,6
    '4': [false, true, true, true, false, true, false], // 4 lights up segments 1,2,3,5
    '5': [true, true, false, true, false, true, true], // 5 lights up segments 0,1,3,5,6
    '6': [true, true, false, true, true, true, true], // 6 lights up segments 0,1,3,4,5,6
    '7': [true, false, true, false, false, true, false], // 7 lights up segments 0,2,5
    '8': [true, true, true, true, true, true, true], // 8 lights up all segments
    '9': [true, true, true, true, false, true, true], // 9 lights up segments 0,1,2,3,5,6
    ':': [false, false, false, false, false, false, false], // No segments for colon
  };

  const segments = segmentMap[value] || [false, false, false, false, false, false, false];

  return (
    <div className="relative w-[14px] h-[16px] mx-px">
      {/* Segments */}
      <div className="absolute inset-0">
        {/* Segment 0 - Top horizontal */}
        <div
          className={`absolute h-[2px] w-[10px] top-0 left-[2px] ${
            segments[0] ? `bg-[${color}]` : 'bg-transparent'
          }`}
        ></div>

        {/* Segment 1 - Top left vertical */}
        <div
          className={`absolute w-[2px] h-[6px] top-[1px] left-0 ${
            segments[1] ? `bg-[${color}]` : 'bg-transparent'
          }`}
        ></div>

        {/* Segment 2 - Top right vertical */}
        <div
          className={`absolute w-[2px] h-[6px] top-[1px] right-0 ${
            segments[2] ? `bg-[${color}]` : 'bg-transparent'
          }`}
        ></div>

        {/* Segment 3 - Middle horizontal */}
        <div
          className={`absolute h-[2px] w-[10px] top-[7px] left-[2px] ${
            segments[3] ? `bg-[${color}]` : 'bg-transparent'
          }`}
        ></div>

        {/* Segment 4 - Bottom left vertical */}
        <div
          className={`absolute w-[2px] h-[6px] bottom-[1px] left-0 ${
            segments[4] ? `bg-[${color}]` : 'bg-transparent'
          }`}
        ></div>

        {/* Segment 5 - Bottom right vertical */}
        <div
          className={`absolute w-[2px] h-[6px] bottom-[1px] right-0 ${
            segments[5] ? `bg-[${color}]` : 'bg-transparent'
          }`}
        ></div>

        {/* Segment 6 - Bottom horizontal */}
        <div
          className={`absolute h-[2px] w-[10px] bottom-0 left-[2px] ${
            segments[6] ? `bg-[${color}]` : 'bg-transparent'
          }`}
        ></div>
      </div>
    </div>
  );
}
