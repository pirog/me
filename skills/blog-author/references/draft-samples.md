# draft samples

these are complete fictional articles for reviewing [piro-blog-author](../SKILL.md), not reports of
pirog's work or approved voice examples. both use the same source brief so structure does not get to
improve the facts. [piro-voice](../../voice/SKILL.md) remains the expression owner.

## shared fictional brief

- **idea:** a smaller intake form is worth investigating, but a promising observation is not a verdict.
- **reader:** someone building or maintaining a product's intake experience.
- **takeaway:** distinguish what changed, what was observed, and what still needs testing.
- **supplied scenario:** an imaginary team reduced an intake form from eight fields to four.
  completion was 40% before the change and 55% during a one-week pilot. there was no control group.
- **unknown:** sample size, measurement definition, traffic mix, field identities, implementation,
  user feedback, downstream quality, and causes of the observed difference.
- **support:** only this fictional brief. no external research, real customer story, or interviews.

## technical draft: four fewer fields, one unanswered question

_fictional worked example; the team and results below are invented for reviewing this draft._

### start with the question, not the graph

say you're looking at an intake form and wondering whether it asks too much before someone can get
started. the tempting move is to remove a few fields, watch completion, and declare victory if the
number goes up. nice little experiment. possibly even a useful change. but the implementation and the
explanation are two different things, and the second one needs a bit more care.

in this imaginary case, a team reduced its form from eight fields to four. completion was 40% before
the change and 55% during a one-week pilot. that's enough to ask a better question: is the shorter form
helping people finish, and what would establish that? it's not enough to announce that four fields
were the problem all along.

### separate the change from the observation

the approach here is straightforward: reduce what the form asks, then compare the reported completion
rates. fewer fields might mean less work for the person filling it out. that's a plausible explanation,
not an observed mechanism. the brief doesn't tell us which fields disappeared, whether they were
required, or what else happened during that week.

before taking the comparison further, i'd want to know what “completion” means in both periods. does
the denominator count the same thing? are the periods comparable? those are proposed investigation
questions, not checks this fictional team is known to have performed. without the answers, dressing
the comparison up as a validated experiment would mostly validate our enthusiasm.

### work through the actual numbers

here's the entire numerical example, without supplying any missing traffic:

| measure             | before | pilot |
| ------------------- | ------ | ----- |
| form fields         | 8      | 4     |
| reported completion | 40%    | 55%   |

the form has four fewer fields. the reported completion rate is 15 percentage points higher:
`55% - 40% = 15 percentage points`. that's not the same as saying “15% more people completed it.”
we don't have counts, so we can't report how many more people finished, or even whether more people
finished in absolute terms. rates and totals answer different questions.

there's also no supplied sample size, and no control group. the pilot lasted one week. those limits
belong beside the comparison, not buried below a confident conclusion. the numbers describe the
fictional observation; they don't identify its cause or tell us how stable it is.

### a shorter form still has a job to do

completion matters, but an intake form isn't necessarily useful just because someone reaches the end.
if removed information is needed to handle the request, collecting it later could move work rather
than remove it. that's a tradeoff to investigate, not a downstream failure reported in this case.

one alternative worth considering is asking only what is needed for the next decision, then requesting
additional information when it becomes relevant. another is leaving the form alone until the team
understands what each field does. neither approach wins by having a nicer field count. the right
comparison includes what the person can accomplish and what happens to their request afterward.

### keep the result small enough to be true

the useful next step would be to inspect the missing measurement details and plan a comparison that
better separates the form change from other explanations. where appropriate, that might include a
controlled comparison and a check on downstream request quality. none of that has happened in the
supplied scenario.

for now, the defensible takeaway is modest: a four-field form coincided with a higher reported
completion rate during a one-week pilot. promising? sure. proof that removing four fields caused the
increase? nope. keep the idea moving, but let the next investigation earn the stronger claim.

## product/story draft: let people get to the thing

_fictional product story; this is not pirog's experience or a real customer case study._

### before the useful part

imagine wanting help with something and finding a form between you and the person who can help.
some questions make sense immediately. others might make perfect sense to the team receiving the
request while leaving you wondering why you need to answer them right now. you're trying to get to
the useful part. the form is still introducing itself.

that's an imagined reader situation, not a customer interview. it does frame a practical product
question, though: what does someone really need to provide before the next useful thing can happen?
not everything a team might eventually want to know. not everything that would look tidy in a record.
what is needed now?

### a smaller first ask

in this fictional case, a team tried a smaller ask. it reduced an intake form from eight fields to
four. completion was 40% before the change and 55% during a one-week pilot.

the change is easy to picture: someone encounters a form with four fewer fields. the brief doesn't
tell us what those fields were, how they were implemented, or how the person felt about them. i'd
rather leave that space empty than invent a delightful customer quote to make the story land.

what makes the change interesting isn't a general principle that fewer fields always wins. it's the
possibility that the product can ask less before providing value. if that's true here, the team may
have found a better starting point for the conversation. if it isn't, the lower field count is just a
lower field count. useful distinction.

### a promising number, not an origin story

the reported completion rate moved from 40% to 55%, a difference of 15 percentage points. that's a
reason to pay attention. it's also exactly where a neat story can start outrunning its evidence.

there was no control group, the pilot lasted one week, and the sample size wasn't supplied. we don't
know whether the people arriving were comparable, whether completion was measured consistently, or
what else changed. those aren't minor qualifications to tuck away after the exciting bit. they change
what the team can honestly say it learned.

the supported version is that the shorter form and higher reported completion appeared together in
this fictional pilot. the unsupported version is that the team discovered the cause of abandonment
and fixed it. one is a useful lead. the other is a case study the available material hasn't earned.

### don't make the next person pay for the improvement

there's another question the completion number can't answer: what happened after submission? perhaps
four fields would give the team everything it needs to take the next step. perhaps removing information
would require another round of questions. neither outcome is provided here.

that's why i'd look at the whole request, not only the moment someone submits it. a proposed follow-up
could examine whether the shorter form makes it easier to begin without making the next step harder.
it could also ask people which information felt necessary or confusing. those would be new sources of
evidence, not details we can retrofit into this story.

the product tradeoff isn't “ask questions” versus “never ask questions.” it's when to ask, what the
answer enables, and who carries the work. a smaller first step could be worthwhile even if some
information still needs collecting later. it just needs to be judged as that choice, not sold as
friction disappearing into hyperspace.

### what i'd try next

if you're facing a similar decision, start by asking what each field enables before the first useful
response. then decide what comparison would tell you whether a smaller ask helps, including what
happens to the request afterward. don't promise the same numerical result; this fictional week can't
supply one for your product.

the lesson here isn't to cut every form in half. it's to question what you're asking people to do,
try a bounded change when it makes sense, and keep the explanation attached to the evidence. a
promising observation can be enough to justify another look. it doesn't need a victory parade.

## review status

both drafts are unreviewed by pirog. for **each** draft: does this sound like you, and would this
structure help you write something useful? point to wording that feels wrong or a section that does
not earn its space. the shared voice's earlier short-sample approval does not approve these articles.

check factual support separately: both must retain the fictional label, eight-to-four change,
40%-to-55% comparison, one-week window, missing sample size, and absence of a control group without
claiming causation. record actual review and any resulting revisions on the task/PR before calling
the human-review requirement satisfied.
