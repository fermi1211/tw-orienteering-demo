export function articleImageProblem(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return '請使用 JPG、PNG 或 WebP 圖片。';
  if (file.size > 5 * 1024 * 1024) return '每張圖片上限為 5 MB，請縮小後再加入。';
  if (!file.size) return '圖片檔案為空，請重新選擇。';
  return '';
}
export async function readArticleImage(file) {
  const problem = articleImageProblem(file);
  if (problem) throw new Error(problem);
  const src = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('圖片無法讀取，請重新選擇。')); reader.readAsDataURL(file); });
  await new Promise((resolve, reject) => { const image = new Image(); image.onload = resolve; image.onerror = () => reject(new Error('圖片內容無法開啟，請選擇有效的圖片。')); image.src = src; });
  return src;
}
