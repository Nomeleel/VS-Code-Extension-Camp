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

    // Info
    let infoElement: HTMLDivElement = document.getElementById('info') as HTMLDivElement;
    
    function infoAppendChild(label: string, value: string) {
      let labelElement: HTMLDivElement = document.createElement('div');
      labelElement.innerText = `${label}:`;
      let spaceElement: HTMLDivElement = document.createElement('div');
      spaceElement.innerText = 'sp';
      spaceElement.setAttribute('class', 'space');
      let valueElement: HTMLSpanElement = document.createElement('span');
      valueElement.innerText = value;
      
      let entryElement: HTMLDivElement = document.createElement('div');
      entryElement.setAttribute('class', 'info-entry');
      entryElement.appendChild(labelElement);
      entryElement.appendChild(spaceElement);
      entryElement.appendChild(valueElement);

      infoElement.appendChild(entryElement);
    }

    infoAppendChild('Size', `${videoSize.width}  ×  ${videoSize.height}`);
    infoAppendChild('Frame', `${videoItem.frames}`);
    infoAppendChild('FPS', `${videoItem.FPS}`);
    infoAppendChild('Duration', `${videoItem.frames / videoItem.FPS} s`);
    infoAppendChild('Version', `${videoItem.version}`);

    // Image
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
      let itemPreview = document.getElementById('item-preview');
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

    let countElement: HTMLDivElement = document.getElementById('count') as HTMLDivElement;
    let numElement: HTMLSpanElement = document.createElement('span');
    numElement.innerText = `(${imageCount})`;
    countElement.appendChild(numElement);
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