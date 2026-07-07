import React, { useState } from "react";
import { Play, Pause, HelpCircle, Info } from "lucide-react";

export default function HeroVideo() {
  const [isPlaying, setIsPlaying] = useState(false);

  // Vídeo conceitual leve e bonito para ilustrar foco e organização (usando um vídeo público e livre de direitos autorais de natureza/foco)
  const videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-laptop-keyboard-close-up-43034-large.mp4";

  return (
    <div className="bg-card border border-border rounded-2xl p-6 soft-shadow flex flex-col lg:flex-row gap-6 items-center">
      {/* Informações da Esquerda */}
      <div className="flex-1 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
          <Info className="w-3.5 h-3.5" />
          Painel de Evolução Pessoal v6
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Como funciona a hierarquia cronológica?
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Para que grandes conquistas aconteçam, dividimos a jornada em três camadas simples. Assista ao vídeo explicativo ao lado ou leia as diretrizes abaixo para entender como o progresso é calculado automaticamente:
        </p>
        
        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Objetivos:</strong> Visões macro de longo prazo. O progresso deles é a média das suas metas internas.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Metas:</strong> Marcos tangíveis de médio prazo. O progresso delas depende diretamente da conclusão das submetas.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Submetas:</strong> Tarefas e prazos atômicos. Marcar uma submeta como concluída atualiza instantaneamente todo o dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Vídeo Conceitual da Direita */}
      <div className="w-full lg:w-[380px] shrink-0">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border border-border group soft-shadow">
          <video 
            src={videoUrl}
            loop
            muted
            playsInline
            id="hero-video-player"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Overlay de Gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent flex flex-col justify-end p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white/90 drop-shadow">
                {isPlaying ? "Vídeo: Foco e Produtividade" : "Clique para assistir ao conceito"}
              </span>
              
              <button
                onClick={() => {
                  const video = document.getElementById("hero-video-player") as HTMLVideoElement;
                  if (video) {
                    if (isPlaying) {
                      video.pause();
                    } else {
                      video.play();
                    }
                    setIsPlaying(!isPlaying);
                  }
                }}
                className="p-2.5 bg-white text-black hover:bg-primary hover:text-white rounded-full transition-all duration-300 shadow-lg hover:scale-110 active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
