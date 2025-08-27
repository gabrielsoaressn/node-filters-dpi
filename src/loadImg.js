import { Jimp } from "jimp";

async function loadImg(imgSource) {
    const img = await Jimp.read(imgSource);
    return img;
}
export { loadImg };