import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  RotateCw, 
  ArrowRight,
  ArrowLeft,
  Shuffle, 
  Layers,
  Lightbulb,
  CheckCircle2
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
  isFlipped?: boolean;
  onFlipChange?: (flipped: boolean) => void;
}

// 8 Distinct Pastel Themes with High Contrast & Clear Depth
export const PASTEL_THEMES = [
  {
    name: 'Warm Cream',
    gradient: 'from-[#FFFDF7] via-[#FFF9EE] to-[#FBF3E0]',
    border: 'border-[#EADCC2]',
    badgeBg: 'bg-[#F4E8D1]',
    badgeText: 'text-[#875F19]',
    shadowColor: 'rgba(215, 194, 155, 0.45)',
    accent: '#B4823A',
  },
  {
    name: 'Soft Peach',
    gradient: 'from-[#FFF7F4] via-[#FFEFE8] to-[#FDDFD1]',
    border: 'border-[#F8C6B4]',
    badgeBg: 'bg-[#FBD4C5]',
    badgeText: 'text-[#AC3F1F]',
    shadowColor: 'rgba(235, 178, 158, 0.45)',
    accent: '#D95D39',
  },
  {
    name: 'Pale Primrose',
    gradient: 'from-[#FFFFEC] via-[#FFFCD8] to-[#FAF4B2]',
    border: 'border-[#EFE284]',
    badgeBg: 'bg-[#F8EEA2]',
    badgeText: 'text-[#886B06]',
    shadowColor: 'rgba(224, 209, 107, 0.45)',
    accent: '#C49B18',
  },
  {
    name: 'Soft Coral',
    gradient: 'from-[#FFF4F1] via-[#FFE7E0] to-[#FDCEC5]',
    border: 'border-[#F9B9AB]',
    badgeBg: 'bg-[#FDCBC1]',
    badgeText: 'text-[#B43825]',
    shadowColor: 'rgba(238, 166, 150, 0.45)',
    accent: '#E05A47',
  },
  {
    name: 'Light Lavender',
    gradient: 'from-[#F9F6FF] via-[#EFE9FE] to-[#E3D9FD]',
    border: 'border-[#CCBDF8]',
    badgeBg: 'bg-[#DBD0FA]',
    badgeText: 'text-[#5839A3]',
    shadowColor: 'rgba(195, 178, 243, 0.45)',
    accent: '#7C5AC2',
  },
  {
    name: 'Soft Sky Blue',
    gradient: 'from-[#F4F9FE] via-[#E6F3FE] to-[#CEE9FD]',
    border: 'border-[#ACD8F9]',
    badgeBg: 'bg-[#C4E2FB]',
    badgeText: 'text-[#166BA5]',
    shadowColor: 'rgba(160, 207, 243, 0.45)',
    accent: '#2A85C8',
  },
  {
    name: 'Pale Mint',
    gradient: 'from-[#F3FDF6] via-[#E5FBF0] to-[#CDF6DE]',
    border: 'border-[#ABEBCE]',
    badgeBg: 'bg-[#C2F0DA]',
    badgeText: 'text-[#168044]',
    shadowColor: 'rgba(159, 227, 185, 0.45)',
    accent: '#2E9E5B',
  },
  {
    name: 'Soft Amber',
    gradient: 'from-[#FFF8EE] via-[#FFEE DB] to-[#FEDEBD]',
    border: 'border-[#F8C793]',
    badgeBg: 'bg-[#FDD1A3]',
    badgeText: 'text-[#B05807]',
    shadowColor: 'rgba(238, 184, 128, 0.45)',
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
  isFlipped: controlledFlipped,
  onFlipChange,
}) => {
  // Controlled vs Uncontrolled Flip State
  const [internalFlipped, setInternalFlipped] = useState<boolean>(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const [showHint, setShowHint] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animDirection, setAnimDirection] = useState<'next' | 'prev' | 'shuffle' | null>(null);

  // Incoming card state for smooth Previous transition
  const [incomingPrevCard, setIncomingPrevCard] = useState<{
    card: StackedFlashcardItem;
    index: number;
    theme: typeof PASTEL_THEMES[0];
  } | null>(null);

  // Touch and drag gesture state
  const [dragX, setDragX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const hasMovedSignificantly = useRef<boolean>(false);

  const totalCards = cards.length;
  const currentCard = cards[currentIndex] || cards[0];

  const updateFlip = useCallback((flipped: boolean) => {
    setInternalFlipped(flipped);
    onFlipChange?.(flipped);
  }, [onFlipChange]);

  // Always reset flip and hint when card changes
  useEffect(() => {
    updateFlip(false);
    setShowHint(false);
  }, [currentIndex, cards, updateFlip]);

  const handleFlip = useCallback(() => {
    if (isDragging || hasMovedSignificantly.current) return;
    updateFlip(!isFlipped);
  }, [isDragging, isFlipped, updateFlip]);

  // Smooth Next Navigation
  const handleNext = useCallback(() => {
    if (isAnimating || totalCards <= 1) return;
    setIsAnimating(true);
    setAnimDirection('next');
    updateFlip(false);
    setShowHint(false);

    setTimeout(() => {
      onIndexChange((currentIndex + 1) % totalCards);
      setIsAnimating(false);
      setAnimDirection(null);
      setDragX(0);
    }, 280);
  }, [currentIndex, isAnimating, onIndexChange, totalCards, updateFlip]);

  // Smooth Previous Navigation (with physical card slide-in)
  const handlePrev = useCallback(() => {
    if (isAnimating || totalCards <= 1) return;
    const prevIdx = (currentIndex - 1 + totalCards) % totalCards;
    const prevCard = cards[prevIdx];
    const prevTheme = PASTEL_THEMES[prevIdx % PASTEL_THEMES.length];

    setIncomingPrevCard({
      card: prevCard,
      index: prevIdx,
      theme: prevTheme,
    });

    setIsAnimating(true);
    setAnimDirection('prev');
    updateFlip(false);
    setShowHint(false);

    setTimeout(() => {
      onIndexChange(prevIdx);
      setIsAnimating(false);
      setAnimDirection(null);
      setIncomingPrevCard(null);
      setDragX(0);
    }, 280);
  }, [currentIndex, isAnimating, onIndexChange, totalCards, cards, updateFlip]);

  // Shuffle: Moves to another complete flashcard, keeping headline and description together
  const handleShuffleClick = useCallback(() => {
    if (isAnimating || totalCards <= 1) return;
    // 1. Immediately reset flip and hint so the new card starts on the headline
    updateFlip(false);
    setShowHint(false);

    // 2. Play tactile deck shuffle riffle animation
    setIsAnimating(true);
    setAnimDirection('shuffle');

    // 3. Move to another complete flashcard
    if (onShuffle) {
      onShuffle();
    } else {
      const candidateIndices = cards.map((_, i) => i).filter(i => i !== currentIndex);
      const chosenIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
      onIndexChange(chosenIndex);
    }

    setTimeout(() => {
      setIsAnimating(false);
      setAnimDirection(null);
      setDragX(0);
    }, 320);
  }, [isAnimating, onShuffle, totalCards, cards, currentIndex, onIndexChange, updateFlip]);

  // Keyboard Shortcuts (Space to flip, Left/Right arrows to navigate, S to shuffle)
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
      } else if (e.code === 'KeyS' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleShuffleClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleShuffleClick]);

  // Touch Swipe Handlers (Responsive for mobile)
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

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setDragX(deltaX * 0.7);
    }
  };

  const handleTouchEnd = () => {
    if (!dragStartRef.current) return;
    const threshold = 55;

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

  // Mouse Drag Handlers (Desktop)
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

      const threshold = 65;
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
      <div className="w-full max-w-[720px] mx-auto min-h-[440px] rounded-3xl bg-amber-50/50 border border-amber-200 p-8 flex flex-col items-center justify-center text-center">
        <Layers className="w-12 h-12 text-amber-500 mb-3" />
        <h3 className="font-display font-black text-xl text-stone-900 uppercase">No Flashcards In Deck</h3>
        <p className="text-sm text-stone-600 mt-1">Generate or add cards to start your active recall stack session.</p>
      </div>
    );
  }

  // Active theme
  const activeTheme = PASTEL_THEMES[currentIndex % PASTEL_THEMES.length];

  // Up to 3 background stacked cards visibly layered behind the active card
  // Pos 1: translateY -18px, scale 0.96
  // Pos 2: translateY -36px, scale 0.92
  // Pos 3: translateY -52px, scale 0.88
  const maxStackVisible = Math.min(totalCards - 1, 3);
  const backgroundStack = Array.from({ length: maxStackVisible }, (_, i) => {
    const pos = i + 1;
    const cardIdx = (currentIndex + pos) % totalCards;
    const card = cards[cardIdx];
    const theme = PASTEL_THEMES[cardIdx % PASTEL_THEMES.length];
    return { pos, cardIdx, card, theme };
  });

  return (
    <div className="w-full flex flex-col items-center select-none py-2 sm:py-4">
      {/* Top Deck Header Bar */}
      <div className="w-full max-w-[720px] flex items-center justify-between px-2 sm:px-1 mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
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
          <button
            type="button"
            id="shuffle-flashcard-top-btn"
            onClick={handleShuffleClick}
            disabled={isAnimating || totalCards <= 1}
            className="px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-800 hover:bg-stone-50 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-40"
            title="Shuffle to another complete flashcard"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Shuffle</span>
          </button>

          <button
            type="button"
            id="flip-flashcard-top-btn"
            onClick={handleFlip}
            className="px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-stone-800 hover:bg-stone-50 text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Flip Card"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#D92B8A]" />
            <span>Flip</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* STACKED FLASHCARD ARENA (CodePen Inspired Physical Deck)             */}
      {/* Visual Depth, Layering, Soft Shadows, Smooth Transitions           */}
      {/* =================================================================== */}
      <div 
        className="relative w-full max-w-[720px] h-[480px] sm:h-[510px] md:h-[530px] flex items-start justify-center pt-14 sm:pt-16 px-2 sm:px-0"
        style={{ perspective: '1200px' }}
      >
        {/* 1. RENDER VISIBLE STACKED CARDS BEHIND (From back to front: Pos 3 -> 2 -> 1) */}
        {backgroundStack.slice().reverse().map(({ pos, cardIdx, card, theme }) => {
          const baseScales = [1, 0.96, 0.92, 0.88];
          const baseOffsets = [0, -18, -36, -52];
          const baseOpacities = [1, 0.96, 0.88, 0.72];
          const zIndices = [30, 20, 10, 5];

          let scale = baseScales[pos];
          let offsetY = baseOffsets[pos];
          let opacity = baseOpacities[pos];
          let rotateZ = 0;

          if (isAnimating) {
            if (animDirection === 'next') {
              // Shift forward one step
              scale = baseScales[pos - 1] ?? 1;
              offsetY = baseOffsets[pos - 1] ?? 0;
              opacity = baseOpacities[pos - 1] ?? 1;
            } else if (animDirection === 'prev') {
              // Shift back one step
              scale = baseScales[Math.min(pos + 1, 3)];
              offsetY = baseOffsets[Math.min(pos + 1, 3)];
              opacity = baseOpacities[Math.min(pos + 1, 3)];
            } else if (animDirection === 'shuffle') {
              // Playful deck riffle fan
              rotateZ = pos === 1 ? 4 : pos === 2 ? -3 : 2;
              offsetY = baseOffsets[pos] + (pos === 1 ? -4 : pos === 2 ? 4 : -2);
            }
          }

          return (
            <div
              key={`bg-card-${pos}-${cardIdx}`}
              className={`absolute inset-x-2 sm:inset-x-0 top-14 sm:top-16 h-[390px] sm:h-[420px] md:h-[440px] rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br ${theme.gradient} border-2 ${theme.border} p-5 sm:p-6 flex flex-col justify-between overflow-hidden pointer-events-none select-none`}
              style={{
                zIndex: zIndices[pos],
                transform: `translate3d(0, ${offsetY}px, 0) scale(${scale}) rotate(${rotateZ}deg)`,
                transformOrigin: 'top center',
                opacity,
                boxShadow: `0 18px 36px -10px rgba(28, 25, 23, 0.14), 0 0 0 1px rgba(0, 0, 0, 0.04), 0 8px 16px -4px ${theme.shadowColor}`,
                transition: isAnimating 
                  ? 'transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.26s ease' 
                  : 'transform 0.24s ease, opacity 0.24s ease',
              }}
            >
              {/* Exposed Top Strip of Stacked Card: Shows Card Number & Concept Preview */}
              <div className="flex items-center justify-between opacity-95 px-1 pt-0.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText} border ${theme.border}`}>
                    #{cardIdx + 1}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-stone-600 truncate max-w-[180px] sm:max-w-[320px]">
                    {card.front}
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-stone-400/40" />
              </div>
            </div>
          );
        })}

        {/* 2. INCOMING CARD FOR SMOOTH PREVIOUS SLIDE-IN */}
        {incomingPrevCard && isAnimating && animDirection === 'prev' && (
          <div
            className={`absolute inset-x-2 sm:inset-x-0 top-14 sm:top-16 h-[390px] sm:h-[420px] md:h-[440px] rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br ${incomingPrevCard.theme.gradient} border-2 ${incomingPrevCard.theme.border} p-6 sm:p-10 flex flex-col justify-between select-none pointer-events-none`}
            style={{
              zIndex: 50,
              transform: 'translate3d(0, 0, 0) scale(1)',
              opacity: 1,
              boxShadow: `0 24px 48px -12px rgba(28, 25, 23, 0.18), 0 10px 24px -6px ${incomingPrevCard.theme.shadowColor}`,
              animation: 'incomingCardPrev 0.28s cubic-bezier(0.2, 0.9, 0.3, 1) forwards',
            }}
          >
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${incomingPrevCard.theme.badgeBg} ${incomingPrevCard.theme.badgeText} border ${incomingPrevCard.theme.border}`}>
                {incomingPrevCard.card.category || deckCategory || 'CONCEPT'}
              </span>
              <span className="text-[11px] font-mono font-bold text-stone-500">
                Card {incomingPrevCard.index + 1} of {totalCards}
              </span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-6 my-auto">
              <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#1C1917] leading-snug tracking-tight max-w-xl">
                {incomingPrevCard.card.front}
              </h2>
            </div>
          </div>
        )}

        {/* 3. ACTIVE FRONT CARD (INTERACTIVE, FLIPPABLE, DRAGGABLE) */}
        {(() => {
          let transform = 'translate3d(0, 0, 0) scale(1)';
          let opacity = 1;

          if (isAnimating) {
            if (animDirection === 'next') {
              // Active card glides smoothly off to the left with slight tilt
              transform = 'translate3d(-110%, 15px, 0) rotate(-10deg) scale(0.94)';
              opacity = 0;
            } else if (animDirection === 'prev') {
              // Active card smoothly drops into stack layer 1 position
              transform = 'translate3d(0, -18px, 0) scale(0.96)';
              opacity = 0.96;
            } else if (animDirection === 'shuffle') {
              // Playful shuffle riffle tilt
              transform = 'translate3d(-16px, 0, 0) rotate(-5deg) scale(0.98)';
              opacity = 0.95;
            }
          } else if (isDragging) {
            const rotateDeg = (dragX / 28).toFixed(2);
            transform = `translate3d(${dragX}px, 0, 0) rotate(${rotateDeg}deg) scale(1)`;
          }

          return (
            <div
              id="active-flashcard-deck-card"
              className="absolute inset-x-2 sm:inset-x-0 top-14 sm:top-16 h-[390px] sm:h-[420px] md:h-[440px] cursor-pointer"
              style={{
                zIndex: 40,
                transform,
                opacity,
                transition: isDragging 
                  ? 'none' 
                  : 'transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.26s ease',
                willChange: 'transform, opacity',
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
            >
              {/* 3D Flip Container */}
              <div
                className="w-full h-full relative"
                style={{
                  perspective: '1200px',
                  transformStyle: 'preserve-3d',
                }}
                onClick={handleFlip}
              >
                {/* 3D Flipping Card Body */}
                <div
                  className="w-full h-full relative rounded-[2rem] sm:rounded-[2.5rem] transition-transform duration-500 ease-out"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* ======================================================= */}
                  {/* FRONT FACE: HEADLINE / QUESTION / CONCEPT               */}
                  {/* ======================================================= */}
                  <div
                    className={`absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br ${activeTheme.gradient} border-2 ${activeTheme.border} p-6 sm:p-10 flex flex-col justify-between overflow-hidden select-none`}
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      boxShadow: `0 24px 48px -12px rgba(28, 25, 23, 0.16), 0 10px 24px -6px ${activeTheme.shadowColor}, 0 0 0 1px rgba(0, 0, 0, 0.04)`,
                    }}
                  >
                    {/* Top Row: Category, Card Counter & Flip Cue */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${activeTheme.badgeBg} ${activeTheme.badgeText} border ${activeTheme.border}`}
                        >
                          {currentCard.category || deckCategory || 'CONCEPT'}
                        </span>
                        {currentCard.difficulty && (
                          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-900/5 text-stone-700">
                            {currentCard.difficulty}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-stone-500">
                          #{currentIndex + 1} / {totalCards}
                        </span>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-stone-700 text-xs font-mono font-bold border border-stone-200 shadow-xs transition-colors">
                          <RotateCw className="w-3.5 h-3.5 text-[#D92B8A]" />
                          <span className="text-[11px] uppercase tracking-wider hidden sm:inline">Flip</span>
                        </div>
                      </div>
                    </div>

                    {/* Center: Main Headline / Question / Term */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-6 my-auto">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-stone-500 mb-2.5 block">
                        HEADLINE / QUESTION
                      </span>
                      <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#1C1917] leading-snug tracking-tight max-w-xl">
                        {currentCard.front}
                      </h2>
                      {currentCard.subtitle && (
                        <p className="mt-2 text-sm text-stone-600 font-medium max-w-md">
                          {currentCard.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Bottom Row: Hint & Click to Flip indicator */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-800/10">
                      {currentCard.hint ? (
                        <div className="flex-1">
                          {!showHint ? (
                            <button
                              type="button"
                              id={`show-hint-btn-${currentIndex}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowHint(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-stone-700 text-xs font-mono font-bold transition-all shadow-xs border border-stone-200 cursor-pointer"
                            >
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                              <span>Show Hint</span>
                            </button>
                          ) : (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="p-3 bg-white/95 border border-stone-300 rounded-xl text-xs font-medium text-stone-800 shadow-sm max-w-md"
                            >
                              <span className="font-mono font-bold text-amber-600 mr-1.5">💡 HINT:</span>
                              {currentCard.hint}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-stone-500">
                          Active Recall Flashcard
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 text-stone-500 text-xs font-mono">
                        <RotateCw className="w-3 h-3 text-stone-400" />
                        <span className="text-[11px]">Click or tap to flip</span>
                      </div>
                    </div>
                  </div>

                  {/* ======================================================= */}
                  {/* BACK FACE: DESCRIPTION / ANSWER                         */}
                  {/* Headline & Description Always Together on Same Card     */}
                  {/* ======================================================= */}
                  <div
                    className={`absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br ${activeTheme.gradient} border-2 ${activeTheme.border} p-6 sm:p-10 flex flex-col justify-between overflow-hidden select-none`}
                    style={{
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      boxShadow: `0 24px 48px -12px rgba(28, 25, 23, 0.16), 0 10px 24px -6px ${activeTheme.shadowColor}, 0 0 0 1px rgba(0, 0, 0, 0.04)`,
                    }}
                  >
                    {/* Top Row: Answer Badge & Flip Back cue */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-stone-900 text-stone-100">
                        ANSWER / DESCRIPTION
                      </span>

                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 hover:bg-white text-stone-700 text-xs font-mono font-bold border border-stone-200 shadow-xs transition-colors">
                        <RotateCw className="w-3.5 h-3.5 text-[#D92B8A]" />
                        <span className="text-[11px] uppercase tracking-wider hidden sm:inline">Flip Back</span>
                      </div>
                    </div>

                    {/* Headline Context Bar: Keeps Headline & Description Together! */}
                    <div className="mt-2 px-3.5 py-1.5 rounded-xl bg-stone-900/5 border border-stone-900/10 text-stone-700 text-xs font-medium flex items-center gap-2 max-w-full">
                      <span className="font-mono font-bold text-[10px] uppercase text-stone-500 tracking-wider whitespace-nowrap">
                        Concept:
                      </span>
                      <span className="truncate font-semibold text-stone-900">
                        {currentCard.front}
                      </span>
                    </div>

                    {/* Center: Full Description / Answer */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-6 my-auto overflow-y-auto max-h-[220px] sm:max-h-[250px] custom-scrollbar">
                      <p className="text-[#1C1917] text-base sm:text-lg md:text-xl font-medium leading-relaxed max-w-xl">
                        {currentCard.back}
                      </p>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-800/10">
                      <span className="text-[11px] font-mono text-stone-500">
                        Card {currentIndex + 1} of {totalCards}
                      </span>

                      <div className="flex items-center gap-1.5 text-stone-500 text-xs font-mono">
                        <RotateCw className="w-3 h-3 text-stone-400" />
                        <span className="text-[11px]">Click or tap to flip back</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* =================================================================== */}
      {/* TACTILE NAVIGATION CONTROLS (PREVIOUS / SHUFFLE / NEXT)            */}
      {/* =================================================================== */}
      <div className="w-full max-w-[720px] flex items-center justify-between gap-2 sm:gap-4 mt-6 px-2">
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

        <button
          type="button"
          id="shuffle-flashcard-deck-btn"
          onClick={handleShuffleClick}
          disabled={isAnimating || totalCards <= 1}
          className="px-4 sm:px-5 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100/90 active:scale-95 border border-amber-200 text-amber-900 font-display font-black text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-40"
          title="Shuffle to another complete flashcard"
        >
          <Shuffle className="w-4 h-4 text-amber-700" />
          <span>Shuffle</span>
        </button>

        {/* Tactile Progress Indicator: e.g. "Card 3 / 8" */}
        <div className="flex items-center gap-1.5">
          <div className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-stone-100 border border-stone-200 font-mono text-xs sm:text-sm font-bold text-stone-800 shadow-inner">
            <span className="text-[#1C1917]">{currentIndex + 1}</span>
            <span className="text-stone-400 mx-1">/</span>
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

      {/* Interactive Dot Navigator for decks with up to 16 cards */}
      {totalCards > 1 && totalCards <= 16 && (
        <div className="flex items-center justify-center gap-1.5 mt-3 px-2 flex-wrap">
          {cards.map((_, idx) => (
            <button
              key={`deck-dot-${idx}`}
              type="button"
              onClick={() => {
                if (idx !== currentIndex && !isAnimating) {
                  updateFlip(false);
                  onIndexChange(idx);
                }
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-[#D92B8A]'
                  : 'w-2 bg-stone-300 hover:bg-stone-400'
              }`}
              title={`Go to Card ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Optional Rating Component Slot (Active Recall in FlashcardsView) */}
      {ratingComponent && (
        <div className="w-full max-w-[720px] mt-6 px-2">
          {ratingComponent}
        </div>
      )}
    </div>
  );
};
