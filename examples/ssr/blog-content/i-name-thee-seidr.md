---

title: I name thee Seidr
date: 2025-12-22
tags: [Design, Naming Things]
---

This [happy little accident](./i-accidentally-a-whole-library) has been quite fun to build, and I've started to enjoy working with DOM when it's not completely messed up and full of bloat.

I've been able to establish a nice design philosophy for how I'll shape this library: functional-first, unless _absolutely_ necessary. No OOP with its stupid `this` chains which I often forget to type out.

One thing I'm not a huge fan of is the name `ObservableValue` for the core reactive primitive (and only class) of this otherwise functional-style library, so once again I'm drawing inspiration from Norse mythology which is something I've always had a penchant for.

> Hmm... Reactive graphs.

Causality... _Fate_... Maybe _"wyrd"_?

> No, that would imply inevitability, and this is definitely just deterministic computation.

The seamless binding of reactive properties in vanilla TypeScript _has_ felt like _magic_ at times.

> Wait a hot damn minute, _magic..?_

The Old Norse word _"seiðr"_ roughly translates to _magic of influence and causality_.

_"Seidr"_ has a really nice ring to it. Yup, I think that's the winner.

> I name thee... _[Seidr](https://github.com/fimbul-works/seidr#readme)!_
