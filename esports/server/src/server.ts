import express from "express";
import axios from "axios";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { convertHourStringToMinutes } from "./utils/convert-hour-string-to-minutes";
import { convertMinutesToHourString } from "./utils/convert-minutes-to-hour-string";

const TWITCH_CLIENT_ID = "w689bjkxt1yzsdvuqwl5x1sfw7ox98";
const TWITCH_SECRET = "rs6nmd3rtfzo1jpduwcnhtcykz9vsy";

const app = express();

app.use(express.json());
app.use(cors());

interface Game {
  id: string;
  name: string;
  box_art_url: string;
  adsCount: number;
}

const prisma = new PrismaClient();

app.get("/games", async (request, response) => {
  let token: string = "";
  let games: Game[] = [];

  await axios
    .post("https://id.twitch.tv/oauth2/token", {
      client_id: TWITCH_CLIENT_ID,
      client_secret: TWITCH_SECRET,
      grant_type: "client_credentials",
    })
    .then((resp) => {
      token = resp.data.access_token;
    });

  await axios
    .get("https://api.twitch.tv/helix/games/top", {
      headers: {
        "Client-Id": TWITCH_CLIENT_ID,
        Authorization: "Bearer " + token,
      },
    })
    .then((resp) => {
      games = resp.data.data;
      games.map((game) => {
        game.box_art_url = game.box_art_url.replace("{height}", "380");
        game.box_art_url = game.box_art_url.replace("{width}", "285");
        return game;
      });
    });

  const ads = await prisma.ad.groupBy({
    by: ["gameId"],
    _count: {
      gameId: true,
    },
  });

  games.map((game) => {
    game.adsCount = 0
    ads.forEach((ad) => {
      if (ad.gameId == game.id) game.adsCount = ad._count.gameId;
    });
    return game;
  });

  return response.json(games);
});

/*app.get("/games", async (request, response) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });

  return response.json(games);
});
*/

app.post("/games/:id/ads", async (request, response) => {
  const gameId = request.params.id;
  const body: any = request.body;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      yearsPlaying: body.yearsPlaying,
      discord: body.discord,
      weekDays: body.weekDays.join(","),
      hourStart: convertHourStringToMinutes(body.hourStart),
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel,
    },
  });

  return response.status(201).json(ad);
});

app.get("/games/:id/ads", async (request, response) => {
  const gameId = request.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
    },
    where: {
      gameId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return response.json(
    ads.map((ad) => {
      {
        return {
          ...ad,
          weekDays: ad.weekDays.split(","),
          hourStart: convertMinutesToHourString(ad.hourStart),
          hourEnd: convertMinutesToHourString(ad.hourEnd),
        };
      }
    })
  );
});

app.get("/ads/:id/discord", async (request, response) => {
  const adId = request.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adId,
    },
  });

  return response.json({
    discord: ad.discord,
  });
});

app.listen(3333);
