import { Parser, Player, VideoEntity } from 'svga.lite';

let player: any;

async function load(svgaBuffer: ArrayBuffer) {
  let parser: Parser = new Parser();
  const svgaData = await parser.do(new Uint8Array(svgaBuffer));
  player = new Player('#canvas');
  await player.mount(svgaData);

  // let processElement : HTMLHRElement = document.getElementById('process') as HTMLHRElement;
  // player.$on('process', () => {
  //   processElement.innerText = `${player.currentFrame + 1} / ${player.totalFramesCount}`;
  // });

  let videoItem: VideoEntity = player.videoItem;
  if (videoItem) {
    let videoSize = videoItem.videoSize;
    let sizeElement: HTMLHRElement = document.getElementById('size') as HTMLHRElement;
    sizeElement.innerText += `    ${videoSize.width}  ×  ${videoSize.height}`;

    let gridElement = document.getElementById('grid');
    let imageCount = 0;
    for (const key in videoItem.images) {
      imageCount++;
      let item: HTMLDivElement = document.createElement('div');
      item.setAttribute('class', 'item');

      let itemImage: HTMLDivElement = document.createElement('div');
      itemImage.setAttribute('class', 'item-image');

      let image: HTMLImageElement = document.createElement('img') as HTMLImageElement;
      let base64 = videoItem.images[key];
      image.src = `data:image/png;base64,${base64}`;

      // Preview
      let itemPreview = document.getElementById('itemPreview');
      let previewImage: HTMLImageElement = document.createElement('img') as HTMLImageElement;
      previewImage.src = image.src;

      item.onmousemove = (event) => {
        if (!itemPreview.hasChildNodes()) {
          itemPreview.appendChild(previewImage);
        }
        const previewSize = 300;
        let left = event.pageX - previewSize / 2;
        let top = event.pageY - previewSize - 20;
        itemPreview.style.left = `${left}px`;
        itemPreview.style.top = `${top}px`;
        itemPreview.style.display = 'flex';
      };

      item.onmouseleave = (event) => {
        itemPreview.removeChild(previewImage);
        itemPreview.style.display = 'none';
      };

      itemImage.appendChild(image);

      let keyLabel = document.createElement('div');
      keyLabel.setAttribute('class', 'key-label');
      keyLabel.append(key);

      itemImage.appendChild(keyLabel);

      item.appendChild(itemImage);

      let sizeLabel = document.createElement('div');
      sizeLabel.append(`${image.naturalWidth} × ${image.naturalHeight} px`);
      item.appendChild(sizeLabel);

      let memsizeLabel = document.createElement('div');
      memsizeLabel.append(getMemsizeByBase64(base64));
      item.appendChild(memsizeLabel);

      gridElement.appendChild(item);
    }

    let countElement: HTMLHRElement = document.getElementById('count') as HTMLHRElement;
    countElement.innerText += '   ' + imageCount;
  }
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

// Util
let memUnitMap = new Map
  ([
    [1, 'B'],
    [2, 'kB'],
    [3, 'mB'],
  ]);

export function getMemsizeByBase64(base64: string): string {
  let length = base64.length / 4 * 3;

  function memsizeStr(pow: number): string {
    if (length < Math.pow(1000, pow)) {
      return `${(length / Math.pow(1000, pow - 1)).toFixed(pow - 1)} ${memUnitMap.get(pow)}`;
    } else {
      return memsizeStr(pow + 1);
    }
  }

  return memsizeStr(1);
}