import { hsvToRgb, rgbToHsv } from "./hsv";

const rgbFromHexString = (hex) => {
 const hexClean = hex.replace("#", "");
 return {
  r: parseInt(hexClean.substring(0, 2), 16),
  g: parseInt(hexClean.substring(2, 4), 16),
  b: parseInt(hexClean.substring(4, 6), 16),
 };
};

const rgbToHexString = (rgb) => {
 const toHex = (value) =>
  Math.round(value).toString(16).padStart(2, "0");
 return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
};

export function updateColorPalette(rootColor) {
 const rootRgb = rgbFromHexString(rootColor);
 const rootHsv = rgbToHsv(rootRgb.r, rootRgb.g, rootRgb.b);

 document.documentElement.style.setProperty(
  "--accent",
  rootColor
 );
 document.documentElement.style.setProperty(
  "--accent-secondary",
  rgbToHexString(hsvToRgb(rootHsv[0], 0.271, 0.419))
 );
 document.documentElement.style.setProperty(
  "--accent-tertiary",
  rgbToHexString(hsvToRgb(rootHsv[0], 0.2258, 0.2431))
 );
 document.documentElement.style.setProperty(
  "--primary-text",
  rgbToHexString(hsvToRgb(rootHsv[0], 0.0474, 0.9098))
 );
 document.documentElement.style.setProperty(
  "--secondary-text",
  rgbToHexString(hsvToRgb(rootHsv[0], 0.0634, 0.5565))
 );
 document.documentElement.style.setProperty(
  "--tertiary-text",
  rgbToHexString(hsvToRgb(rootHsv[0], 0.1406, 0.251))
 );
 document.documentElement.style.setProperty(
  "--fouriary-text",
  rgbToHexString(hsvToRgb(rootHsv[0], 0.1406, 0.251))
 );
 document.documentElement.style.setProperty(
  "--primary-background",
  rgbToHexString(hsvToRgb(rootHsv[0], 0, 0.1804))
 );
 document.documentElement.style.setProperty(
  "--secondary-background",
  rgbToHexString(hsvToRgb(rootHsv[0], 0, 0.1569))
 );
}
