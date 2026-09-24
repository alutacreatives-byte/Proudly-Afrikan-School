import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Lightbulb, 
  Shuffle, 
  Layers,
  ArrowRight,
  ArrowLeft,
  Volume2
} from 'lucide-react';

export interface StackedFlashcardItem {
  id?: string;
  front: string;
  back: string;
  hint?: string;
  category?: string;
  difficulty?: string;
  subtitle?: string;
}

export interface StackedFlashcardDeckProps {
  cards: StackedFlashcardItem[];
  currentIndex: number;
  onIndexChange: (newIndex: number) => void;
  onShuffle?: () => void;
  deckTitle?: string;
  deckCategory?: string;
  ratingComponent?: React.ReactNode;
}

// 8 Exact rotating pastel color themes specified in requirements
export const PASTEL_THEMES = [
  {
    name: 'Warm Cream',
    gradient: 'from-[#FFFDF7] via-[#FFF9ED] to-[#FAF1DC]',
    border: 'border-[#E8DCBF]',
    badgeBg: 'bg-[#F2E5C9]/80',
    badgeText: 'text-[#8A6721]',
    shadow: 'rgba(232, 220, 191, 0.45)',
    accent: '#B4823A',
  },
  {
    name: 'Soft Peach',
    gradient: 'from-[#FFF6F2] via-[#FFECE2] to-[#FDDAC9]',
    border: 'border-[#F6C2AE]',
    badgeBg: 'bg-[#F9CFBF]/80',
    badgeText: 'text-[#B04625]',
    shadow: 'rgba(246, 194, 174, 0.45)',
    accent: '#D95D39',
  },
  {
    name: 'Pale Yellow',
    gradient: 'from-[#FFFFEB] via-[#FFFBD4] to-[#FAF3AA]',
    border: 'border-[#EFE17D]',
    badgeBg: 'bg-[#F7ED9A]/80',
    badgeText: 'text-[#8D700B]',
    shadow: 'rgba(239, 225, 125, 0.45)',
    accent: '#C49B18',
  },
  {
    name: 'Soft Coral',
    gradient: 'from-[#FFF3EF] via-[#FFE3DB] to-[#FDCBC0]',
    border: 'border-[#F8B3A4]',
    badgeBg: 'bg-[#FBC4B8]/80',
    badgeText: 'text-[#B83E2B]',
    shadow: 'rgba(248, 179, 164, 0.45)',
    accent: '#E05A47',
  },
  {
    name: 'Light Lavender',
    gradient: 'from-[#F8F5FF] via-[#EEE8FE] to-[#DFD4FD]',
    border: 'border-[#C8B8F7]',
    badgeBg: 'bg-[#D7CBFA]/80',
    badgeText: 'text-[#5B3CA7]',
    shadow: 'rgba(200, 184, 247, 0.45)',
    accent: '#7C5AC2',
  },
  {
    name: 'Soft Sky Blue',
    gradient: 'from-[#F3F9FE] via-[#E3F2FE] to-[#CAE6FD]',
    border: 'border-[#A7D5F8]',
    badgeBg: 'bg-[#BFDFFB]/80',
    badgeText: 'text-[#1B6FAA]',
    shadow: 'rgba(167, 213, 248, 0.45)',
    accent: '#2A85C8',
  },
  {
    name: 'Pale Mint',
    gradient: 'from-[#F2FDF5] via-[#E2FAEB] to-[#C8F5D8]',
    border: 'border-[#A5E9BD]',
    badgeBg: 'bg-[#BEEECF]/80',
    badgeText: 'text-[#1A8548]',
    shadow: 'rgba(165, 233, 189, 0.45)',
    accent: '#2E9E5B',
  },
  {
    name: 'Soft Orange',
    gradient: 'from-[#FFF7ED] via-[#FFEDD8] to-[#FEDBB8]',
    border: 'border-[#F8C38C]',
    badgeBg: 'bg-[#FDCD9C]/80',
    badgeText: 'text-[#B85F0F]',
    shadow: 'rgba(248, 195, 140, 0.45)',
    accent: '#D97724',
  },
];

export const StackedFlashcardDeck: React.FC<StackedFlashcardDeckProps> = ({
  cards,
  currentIndex,
  onIndexChange,
  onShuffle,
  deckTitle,
  deckCategory,
  ratingComponent,
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animDirection, setAnimDirection] = useState<'next' | 'prev' | 'shuffle' | null>(null);

  // Drag and swipe gesture state
  const [dragX, setDragX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasMovedSignificantly = useRef<boolean>(false);

  const totalCards = cards.length;
  const currentCard = cards[currentIndex] || cards[0];

  // Guarantee flip and hint are always reset when card or deck updates
  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
  }, [currentIndex, cards]);

  const handleNext = useCallback(() => {
    if (isAnimating || totalCards <= 1) return;
    setIsAnimating(true);
    setAnimDirection('next');
    setIsFlipped(false);
    setShowHint(false);

    setTimeout(() => {
      onIndexChange((currentIndex + 1) % totalCards);
      setIsAnimating(false);
      setAnimDirection(null);
      setDragX(0);
    }, 280);
  }, [currentIndex, isAnimating, onIndexChange, totalCards]);

  const handlePrev = useCallback(() => {
    if (isAnimating || totalCards <= 1) return;
    setIsAnimating(true);
    setAnimDirection('prev');
    setIsFlipped(false);
    setShowHint(false);

    setTimeout(() => {
      onIndexChange((currentIndex - 1 + totalCards) % totalCards);
      setIsAnimating(false);
      setAnimDirection(null);
      setDragX(0);
    }, 280);
  }, [currentIndex, isAnimating, onIndexChange, totalCards]);

  const handleShuffleClick = useCallback(() => {
    if (isAnimating || !onShuffle || totalCards <= 1) return;
    // 1. Immediately reset flip and hint to ensure the new headline is shown
    setIsFlipped(false);
    setShowHint(false);
    // 2. Trigger deck riffle/shuffle animation
    setIsAnimating(true);
    setAnimDirection('shuffle');

    // 3. Trigger parent shuffle which guarantees a new complete card pair
    onShuffle();

    setTimeout(() => {
      setIsAnimating(false);
      setAnimDirection(null);
      setDragX(0);
    }, 320);
  }, [isAnimating, onShuffle, totalCards]);

  const handleFlip = useCallback(() => {
    if (isDragging || hasMovedSignificantly.current) return;
    setIsFlipped((prev) => !prev);
  }, [isDragging]);

  // Global keyboard shortcuts (Left/Right arrow, Spacebar to flip, S to shuffle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyN') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyP') {
        e.preventDefault();
        handlePrev();
      } else if ((e.code === 'KeyS' || e.key === 's' || e.key === 'S') && onShuffle) {
        e.preventDefault();
        handleShuffleClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleFlip, handleShuffleClick, onShuffle]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    hasMovedSignificantly.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStartRef.current || isAnimating) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;

    if (Math.abs(deltaX) > 10) {
      hasMovedSignificantly.current = true;
    }

    // Only apply horizontal resistance drag if not primarily scrolling vertically
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setDragX(deltaX * 0.7);
    }
  };

  const handleTouchEnd = () => {
    if (!dragStartRef.current) return;
    const threshold = 60;

    if (dragX < -threshold) {
      handleNext();
    } else if (dragX > threshold) {
      handlePrev();
    } else {
      setDragX(0);
    }

    setIsDragging(false);
    dragStartRef.current = null;
  };

  // Mouse handlers for desktop drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating || e.button !== 0) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    hasMovedSignificantly.current = false;
    setIsDragging(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current) return;
      const deltaX = moveEvent.clientX - dragStartRef.current.x;
      if (Math.abs(deltaX) > 8) {
        hasMovedSignificantly.current = true;
      }
      setDragX(deltaX * 0.65);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      const threshold = 70;
      setDragX((currentDrag) => {
        if (currentDrag < -threshold) {
          handleNext();
        } else if (currentDrag > threshold) {
          handlePrev();
        }
        return 0;
      });

      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="w-full max-w-[760px] mx-auto min-h-[460px] rounded-3xl bg-amber-50/50 border border-amber-200 p-8 flex flex-col items-center justify-center text-center">
        <Layers className="w-12 h-12 text-amber-500 mb-3" />
        <h3 className="font-display font-black text-xl text-stone-900 uppercase">No Flashcards In Deck</h3>
        <p className="text-sm text-stone-600 mt-1">Generate or add cards to start your active recall stack session.</p>
      </div>
    );
  }

  // Generate the 4 layers in the stack
  // Pos 0: Active Card (Scale: 1.0, Offset: 0px, Opacity: 1)
  // Pos 1: Card behind (Scale: 0.96, Offset: 24px, Opacity: 0.98)
  // Pos 2: Third card (Scale: 0.92, Offset: 48px, Opacity: 0.88)
  // Pos 3: Fourth card (Scale: 0.88, Offset: 72px, Opacity: 0.65)
  const stackPositions = [0, 1, 2, 3].map((pos) => {
    const cardIdx = (currentIndex + pos) % totalCards;
    const card = cards[cardIdx];
    const theme = PASTEL_THEMES[cardIdx % PASTEL_THEMES.length];
    return { pos, cardIdx, card, theme };
  });

  return (
    <div className="w-full flex flex-col items-center select-none py-2 sm:py-4">
      {/* Top Meta Bar: Progress & Deck Title */}
      <div className="w-full max-w-[760px] flex items-center justify-between px-2 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs sm:text-sm font-bold tracking-wider px-3.5 py-1.5 rounded-full bg-stone-900 text-stone-100 shadow-sm flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Card {currentIndex + 1} / {totalCards}</span>
          </span>

          {(deckCategory || currentCard?.category) && (
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
              {currentCard?.category || deckCategory}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onShuffle && (
            <button
              type="button"
              id="shuffle-flashcard-stack-btn"
              onClick={handleShuffleClick}
              disabled={isAnimating || totalCards <= 1}
              className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-stone-800 hover:bg-stone-50 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-40"
              title="Shuffle to a new headline card"
            >
              <Shuffle className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Shuffle</span>
            </button>
          )}

          <button
            type="button"
            id="flip-flashcard-stack-toggle-btn"
            onClick={handleFlip}
            className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-stone-800 hover:bg-stone-50 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Flip Card"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-600" />
            <span>Flip</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* THE PHYSICAL STACKED CARDS ARENA (CodePen Inspired)               */}
      {/* Desktop: 650-800px wide, 460-520px high                            */}
      {/* Mobile: 90% available width                                        */}
      {/* =================================================================== */}
      <div 
        className="relative w-full max-w-[760px] h-[510px] sm:h-[530px] md:h-[550px] flex items-start justify-center pt-14 sm:pt-16 px-3 sm:px-0"
        style={{ perspective: '1400px' }}
      >
        {/* Render stack from back to front (Pos 3 -> Pos 2 -> Pos 1 -> Pos 0) */}
        {stackPositions.slice().reverse().map(({ pos, cardIdx, card, theme }) => {
          // ACTIVE CARD (POS 0)
          if (pos === 0) {
            // Apply drag offset or exit animation transform
            let transform = 'translate3d(0, 0, 0) scale(1)';
            let opacity = 1;

            if (isAnimating) {
              if (animDirection === 'next') {
                transform = 'translate3d(-115%, -15px, 0) rotate(-9deg) scale(0.96)';
                opacity = 0;
              } else if (animDirection === 'prev') {
                transform = 'translate3d(115%, -15px, 0) rotate(9deg) scale(0.96)';
                opacity = 0;
              } else if (animDirection === 'shuffle') {
                transform = 'translate3d(0, 0, 0) rotate(-4deg) scale(0.98)';
                opacity = 0.95;
              }
            } else if (isDragging) {
              const rotateDeg = (dragX / 30).toFixed(2);
              transform = `translate3d(${dragX}px, 0, 0) rotate(${rotateDeg}deg) scale(1)`;
            }

            return (
              <div
                key={`active-card-${cardIdx}-${currentIndex}`}
                id="active-flashcard-front-card"
                className="absolute inset-x-3 sm:inset-x-0 top-14 sm:top-16 h-[420px] sm:h-[440px] md:h-[460px] cursor-pointer"
                style={{
                  zIndex: 40,
                  transform,
                  opacity,
                  transition: isDragging ? 'none' : 'transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.28s ease',
                  willChange: 'transform, opacity',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
              >
                {/* 3D Flip Outer Container */}
                <div
                  className="w-full h-full relative"
                  style={{
                    perspective: '1200px',
                    transformStyle: 'preserve-3d',
                  }}
                  onClick={handleFlip}
                >
                  {/* Flipping Inner Wrapper */}
                  <div
                    className="w-full h-full relative rounded-[2rem] sm:rounded-[2.5rem] transition-transform duration-500 ease-out"
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* =================================================== */}
                    {/* ACTIVE CARD FRONT (PROMPT / QUESTION / TERM)       */}
                    {/* =================================================== */}
                    <div
                      className={`absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br ${theme.gradient} border-2 ${theme.border} p-6 sm:p-10 flex flex-col justify-between overflow-hidden`}
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        boxShadow: `0 24px 48px -12px rgba(20, 20, 25, 0.16), 0 10px 24px -6px ${theme.shadow}`,
                      }}
                    >
                      {/* Top Bar of Active Card */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText} border ${theme.border}`}
                          >
                            {card.category || deckCategory || 'CONCEPT'}
                          </span>
                          {card.difficulty && (
                            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-900/5 text-stone-700">
                              {card.difficulty}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/5 text-stone-700 text-xs font-mono font-bold">
                          <RotateCw className="w-3.5 h-3.5 text-stone-600" />
                          <span className="text-[11px] uppercase tracking-wider">Tap to Flip</span>
                        </div>
                      </div>

                      {/* Main Center Content: Front (Dark Charcoal Text) */}
                      <div className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-6 my-auto">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-stone-500 mb-2 block">
                          QUESTION / TERM #{currentIndex + 1}
                        </span>
                        <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#1C1917] leading-tight max-w-xl">
                          {card.front}
                        </h2>
                      </div>

                      {/* Bottom Footer & Hint of Active Card */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-800/10">
                        {card.hint ? (
                          <div className="flex-1">
                            {!showHint ? (
                              <button
                                type="button"
                                id={`show-hint-btn-${cardIdx}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowHint(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 hover:bg-white text-stone-700 hover:text-stone-900 text-xs font-mono font-bold transition-all shadow-xs border border-stone-200"
                              >
                                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                <span>Show Hint</span>
                              </button>
                            ) : (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="p-3 bg-white/95 border border-stone-300 rounded-xl text-xs font-medium text-stone-800 shadow-md max-w-md"
                              >
                                <span className="font-mono font-bold text-amber-600 mr-1.5">💡 HINT:</span>
                                {card.hint}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-stone-500">
                            Active Recall Challenge
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-stone-500 hidden sm:inline-block">
                          Swipe or Drag to change card
                        </span>
                      </div>
                    </div>

                    {/* =================================================== */}
                    {/* ACTIVE CARD BACK (ANSWER / DEFINITION / RECALL)    */}
                    {/* =================================================== */}
                    <div
                      className={`absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br ${theme.gradient} border-2 ${theme.border} p-6 sm:p-10 flex flex-col justify-between overflow-hidden`}
                      style={{
                        transform: 'rotateY(180deg)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        boxShadow: `0 24px 48px -12px rgba(20, 20, 25, 0.16), 0 10px 24px -6px ${theme.shadow}`,
                      }}
                    >
                      {/* Top Bar of Active Card Back */}
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-stone-900 text-stone-100">
                          ANSWER / DEFINITION
                        </span>

                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/5 text-stone-700 text-xs font-mono font-bold">
                          <RotateCw className="w-3.5 h-3.5 text-stone-600" />
                          <span className="text-[11px] uppercase tracking-wider">Tap to Flip Back</span>
                        </div>
                      </div>

                      {/* Main Center Content: Back (Dark Charcoal Text) */}
                      <div className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-6 my-auto overflow-y-auto max-h-[260px] custom-scrollbar">
                        <p className="text-[#1C1917] text-base sm:text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                          {card.back}
                        </p>
                      </div>

                      {/* Bottom Footer of Active Card Back */}
                      <div className="flex items-center justify-between pt-2 border-t border-stone-800/10">
                        <span className="text-[11px] font-mono font-bold uppercase text-stone-600">
                          {card.front}
                        </span>

                        <span className="text-[10px] font-mono text-stone-500">
                          Click to flip back
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // ===============================================================
          // BACKGROUND STACKED CARDS (POSITIONS 1, 2, 3)
          // CodePen (Itchiii) Physical Stack Reference:
          // Pos 1: Scale 0.95, Offset -22px (visible top edge & sides)
          // Pos 2: Scale 0.90, Offset -44px (visible top edge & sides)
          // Pos 3: Scale 0.85, Offset -66px (visible top edge & sides)
          // ===============================================================
          const scales = [1, 0.95, 0.90, 0.85];
          const offsets = [0, -22, -44, -66];
          const opacities = [1, 0.96, 0.86, 0.68];
          const zIndices = [40, 30, 20, 10];

          // Smooth forward transition when active card exits
          let scale = scales[pos];
          let offsetY = offsets[pos];
          let opacity = opacities[pos];

          if (isAnimating) {
            if (animDirection === 'next') {
              scale = scales[pos - 1] ?? 1;
              offsetY = offsets[pos - 1] ?? 0;
              opacity = opacities[pos - 1] ?? 1;
            } else if (animDirection === 'shuffle') {
              offsetY = offsets[pos] + (pos === 1 ? -6 : pos === 2 ? 6 : -3);
            }
          }

          return (
            <div
              key={`bg-card-${pos}-${cardIdx}`}
              className={`absolute inset-x-3 sm:inset-x-0 top-14 sm:top-16 h-[420px] sm:h-[440px] md:h-[460px] rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br ${theme.gradient} border-2 ${theme.border} p-6 flex flex-col justify-between overflow-hidden pointer-events-none select-none`}
              style={{
                zIndex: zIndices[pos],
                transform: `translate3d(0, ${offsetY}px, 0) scale(${scale})`,
                transformOrigin: 'top center',
                opacity,
                boxShadow: `0 20px 40px -10px rgba(15, 15, 20, 0.16), 0 8px 16px -4px ${theme.shadow}`,
                transition: 'transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.28s ease',
              }}
            >
              {/* Visible top edge header for stacked cards peeking behind active card */}
              <div className="flex items-center justify-between opacity-95 px-1 pt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText} border ${theme.border}`}>
                  #{cardIdx + 1} • {card.category || deckCategory || 'CONCEPT'}
                </span>
                <span className="w-2 h-2 rounded-full bg-stone-500/40" />
              </div>
            </div>
          );
        })}
      </div>

      {/* =================================================================== */}
      {/* TACTILE NAVIGATION CONTROLS (PREVIOUS / SHUFFLE / PROGRESS / NEXT) */}
      {/* =================================================================== */}
      <div className="w-full max-w-[760px] flex items-center justify-between gap-2 sm:gap-4 mt-6 px-2">
        <button
          type="button"
          id="prev-flashcard-stack-btn"
          onClick={handlePrev}
          disabled={isAnimating || totalCards <= 1}
          className="px-4 sm:px-6 py-3 rounded-2xl bg-white border border-stone-200 hover:bg-stone-50 active:scale-95 font-display font-black text-xs uppercase text-stone-800 flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4 text-stone-700" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {onShuffle && (
          <button
            type="button"
            id="shuffle-flashcard-stack-nav-btn"
            onClick={handleShuffleClick}
            disabled={isAnimating || totalCards <= 1}
            className="px-4 sm:px-5 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 active:scale-95 border border-amber-200 text-amber-900 font-display font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-40"
            title="Shuffle to a new complete headline card"
          >
            <Shuffle className="w-4 h-4 text-amber-700" />
            <span>Shuffle</span>
          </button>
        )}

        {/* Tactile Progress Indicator: e.g. "4 / 20" */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 font-mono text-xs sm:text-sm font-bold text-stone-800 shadow-inner">
            <span className="text-[#1C1917]">{currentIndex + 1}</span>
            <span className="text-stone-400 mx-1.5">/</span>
            <span className="text-stone-500">{totalCards}</span>
          </div>
        </div>

        <button
          type="button"
          id="next-flashcard-stack-btn"
          onClick={handleNext}
          disabled={isAnimating || totalCards <= 1}
          className="px-4 sm:px-6 py-3 rounded-2xl bg-[#18181B] hover:bg-[#27272A] active:scale-95 text-white font-display font-black text-xs uppercase flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-40"
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Optional Rating Component Slot (Used in Active Recall / Review) */}
      {ratingComponent && (
        <div className="w-full max-w-[760px] mt-6 px-2">
          {ratingComponent}
        </div>
      )}
    </div>
  );
};
