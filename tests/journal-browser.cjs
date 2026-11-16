const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const baseline=require('./fixtures/journal-browser-baseline.json');
const root=path.resolve(__dirname,'../dist');
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
(async()=>{
 const {artworkSeo}=await import(pathToFileURL(path.resolve(__dirname,'../src/artwork-seo.mjs')));
 const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  if(pathname==='/api/etsy-newest'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({listings:[]}));return;}
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)&&file!==root){res.statusCode=403;res.end();return;}
  if(pathname==='/')file=path.join(root,'index.html');
  else if(!path.extname(pathname)&&fs.existsSync(file+'.html'))file+='.html';
  if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'index.html');
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {}),headless:true});
 const results=[];
 const shotDir=path.join(process.env.TEMP||'/tmp','vanta-rollout-screenshots');fs.mkdirSync(shotDir,{recursive:true});
 try{
  for(const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]){
   const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce',timezoneId:'Pacific/Auckland'});
   const page=await context.newPage();
   await page.route('**/_vercel/**',route=>route.fulfill({status:200,contentType:'application/javascript',body:''}));
   const targets=viewport.name==='desktop'?baseline.pages:baseline.pages.filter(p=>artworkSeo[p.path.split('/').at(-1)]);
   for(const before of targets){
    const errors=[];page.removeAllListeners('pageerror');page.on('pageerror',e=>errors.push(e.message));
    const response=await page.goto(origin+before.path,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);
    await page.waitForFunction(()=>document.querySelector('#root')?.childElementCount>0);
    const slug=before.path.split('/').at(-1),seo=artworkSeo[slug];
    if(before.articleCount===1)await page.waitForFunction(()=>document.querySelector('script[data-journal-schema]'));
    const observed=await page.evaluate(()=>({title:document.title,description:document.querySelector('meta[name=description]')?.content,canonical:document.querySelector('link[rel=canonical]')?.href,links:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),h1:[...document.querySelectorAll('h1')].map(h=>h.textContent),mainText:document.querySelector('main')?.innerText,schemas:[...document.querySelectorAll('script[type="application/ld+json"]')].map(s=>JSON.parse(s.textContent)),images:[...document.querySelectorAll('main img')].map(i=>({src:i.getAttribute('src'),alt:i.alt})),ogTitle:document.querySelector('meta[property="og:title"]')?.content,ogDescription:document.querySelector('meta[property="og:description"]')?.content,ogUrl:document.querySelector('meta[property="og:url"]')?.content,twitterTitle:document.querySelector('meta[name="twitter:title"]')?.content,featured:document.querySelector('.journal-featured-artwork')?.innerText,overflow:document.documentElement.scrollWidth>window.innerWidth}));
    assert.deepEqual(errors,[],before.path);
    assert.equal(observed.canonical,'https://www.vanta-hollow.com'+before.path);
    assert.deepEqual(observed.h1,before.h1,before.path);
    const remaining=[...observed.links];for(const link of before.links){const index=remaining.indexOf(link);assert.ok(index!==-1,`Lost existing link ${before.path}: ${link}`);remaining.splice(index,1);}
    for(const link of observed.links.filter(l=>l.startsWith('/journal/')))assert.ok(baseline.pages.some(p=>p.path===link),`Broken internal link ${link}`);
    if(before.articleCount===1){assert.equal(observed.mainText.split('FEATURED ARTWORK')[0],before.mainText.split('FEATURED ARTWORK')[0],`Story changed ${before.path}`);assert.equal(observed.schemas.length,1);assert.equal(observed.schemas[0]['@type'],'Article');assert.equal(observed.schemas[0].headline,before.schemas[0].headline);}
    if(seo){
     assert.equal(observed.title,seo.title);assert.equal(observed.description,seo.description);
     assert.equal(observed.ogTitle,seo.title);assert.equal(observed.ogDescription,seo.description);assert.equal(observed.ogUrl,observed.canonical);assert.equal(observed.twitterTitle,seo.title);
     assert.equal(observed.images[0].alt,seo.imageAlt);assert.equal(observed.images[1].alt,seo.mockupAlt);
     assert.equal(observed.images[0].src,before.images[0].src);assert.equal(observed.images[1].src,before.images[1].src);
     for (const image of observed.images.slice(0,2)) assert.ok(fs.existsSync(path.join(__dirname,'../public',image.src)), 'Missing artwork asset: '+image.src);
     for (const img of await page.locator('.journal-entry-hero img, .journal-featured-artwork img').all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(el => el.decode());
      assert.ok(await img.evaluate(el => el.naturalWidth > 0), 'Artwork failed to render');
     }
     const purchase=page.locator('.journal-featured-artwork a.button');
     assert.equal(await purchase.getAttribute('href'),before.links.find(l=>l.includes('etsy.com/listing/')));
     assert.equal(await purchase.getAttribute('target'),'_blank');
     const head=await page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('meta[name],meta[property]')].map(m=>[m.getAttribute('name')||m.getAttribute('property'),m.content])));
     assert.equal(head['twitter:description'],seo.description);
     assert.equal(head['og:image'],'https://www.vanta-hollow.com'+seo.artworkImage);
     assert.equal(head['twitter:image'],head['og:image']);
     assert.ok(observed.featured.includes(seo.purchaseContext));assert.ok(observed.links.includes('/journal/'+seo.relatedSlug));
     assert.match(observed.schemas[0].datePublished,/^\d{4}-\d{2}-\d{2}$/);assert.equal(observed.schemas[0].description,seo.description);
     assert.equal(observed.overflow,false,`Mobile/desktop overflow ${slug}`);
     await page.evaluate(()=>document.fonts.ready);
     await page.evaluate(()=>window.scrollTo(0,0));
     if(['the-cathedral','the-haunted-carnival-gatekeeper','the-road-to-vesperhold'].includes(slug)) await page.screenshot({path:path.join(shotDir,slug+'-'+viewport.name+'.png'),fullPage:true,animations:'disabled'});
    }else {assert.equal(observed.title,before.title);assert.equal(observed.description,before.description);}
    results.push({path:before.path,viewport:viewport.name,passed:true,selected:!!seo});
   }
   await context.close();
  }
  fs.writeFileSync(path.join(shotDir,'results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({passed:results.length,desktop:52,mobile:46,screenshots:6,storyPreservation:'all 46 exact',existingLinks:'all preserved',origin}));
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
