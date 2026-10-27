// In-tab demo media settings; no server persistence.
export const mediaPolicy={maxImages:30,maxBytes:10*1024*1024};
export function setImageLimit(value){const n=Number(value);if(!Number.isInteger(n)||n<1||n>100)throw new Error('圖片張數上限請填 1 至 100 的整數。');mediaPolicy.maxImages=n;}
