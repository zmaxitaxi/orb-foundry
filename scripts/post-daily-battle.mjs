#!/usr/bin/env node
import { exportRandomBattle } from "./export-random-battle.mjs";
import { transcodeBattleVideo } from "./transcode-battle-video.mjs";
import { uploadBattleVideo } from "./upload-battle-video.mjs";
import { postInstagram } from "./post-instagram.mjs";

export async function postDailyBattle() {
  const exportResult = await exportRandomBattle();
  const transcode = await transcodeBattleVideo(exportResult.metadataPath);
  const upload = await uploadBattleVideo(exportResult.metadataPath);
  const instagram = await postInstagram(exportResult.metadataPath);
  return { export: exportResult, transcode, upload, instagram };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  postDailyBattle()
    .then((result) => {
      console.log(JSON.stringify({
        webmPath: result.export.sourceWebmPath || result.export.videoPath,
        mp4Path: result.transcode.mp4Path,
        publicVideoUrl: result.upload.publicVideoUrl,
        metadataPath: result.export.metadataPath,
        caption: result.export.caption,
        instagram: result.instagram,
      }, null, 2));
    })
    .catch((error) => {
      console.error(error.stack || error.message);
      process.exit(1);
    });
}
