import { Parser, Player } from 'svga.lite';

let player: Player;

async function load(svgaBuffer: ArrayBuffer) {
  let parser: Parser = new Parser();
  const svgaData = await parser.do(new Uint8Array(svgaBuffer));
  player = new Player('#canvas');
  await player.mount(svgaData);
}

window.addEventListener('message', async e => {
  const { type, args } = e.data;
  switch (type) {
    case 'load':
      {
        await load(args.data);
        player.start();
        break;
      }
  }
});

// @ts-ignore
const vscode = acquireVsCodeApi();
vscode.postMessage({ type: 'ready' });