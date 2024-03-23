/* eslint-disable react/jsx-key */
import fs from "fs";
import path from "path";
import { Button } from "frames.js/next";
import { createFrames } from "frames.js/next";
import { kv } from "@vercel/kv";

const frames = createFrames({
  basePath: "/frames",
});

const bitcell = fs.readFileSync(path.join(process.cwd(), "/public/bitcell_memesbruh03.ttf"));
const defaultFonts = [
  {
    name: "Bitcell",
    data: bitcell,
    weight: 400,
    style: "normal",
  },
];
const defaultAspectRatio = "1:1";
const defaultImageOptions = {
  aspectRatio: defaultAspectRatio,
  fonts: defaultFonts,
} as any;
const defaultHeaders = {
  "Cache-Control": "max-age=0",
};

const handleRequest = frames(async (ctx) => {
  const action = ctx.searchParams.action || "";
  let sessionKey = ctx.searchParams.sessionKey || "";
  if (!sessionKey && action == "start") {
    const newSessionKey = crypto.randomUUID();
    console.log("newSessionKey", newSessionKey);
    sessionKey = newSessionKey;
  }
  const index = Number(ctx.searchParams.index || 0);
  const inputText = ctx?.message?.inputText;

  if (action == "start" || action === "processAI") {
    fetch(new URL("/ai", process.env.NEXT_PUBLIC_HOST).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionKey, inputText }),
    });
  }

  let imageUrl = "";
  let responseText = "";
  if (action === "checkAI") {
    const sessionData: any = await kv.get(sessionKey);
    if (sessionData && sessionData.imageUrls && sessionData.imageUrls.length == index) {
      imageUrl = sessionData.imageUrls[index - 1];
      responseText = sessionData.messages[index * 2].content;
    }
  }

  if (action === "processVideo") {
    fetch(new URL("/api/video", process.env.NEXT_PUBLIC_HOST).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionKey }),
    });
  }

  let videoUrl = "";
  if (action === "checkVideo") {
    const sessionData: any = await kv.get(sessionKey);
    if (sessionData && sessionData.videoUrl) {
      videoUrl = sessionData.videoUrl;
    }
  }
  console.log("videoUrl", videoUrl);

  // const isEnded = false;

  if (ctx.message?.transactionId) {
    return {
      image: (
        <div style={{ fontFamily: "Bitcell" }} tw="bg-black text-white w-full h-full justify-center items-center flex">
          Transaction submitted! {ctx.message.transactionId}
        </div>
      ),
      imageOptions: defaultImageOptions,
      buttons: [
        <Button action="link" target={`https://www.onceupon.gg/tx/${ctx.message.transactionId}`}>
          View on block explorer
        </Button>,
      ],
    };
  }

  if (videoUrl) {
    return {
      image: (
        <div
          style={{ fontFamily: "Bitcell", fontSize: 20, backgroundImage: `url(${"http:/localhost:3000/image.png"})` }}
          tw={`flex bg-black text-white w-full h-full justify-center items-center`}
        >
          <div tw="flex p-2 bg-gray-800 bg-opacity-75 w-full justify-center items-center">Video created</div>
        </div>
      ),
      imageOptions: { ...defaultImageOptions, width: "256", height: "256" },
      buttons: [
        <Button action="post" target={{ query: { sessionKey, action: "mint", index } }}>
          Mint NFT
        </Button>,
      ],
      headers: defaultHeaders,
    };
  }

  if (action == "processVideo" || action == "checkVideo") {
    return {
      image: (
        <div
          style={{ fontFamily: "Bitcell", fontSize: 20, backgroundImage: `url(${"http:/localhost:3000/image.png"})` }}
          tw={`flex bg-black text-white w-full h-full justify-center items-center`}
        >
          <div tw="flex p-2 bg-gray-800 bg-opacity-75 w-full justify-center items-center">Processing...</div>
        </div>
      ),
      imageOptions: { ...defaultImageOptions, width: "256", height: "256" },
      buttons: [
        <Button action="post" target={{ query: { sessionKey, action: "checkVideo" } }}>
          Check status
        </Button>,
      ],
      headers: defaultHeaders,
    };
  }

  if (imageUrl && responseText) {
    return {
      image: (
        <div
          style={{ fontFamily: "Bitcell", fontSize: 24, backgroundImage: `url(${imageUrl})` }}
          tw="flex flex-col bg-black text-white w-full h-full"
        >
          <div tw="p-2 bg-gray-800 bg-opacity-75">{responseText}</div>
        </div>
      ),
      imageOptions: { ...defaultImageOptions, width: "256", height: "256" },
      textInput: "What do you do?",
      buttons: [
        <Button action="post" target={{ query: { sessionKey, action: "processVideo" } }}>
          End
        </Button>,
        <Button action="post" target={{ query: { sessionKey, action: "processAI", index: index + 1 } }}>
          Next
        </Button>,
      ],
      headers: defaultHeaders,
    };
  }

  if (action == "start" || action == "processAI" || action == "checkAI") {
    return {
      image: (
        <div
          style={{ fontFamily: "Bitcell", fontSize: 20, backgroundImage: `url(${"http:/localhost:3000/image.png"})` }}
          tw={`flex bg-black text-white w-full h-full justify-center items-center`}
        >
          <div tw="flex p-2 bg-gray-800 bg-opacity-75 w-full justify-center items-center">Processing...</div>
        </div>
      ),
      imageOptions: { ...defaultImageOptions, width: "256", height: "256" },
      buttons: [
        <Button action="post" target={{ query: { sessionKey, action: "checkAI", index } }}>
          Check status
        </Button>,
      ],
      headers: defaultHeaders,
    };
  }

  return {
    image: (
      <div
        style={{ fontFamily: "Bitcell", fontSize: 40, backgroundImage: `url(${"http:/localhost:3000/image.png"})` }}
        tw={`flex bg-black text-white w-full h-full justify-center items-center`}
      >
        <div tw="flex p-2 bg-gray-800 bg-opacity-75 w-full justify-center items-center">AI Quest</div>
      </div>
    ),
    imageOptions: { ...defaultImageOptions, width: "256", height: "256" },
    buttons: [
      <Button action="post" target={{ query: { action: "start", index: 1 } }}>
        Start
      </Button>,
    ],
    headers: defaultHeaders,
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
