---
title: I accidentally a whole library!
date: 2025-12-19
tags: [React, Personal]
---
The past week I've been working on a small SPA with React to showcase some example shader programs for my WebGL library, *Loiske*, when I found myself thinking *"why am I using a UI library that's like 40kB just for a 'Hello World' - while my WebGL library is less than 3kB?!"*

Fuck this noise, **I'm going oldschool!**

I started aggressively porting the project to vanilla TypeScript. No JSX or build steps, or any *goddamn useEffect*!

Ah. *Bliss.*

But also *really* awkward and repetitive. Pure DOM just wasn't great to work with in the era of jQuery, and the experience hasn't improved much since then.

Most of all I missed reactivity, so I added my [observable](https://www.npmjs.com/package/@fimbul-works/observable) primitives library to the project, and quickly wrote an HTML element factory which let me bind observable values to elements. And a tiny scaffolding to reuse code through pure functions.

A few form helpers here, and a few utility functions there, and...

Wait... Uh. *Oh no.*

I think **I accidentally a whole library!**
