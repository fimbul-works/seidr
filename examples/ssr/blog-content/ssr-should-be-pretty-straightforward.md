---
title: SSR should be pretty straightforward...
date: 2025-12-24
tags: [Rendering, SSR, Tech]
---
Now that Seidr's core functionality is in a pretty good shape, I've set my sights on *Server-Side Rendering*.

Components render in a single pass - similar to [SolidJS](https://www.solidjs.com) - avoiding React's funky lifecycle weirdness. This means that the client and server should produce identical outputs given the same state.

Since there's only a single reactive primitive - the name-sake `Seidr` class - the SSR data hydration payload should be quite small, since I only need to transmit the root values, as any derived values cascade from their parent values automatically.

I'll build a minimal `Document` and `Element` DOM implementation to be used on the server, so the client and server can use the same code for rendering. I've yet to plan out exactly how to handle hydration mismatches, but I'll wing it as I go along.

<span title="Famous last words...">Should be a piece of cake!</span>