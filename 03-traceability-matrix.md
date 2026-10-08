# 3. Traceability matrix

Status at the time of writing: test cases designed, not executed yet. DEF-101 … DEF-103 are mock defects written for this assignment.

## Requirements → test cases

| Requirement | Test cases | Technique | Coverage | Related defects |
|---|---|---|---|---|
| REQ-1 Amount 100 – 500,000, whole tenge | TR-AMT-001, 002, 003, 005, 006, 007 | EP + 3-value BVA | Covered: all four range boundaries and the decimal partition. Not covered: 98, 101, 499,999, 500,002, and empty / non-numeric input (left out to stay within 12 tests) | — |
| REQ-2 Daily limit 1,000,000, reset at midnight Almaty time | TR-DAY-001 | Decision table | **Partly covered.** The limit check is covered. The **midnight reset is not covered**: TEST-2 cannot move the server clock (project risk in the test plan) | DEF-102 |
| REQ-3 SMS code above 100,000 | TR-AMT-002, 003, 004, 005 | 3-value BVA | Covered on both sides of the threshold (100,000 / 100,001) | — |
| REQ-4 Code valid 120 s; 3 wrong attempts cancel | TR-OTP-001, 002, 003 | State transition | Partly covered: 4 of the 7 valid-transition paths (TR-OTP-001, TR-OTP-002; TR-AMT-005 takes W1 → Confirmed; TR-OTP-003 passes W1 → Expired) plus one invalid transition (Expired + correct code). The other paths and invalid transitions are in the [SMS checklist](04-sms-release-checklist.md) | DEF-101 |
| REQ-5 Amount error shown first | TR-DAY-002 | Decision table | Covered | — |
| **Insufficient balance** | — | — | **NOT COVERED: no requirement exists.** The brief does not say what happens, so no expected result can be written (Q-1) | DEF-103 |
| **Code resend** | — | — | **NOT COVERED:** not specified whether resend exists or whether it resets the timer and attempts (Q-2) | — |
| **Cancelled or pending transfers vs the daily limit** | — | — | **NOT COVERED:** not specified whether they count toward *Used today* (Q-3) | — |

## Test cases → requirements

| Test case | REQ-1 | REQ-2 | REQ-3 | REQ-4 | REQ-5 |
|---|:-:|:-:|:-:|:-:|:-:|
| TR-AMT-001 | ✔ | | | | |
| TR-AMT-002 | ✔ | | ✔ | | |
| TR-AMT-003 | ✔ | | ✔ | | |
| TR-AMT-004 | | | ✔ | | |
| TR-AMT-005 | ✔ | | ✔ | | |
| TR-AMT-006 | ✔ | | | | |
| TR-AMT-007 | ✔ | | | | |
| TR-DAY-001 | | ✔ | | | |
| TR-DAY-002 | | | | | ✔ |
| TR-OTP-001 | | | | ✔ | |
| TR-OTP-002 | | | | ✔ | |
| TR-OTP-003 | | | | ✔ | |

## Open questions to the analyst

| ID | Question | Blocks |
|---|---|---|
| Q-1 | What happens when the balance is lower than the amount? Which error is shown, and is it checked before or after the SMS code? | Insufficient-balance tests; DEF-103 triage |
| Q-2 | Can the customer request a new code? Does that reset the 120 s timer and the attempt counter? | Resend tests |
| Q-3 | Do cancelled, expired or pending transfers count toward the daily limit? | Limit tests after a cancelled transfer |
| Q-4 | What are the exact error texts (amount, format, daily limit, wrong code, expired, cancelled)? | Exact assertions in all negative tests |
| Q-5 | Does the 120 s count from code generation or from SMS delivery, and is a code entered at exactly 120 s valid? | Timer boundary test |
| Q-6 | A transfer is submitted at 23:59:50 and confirmed after midnight. Which day's limit does it use? | Midnight tests for REQ-2 |
