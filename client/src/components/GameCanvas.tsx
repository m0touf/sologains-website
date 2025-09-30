import { useEffect, useRef } from "react";
import Phaser from "phaser";

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();

    if (gameRef.current) {
      gameRef.current.destroy(true);
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: width,
      height: height,
      parent: container,
      backgroundColor: "#0f172a",
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: {
        preload: function () {
          // Create a simple colored rectangle as hero sprite
          this.load.image("hero", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");
        },
        create: function () {
          // Create hero sprite with enhanced styling
          const hero = this.add.sprite(width / 2, height / 2, "hero");
          hero.setDisplaySize(100, 100);
          hero.setTint(0x10b981); // emerald color
          
          // Add physics body
          this.physics.add.existing(hero);
          
          // Enhanced floating animation with rotation
          this.tweens.add({
            targets: hero,
            y: height / 2 - 20,
            rotation: 0.1,
            scaleX: 1.1,
            scaleY: 1.1,
            yoyo: true,
            duration: 1200,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });

          // Add pulsing glow effect
          this.tweens.add({
            targets: hero,
            alpha: 0.8,
            yoyo: true,
            duration: 2000,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });

          // Enhanced particle system with multiple layers
          const particles1 = this.add.particles(0, 0, 'hero', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            scale: { start: 0.2, end: 0 },
            alpha: { start: 0.4, end: 0 },
            tint: 0x06b6d4, // cyan color
            lifespan: 4000,
            frequency: 80,
            speed: { min: 20, max: 50 }
          });

          const particles2 = this.add.particles(0, 0, 'hero', {
            x: { min: 0, max: width },
            y: { min: 0, max: height },
            scale: { start: 0.15, end: 0 },
            alpha: { start: 0.3, end: 0 },
            tint: 0x10b981, // emerald color
            lifespan: 3000,
            frequency: 120,
            speed: { min: 10, max: 30 }
          });

          // Add floating orbs around the hero
          for (let i = 0; i < 6; i++) {
            const orb = this.add.sprite(width / 2, height / 2, "hero");
            orb.setDisplaySize(20, 20);
            orb.setTint(i % 2 === 0 ? 0x06b6d4 : 0x10b981);
            orb.setAlpha(0.6);
            
            const angle = (i / 6) * Math.PI * 2;
            const radius = 120;
            
            this.tweens.add({
              targets: orb,
              x: width / 2 + Math.cos(angle) * radius,
              y: height / 2 + Math.sin(angle) * radius,
              duration: 3000 + (i * 200),
              repeat: -1,
              ease: 'Linear'
            });
            
            // Rotate orbs around hero
            this.tweens.add({
              targets: orb,
              rotation: Math.PI * 2,
              duration: 8000 + (i * 500),
              repeat: -1,
              ease: 'Linear'
            });
          }

        }
      }
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 relative"
    />
  );
}
