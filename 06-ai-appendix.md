# 6. AI appendix (Level 1)

## Tools used

| Tool                                           | Used for                                                                                                    |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Claude (Anthropic), one chat session           | Reading the Week 3 and Week 4 slides; reviewing my Week 3; drafting this documentation pack (files 01–05) |
| Model used for the Week 3 comparison: Opus 5.5 | The slide-42 prompt run on the brief in a fresh chat, for the Week 3 comparison                             |

## Prompts used

**Prompt 1** (Claude, with both lecture decks attached):

> крч, прочитай все две презентаций потом начнем работу

**Prompt 2** (Claude, with my Week 3 sheet attached):

> Что я сделал на третьей неделе

**Prompt 3** (Claude): the assignment text from slide 38, pasted as is:

> A documentation pack for the money transfer feature, in your course repository, as Markdown. 1. A one-page test plan section … 6. AI appendix (Level 1): prompts used, raw output, what you changed and why.

**Prompt 4** (fresh chat, Week 3 comparison): the prompt from slide 42 with the brief pasted in.

## Raw output

- **Files 01–05 as Claude generated them:** commit `[hash]`, "Raw AI output for Week 4 pack". Every later commit is my change, so `git diff [hash] HEAD` shows exactly what I changed.
- **Week 3 comparison:** the raw model output is in `week3/Week3_AI_Output` (spreadsheet as generated).

## What I changed and why

| File / section | What the AI wrote | What I changed | Why |
| -------------- | ----------------- | -------------- | --- |
| [fill in]      |                   |                |     |
| [fill in]      |                   |                |     |
| [fill in]      |                   |                |     |

## What I verified myself before submitting

- [ ] Every test case re-read step by step: can someone run it without asking me anything? (The grading follows one test case exactly as written.)
- [ ] Test data (customers, accounts, balances) is consistent between the test plan, the test cases and the defect reports.
- [ ] Each expected result follows from REQ-1 … REQ-5. Anything that does not is marked as an assumption or as a question to the analyst.
- [ ] Severity and priority in the defect reports are my own decisions, not the model's.
- [ ] Defect reports are marked as mock: no invented step is presented as something I really did.
