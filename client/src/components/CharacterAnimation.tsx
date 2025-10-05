import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

interface CharacterAnimationProps {
  width?: number;
  height?: number;
  className?: string;
  frameWidth?: number;
  frameHeight?: number;
  frameCount?: number;
  frameRate?: number;
  debug?: boolean;
  startFrame?: number;
  onEmote?: () => void;
}

export default function CharacterAnimation({ 
  width = 160, 
  height = 160, 
  className = '',
  frameWidth = 32,
  frameHeight = 32,
  frameCount = 8,
  frameRate = 6,
  debug = false,
  startFrame = 0,
  onEmote
}: CharacterAnimationProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Phaser game configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: width,
      height: height,
      parent: containerRef.current,
      backgroundColor: '#fef3c7', // Light amber background to match theme
      scene: {
        preload: function() {
          // Load the idle sprite sheet (128x256 with 32x32 frames = 4x8 grid)
          // Try different frame configurations to fix alignment
          this.load.spritesheet('idle', '/spritesheets/idle.png', {
            frameWidth: frameWidth,
            frameHeight: frameHeight,
            spacing: 0, // No spacing between frames
            margin: 0   // No margin around the sheet
          });
          
          // Load the emote sprite sheet (192x256 with 64x64 frames = 3x4 grid)
          this.load.spritesheet('emote', '/spritesheets/emote.png', {
            frameWidth: frameWidth,
            frameHeight: frameHeight,
            spacing: 0,
            margin: 0
          });
          
          // Load the walk sprite sheet (576x256 with 64x64 frames = 9x4 grid)
          this.load.spritesheet('walk', '/spritesheets/walk.png', {
            frameWidth: frameWidth,
            frameHeight: frameHeight,
            spacing: 0,
            margin: 0
          });
          
          // Add error handling
          this.load.on('loaderror', (file: any) => {
            console.error('Failed to load sprite sheet:', file.key);
          });
        },
        create: function() {
          console.log('Creating character animation with:', { frameWidth, frameHeight, frameCount, frameRate });
          
          // Determine which sprite sheet to use based on startFrame
          let spriteKey = 'idle';
          if (startFrame >= 18) {
            spriteKey = 'walk';
          } else if (startFrame >= 6) {
            spriteKey = 'emote';
          }
          
          // Check if the texture loaded successfully
          if (!this.textures.exists(spriteKey)) {
            console.error(`${spriteKey} texture not found!`);
            // Create a fallback colored rectangle
            this.add.rectangle(width / 2, height / 2, 32, 32, 0xff0000);
            this.add.text(width / 2, height / 2 + 20, 'Sprite Error', { 
              fontSize: '12px', 
              color: '#000000' 
            }).setOrigin(0.5);
            return;
          }
          
          // Create the character sprite
          const character = this.add.sprite(width / 2, height / 2, spriteKey);
          
          // Scale the character to fit the container
          const scale = Math.min(width / frameWidth, height / frameHeight) * 0.9; // 0.7 for better centering
          character.setScale(scale);
          
          // Center the character more precisely
          character.setOrigin(0.5, 0.58);
          
          console.log('Character scale:', scale);
          console.log('Texture info:', this.textures.get(spriteKey));
          
          // Debug mode: Show individual frames or play animation
          if (debug) {
            // Show frame 0 to check alignment
            character.setFrame(0);
            console.log('Debug mode: Showing frame 0 only');
            
            // Add frame counter and controls for debugging
            this.add.text(10, 10, 'Frame: 0', { 
              fontSize: '12px', 
              color: '#000000' 
            });
            
            // Add instructions
            this.add.text(10, 30, 'Press 1-8 to test frames', { 
              fontSize: '10px', 
              color: '#000000' 
            });
            
            // Add current frame size info
            this.add.text(10, 50, `Frame: ${frameWidth}x${frameHeight}`, { 
              fontSize: '10px', 
              color: '#000000' 
            });
            
            // Add keyboard controls to test different frames
            this.input.keyboard?.on('keydown', (event: any) => {
              const key = event.key;
              if (key >= '1' && key <= '8') {
                const frameNum = parseInt(key) - 1;
                character.setFrame(frameNum);
                console.log(`Switched to frame ${frameNum}`);
              }
            });
          } else {
            // Create animation with custom start frame
            const animationKey = spriteKey;
            this.anims.create({
              key: animationKey,
              frames: this.anims.generateFrameNumbers(spriteKey, { start: startFrame, end: startFrame + frameCount - 1 }),
              frameRate: frameRate,
              repeat: -1 // Loop forever
            });
            
            // Create emote animation (third row = frames 6-8 for 3x4 grid)
            this.anims.create({
              key: 'emote',
              frames: this.anims.generateFrameNumbers('emote', { start: 6, end: 8 }),
              frameRate: 4,
              repeat: 0 // Play once
            });
            
            console.log('Animation created, playing...');
            
            // Play the animation
            character.play(animationKey);
            
            // Add click handler for emote (only if not already playing emote)
            if (spriteKey !== 'emote') {
              character.setInteractive();
              character.on('pointerdown', () => {
                console.log('Character clicked, playing emote...');
                character.play('emote');
                
                // Return to original animation after emote completes
                character.once('animationcomplete', () => {
                  console.log('Emote complete, returning to original animation...');
                  character.play(animationKey);
                });
                
                // Call the onEmote callback if provided
                if (onEmote) {
                  onEmote();
                }
              });
            }
          }
          
          // Debug: Log animation info
          character.on('animationcomplete', () => {
            console.log('Animation cycle complete');
          });
        }
      }
    };

    // Create the Phaser game
    gameRef.current = new Phaser.Game(config);

    // Cleanup function
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [width, height, frameWidth, frameHeight, frameCount, frameRate, debug, startFrame, onEmote]);

  return (
    <div 
      ref={containerRef} 
      className={`character-animation ${className}`}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
}
