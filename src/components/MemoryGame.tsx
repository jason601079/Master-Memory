import { useState, useEffect, useCallback } from 'react';
import { Card as CardType, GameStats, Difficulty, DifficultyConfig } from '@/types/game';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trophy, Clock, RotateCcw, Play } from 'lucide-react';

const CARD_EMOJIS = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '🎸', '🎺', '🎻', '🎹', '🎤', '🎧', '🎬', '🎯', '🎊', '🎉', '🎁', '🎀'];

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: { gridSize: 4, label: 'Easy (4x4)' },
  medium: { gridSize: 6, label: 'Medium (6x6)' },
  hard: { gridSize: 8, label: 'Hard (8x8)' }
};

const GameCard = ({ card, onClick, isClickable }: { 
  card: CardType; 
  onClick: () => void; 
  isClickable: boolean;
}) => {
  const handleClick = () => {
    if (isClickable && !card.isFlipped && !card.isMatched) {
      onClick();
    }
  };

  return (
    <Card 
      className={`
        relative w-full aspect-square cursor-pointer transition-all duration-300 hover:scale-105
        ${card.isMatched ? 'animate-bounce-success' : ''}
        ${!isClickable ? 'cursor-not-allowed opacity-50' : ''}
      `}
      onClick={handleClick}
    >
      <div className="relative w-full h-full [perspective:1000px]">
        <div
          className={`
            absolute inset-0 w-full h-full transition-transform duration-600 [transform-style:preserve-3d]
            ${card.isFlipped || card.isMatched ? '[transform:rotateY(180deg)]' : ''}
          `}
        >
          {/* Back of card */}
          <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 bg-primary-foreground/20 rounded-full animate-pulse-glow" />
          </div>
          
          {/* Front of card */}
          <div 
            className={`
              absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]
              rounded-lg flex items-center justify-center text-4xl font-bold
              ${card.isMatched 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-secondary to-accent'
              }
            `}
          >
            {card.emoji}
          </div>
        </div>
      </div>
    </Card>
  );
};

export const MemoryGame = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [stats, setStats] = useState<GameStats>({
    moves: 0,
    matches: 0,
    timeElapsed: 0,
    isGameComplete: false
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [isClickable, setIsClickable] = useState(true);

  const initializeGame = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const totalCards = (config.gridSize * config.gridSize) / 2;
    const selectedEmojis = CARD_EMOJIS.slice(0, totalCards);
    const pairedEmojis = [...selectedEmojis, ...selectedEmojis];
    
    const shuffledCards = pairedEmojis
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setStats({
      moves: 0,
      matches: 0,
      timeElapsed: 0,
      isGameComplete: false
    });
    setIsClickable(true);
  }, [difficulty]);

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2) return;

    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setIsClickable(false);
      setStats(prev => ({ ...prev, moves: prev.moves + 1 }));

      const [firstCard, secondCard] = newFlippedCards.map(id => 
        cards.find(card => card.id === id)!
      );

      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            newFlippedCards.includes(card.id) 
              ? { ...card, isMatched: true }
              : card
          ));
          setStats(prev => ({ ...prev, matches: prev.matches + 1 }));
          setFlippedCards([]);
          setIsClickable(true);
        }, 600);
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            newFlippedCards.includes(card.id) 
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
          setIsClickable(true);
        }, 1200);
      }
    }
  };

  const startGame = () => {
    setGameStarted(true);
    initializeGame();
  };

  const resetGame = () => {
    initializeGame();
  };

  // Timer effect
  useEffect(() => {
    if (!gameStarted || stats.isGameComplete) return;

    const timer = setInterval(() => {
      setStats(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, stats.isGameComplete]);

  // Check for game completion
  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched)) {
      setStats(prev => ({ ...prev, isGameComplete: true }));
    }
  }, [cards]);

  const config = DIFFICULTY_CONFIG[difficulty];
  const gridCols = config.gridSize;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-900/20 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Memory Master
            </h1>
            <p className="text-muted-foreground">Test your memory with this challenging card matching game</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Choose Difficulty</label>
              <Select value={difficulty} onValueChange={(value: Difficulty) => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={startGame} size="lg" className="w-full">
              <Play className="mr-2 h-4 w-4" />
              Start Game
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-900/20 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Memory Master
          </h1>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Clock className="mr-1 h-3 w-3" />
              {formatTime(stats.timeElapsed)}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              Moves: {stats.moves}
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Trophy className="mr-1 h-3 w-3" />
              {stats.matches}/{(config.gridSize * config.gridSize) / 2}
            </Badge>
          </div>
        </div>

        {/* Game Complete Message */}
        {stats.isGameComplete && (
          <Card className="p-6 mb-6 text-center bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
            <h2 className="text-2xl font-bold text-green-400 mb-2">🎉 Congratulations!</h2>
            <p className="text-muted-foreground">
              You completed the game in {stats.moves} moves and {formatTime(stats.timeElapsed)}!
            </p>
          </Card>
        )}

        {/* Game Grid */}
        <div 
          className="grid gap-4 mb-6"
          style={{ 
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            maxWidth: `${gridCols * 100}px`,
            margin: '0 auto'
          }}
        >
          {cards.map((card) => (
            <GameCard
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card.id)}
              isClickable={isClickable}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button onClick={resetGame} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Game
          </Button>
          <Button onClick={() => setGameStarted(false)} variant="outline">
            Change Difficulty
          </Button>
        </div>
      </div>
    </div>
  );
};