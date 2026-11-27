import assert from "node:assert/strict";
import {test} from "node:test";
import {createRequire} from "node:module";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import ts from "typescript";
const require = createRequire(import.meta.url);
require.extensions[".tsx"] = require.extensions[".ts"] = (module, filename) => module._compile(ts.transpileModule(readFileSync(filename,"utf8"), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText, filename);
const Module=require("node:module"), resolve=Module._resolveFilename;
Module._resolveFilename=function(request,...args){return resolve.call(this,request.startsWith("@/")?fileURLToPath(new URL("../"+request.slice(2),import.meta.url)):request,...args);};
const {createElement}=require("react"), {renderToStaticMarkup}=require("react-dom/server");
const personal = type => ({section:type,entries:[],page:1,hasMore:false,total:0,counts:{maintained:1,original:0,update:0}});
const tool={id:"cp_example",name:"Maintained tool",description:"Example",versions:[],repositories:[]};

test("shared profile renders three sections together with maintained first and independent pagination",()=>{
  const Profile=require("../app/community/ContributorSections.tsx").default;
  const html=renderToStaticMarkup(createElement(Profile,{route:"/community/mine",sections:{maintained:{...personal("maintained"),entries:[{kind:"maintained",tool}]},original:{...personal("original"),page:2,hasMore:true},update:personal("update")},pages:{maintained:"1",original:"2",update:"3"},mine:true}));
  assert.ok(html.indexOf('id="maintained"')<html.indexOf('id="original"'));
  for(const id of ["maintained","original","update"])assert.match(html,new RegExp(`href="#${id}"`));
  assert.match(html,/originalPage=3/);assert.match(html,/updatePage=3/);
  assert.match(html,/Manage this tool/);
});

test("public profiles omit account management, internal IDs and draft review actions",()=>{
  const Profile=require("../app/community/ContributorSections.tsx").default;
  const html=renderToStaticMarkup(createElement(Profile,{route:"/community/contributors/contributor_"+"a".repeat(64),sections:{maintained:{...personal("maintained"),entries:[{kind:"maintained",tool}]},original:personal("original"),update:{...personal("update"),entries:[{kind:"submission",submission:{id:"public-submission",status:"published",name:"Published work",type:"update",label:"v1",pipelineId:tool.id,createdAt:"2026-11-25",authors:[],maintainers:[],repository:"https://github.com/example/tool",contributor:{id:"google:"+"a".repeat(64),login:"member"}}}]}},mine:false}));
  assert.match(html,/Maintained tool/);assert.match(html,/Published work/);
  assert.doesNotMatch(html,/Manage this tool|Review status|registry\/submissions|google:|Account settings|Contributor ID|Sign out/);
});

test('private account OAuth returns allow exact account destinations without widening redirects',()=>{
 const {safeCommunityReturn}=require('../lib/community/return-path.ts');
 for(const path of ['/community/account','/community/account/settings','/community/account/security'])assert.equal(safeCommunityReturn(path),path);
 for(const path of ['/community/account/admin','/community/account/settings/extra','//elsewhere.test/community/account','/community/account#private'])assert.equal(safeCommunityReturn(path),'/community/mine');
});
