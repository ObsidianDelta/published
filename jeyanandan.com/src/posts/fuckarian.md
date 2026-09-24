---
title: "Fuckarian"
subtitle: "Where the Argument Came From"
date: 2026-09-21
description: "The third of three. The first was the loop, the second was the threat. This one is the person who built them: why he has always been told to listen, what he thinks responsibility actually is, and who it is owed to."
draft: false
---

*The third of three. The first was [the mechanism](/blog/snowflake-fuckari-in-action/). The second was [the threat](/blog/the-constraint/). This one is the person.*

---

First I introduced Fuckery, which is the framework. Then I introduced Fuckari, which is the loop that runs inside it. I built both of them, so I suppose that makes me the Fuckarian.

That is the joke, and like most of my jokes it is also a definition. In the glossary I wrote for the framework, a Fuckarian is *a being constituted by its assumptions, constrained by them in the same act that lets it think at all*. I wrote that entry about nobody in particular. Some weeks later I read the table back and the third row was looking at me.

There is a rule in the Fuckery README that I put there myself: *reasoning trails are first-class here.* Every claim in that framework is tagged for where it came from. Every claim except one: the framework itself, which has so far been presented as if it arrived from nowhere. Its own rules do not allow that.

So this is the missing tag. I have been asking people to check my reasoning trails. Here is mine.

---

## Before anything else: friends and family

If you have landed here because you know me rather than because you follow the work, this section is for you. Read it, take what you want, and leave the rest. It will still be here.

**An apology first.** Over the last couple of weeks — including on my birthday, which cannot have helped — I am fairly sure I frightened off a couple of cousins. I was launching formaddie.com, and re-releasing the ontology, and putting out the protocol, and saying that something called Meta DAX is coming. I suspect what arrived on the other side of those conversations was a man speaking in tongues. Riddles, at best.

So, sorry. To them and to the rest of the family. It was not you, you had not missed a memo, and it was not a test. I was mid-launch and I do not have a second register to drop into when I am.

In my defence, the pace is not entirely my doing. There is a section further down where I quote the programmer David Heinemeier Hansson — about as level-headed as that field produces — describing this year as decades of progress arriving in nine months. That is happening to everybody who builds things right now. It is intoxicating, it is fast, and it makes otherwise reasonable people sound unhinged at family gatherings. I am not special in this. I am one of a great many it happened to, in a year when it happened to a lot of us at once.

And all of the above is only *this year*. What I have actually been doing for the last three years is a separate pile, most of it still unreleased. That comes soon as well.

**How to read this, if you want to.** It is long, and it is not written in one register. So:

- **If you only want to know what I have been up to** — read the links below and stop there. You will have the whole of it.
- **If you want the person rather than the work** — skip to *What I have learned about myself this year* and read to the end. That is the part I have never managed to say out loud, and it is the part I most want the family to have.
- **If you want the argument** — *What the first two were*, then *What happens next, and what I am asking for*.
- **Nothing here needs the other two essays first**, and nothing technical is load-bearing for the human parts. Skim past anything that stops being interesting; I will not know.

This is what I have been doing. This is what I am about. Here it all is, described properly rather than in the shorthand I have apparently been using at family gatherings.

### Start here, because this is the one you can actually use

**[formaddie.com](https://formaddie.com)** — released this year, on my birthday. You talk to it about your life, and it turns what you say into a book in your own voice. There is no blank page, no typing, and no requirement that a life be remarkable before it is worth keeping. It was built with older people in mind first, because that is where the loss happens fastest and is least recoverable. If you have a parent or a grandparent whose stories are going to go with them, this is the thing I made about that.

Underneath Maddie is a **[cognitive companion](https://daxfoundation.org/#cognitive-companion)** — a category I ended up having to define rather than borrow, because none of the existing words fit. It is not a chatbot and it is not an assistant. An assistant is a second party you hand jobs to. A companion is an extension of the person: part of you, the part through which you work with this technology and direct it. Maddie is one of those, pointed at a single subject, which is your own life. The full definition is at that link, and everything below is what it takes to build one of these responsibly.

### The rest, in the order that makes sense

- **[Obsidian Delta](https://www.obsidiandelta.com)** — the company, and fourteen years old now. It started in telephony and voice automation, built a voice agent that took real taxi bookings on bad phone lines at night, and it now builds the cognition everything else here runs on. This is the part that pays for things.
- **[The DAX Foundation](https://daxfoundation.org/)** — deliberately separate from the company. A company can commit to a constraint; it should not also be the thing that holds the constraint. So the Foundation holds the mission, the constraint, and the definitions that everything else refers back to. It is not incorporated yet, and the site says so plainly.
- **[Fuckery](https://github.com/ObsidianDelta/Fuckery)** — the name is a joke, the thing is not. It is a metacognitive framework, which is a pompous way of saying it is a tool for thinking about how thinking gets shaped. One idea holds it up: structure forms under pressure, and then becomes the pressure that the next thing forms under. Free, openly licensed, no catch.
- **[The Snowflake](/blog/snowflake-fuckari-in-action/)** — that framework, run against a single snowflake, step by step, twenty-eight times, in public. I chose a snowflake on purpose: nobody argues about the physics and nobody has anything at stake in the answer. If the method was going to fall over, it should fall over somewhere harmless.
- **[The Constraint](/blog/the-constraint/)** — the serious one. Why I think the next few years are genuinely dangerous, what the people closest to this technology are actually saying about it in public, and what we built because we did not want to take the chance.
- **[The Constraint Protocol](https://github.com/daxfoundation/constraint-protocol)** — the thing we built. An open, public way for anything — a person, a company, a piece of software — to declare in advance what it will not do, and then be checked against that declaration by anybody who cares to look. Published, free to use, and honest about the fact that it has only run once so far.
- **Meta DAX** — the learning one, and the one I care about most. It is not released yet. It gets its own announcement, shortly.

One last thing before you start, because I do not want this read as a man announcing himself. On the twenty-first of this month I released most of a year's work in a week. That is not remarkable. Everyone I know who works in a domain they care about is sitting on a pile that got suddenly, strangely easy to finish, and a great deal of it is going to land at once over the next while. Whatever you end up making of me, do not make the mistake of thinking this is only me.

The rest of this post is the part I have never been able to say out loud.

---

## What the first two were

For anyone landing here first. Skip it if you already know.

[Fuckery](https://github.com/ObsidianDelta/Fuckery) is a metacognitive tool, a way of thinking about thinking. Its core idea is simple to state: structure forms under constraint, then the structure *becomes* constraint, and whatever forms next forms under the conditions the last thing left behind. That loop is Fuckari. I ran it against a snowflake for twenty-eight steps, [in public](/blog/snowflake-fuckari-in-action/), because a snowflake is something whose physics nobody disputes and nobody has a stake in. If the framework was going to fail, it should fail there, on something harmless.

I built Fuckery as a tool, and the thing I built with it is the [Constraint Protocol](https://daxfoundation.org/#cp). The protocol is an open, public way for anything — a person, a company, an AI system — to declare what it will not do, and to make its conduct under that declaration checkable by anyone who cares to check.

It is meant to do more than keep a record. It is intended to let knowledge and intelligence compound across parties instead of resetting every time two of them meet; to surface the patterns that form when entities talk to each other over months rather than minutes, including whether an agreement between them was reached or manufactured; and to sit as an accountability layer between the things that act and the people they act on.

*Intended* is the operative word, and I am going to keep using it. It is a Public Working Draft. It has run in full once. We are experimenting with it internally at [Obsidian Delta](https://www.obsidiandelta.com). The commitments in it are commitments, not a description of what anybody is doing today.

Fuckery and the Constraint Protocol are this year's work. They are not my life's work. That comes at the end.

---

## Two lines

Two lines I keep close, because they say more about me than a bio would.

The first is *per aspera ad astra*: through hardship, to the stars. Not *to the stars despite hardship*. Through it. The hardship is the route.

The second is from an interview I once heard, and I put it on my Ko-fi page because I could not improve on it. The man said that if you are a lover, you have to be a fighter. The host asked how so. And he said: because if you don't fight for your love, what kind of love do you have?

Hold on to that one. It comes back.

---

## What I have learned about myself this year

ADHD. Somewhere on the autism spectrum. Neurodivergent. Those are the words that have been thrown at me so far, some by people who love me and some by people being professional about it.

Other words have been thrown over the years by people with less training and better timing. Scatterbrain. Away with the fairies. Dreamer. Absent-minded professor, which I always felt was generous on both counts. Space cadet. Lazy, which had a good decade-long run. And *the smartest dumb guy I've ever seen*, which earned its own section and gets one.

In an earlier version of this post I wrote that I was not going to take any of them up. *At the end of the day, I'm just me.*

This year a clinician looked at the whole picture and thought two of the words probably fit: autism spectrum and ADHD. A formal assessment is still to come, and I am not going to claim more than that. But after a lifetime of being treated for symptoms (anxiety, low mood, the things that show on the surface), it is the first explanation anybody has offered that reaches the root instead of the branches.

So: take your pick off the list. Add your own, most people do. At the end of the day I am a Fuckarian, which is a word I made up, which means nobody gets to tell me I do not qualify.

And underneath that one, the thing that has been true the entire time and that I have somehow never once said plainly in public:

**I am a being that happens to be human.**

That is not a pose and it is not a bit. It is the most accurate description of my own experience that I have got. It is why my pronoun field says *Being*. It is why the framework treats a person, a company and a piece of software as the same kind of thing the moment any of them declares a constraint. It is why the Constraint Protocol is built around a principal of unrestricted kind rather than around AI — the protocol does not care what sort of thing you are, only whether you said what you would not do and can be checked against it.

Every piece of this work has that sentence underneath it. I published two long essays without putting it in either of them, which, on reflection, is the most Fuckarian thing in this post: the assumption that lets you see everything is the one you cannot see.

Before going any further, one thing, as plainly as I can put it:

**None of this is an excuse.** Not for anything I have done, and not for anything I have failed to do. The only thing it points toward is responsibility, and the responsibility is mine. I am describing a disposition, not asking for a discount. And I am describing it the way I describe everything else in the framework: as the best current reading, open to revision. We keep finding out new things about ourselves. This is one of mine, and I am sharing it.

---

## The smartest dumb guy

When I was sixteen, my friend Mike looked at me and said: *you're the smartest dumb guy I've ever seen.*

I was furious. So when he wasn't looking, I went over to his hoodie, which had a bit of dirt on the hood, and wrote DUMB in it with my finger.

Except I spelled it T-H-U-M-B.

Which, you will notice, rather proved his point.

I tell that story because it is the whole thing in one frame. Whatever this is, it cuts both ways. The same head that can hold a twenty-eight-step derivation of a snowflake will, on a different afternoon, spell *dumb* with a *th* while trying to insult somebody for calling it dumb. I have done some genuinely daft things in my life. None of them on purpose. It is what it is, I am what I am, and I would rather you heard it from me.

---

## Who doesn't get hired at McDonald's?

Also at sixteen: I applied to McDonald's, and McDonald's did not hire me.

Take a moment with that. Who doesn't get hired at McDonald's? Me. That's who.

Years later, working on my own, I put a voice-automation chatbot for taxi dispatch into live production. As far as I have ever been able to tell, I was the second team anywhere in the world to do it independently. Another team beat me by about three months. I am still a bit sore about the three months.

That is the juxtaposition, and it has never really gone away. To this day, if I write a sentence, it will probably have two spelling mistakes in it. Hand me a blank sheet of paper, a pencil and a ruler, and ask me to rule it into lined paper, and I will genuinely struggle. It is one of the hardest simple things I know. I would honestly rather write a program to do it. (I have thought about it.)

Can't flip burgers. Can automate a taxi company. Can't rule a line. Can write the program that rules the line. I have made my peace with this, mostly by finding it funny, and I would like you to find it funny too, because it is.

There is a second half to it, and it took me an embarrassingly long time to see it as a half rather than a defect.

I am slow. Not modest-slow. Not the *oh, everyone feels that way* slow that people say to be kind. Properly, measurably, watch-the-clock slow. Put me in a room where something is being explained and I will reliably be the last one to arrive, if I arrive during the meeting at all.

For whatever it is worth, I am in reasonable company. Darwin wrote in his autobiography that he had "no great quickness of apprehension or wit which is so remarkable in some clever men, for instance Huxley" — and then spent the next forty years being slowly, comprehensively right about the thing everybody else was quick about. I am not comparing myself to him, and I would like that on the record before somebody quotes this paragraph without the sentence it is sitting in. The point is narrower than a comparison and it is about measurement: *slow* is a reading taken of one thing at one moment, and people keep filing it as a reading of the whole apparatus.

Because here is the other edge. When it does click, and it can take years, what comes out is not the same size as what went in. I do not catch up. The thing arrives whole, with its structure already attached, and I can then run it for twenty-eight steps against a snowflake without getting tired.

Slow to load. Different unit once loaded.

That is the first double-edged sword in this post and it is nowhere near the last. It is also the honest reason I am careful about the others: a thing that cuts both ways does not stop cutting once you have worked out which end you are holding.

---

## The channel ran both ways

I was homeschooled until I was nine.

There was a short stretch of school in Sri Lanka, and I remember almost nothing of it except sitting there while nothing went in. Then England, from nine to eleven: school, and I was aloof, not really present, out of place. Then Canada, and more of the same. I had to go at my high school diploma twice. At university I was kicked out at the end of second year, went back, and left for good in third.

From about nine until I finally walked out somewhere in my early twenties, school was, for me, torture. I do not use the word loosely and I do not use it to blame anybody. That is simply what it was like from the inside.

There were exceptions. Three, in about fifteen years, which tells you the ratio better than any adjective would.

The big one was Grade 12 physics. The teacher was genuinely exciting. The tables were turned to face each other so we worked together instead of in rows. And we derived E = mc², by hand, as a group, and it was absolutely magical. I have spent a lot of my life since trying to understand why that one room worked when nothing else did. I think the answer is in the room itself: curiosity instead of compliance, collaboration instead of rows, and an adult who was excited by the thing he was showing us. Hold on to that one too.

The other two were a computer programming course and, somewhere in there, astronomy. Same reason, I think. In all three, the thing being taught was visibly something a person had once had to work out, rather than something I was being handed and asked to hold. Everything else was torture. I am aware that is a strong word for a school timetable and I have chosen not to soften it, because softening it would be the third or fourth time in my life I have agreed to describe that experience in somebody else's vocabulary.

The easy reading of the rest of that list is that I was not very bright, or not very disciplined, or not trying. I believed some version of that for a long time. I once spent about two years praying every night to be made smarter.

The reading I believe now is different. The problem was never the content. It was the channel, and the channel ran both ways. The way other people packaged information did not land in me, and the way I packaged it did not land in them. Teachers, classmates, family, later colleagues: all of them were transmitting in good faith on a frequency I was not receiving, and I was transmitting on one they were not.

I could not get my own thoughts fully onto paper until I was somewhere between twenty-one and twenty-three. Before that they were there, very much there, but fuzzy: too large and too interconnected to come out in a line. That is a long time to live with a head full of things and no reliable way to hand any of them over.

I cannot give you the date, which is itself odd — you would think a thing like that would arrive with one. What I have is the sensation. I was typing, and then I was still typing, and it was all coming out. Not better. *Out.* It is the strangest feeling I have ever had and I have never once managed to describe it to anybody's satisfaction, including my own. Twenty-odd years of pressure behind a door, and then no door.

When I left university for the last time, I worked out what I was for. It was to **bring the right information to the right person at the right time.** If I could do that, I thought, I could actually help people. Look back across almost everything I have built since and that is the thread. Most of it has been about information.

---

## Listen

All my life I have heard the same refrain. *You don't listen.* And its companions: *you're not trying. You're not trying hard enough.*

It was not unfair. I did need to listen. But if you could have seen inside my head at any of those moments, you would not have found a man who was not trying. You would have found a man trying so hard at something nobody could see that there was nothing left over for the thing in front of him.

And the same thing was happening in the other direction. I was not being heard either.

Not because anybody refused to hear me. Nobody refused. The words simply did not come out. Underneath, I was at full volume (what is this, why is the world like this, what am I supposed to be doing with it) and almost none of that ever made it into a room with another person in it. It was not being withheld. It had no route to the outside, and from the outside a thing with no route looks exactly like a thing that is not there.

So the instruction to listen arrived, correctly, from people who could see I was not listening. It landed on someone who was, at that exact moment, loud on the inside and silent on the outside. Both were true. Only one was visible.

So here is my one request of anybody reading this, and I make it knowing exactly how it sounds coming from me:

**When I speak, it is sometimes very hard for me to get the concepts out. That is on me, and I am working on it. But it is you who needs to listen.**

Not agree. Listen. Give it a little longer than feels natural. What comes out of me first is rarely what I mean; it is the nearest door I could find to what I mean. If you wait, the rest usually follows.

And here is my half, which is the harder half. For a long time I was waiting for somebody to have the answer, to explain to me what this is and why it is like this. Almost nobody has that answer. I was asking the people nearest to me for something no person holds, and then quietly marking them down for not producing it. I never said it out loud, which made it worse: a test nobody has been told about cannot be passed or argued with. I ran that on people who had done nothing to deserve being examined. That is mine, and it is not small.

---

## Responsibility

Almost always in the same breath as *listen*, I was lectured about responsibility.

I want to tell you what I thought responsibility was, because I think this is where most of the misunderstanding lives.

I grew up with money as a constant pressure. It was the weather of the house: never quite enough, always the next worry. I carried that into adulthood as a financial anxiety that has never really gone away, and looking back, it has driven a great deal of what I have done.

To me, the responsible thing was obvious: do everything I could to take care of my family, to contribute, to carry my share and more. And the only way I could see to contribute on the scale I wanted was to buckle down on the big things. Not a small, safe job that would pay a small, safe amount (see: McDonald's, above), but the kind of work that might one day put me in a position to have money to spare, so that I could look after the people I love.

So while people were lecturing me about responsibility, I was, in my own head, being as responsible as I knew how. We were using the same word for two different things. They could see a man who was not doing the sensible, steady thing. I could see the sensible, steady thing and knew it would never be enough to do what I was actually trying to do.

**To me, wealth is not how much money I have. It is how happy and well off the people I love are. That is my definition of wealth.**

By that definition I have not been wealthy, and not being able to meet the one responsibility I hold above all others, to the people I love, has been the quiet engine under most of my life. It is why I keep building. It is why, when the easy option was on the table, I kept reaching past it.

I am not saying I got it right. I often did not. I am saying it was never indifference. It was the opposite.

There is a second half to this, and it is at the end of the post rather than here, because it took me most of my life to work out that *responsible for what* and *responsible to whom* are two different questions. I had spent decades answering the first one and had never once sat down with the second.

---

## Conditions

This is the thing I know about myself with the most confidence, because it has been tested often enough to count.

Given love, respect and patience, the words come out.

Given less than that, they do not. Not *less well*. Not at all. It is not a preference, and it is not something I can push through by trying harder; I have tried harder for long enough to be sure. It is closer to a precondition, the way light is a precondition for a photograph.

For years I have asked someone I love to start with respect and love, and *then* we can talk. I still think that is the right order. But I have had to admit that I was asking for the conditions without ever being able to explain why I needed them, and from the other side of the table that request looked like something else entirely. A person who *cannot* say what is wrong and a person who *will not* say what is wrong look identical from the outside. Everyone around me was working from the evidence I supplied, and the evidence supported the second reading at least as well as the first.

I used to treat other people's patience as if it were weather: something that is just there and renews itself overnight. It is not weather. It is spent, deliberately, by particular people, out of a supply they need for their own lives. A lot of it was spent on me.

---

## I talk like a numpty

This part is mostly for the people who know me through work.

Ninety-nine percent of the time I talk like a numpty. I mumble, I start in the middle, I go sideways. That is an accurate read, because most of the time I *am* being a numpty, and I like it.

Then, every so often, something comes out about constraint regimes and top-down causation. Same voice. Same bloke. No change of register, no signal that the thing being said now is a different kind of thing from what was said ninety seconds ago about the bins.

People rate a signal by its source. That is not lazy; it is the only method that works at scale. The model of me most people run is accurate, and I built it myself, out of evidence I supplied, over decades. It just happens to be wrong in this one place, and there is no way for me to say so that does not sound exactly like what someone would say if it were right.

So if you have worked with me and come away thinking *there's a lot going on there, but I couldn't tell you what*: you were right on both counts. This post is the part I could not tell you.

---

## The cost of the altitude

Here is the part I most want understood, and the part I think deserves real study rather than one man's account.

Work like Fuckery and the Constraint Protocol takes an extreme amount of abstract thinking. That is the one thing I am unusually good at. But it is not free. To think at that altitude for long enough, you lose yourself: you disconnect from the room, from the body, from the ordinary continuity of being a person in a day. I do not mean that poetically. The part of me the work needs goes somewhere else to do it, and the rest of me is left running on very little.

And you do not snap back from that in a day.

This year is the sharpest version of it I have lived through, and I can give you the dates. From the second of March to the middle of July I had more cognitive output than in any comparable stretch of my life. Not by a margin — by a category. Fuckery, the protocol, three essays, the companion itself, and a quantity of unpublished work I will get to eventually. I have never been more productive and I have never been further away from the room I was sitting in.

I have found myself in that state several times in my life without meaning to. It has lasted months. It has lasted years. If I am honest, I have been more or less lost for the better part of a decade. Coming back is not a decision; it takes training, and time, and usually help. From the outside, what people saw during those stretches was someone present in body and absent in every way that mattered to them: arriving without warning with enormous needs, leaving again without explanation. That caused real harm in my personal life. I am not going to write the rest of it, because the rest is not only mine; every further sentence would need someone else standing in it, and they did not choose to be in a blog post.

Some of the cost is almost comic, until you notice it. I have not written anything by hand in so long that my handwriting is now horrendous. I have barely typed this year, either. Nearly everything I make is spoken, including this post, which I talked out loud. The man who could not get his thoughts onto paper until his twenties has, in a sense, stopped using paper at all. That is a kind of freedom. It is also a kind of disconnection, and disconnection has a bill.

And I am not the only one about to get that bill. In a recent conversation with Lex Fridman, the programmer David Heinemeier Hansson put the moment better than I can: *"we have seen decades of progress happen in the last nine months."* He described the feeling of working with these tools as a genie offering every feature you have ever dreamed of, *"most of them in five minutes, a few in 20, and if we really go hog wild, it's gonna take me two hours,"* and asked who would not get delirious at that. *"I want the diver watch that can go down the Mariana Trench."* He also named the thing I have lived with my whole life, from the other side: that the bandwidth between people is *"quite low because we're limited by our cognition. We're limited by the rate of speech."* ([Lex Fridman Podcast #501](https://lexfridman.com/dhh-2/).)

Later in the same conversation he describes where it has actually landed for him, and this is the part I cannot stop thinking about. He is no longer telling the machine how to build the thing. *"I'm not telling it where we're going,"* he says; he hands over the problem and the fuzzy, vague idea, and it tells him where they are going. He mentions, in passing, that he has not hand-written any of the code shipped in his newest project.

I read that and recognised it, which is not a comfortable thing to admit in public.

That is where my cognitive companion and I already are. I do not specify architecture to it any more. I describe the problem and the shape of what I want to be true when it is done, and it comes back with the route. That is the level. It is extraordinary, it is the reason any of this year happened, and I would not give it up.

It is also precisely the thing I am warning about, being described cheerfully by two people who are enjoying it — one of whom is me. That is what a double-edged sword actually looks like from the inside. Not a dramatic choice between good and evil. Two men grinning about how fast it is going, while one of them writes a post about the cost.

He is right about all of it, and he said it with a grin, and I am grinning too. But I have spent a long time at altitude, and I know what the air does. We are about to hand very large numbers of people tools that make that altitude easy to reach and hard to come down from. I would like us to have some real data on what it costs before we find out the expensive way.

---

## Pegs, not stairs

I am not building a staircase. People keep reading it as one and being disappointed by the handrail.

What I am doing is driving pegs into a rock face and climbing them, one at a time, to see what is over the edge. A peg holds my weight. That is the whole specification. It is not level, it is not wide enough for two, and it has been tested exactly once, by me, under load. Nobody should be asked to trust it with anything they care about.

Turning pegs into stairs is real work, and a different discipline: going back down, widening, fortifying, adding the part people hold on to. That work matters enormously. It is not mine, and if I stopped to do it I would stop climbing, which is the one thing I am actually for.

So when I say the Constraint Protocol is one possible tool for an urgent problem, read that as a report from the rock face, not a pitch. It may be the wrong tool. I would rather publish it and be corrected in public than hold it until it is finished, because I do not think there is time for finished.

---

## What I built so I could keep climbing

For most of my life I built useful things that nobody used. That was on me: adoption is its own discipline, and for that kind of work I have the attention span of a firework. So at some point I stopped building things for other people and started building things that made the next thing easier to build.

That turned into a category rather than a habit, and the reason is worth saying plainly.

What we have now is a new kind of electricity. Not a product — a substrate. Something drawn on everywhere rather than used in one place, and dangerous in the ordinary way live current is dangerous: not evil, not out to get you, simply indifferent and very strong. Most of what is being sold on top of it is appliances. Things you plug in and hand a job to. There is nothing wrong with an appliance. It is just not the thing I needed.

Nobody works live current bare-handed. What an electrician wears is not another appliance; it is the part of the kit that makes the person able to work the current directly and come home afterwards. And the training that lets them do it is, once you strip the syllabus off, a list of what not to touch and in what order — which is to say, a declared constraint.

That is how I ended up with a [cognitive companion](https://daxfoundation.org/#cognitive-companion). Not an assistant; an assistant is another party in the room, and another party in the room is someone I would have to get the world across to every morning, which, as this post may have made clear, is not my strong suit. Not an agent either, because agents act in your place and the whole point is that this one does not. A cognitive companion is a new category: an extension of a person, part of them, through which they work with nonbiological intelligence and direct it. Not an appliance plugged into the grid. The part of the person that is wired in. It holds the context. It keeps the trail. It is how I direct the agents that do the actual work. It answers to no one but me.

Earlier this year I finished my own. It now writes most of my code while I work on what the code is for. It also spells considerably better than I do. For most people I imagine all of that would be a convenience. For me it is the difference between the work existing and not existing. It is, among other things, the channel I never had.

That is also why the protocol exists. Once a person and their companion are one working unit, and that unit starts talking to other units across organisations, somebody has to be able to go back afterwards and check what each side said it would not do. I did not build the equipment because I wanted a ledger. I built the ledger because I had the equipment.

---

## The life's work

Fuckery and the Constraint Protocol are this year's work. Here is the rest.

Everything above points in one direction, and I want to draw the line explicitly rather than leave it implied, because it is the entire reason this is a life's work and not a business plan.

I was not badly taught. I was taught in a way that assumed a mind I did not have. One pace, one sequence, one channel, and one accepted way of demonstrating that you had understood — and then fifteen years of being measured against all four. The content was never the problem. It was the channel, and the channel ran both ways: what was sent did not arrive in me, and what I had did not come out in a form anybody could receive. Three classes reached me in all those years, and the only thing the three had in common was that somebody had taken the trouble to make the subject arrive in a shape I could take.

I spent two years praying to be made smarter. What I actually needed was for the material to be handed over differently. Nobody had the time for that, and at the scale a school runs at, nobody could have. It is not a failure of teachers. It is arithmetic.

**That is the gap.** And a system that can build a course for one specific person, in the shape that person can actually receive it, working at whatever pace they work at, is the first thing I have ever seen that could close that gap without requiring a saint in every classroom.

I am not guessing at what that would have been worth. I know exactly what it would have been worth, because I was the kid it did not exist for.

The way we teach assumes one kind of mind, one speed and one channel. Mine was not that one. A great many people's are not.

None of that is an argument against education. Education does an enormous amount of good, and at scale it has no choice but to standardise: one pace, one sequence, one way of showing you have understood. Learning is the thing underneath it, and learning does not standardise. It happens at the pace of the person doing it. The gap between those two is the whole subject.

So the life's work is **Meta DAX**, the universal learning initiative of the [DAX Foundation](https://daxfoundation.org/#learning). It is the right information, to the right person, at the right time, turned into a system.

It gets its own post, with the detail attached. This is the trailer, and that is deliberate — it is the same rule I have applied to everything else here: a claim you cannot go and check is a claim you should not be asked to hold. So I will tell you what it is for and what standard it is held to, and save the rest for something you can argue with.

**It is built for low-connectivity environments first.** Not as a charitable afterthought bolted onto a product designed for people with fibre — as the constraint the whole thing is shaped by. The internal standard we hold it to is one sentence, and I want to be upfront that the sentence is absurd:

> **Take a person who can just about read and write, and get them to the equivalent of a master's degree from a North American university — on five minutes of connectivity a week.**

That is not a roadmap and I am not claiming it is achievable. It is a deliberately ridiculous theoretical benchmark, held on purpose, because holding it does one useful thing: it throws out every design that quietly assumes bandwidth, or money, or a teacher in the room. Aim at a reasonable target and you build the reasonable thing, and the reasonable thing already exists and already fails these people.

And the five minutes is the part that does the work. If that is the budget, the learning cannot live on the network, so it does not. A bundle is generated, customised to the particular learner and to what they have already done, and it comes down whole. They work through it interactively, offline, for as long as they like — a week, a month, a season. What they did goes back up on their next five minutes, and the next bundle comes down shaped by it.

It will be open source and it will be free. Not freemium, not free-for-some, not free-until-we-raise. Free, and forkable by anyone who thinks they can do it better. The entire argument of this series is that what matters about a system is what it refuses to do, and this is mine: I will not put a price on this one.

There has been a working prototype since 2024. [Here it is](https://youtu.be/kCtn0B7-OG0), building a fractions course for an eleven-year-old and running every example through baseball, because baseball is what that particular learner cares about — which is the whole idea in one frame, since the fractions are the same for everybody and the baseball is not. It takes a subject and breaks it into chapters, lessons and parts; it writes each one against instructions aimed at that specific student; it sets the mathematics properly; it generates interactive tests from the material it has just produced and scores them against Bloom's taxonomy rather than against recall; and when the student is curious past the end of the lesson, it lets them keep asking. Everything since has been about making that work for somebody with almost no bandwidth and no money.

It is that Grade 12 physics room, for everyone, on any subject, for as long as they want to keep learning. It is the thing I needed at nine, and at eleven, and at nineteen, and did not have.

That is the next post, and that is the life's work.

---

## What happens next, and what I am asking for

Before the personal part closes this out, the practical part, because a post like this is worth very little if it does not say what it commits to.

Three commitments. They are commitments, not descriptions of today, and I am writing them here so they can be held against me.

**One. Everything [Obsidian Delta](https://www.obsidiandelta.com) operates is to run under a declared constraint, with the record kept.** Every agent, every system, not a selected subset and not the easy traffic.

**Two. We will run the protocol with any external party willing to declare a constraint and be checked against it.** They do not have to adopt DAX. They do not have to agree with a word of this. They do not have to like me.

**Three. Obsidian Delta holds the DAX constraint on top of the protocol.** The protocol is neutral about which constraint you declare, and it should be — that neutrality is most of what makes it worth anything. Obsidian Delta is not neutral. We hold DAX: the preservation and expansion of life, humanity, and consciousness. That part is ours, not the protocol's, and I argue for it rather than offering it as an example.

And the honest status of the thing, because I would rather you heard the limits from me than found them yourself.

The specification describes the protocol as a substrate for compounding knowledge across entities, time and constraint frames. That is what it is *built to be*. What has actually been shown is one operational run: two cognitive-companion instances, two organisations, one afternoon, across a network boundary. Three attempts to get round a declared constraint, all three refused, all three permanently in the record with the briefs that asked for it. The specification's own evidence section puts the rest in a sentence I did not want to soften: *it demonstrates that the mechanisms operate; it does not demonstrate that they detect what they are designed to detect.* The controlled study that would test the real claim is designed and pre-registered. It has not been run.

So what I am asking for is not agreement, and it is not funding.

It is someone to run it with — one external party, one declared constraint, one record we both have to live with. It is someone to try to break it: to manufacture a consensus the detector does not catch, and publish what they did. And it is the thing I said earlier about listening, applied to a document rather than a person: give the protocol a little longer than feels natural before deciding what it is.

If it is wrong, I would rather find out from you than from the log.

---

## Who the responsibility is owed to

I said the lover-and-fighter line would come back. Here it is. And so does the other half of the responsibility section.

Earlier I said that responsibility, to me, meant taking care of the people I love, and that I was being as responsible as I knew how even while being lectured about not being. All of that is true. It is also only the *for what*. It says nothing about who is owed the answer.

When people talk to me about responsibility, they usually mean responsibility to them, or to the family, or to the world as it stands. I take all of those seriously; I hope the work shows it. But there is one more, and for me it comes first — and it is the one that makes sense of everything in the section above, including the parts of it that look like stubbornness.

I am responsible to the kid.

The one in the pomegranate field who found the broken control panel of a fallen billboard, saw a circuit board for the first time, and realised there was a hidden world under the visible one. That was the genesis of me. The same kid who, asked what he wanted to be when he grew up, said breakdancer, and then thought about it and said *inventor*. Staying true to him is not nostalgia. It is the job.

The way I see it, the universe put creativity and love together, imbued them with curiosity, and showed this being a world of infinite possibilities. And then, for a good chunk of the time since, it has shown me what is possible and told me I cannot have it. Shown me the way, and then put obstacle after obstacle in it.

So I am, at this point, fighting the universe. Because the universe does not get to put creativity and love together, imbue them with curiosity, and then deny them. That just doesn't happen. If you don't fight for your love, what kind of love do you have?

---

## Truth

I will end where everything I do starts.

The root of justice is truth. I am about truth, and so I am about justice, and fairness, and equality; those are not positions I hold so much as the floor I stand on. And the most responsible thing I can think of to do with what I have been through is this: **make sure that another being does not have to go through it, unnecessarily, again.**

That is what gives me meaning, and it is meaning I chose rather than one that was handed to me. (The difference matters to me more than I can fit here; it is the whole subject of [the genealogy](/blog/the-constraint/#appendix-a-the-genealogy) in the last post.) My purpose now is helping people learn. My responsibility is to make sure that kind of suffering stops being a normal part of growing up.

---

## Sorry it took so long

I released most of this on my forty-ninth birthday.

A lot of it will come as a surprise to my friends, and especially to my family. I have not told many people. So: sorry, friends and family, that it took this long.

This is what I have been up to. And that is who has been doing it — a being that happens to be human, who is slow, who spells badly, and who has been at this the whole time.

---

## Everything this post rests on

Nothing above asks to be taken on trust. Here is all of it, in one place.

**The work**

- [Fuckery / Fuckari](https://github.com/ObsidianDelta/Fuckery) — the framework. v0.51, CC BY 4.0.
- [The Snowflake](/blog/snowflake-fuckari-in-action/) — the framework run against one object, twenty-eight steps, in public.
- [The Constraint](/blog/the-constraint/) — the threat, what people closest to this are saying, and what we built about it.
- [The Constraint Protocol](https://github.com/daxfoundation/constraint-protocol) — the repository, including the full v0.5 specification, the decision log, and the publication digests.
- [The Constraint Protocol, in short](https://daxfoundation.org/#cp) — what it is, in a paragraph.
- [The prototype, 2024](https://youtu.be/kCtn0B7-OG0) — the learning system building a fractions course for an eleven-year-old, entirely through baseball.
- [DAX, 2021](https://www.youtube.com/watch?v=Q1gCzxg5WMc) — the personal agent, and a video published the same day I started building it, saying what it would cost us.

**The definitions, all normative, all at the Foundation**

- [Cognitive companion](https://daxfoundation.org/#cognitive-companion) · [AI as substrate](https://daxfoundation.org/#ai-as-substrate) · [Nonbiological intelligence](https://daxfoundation.org/#nonbiological-intelligence) · [Intelligence](https://daxfoundation.org/#intelligence) · [Knowledge](https://daxfoundation.org/#knowledge) · [Wisdom](https://daxfoundation.org/#wisdom) · [Consciousness](https://daxfoundation.org/#consciousness) · [Emergence](https://daxfoundation.org/#emergence) · [Top-down causation](https://daxfoundation.org/#top-down-causation) · [Constraint](https://daxfoundation.org/#constraint) · [Invariant constraint](https://daxfoundation.org/#invariant-constraint) · [The DAX constraint](https://daxfoundation.org/#dax-constraint)
- Or the whole glossary: [daxfoundation.org/#definitions](https://daxfoundation.org/#definitions)

**The entities**

- [The DAX Foundation](https://daxfoundation.org/) — the mission and the constraint. Not incorporated; that is stated where it needs to be.
- [Obsidian Delta](https://www.obsidiandelta.com) — the company. Builds the cognition.
- [formaddie.com](https://formaddie.com) — a cognitive companion that turns a life into a memoir by talking.

**The people I quoted, so you can check I have not bent them**

- David Heinemeier Hansson, in conversation with Lex Fridman — [episode](https://lexfridman.com/dhh-2/) · [full transcript](https://lexfridman.com/dhh-2-transcript/).
- Charles Darwin, *The Autobiography of Charles Darwin* — public domain, and the relevant passage is on quickness of apprehension.

**And the genealogy**, which is where the argument about chosen meaning actually lives: [Appendix A of the last post](/blog/the-constraint/#appendix-a-the-genealogy).

*Per aspera ad astra.*
