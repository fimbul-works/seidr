---
title: I accidentally a whole library!
date: 2025-12-19
tags: [React, Personal]
---
The past week I've been working on a small SPA using React for my WebGL library, *Loiske*, to showcase some example shader apps... At some point I started asking myself:

> Why, oh *why*, am I using a frontend library that's more than 80kB *just to build a simple web application*, when the Loiske core is less than 3kB?!
>
> You know what? *Fuck* this. I'm gonna do this *oldschool!*

I began porting the project aggressively with pure vanilla TypeScript. No JSX or transpilers, and no *damn useEffect!*

Ah... That *will* be *bliss*, I'm sure.

Old age gilds even the fondest of memories, and I quickly remembered that raw DOM manipulation wasn't great to work with back in the days of jQuery, and while web technologies *have* improved over the years, manually updating the DOM is still really awkward and cumbersome. But I've never been one to quit early, and so I soldiered on.

Turns out, I missed *reactivity* rather badly.

I added my [observable primitives](https://www.npmjs.com/package/@fimbul-works/observable) library to the project, and quickly whipped up an HTML element factory that let me bind observable values to element properties. I also built some scaffolding to reuse code through pure functions, like primitive components - but without all the lifecycle madness of React. *Fuck useEffect*.

Next I needed a few form helpers, and a few more utility functions...

Wait... Uh. *Oh no.*

I think **I accidentally a whole library!**
