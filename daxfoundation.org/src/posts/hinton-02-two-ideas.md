---
title: "The Teacher, Part 2: two ideas that taught a machine to learn"
description: "Backpropagation and the Boltzmann machine — the two inventions, drawn partly from nineteenth-century physics, that made it possible for a network to learn from examples instead of rules. What they are, in plain words, and why they are the ground our free-learning mission stands on."
date: 2026-11-06
draft: false
series: the-teacher
part: 2
series_total: 5
related:
  - url: https://www.nobelprize.org/prizes/physics/2024/popular-information/
    label: "Nobel Prize in Physics 2024 — popular science background"
  - url: https://www.acm.org/media-center/2019/march/turing-award-2018
    label: "ACM A.M. Turing Award 2018 citation"
  - url: https://daxfoundation.org/metadax/
    label: "Meta DAX — free universal learning"
---

If you want to understand what Geoffrey Hinton actually gave the world, you have to look at two ideas. Neither is magic. Both are now so woven into daily life that most people use their descendants a dozen times a day without knowing the names. We are going to try to say what they are without the mathematics, because the shape of each one matters to the thing we are building.

## The first idea: backpropagation

A neural network is a stack of simple units, each connected to the next by links that carry a strength — a number — called a weight. Show the network an input, and a signal flows forward through the weights to produce an answer. At first the answer is garbage, because the weights are random. The whole problem of learning is: how do you adjust millions of weights so the answer stops being garbage?

Backpropagation is the answer. You measure how wrong the network was, then you push that error *backwards* through the network, layer by layer, working out how much each individual weight contributed to the mistake and nudging it in the direction that would have made the error smaller. Do this over and over, with enough examples, and a network that started out useless teaches itself to recognise a face, parse a sentence, or price a risk.

Hinton did not invent the underlying calculus, and he has always been careful to say so. What he did, in a 1986 paper written with David Rumelhart and Ronald Williams — "Learning Internal Representations by Error Propagation" — was show that this method could actually train multi-layer neural networks to learn useful internal representations of data. That demonstration is the reason backpropagation is, in the ACM's words from its 2018 Turing Award citation, "standard in most neural networks today." Almost every system now called "AI" learns by some version of this backward push of error. It is the engine.

## The second idea: the Boltzmann machine

The second idea is the one the Nobel committee singled out, and it is stranger and more beautiful. In the early 1980s, working with Terrence Sejnowski, Hinton took a model of memory built by John Hopfield and made it probabilistic — it would settle into states not with certainty but with probabilities, borrowed directly from the equations the nineteenth-century physicist Ludwig Boltzmann wrote to describe how heat and disorder distribute themselves among the particles of a gas.

The result, published in 1985, was named the Boltzmann machine in his honour. Fed enough examples, it learns the statistical shape of a kind of data — and then, crucially, it can generate *new* examples of that same kind. The Nobel committee's own background material calls it an early example of a generative model: a machine that does not just recognise patterns but can produce them. Everything now called "generative AI" is, in a real sense, standing on that 1985 idea. Hinton later found a far more practical variant, the restricted Boltzmann machine, with an efficient learning method that helped reignite the whole field in the mid-2000s.

Sit with how odd that is. To teach a machine to imagine, a computer scientist reached back a century into thermodynamics — the physics of steam engines and gases — and found exactly the mathematics he needed. That is why a computer scientist won a Nobel Prize in Physics. The committee awarded it "for foundational discoveries and inventions that enable machine learning with artificial neural networks," and the Boltzmann machine is the clearest example of what they meant.

## Why this is the ground under our feet

Here is why we spend a whole part of a tribute on two technical ideas. Both of them are, at bottom, statements about *learning* — and they say something we find genuinely moving. Intelligence does not have to be hand-written by an expert, rule by rule, forever out of reach of anyone who cannot afford the expert. It can be *grown*, from examples, by adjusting connections. A thing can learn.

That is the hinge our entire mission swings on. Meta DAX exists to put teaching within reach of every human being — any subject, any domain, free, forever — and it is only conceivable because of machines that learn instead of machines that must be programmed. If every tutoring system had to be hand-coded by specialists for each learner, free universal learning would be a fantasy. Because of backpropagation and its descendants, a capable tutor can now be synthesised cheaply, adapted to the person in front of it, and handed to someone who could never have paid for one. The cognition behind our own tools is provided by Obsidian Delta; the fact that such cognition can exist at all is the inheritance Hinton's two ideas left us.

He taught a machine to learn from examples. We are trying to use machines that learn to help people learn. That is the whole line, and it starts here, with a backward push of error and a century-old equation about heat.

This is Part 2 of five. Next: 2012, and the two students who turned a stubborn idea into the thing that changed everything.

---

*This is a tribute and our own commentary. The DAX Foundation and Obsidian Delta are not affiliated with, endorsed by, or in partnership with Geoffrey Hinton, the University of Toronto, the Royal Swedish Academy of Sciences, or the Association for Computing Machinery. Every quote here is attributed to its public source; nothing is put in anyone's mouth.*
