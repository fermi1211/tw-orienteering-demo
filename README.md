# 台灣定向 Angular Demo

[線上預覽](https://fermi1211.github.io/tw-orienteering-demo/)

更新（2026-10-28）：全面改為 Angular 22.2.3，採森林綠／定向橘視覺。保留賽事列表與日曆、單人／多人報名、會員、管理後台、專欄、歷史賽事、回饋與儲值金示範。

本次同步條款範本編輯／預覽與閱讀到底後自行同意、每場組別及費用新增／編輯／停用／恢復、文章預覽 Dialog、會員資料格式檢查與報名訂單收合等更新。

這是獨立前端原型，所有資料只保留於目前分頁，重新整理重設。請使用虛構資料；沒有真實登入、永久資料庫、收款或寄信。取消／儲值金只是互動示範。

## 本機執行

Node.js 需符合 package.json engines（目前使用 26.4）：

```sh
npm ci
npm run dev
```

## 建置與驗證

```sh
npm run build
npm test
```

Angular AOT 輸出在 `dist/client`，`baseHref` 設為 `./`，支援 GitHub Pages 儲存庫子路徑。其他 dist 封裝檔供既有 Sites 相容使用。

## 發布

Settings → Pages 的 Source 使用 GitHub Actions。推送 main 後自動安裝相依套件、建置、測試並發布 `dist/client`。工作流程使用 Node.js 26。

地圖來源 OpenStreetMap，字型 Noto，圖示 Phosphor；授權依各套件規定。
