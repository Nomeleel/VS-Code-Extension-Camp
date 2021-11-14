import { Parser, Player } from 'svga.lite';

let player: any;

async function load(svgaBuffer: ArrayBuffer) {
  let parser: Parser = new Parser();
  const svgaData = await parser.do(new Uint8Array(svgaBuffer));
  player = new Player('#canvas');
  await player.mount(svgaData);

  let videoItem = player.videoItem;
  if (videoItem) {
    let videoSize = videoItem.videoSize;
    let sizeElement : HTMLHRElement = document.getElementById('size') as HTMLHRElement;
    sizeElement.innerText += `    ${videoSize.width}  ×  ${videoSize.height}`;

    let frameElement : HTMLHRElement = document.getElementById('frame') as HTMLHRElement;
    frameElement.innerText += '   ' + videoItem.frames;

    let gridElement = document.getElementById('grid');
    for (const key in videoItem.images) {
      let item = document.createElement('div');
      item.setAttribute('class', 'item');
      let image: HTMLImageElement = document.createElement('img') as HTMLImageElement;
      image.src = `data:image/png;base64,${videoItem.images[key]}`;
      item.appendChild(image);
      
      let label = document.createElement('div');
      label.setAttribute('class', 'item-label');
      label.append(key);
      
      item.appendChild(label);
      gridElement.appendChild(item);
    }
  }
  console.log(player);
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