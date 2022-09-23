interface GameBannerProps {
  box_art_url: string;
  name: string;
  adsCount: number;
}

export function GameBanner(props: GameBannerProps) {
  return (
      <a href="" className="relative rounded-lg overflow-hidden keen-slider__slide">
        <img src={props.box_art_url} alt="" className="h-72 w-full"/>
        <div className="w-full pt-16 pb-4 px-4 bg-game-gradient absolute bottom-0 left-0 right-0">
          <strong className="font-bold text-white block">{props.name}</strong>
          <span className="text-zinc-300 text-sm block mt-1">
            {props.adsCount} anúncio(s)
          </span>
        </div>
      </a>
  );
}
