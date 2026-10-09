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
import whipImg from "/icons/sound/whip.svg";
import wineImg from "/icons/sound/wine.svg";
import courtImg from "/icons/sound/court.svg";
import badDragonImg from "/icons/Bad_Dragon_logo.svg";
import dragonImg from "/icons/dragon1.svg";
import primoImg from "/icons/sound/primo.svg";
import fireballImg from "/icons/sound/fireball.svg";
import crabImg from "/icons/sound/crab.svg";
import chairImg from "/icons/sound/chair.svg";
// import foxTailImg from "/icons/fox-tail.svg";

// `volume` levels the files to roughly the same loudness (EBU R128 max
// momentary loudness, target about -18 LUFS; see harness/project/overview.md).
// Short transients with peaks near 0 dBFS stay at 1.
export const Sounds: Sound[] = [
  {
    name: "Bau Bau",
    img: bauImg,
    file: ["Fuwawa  Bau.mp3", "Mococo Bau.mp3"],
    volume: 1.7,
  },
  {
    name: "Fox",
    img: foxImg,
    file: "fox.mp3",
    volume: 1.5,
  },
  {
    name: "Dog",
    img: dogImg,
    file: "bark.mp3",
    volume: 1,
  },
  {
    name: "Scream",
    img: screamImg,
    file: "scream.mp3",
    volume: 0.25,
  },
  {
    name: "Secret",
    img: secretImg,
    file: "secret.mp3",
    volume: 0.4,
  },
  {
    name: "Got Item",
    img: giftImg,
    file: "got item.mp3",
    volume: 0.8,
  },
  {
    name: "Chokobo",
    img: chokoboImg,
    file: "chokobo.mp3",
    volume: 1,
  },
  {
    name: "!",
    img: exclamationImg,
    file: "!.mp3",
    volume: 1,
  },
  {
    name: "Honk",
    img: gooseImg,
    file: "honk.mp3",
    volume: 1,
  },
  {
    name: "Victory",
    img: victoryImg,
    file: "victory.mp3",
    volume: 0.4,
  },
  {
    name: "Cricket",
    img: cricketImg,
    file: "cricket.mp3",
    volume: 0.8,
  },
  {
    name: "Fatality",
    img: mortalKombatImg,
    file: "fatality.mp3",
    volume: 0.5,
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
    volume: 1,
  },
  {
    name: "Dragon",
    img: dragonImg,
    file: "dragon.mp3",
    volume: 0.3,
  },
  {
    name: "Whip",
    img: whipImg,
    file: "whip.mp3",
    volume: 0.4,
  },
  {
    name: "Osmanthus Wine",
    img: wineImg,
    file: "Osmanthus Wine.mp3",
    volume: 0.4,
  },
  {
    name: "Oratrice Mecanique D'Analyse Cardinale ",
    img: courtImg,
    file: [
      "Oratrice Mecanique D'Analyse Cardinale 1.mp3",
      "Oratrice Mecanique D'Analyse Cardinale 2.mp3",
      "Oratrice Mecanique D'Analyse Cardinale 3.mp3",
    ],
    volume: 1.2,
  },
  {
    name: "Paimon",
    img: primoImg,
    file: "paimon.mp3",
    volume: 0.8,
  },
  {
    name: "Fireball",
    img: fireballImg,
    file: "fireball.mp3",
    volume: 0.5,
  },
  {
    name: "Crab Dance",
    img: crabImg,
    file: "crab-dance.mp3",
    volume: 0.2,
  },
  {
    name: "Plastic Chair",
    img: chairImg,
    file: "plastic_chair.mp3",
    volume: 0.2,
  },
];
