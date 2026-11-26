import assert from "node:assert/strict";
import {after,test} from "node:test";
import {createRequire} from "node:module";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import ts from "typescript";
import {JSDOM} from "jsdom";
const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:"https://test.example"});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,FormData:dom.window.FormData,IS_REACT_ACT_ENVIRONMENT:true});
const require=createRequire(import.meta.url),Module=require("node:module"),resolve=Module._resolveFilename;
require.extensions[".tsx"]=require.extensions[".ts"]=(module,filename)=>module._compile(ts.transpileModule(readFileSync(filename,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,filename);
Module._resolveFilename=function(request,...args){return resolve.call(this,request.startsWith("@/")?fileURLToPath(new URL("../"+request.slice(2),import.meta.url)):request,...args);};
const {createElement,act}=require("react"),{createRoot}=require("react-dom/client");
const {AppRouterContext}=require("next/dist/shared/lib/app-router-context.shared-runtime.js");
const root=createRoot(document.getElementById("root"));
const contributor={slug:"contributor_"+"a".repeat(64),name:"account-login",login:"account-login"};
let calls=[],failure=false,refreshes=0;
globalThis.fetch=async(url,init)=>{calls.push({url,init});return failure?Response.json({message:"Your session expired."},{status:401}):Response.json({displayName:JSON.parse(init.body).displayName,contributor});};
async function render(profile){const PublicName=require("../app/community/mine/PublicName.tsx").default;await act(()=>root.render(createElement(AppRouterContext.Provider,{value:{refresh(){refreshes++;}}},createElement(PublicName,{key:String(profile?.displayName),profile}))));}
async function change(value){const input=document.querySelector('input[name="displayName"]');await act(()=>{Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,"value").set.call(input,value);input.dispatchEvent(new window.Event("input",{bubbles:true}));});}
async function save(){await act(()=>document.querySelector("form").dispatchEvent(new window.Event("submit",{bubbles:true,cancelable:true})));}
after(async()=>{await act(()=>root.unmount());Module._resolveFilename=resolve;dom.window.close();});

test("members save and clear only their own public display name",async()=>{
 await render({displayName:null,contributor});await change("  Jiapeng Zhang  ");await save();
 assert.equal(calls.at(-1).url,"/api/community/v2/me/profile");assert.equal(calls.at(-1).init.method,"PATCH");
 assert.deepEqual(JSON.parse(calls.at(-1).init.body),{displayName:"Jiapeng Zhang"});assert.equal(refreshes,1);
 assert.match(document.querySelector('[role="status"]').textContent,/saved/i);
 await change("  ");await save();assert.deepEqual(JSON.parse(calls.at(-1).init.body),{displayName:null});
 assert.match(document.body.textContent,/public activity|published/i);
});
test("profile save errors preserve the typed name and names over 120 characters are rejected",async()=>{
 await render({displayName:"Existing",contributor});await change("New name");failure=true;await save();failure=false;
 assert.match(document.querySelector('[role="alert"]').textContent,/session expired/);assert.equal(document.querySelector("input").value,"New name");
 const before=calls.length;await change("😀".repeat(121));await save();assert.equal(calls.length,before);assert.match(document.querySelector('[role="alert"]').textContent,/120/);
});
test("older service leaves account history usable with explicit unavailable profile settings",async()=>{
 await render(null);assert.equal(document.querySelector("form"),null);assert.match(document.body.textContent,/temporarily unavailable/i);
});
