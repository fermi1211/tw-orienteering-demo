import { entryColumns } from './event-export-model.js';

const WIDTH=1600, MARGIN=64, TOP=230, BOTTOM=2110;
const themes={blue:['#429bb4','#cfdee7','#edf3f7'],green:['#cbdcc8','#f1f4ec','#fafbf7'],orange:['#f2c09e','#fff0e3','#fffaf5']};
const font=(ctx,size,weight=400)=>{ctx.font=`${weight} ${size}px "Noto Sans TC", sans-serif`;};
function wrap(ctx,value,width){
  const text=String(value??'');
  const characters=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('zh-Hant',{granularity:'grapheme'}).segment(text)].map(part=>part.segment):Array.from(text);
  const lines=[];let line='';
  for(const char of characters){if(char==='\n'){lines.push(line);line='';continue;}if(line&&ctx.measureText(line+char).width>width){lines.push(line);line=char;}else line+=char;}
  return [...lines,line];
}
function drawText(ctx,text,x,y,width,size=28,weight=400,align='left'){
  font(ctx,size,weight);ctx.textAlign=align;ctx.textBaseline='middle';
  const lines=wrap(ctx,text,width-28), lineHeight=size*1.4;
  lines.forEach((line,index)=>ctx.fillText(line,align==='center'?x+width/2:x+14,y+(index-(lines.length-1)/2)*lineHeight));
}
function headerCells(columns){
  const cells=[];columns.forEach(column=>{const last=cells[cells.length-1];if(last?.label===column.label&&column.merge)last.span++;else cells.push({label:column.label,span:1});});return cells;
}
export function reportTables(kind,event,rows,settings){
  if(kind==='entry'){
    const columns=entryColumns(event,rows,Math.max(5,Math.min(25,Math.floor(Number(settings.rowsPerColumn)||13))));
    return Array.from({length:Math.ceil(columns.length/7)},(_,index)=>{const part=columns.slice(index*7,index*7+7);return {title:'',theme:'green',columns:part.map(column=>({label:column.label,weight:1,merge:true})),rows:Array.from({length:Math.max(1,...part.map(column=>column.cells.length))},(_,row)=>part.map(column=>column.cells[row]||''))};});
  }
  return settings.sections.filter(section=>section.entries.length).flatMap(section=>{
    const parallel=Math.max(1,Math.min(4,Math.floor(Number(section.parallel)||1))), perColumn=Math.max(5,Math.min(25,Math.floor(Number(section.rowsPerColumn)||13)));
    if(parallel>1){
      const waves=[];
      section.entries.forEach(entry=>{const last=waves[waves.length-1];if(last&&last[0]===entry.time&&last.length<=parallel)last.push(entry.name);else waves.push([entry.time,entry.name]);});
      return [{title:section.title,theme:section.theme,columns:[{label:'出發時間',weight:0.75},...Array.from({length:parallel},()=>({label:'姓名',weight:1.3}))],rows:waves.map(wave=>[...wave,...Array(parallel+1-wave.length).fill('')])}];
    }
    const chunks=Array.from({length:Math.ceil(section.entries.length/perColumn)},(_,i)=>section.entries.slice(i*perColumn,(i+1)*perColumn));
    return Array.from({length:Math.ceil(chunks.length/3)},(_,i)=>{const part=chunks.slice(i*3,i*3+3);return {title:section.title,theme:section.theme,columns:part.flatMap(()=>[{label:'出發時間',weight:0.75},{label:'姓名',weight:1.3}]),rows:Array.from({length:Math.max(...part.map(chunk=>chunk.length))},(_,r)=>part.flatMap(chunk=>chunk[r]?[chunk[r].time,chunk[r].name]:['','']))};});
  });
}
export async function renderRosterImages(kind,event,rows,settings){
  const text=[event.name,settings.title,...rows.map(row=>row.displayNameOverride||row.nickname||row.name||''),...(settings.sections||[]).flatMap(section=>[section.title,...section.entries.map(entry=>entry.name)])].join('');
  await Promise.all([document.fonts.load('400 28px "Noto Sans TC"',text),document.fonts.load('700 36px "Noto Sans TC"',text),document.fonts.load('700 52px "Noto Serif TC"',text)]);
  const measure=document.createElement('canvas').getContext('2d');font(measure,28);
  const layouts=[];let page={blocks:[],y:TOP};
  function nextPage(){if(page.blocks.length)layouts.push(page);page={blocks:[],y:TOP};}
  for(const table of reportTables(kind,event,rows,settings)){
    const sum=table.columns.reduce((n,column)=>n+column.weight,0), widths=table.columns.map(column=>(WIDTH-MARGIN*2)*column.weight/sum);
    font(measure,32,700);
    const titleHeight=table.title?Math.max(66,wrap(measure,table.title,WIDTH-MARGIN*2-28).length*45+24):0;
    font(measure,30,700);let headerIndex=0;
    const headerHeight=Math.max(64,...headerCells(table.columns).map(cell=>{const width=widths.slice(headerIndex,headerIndex+cell.span).reduce((n,w)=>n+w,0);headerIndex+=cell.span;return wrap(measure,cell.label,width-28).length*42+20;}));
    font(measure,28);
    const heights=table.rows.map(row=>Math.max(68,...row.map((cell,index)=>wrap(measure,cell,widths[index]-28).length*40+22)));
    let offset=0;
    while(offset<table.rows.length){
      if(page.y+titleHeight+headerHeight+heights[offset]>BOTTOM)nextPage();
      let height=titleHeight+headerHeight,end=offset;
      while(end<table.rows.length&&page.y+height+heights[end]<=BOTTOM){height+=heights[end];end++;}
      if(end===offset)throw new Error('單列內容過長，請縮短名稱或分區標題後再匯出。');
      page.blocks.push({...table,y:page.y,widths,titleHeight,headerHeight,rows:table.rows.slice(offset,end),heights:heights.slice(offset,end)});page.y+=height+38;offset=end;
      if(offset<table.rows.length)nextPage();
    }
  }
  nextPage();
  return Promise.all(layouts.map(async (layout,pageIndex)=>{
    const canvas=document.createElement('canvas');canvas.width=WIDTH;canvas.height=Math.max(620,Math.ceil(layout.y+80));
    const ctx=canvas.getContext('2d');ctx.fillStyle='#f8f7f2';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#194f3c';drawText(ctx,'TAIWAN ORIENTEERING',MARGIN-14,42,920,22,700);
    const date=event.starts?.slice(0,10)||'';const weekday=date?'日一二三四五六'[new Date(`${date}T12:00:00+08:00`).getUTCDay()]:'';
    ctx.textAlign='right';font(ctx,26,500);ctx.fillText(date?`${date.replaceAll('-','.')}（${weekday}）`:'',WIDTH-MARGIN,43);font(ctx,23);ctx.fillText(event.location||'',WIDTH-MARGIN,80);
    const title=settings.title==='Startlist'?`${event.name} 出發序`:settings.title==='Entry List'?`${event.name} 組別名單`:settings.title;
    let titleSize=52;ctx.font=`700 ${titleSize}px "Noto Serif TC",serif`;while(titleSize>32&&ctx.measureText(title).width>WIDTH-MARGIN*2){titleSize-=2;ctx.font=`700 ${titleSize}px "Noto Serif TC",serif`;}
    ctx.fillStyle='#102722';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(title,MARGIN,137);
    ctx.strokeStyle='#819688';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(MARGIN,186);ctx.lineTo(WIDTH-MARGIN,186);ctx.stroke();
    ctx.fillStyle='#65766b';drawText(ctx,`${rows.length} 筆有效報名`,MARGIN-14,209,WIDTH-MARGIN*2,18);
    for(const block of layout.blocks){
      const palette=themes[block.theme]||themes.green;let y=block.y;
      if(block.title){ctx.fillStyle=palette[1];ctx.fillRect(MARGIN,y,WIDTH-MARGIN*2,block.titleHeight-10);ctx.fillStyle='#183f2a';drawText(ctx,block.title,MARGIN,y+(block.titleHeight-10)/2,WIDTH-MARGIN*2,32,700);y+=block.titleHeight;}
      let x=MARGIN, columnIndex=0;
      for(const cell of headerCells(block.columns)){const width=block.widths.slice(columnIndex,columnIndex+cell.span).reduce((n,w)=>n+w,0);ctx.fillStyle=palette[0];ctx.fillRect(x,y,width,block.headerHeight);ctx.strokeStyle='#ffffff';ctx.strokeRect(x,y,width,block.headerHeight);ctx.fillStyle=block.theme==='blue'?'#ffffff':'#102b1e';drawText(ctx,cell.label,x,y+block.headerHeight/2,width,30,700,'center');x+=width;columnIndex+=cell.span;}
      y+=block.headerHeight;
      block.rows.forEach((row,index)=>{let x=MARGIN;const height=block.heights[index];row.forEach((cell,column)=>{const width=block.widths[column];ctx.fillStyle=palette[index%2?2:1];ctx.fillRect(x,y,width,height);ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.strokeRect(x,y,width,height);ctx.fillStyle='#102722';drawText(ctx,cell,x,y+height/2,width,28,400,kind==='entry'?'left':'center');x+=width;});y+=height;});
    }
    ctx.fillStyle='#65766b';drawText(ctx,'概念示範 · 非正式賽事',MARGIN-14,canvas.height-32,1100,18);drawText(ctx,`${pageIndex+1} / ${layouts.length}`,WIDTH-240,canvas.height-32,176,18,400,'center');
    const blob=await new Promise((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('PNG encoding failed')),'image/png'));
    return {url:URL.createObjectURL(blob),width:canvas.width,height:canvas.height};
  }));
}
