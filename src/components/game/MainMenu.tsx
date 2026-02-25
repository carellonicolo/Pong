import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Gamepad2, 
  Users, 
  Globe, 
  Palette, 
  Zap, 
  Trophy,
  Play,
  Settings,
  Volume2,
  Music,
  RotateCcw,
  Keyboard
} from 'lucide-react';
import { GameConfig, GameMode, GameTheme, BallSpeed, KeyBindings, THEME_PRESETS } from '@/types/game';
import { cn } from '@/lib/utils';
import { KeyBindButton } from './KeyBindButton';

interface MainMenuProps {
  onStartGame: (config: GameConfig) => void;
  onViewLeaderboard?: () => void;
}

const THEME_OPTIONS: { value: GameTheme; label: string; icon: string; description: string }[] = [
  { value: 'retro', label: 'Retro Arcade', icon: '🕹️', description: 'Neon glow, pixel vibes' },
  { value: 'minimal', label: 'Minimal', icon: '⚪', description: 'Clean black & white' },
  { value: 'futuristic', label: 'Futuristico', icon: '🚀', description: 'Glow & particelle' },
  { value: 'custom', label: 'Personalizzato', icon: '🌈', description: 'Scegli i tuoi colori' },
];

const MODE_OPTIONS: { value: GameMode; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'single', label: 'Singolo', icon: <Gamepad2 className="w-6 h-6" />, description: 'Gioca contro la CPU' },
  { value: 'local', label: 'Locale', icon: <Users className="w-6 h-6" />, description: '2 giocatori, stesso schermo' },
  { value: 'online', label: 'Online', icon: <Globe className="w-6 h-6" />, description: 'Sfida giocatori reali' },
];

const SPEED_OPTIONS: { value: BallSpeed; label: string }[] = [
  { value: 'slow', label: 'Lenta' },
  { value: 'normal', label: 'Normale' },
  { value: 'fast', label: 'Veloce' },
];

const COLOR_PRESETS = [
  '210 100% 50%', // Blue
  '0 80% 50%',    // Red
  '120 70% 45%',  // Green
  '45 100% 50%',  // Yellow
  '280 80% 55%',  // Purple
  '180 70% 45%',  // Cyan
  '320 80% 55%',  // Pink
  '30 90% 50%',   // Orange
];

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onViewLeaderboard }) => {
  const [showConfig, setShowConfig] = useState(false);
  const getDefaultConfig = (mode: GameMode): GameConfig => ({
    theme: 'retro',
    mode,
    winScore: 5,
    ballSpeed: 'normal',
    powerUpsEnabled: true,
    player1Color: THEME_PRESETS.retro.paddle1,
    player2Color: THEME_PRESETS.retro.paddle2,
    player1Nickname: 'Player 1',
    player2Nickname: 'Player 2',
    paddleSensitivity: 0.5,
    soundEnabled: true,
    musicEnabled: false,
    player1Keys: mode === 'single' ? { up: 'arrowup', down: 'arrowdown' } : { up: 'w', down: 's' },
    player2Keys: { up: 'arrowup', down: 'arrowdown' },
    mouseEnabled: mode === 'single',
  });

  const [config, setConfig] = useState<GameConfig>(getDefaultConfig('single'));

  const handleResetDefaults = () => {
    setConfig(getDefaultConfig(config.mode));
  };

  const handleThemeChange = (theme: GameTheme) => {
    const themeColors = THEME_PRESETS[theme];
    setConfig(prev => ({
      ...prev,
      theme,
      player1Color: themeColors.paddle1,
      player2Color: themeColors.paddle2,
    }));
  };

  const handleStartGame = () => {
    if (config.mode === 'single') {
      setConfig(prev => ({ ...prev, player2Nickname: 'CPU' }));
    }
    onStartGame({
      ...config,
      player2Nickname: config.mode === 'single' ? 'CPU' : config.player2Nickname,
    });
  };

  if (!showConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background relative overflow-hidden">
        {/* Abstract background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-[15%] right-[10%] w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
          <div className="absolute top-[40%] right-[25%] w-48 h-48 rounded-full bg-primary/3 blur-2xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
          <div className="absolute bottom-[40%] left-[20%] w-56 h-56 rounded-full bg-accent/3 blur-2xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }} />
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diag" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="40" stroke="hsl(var(--foreground))" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diag)"/>
          </svg>
        </div>
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PONG
          </h1>
          <p className="text-xl text-muted-foreground">Multiplayer Edition</p>
        </div>

        <div className="grid gap-4 w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          {MODE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              size="lg"
              className="h-20 justify-start gap-4 text-left hover:scale-[1.02] transition-transform"
              onClick={() => {
                setConfig(getDefaultConfig(option.value));
                setShowConfig(true);
              }}
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {option.icon}
              </div>
              <div>
                <div className="font-semibold">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </div>
            </Button>
          ))}

          {onViewLeaderboard && (
            <Button
              variant="ghost"
              size="lg"
              className="h-16 mt-4"
              onClick={onViewLeaderboard}
            >
              <Trophy className="w-5 h-5 mr-2" />
              Classifica Globale
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background relative overflow-hidden">
      {/* Abstract background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[15%] right-[10%] w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
        <div className="absolute top-[40%] right-[25%] w-48 h-48 rounded-full bg-primary/3 blur-2xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
        <div className="absolute bottom-[40%] left-[20%] w-56 h-56 rounded-full bg-accent/3 blur-2xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }} />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="diag2" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="hsl(var(--foreground))" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diag2)"/>
        </svg>
      </div>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configura Partita
              </CardTitle>
              <CardDescription>
                {MODE_OPTIONS.find(m => m.value === config.mode)?.label} -{' '}
                {MODE_OPTIONS.find(m => m.value === config.mode)?.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleResetDefaults} title="Ripristina valori predefiniti">
                <RotateCcw className="w-4 h-4 mr-1" />
                Default
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowConfig(false)}>
                ← Indietro
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Selection */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Tema Visivo
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => handleThemeChange(theme.value)}
                  className={cn(
                    "p-3 rounded-lg border-2 text-left transition-all hover:scale-[1.02]",
                    config.theme === theme.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="text-2xl mb-1">{theme.icon}</div>
                  <div className="text-sm font-medium">{theme.label}</div>
                  <div className="text-xs text-muted-foreground">{theme.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Player Names */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="player1">Giocatore 1</Label>
              <Input
                id="player1"
                value={config.player1Nickname}
                onChange={(e) => setConfig(prev => ({ ...prev, player1Nickname: e.target.value }))}
                maxLength={15}
              />
            </div>
            {config.mode !== 'single' && (
              <div className="space-y-2">
                <Label htmlFor="player2">Giocatore 2</Label>
                <Input
                  id="player2"
                  value={config.player2Nickname}
                  onChange={(e) => setConfig(prev => ({ ...prev, player2Nickname: e.target.value }))}
                  maxLength={15}
                />
              </div>
            )}
          </div>

          {/* Paddle Colors */}
          {config.theme === 'custom' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Colore Racchetta 1</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setConfig(prev => ({ ...prev, player1Color: color }))}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                        config.player1Color === color ? "border-foreground scale-110" : "border-muted"
                      )}
                      style={{ backgroundColor: `hsl(${color})` }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Colore Racchetta 2</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setConfig(prev => ({ ...prev, player2Color: color }))}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                        config.player2Color === color ? "border-foreground scale-110" : "border-muted"
                      )}
                      style={{ backgroundColor: `hsl(${color})` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Win Score */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Punteggio per vincere</Label>
              <span className="text-sm font-medium">{config.winScore}</span>
            </div>
            <Slider
              value={[config.winScore]}
              onValueChange={([value]) => setConfig(prev => ({ ...prev, winScore: value }))}
              min={3}
              max={21}
              step={1}
            />
          </div>

          {/* Ball Speed */}
          <div className="space-y-3">
            <Label>Velocità Palla</Label>
            <div className="flex gap-2">
              {SPEED_OPTIONS.map((speed) => (
                <Button
                  key={speed.value}
                  variant={config.ballSpeed === speed.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConfig(prev => ({ ...prev, ballSpeed: speed.value }))}
                >
                  {speed.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Paddle Sensitivity */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Sensibilità Racchetta</Label>
              <span className="text-sm font-medium">
                {config.paddleSensitivity <= 0.2 ? 'Molto liscia' : config.paddleSensitivity <= 0.4 ? 'Liscia' : config.paddleSensitivity <= 0.6 ? 'Normale' : config.paddleSensitivity <= 0.8 ? 'Reattiva' : 'Istantanea'}
              </span>
            </div>
            <Slider
              value={[config.paddleSensitivity]}
              onValueChange={([value]) => setConfig(prev => ({ ...prev, paddleSensitivity: value }))}
              min={0.1}
              max={1.0}
              step={0.1}
            />
            <p className="text-xs text-muted-foreground">
              Più bassa = movimento più fluido e controllato
            </p>
          </div>

          {/* Controls Configuration */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Controlli
            </Label>
            
            {config.mode === 'single' && (
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label htmlFor="mouse" className="cursor-pointer text-sm">Controllo mouse</Label>
                  <p className="text-xs text-muted-foreground">Muovi la racchetta col mouse</p>
                </div>
                <Switch
                  id="mouse"
                  checked={config.mouseEnabled}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, mouseEnabled: checked }))}
                />
              </div>
            )}

            <div className="p-3 rounded-lg border space-y-2">
              <Label className="text-sm">{config.mode === 'single' ? 'Tasti movimento' : 'Giocatore 1'}</Label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Su:</span>
                  <KeyBindButton
                    currentKey={config.player1Keys.up}
                    onKeyChange={(key) => setConfig(prev => ({ ...prev, player1Keys: { ...prev.player1Keys, up: key } }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Giù:</span>
                  <KeyBindButton
                    currentKey={config.player1Keys.down}
                    onKeyChange={(key) => setConfig(prev => ({ ...prev, player1Keys: { ...prev.player1Keys, down: key } }))}
                  />
                </div>
              </div>
            </div>

            {config.mode === 'local' && (
              <div className="p-3 rounded-lg border space-y-2">
                <Label className="text-sm">Giocatore 2</Label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Su:</span>
                    <KeyBindButton
                      currentKey={config.player2Keys.up}
                      onKeyChange={(key) => setConfig(prev => ({ ...prev, player2Keys: { ...prev.player2Keys, up: key } }))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Giù:</span>
                    <KeyBindButton
                      currentKey={config.player2Keys.down}
                      onKeyChange={(key) => setConfig(prev => ({ ...prev, player2Keys: { ...prev.player2Keys, down: key } }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Power-ups Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-yellow-500" />
              <div>
                <Label htmlFor="powerups" className="cursor-pointer">Power-ups</Label>
                <p className="text-sm text-muted-foreground">
                  Oggetti speciali durante la partita
                </p>
              </div>
            </div>
            <Switch
              id="powerups"
              checked={config.powerUpsEnabled}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, powerUpsEnabled: checked }))}
            />
          </div>

          {/* Audio Settings */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Audio
            </Label>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-blue-500" />
                <div>
                  <Label htmlFor="sound" className="cursor-pointer">Effetti sonori</Label>
                  <p className="text-sm text-muted-foreground">
                    Colpi, punti e power-ups
                  </p>
                </div>
              </div>
              <Switch
                id="sound"
                checked={config.soundEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, soundEnabled: checked }))}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-purple-500" />
                <div>
                  <Label htmlFor="music" className="cursor-pointer">Musica di sottofondo</Label>
                  <p className="text-sm text-muted-foreground">
                    Melodia retro durante la partita
                  </p>
                </div>
              </div>
              <Switch
                id="music"
                checked={config.musicEnabled}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, musicEnabled: checked }))}
              />
            </div>
          </div>

          {/* Start Button */}
          <Button
            size="lg"
            className="w-full h-14 text-lg gap-2"
            onClick={handleStartGame}
          >
            <Play className="w-5 h-5" />
            {config.mode === 'online' ? 'Cerca Partita' : 'Inizia Partita'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
