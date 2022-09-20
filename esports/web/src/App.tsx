import "./styles/main.css";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import axios from "axios";
import { useKeenSlider } from "keen-slider/react";

import { GameBanner } from "./components/GameBanner";
import { CreateAdBunner } from "./components/CreateAdBunner";
import { CreateAdModal } from "./components/CreateAdModal";

import "keen-slider/keen-slider.min.css";

import logoImg from "./assets/logo-nlw-esports.svg";

interface Game {
  id: string;
  title: string;
  bannerUrl: string;
  _count: {
    ads: number;
  };
}

function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>();

  useEffect(() => {
    slider.current?.update({
      mode: "free-snap",
      slides: {
        origin: 0,
        perView: 5,
      },
    });
  }, [games]);

  useEffect(() => {
    axios("http://localhost:3333/games").then((response) => {
      setGames(response.data);
    });
  }, []);

  return (
    <div className="max-w-[1344px] mx-auto flex flex-col items-center my-20">
      <img src={logoImg} alt="" />

      <h1 className="text-6xl text-white font-black mt-20">
        Seu{" "}
        <span className="text-transparent bg-nlw-gradient bg-clip-text">
          duo
        </span>{" "}
        está aqui.
      </h1>

      <div ref={sliderRef} className="keen-slider grid grid-cols-6 gap-6 mt-16">
        {games.map((game) => {
          return (
            <GameBanner
              key={game.id}
              bannerUrl={game.bannerUrl}
              title={game.title}
              adsCount={game._count.ads}
            />
          );
        })}
      </div>

      <Dialog.Root>
        <CreateAdBunner />

        <CreateAdModal />
      </Dialog.Root>
    </div>
  );
}

export default App;
