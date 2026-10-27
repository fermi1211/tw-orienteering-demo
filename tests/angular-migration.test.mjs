import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
async function sourceFiles(directory='src/'){const entries=await readdir(new URL(directory,root),{withFileTypes:true});const nested=await Promise.all(entries.map(entry=>entry.isDirectory()?sourceFiles(directory+entry.name+'/'):directory+entry.name));return nested.flat();}
test('the complete active application uses Angular bootstrap and contains no React or JSX runtime',async()=>{
 const pkg=JSON.parse(await read('package.json'));assert.ok(pkg.dependencies['@angular/core']);
 for(const dependency of ['react','react-dom','@tiptap/react','@phosphor-icons/react','@vitejs/plugin-react'])assert.equal(pkg.dependencies[dependency]||pkg.devDependencies?.[dependency],undefined);
 const files=await sourceFiles();assert.equal(files.some(file=>/\.jsx$/.test(file)),false);
 for(const file of files.filter(file=>/\.(ts|js)$/.test(file))){const text=await read(file);assert.doesNotMatch(text,/from\s+['"](?:react|react-dom|@tiptap\/react|@phosphor-icons\/react)(?:\/[^'"]*)?['"]/);}
 assert.match(await read('src/main.ts'),/bootstrapApplication\(App/);assert.match(await read('index.html'),/<demo-app>/);
});
test('Angular production output preserves the existing Sites asset and worker packaging contract',async()=>{
 const config=JSON.parse(await read('angular.json'));const build=config.projects.orienteering.architect.build;
 assert.equal(build.builder,'@angular/build:application');assert.equal(build.options.outputPath.browser,'client');assert.equal(build.options.baseHref,'./');
 const index=await read('dist/client/index.html');assert.match(index,/<demo-app>/);assert.doesNotMatch(index,/main\.jsx|react-dom/);
 assert.equal(await read('dist/server/index.js'),await read('worker/index.js'));
});
test('all existing frontend and admin workspaces have Angular component implementations',async()=>{
 for(const file of ['App','EventList','EventDetail','HistoricalEventDetail','SignupPage','MemberProfile','MyRegistrations','GroupRegistration','AdminWorkspace','RegistrationOrders','RegistrationEditor','Feedback','EventExports','ArticleManagement','RichArticleEditor','EventLocationPicker','EventAttachments','HistoricalEventManagement','MemberManagement','RoleManagement','OptionParameters','MemberTagging','JournalPage','CancellationDialog','MemberCredit','PublicEventParticipation'])assert.match(await read(`src/app/${file}.component.ts`),/@Component\(\{/);
 const templates=(await sourceFiles('src/app/')).filter(file=>file.endsWith('.html'));assert.ok(templates.length>=59);
});
