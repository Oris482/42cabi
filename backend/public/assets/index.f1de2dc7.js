import{j as a,a as d,B as u,S as f,R as i,b as h,c as p}from"./vendor.7fc9700e.js";const m=function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))l(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const c of t.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&l(c)}).observe(document,{childList:!0,subtree:!0});function o(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerpolicy&&(t.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?t.credentials="include":e.crossorigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function l(e){if(e.ep)return;e.ep=!0;const t=o(e);fetch(e.href,t)}};m();const r=a.exports.jsx,g=a.exports.jsxs;function y(){const s="http://cabi.42cadet.kr/auth/login";return r("button",{onClick:()=>{d.post(s,{data:"Hello!"}).then(o=>console.log(o.data)).catch(o=>console.log(o))},children:"Login"})}function x(){return r("div",{className:"App",children:r(u,{children:g(f,{children:[r(i,{exact:!0,path:"/",children:r(y,{})}),r(i,{path:"/lent",children:"Lent"}),r(i,{path:"/return",children:"Return"}),r(i,{children:"Main"})]})})})}h.render(r(p.StrictMode,{children:r(x,{})}),document.getElementById("root"));