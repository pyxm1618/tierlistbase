import type { StaticImageData } from "next/image";

import anby from "./assets/agents/anby.png";
import anton from "./assets/agents/anton.png";
import astra from "./assets/agents/astra.png";
import ben from "./assets/agents/ben.png";
import billy from "./assets/agents/billy.png";
import burnice from "./assets/agents/burnice.png";
import caesar from "./assets/agents/caesar.png";
import corin from "./assets/agents/corin.png";
import evelyn from "./assets/agents/evelyn.png";
import harumasa from "./assets/agents/harumasa.png";
import jane from "./assets/agents/jane.png";
import lighter from "./assets/agents/lighter.png";
import lucy from "./assets/agents/lucy.png";
import miyabi from "./assets/agents/miyabi.png";
import nekomata from "./assets/agents/nekomata.png";
import nicole from "./assets/agents/nicole.png";
import piper from "./assets/agents/piper.png";
import qingyi from "./assets/agents/qingyi.png";
import rina from "./assets/agents/rina.png";
import seth from "./assets/agents/seth.png";
import soukaku from "./assets/agents/soukaku.png";
import yanagi from "./assets/agents/yanagi.png";
import zhuYuan from "./assets/agents/zhu-yuan.png";
import butlerboo from "./assets/bangboo/butlerboo.png";
import cryboo from "./assets/bangboo/cryboo.png";
import electroboo from "./assets/bangboo/electroboo.png";
import plugboo from "./assets/bangboo/plugboo.png";
import rocketboo from "./assets/bangboo/rocketboo.png";
import sharkboo from "./assets/bangboo/sharkboo.png";

export const agentIcons: Readonly<Record<string, StaticImageData>> = {
  "alexandrina-sebastiane": rina,
  "anby-demara": anby,
  "anton-ivanov": anton,
  "asaba-harumasa": harumasa,
  "astra-yao": astra,
  "ben-bigger": ben,
  "billy-kid": billy,
  "burnice-white": burnice,
  "caesar-king": caesar,
  "corin-wickes": corin,
  "evelyn-chevalier": evelyn,
  "hoshimi-miyabi": miyabi,
  "jane-doe": jane,
  lighter,
  lucy,
  nekomata,
  "nicole-demara": nicole,
  "piper-wheel": piper,
  qingyi,
  "seth-lowell": seth,
  soukaku,
  "tsukishiro-yanagi": yanagi,
  "zhu-yuan": zhuYuan,
};

export const bangbooIcons: Readonly<Record<string, StaticImageData>> = {
  Sharkboo: sharkboo,
  Butlerboo: butlerboo,
  Rocketboo: rocketboo,
  Cryboo: cryboo,
  Plugboo: plugboo,
  Electroboo: electroboo,
  Butler: butlerboo,
};
