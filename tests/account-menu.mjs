import assert from 'node:assert/strict';
import {after,test} from 'node:test';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><div id="root"></div><button id="outside">Outside</button>',{url:'https://test.example'});
Object.assign(globalThis,{window:dom.window,self:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
const require=createRequire(import.meta.url),Module=require('node:module'),resolve=Module._resolveFilename;
require.extensions['.tsx']=require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);
Module._resolveFilename=function(request,...args){return resolve.call(this,request.startsWith('@/')?fileURLToPath(new URL('../'+request.slice(2),import.meta.url)):request,...args);};
const {createElement,act}=require('react'),{createRoot}=require('react-dom/client');
const {PathnameContext,SearchParamsContext}=require('next/dist/shared/lib/hooks-client-context.shared-runtime.js');
const root=createRoot(document.getElementById('root'));
async function render(path='/community/account',permissions={},query=''){const Menu=require('../app/community/AccountMenu.tsx').default;await act(()=>root.render(createElement(PathnameContext.Provider,{value:path},createElement(SearchParamsContext.Provider,{value:new URLSearchParams(query)},createElement(Menu,{name:'𠮷 Researcher',...permissions})))));}
after(async()=>{await act(()=>root.unmount());Module._resolveFilename=resolve;dom.window.close();});

test('account menu closes on Escape, outside press and route changes, with capability-scoped links',async()=>{
 await render();const details=document.querySelector('details'),summary=document.querySelector('summary');
 await act(()=>summary.click());assert.equal(details.open,true);
 assert.match(summary.textContent,/𠮷 Researcher/);assert.ok(!document.querySelector('a[href="/community/admin"]'));
 await act(()=>details.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true})));
 assert.equal(details.open,false);assert.equal(document.activeElement,summary);
 await act(()=>summary.click());await act(()=>document.getElementById('outside').dispatchEvent(new window.MouseEvent('pointerdown',{bubbles:true})));
 assert.equal(details.open,false);
 await act(()=>summary.click());await render('/community/account/settings',{canManageRegistry:true});assert.equal(details.open,false);
 assert.ok(document.querySelector('a[href="/community/admin"]'));
 assert.equal(document.querySelector('form').getAttribute('action'),'/api/community/auth/logout');
});

test('account menu dismisses across query-only history navigation',async()=>{
 await render('/community/registry/submissions',{canManageRegistry:true},'all=1');
 await act(()=>document.querySelector('summary').click());assert.equal(document.querySelector('details').open,true);
 await render('/community/registry/submissions',{canManageRegistry:true});assert.equal(document.querySelector('details').open,false);
});
