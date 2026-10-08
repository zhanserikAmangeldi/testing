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

- **Files 01–05 as Claude generated them:** commit `7e8ddad`, "Raw AI output". Every later commit is my change, so `git diff 7e8ddad HEAD` shows exactly what I changed.

## What I changed and why

| File / section | What the AI wrote | What I changed | Why |
|---|---|---|---|
| 01-test-plan.md, 02-test-cases.md, 05-defect-reports.md: test customers | Test customers named TC-014, TC-015, TC-016 | Renamed to CUST-014, CUST-015, CUST-016 in all files | "TC" normally means "test case"; one ID must not mean two different things |
| 03-traceability-matrix.md: REQ-2 row | "Midnight reset is not covered", while DEF-102 reports a defect in exactly that behaviour | Coverage changed to "found during an exploratory session at real midnight, no formal test case"; added TR-DAY-003 for the reset | A defect found in an area the matrix calls uncovered means the traceability is incomplete |
| 02-test-cases.md: TR-OTP-001 expected result | "A wrong-code message is shown and the code screen stays open" | "The code screen stays open; the transfer is not executed" | The brief does not say that a message is shown; this is the same invented behaviour I criticised the AI for in the Week 3 comparison (T2, T4) |
| 02-test-cases.md: TR-AMT-007 | Expected result with two branches: "either the decimal separator cannot be typed, or a format error is shown" | Replaced with the empty-field test: an empty *Amount* is rejected | An expected result with two acceptable outcomes is hard to fail; Week 3 rule: "specific enough to fail" |
| 01-test-plan.md: length | About 750 words, including the test customer table | Moved the test customer table to the top of 02-test-cases.md | The assignment asks for a one-page test plan section; the data is needed where the tests are run |
| 04-sms-release-checklist.md: items 2 and 9 | "Code arrives within 30 s" and "Back from the code screen does not execute the transfer" | Marked as "Assumption, not in the brief" | Neither behaviour is in the brief; a checklist item must trace to a requirement or be labelled as an assumption |
| 02-test-cases.md: TR-AMT-004 postconditions | "Transfer waiting for the code. Log out without entering the code." | Added "Reset CUST-014 after the test" | The pending transfer may count toward the daily limit (Q-3 is open) and break the next test; test cases must be independent |
| 05-defect-reports.md: DEF-103 severity | Severity Medium | Raised to High | Severity is the tester's decision, not the model's. Every customer with an insufficient balance gets an SMS and a misleading error, so the bank loses customers' trust |
| 02-test-cases.md: all negative tests | "An amount error is shown" | Added "(text not specified, see Q-4)" | Tells the person running the test that the exact text is an open question, not something they missed |

