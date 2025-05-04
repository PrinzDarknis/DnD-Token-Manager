import { Sound } from "../../../model";

import bauImg from "/icons/sound/bau.svg";
import foxImg from "/icons/sound/fox.svg";
import dogImg from "/icons/sound/dog.svg";
import screamImg from "/icons/sound/scream.svg";
import secretImg from "/icons/sound/secret.svg";
import giftImg from "/icons/sound/gift.svg";
import chokoboImg from "/icons/sound/chokobo.svg";
import exclamationImg from "/icons/sound/!.svg";
import gooseImg from "/icons/sound/goose.svg";
import victoryImg from "/icons/sound/victory.svg";
import cricketImg from "/icons/sound/cricket.svg";
import mortalKombatImg from "/icons/sound/mortal-kombat.svg";
import badDragonImg from "/icons/Bad_Dragon_logo.svg";

export const Sounds: Sound[] = [
  {
    name: "Bau Bau",
    img: bauImg,
    file: ["Fuwawa  Bau.mp3", "Mococo Bau.mp3"],
  },
  {
    name: "Fox",
    img: foxImg,
    file: "fox.mp3",
  },
  {
    name: "Dog",
    img: dogImg,
    file: "bark.mp3",
  },
  {
    name: "Scream",
    img: screamImg,
    file: "scream.mp3",
  },
  {
    name: "Secret",
    img: secretImg,
    file: "secret.mp3",
  },
  {
    name: "Got Item",
    img: giftImg,
    file: "got item.mp3",
  },
  {
    name: "Chokobo",
    img: chokoboImg,
    file: "chokobo.mp3",
  },
  {
    name: "!",
    img: exclamationImg,
    file: "!.mp3",
  },
  {
    name: "Honk",
    img: gooseImg,
    file: "honk.mp3",
  },
  {
    name: "Victory",
    img: victoryImg,
    file: "victory.mp3",
  },
  {
    name: "Cricket",
    img: cricketImg,
    file: "cricket.mp3",
  },
  {
    name: "Fatality",
    img: mortalKombatImg,
    file: "fatality.mp3",
  },
  {
    name: "Bad Dragon",
    img: badDragonImg,
    file: [
      "wet-slap.mp3",
      "wet-slap2.mp3",
      "wet-slap3.mp3",
      "wet-slap4.mp3",
      "wet-slap5.mp3",
    ],
  },
];
