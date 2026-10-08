# 1. Test plan: money transfer between own accounts

| | |
|---|---|
| Release | Mobile app 4.11.0 (build 2291) |
| Feature | Transfer between own accounts with SMS confirmation |
| Test basis | REQ-1 … REQ-5 (below) |
| Author / date | Zhanserik Amangeldi · October 2026 |

## Test basis

| ID | Requirement |
|---|---|
| REQ-1 | Amount 100 – 500,000 KZT per transfer, whole tenge only |
| REQ-2 | Daily limit 1,000,000 KZT across all transfers, reset at midnight Almaty time (UTC+5) |
| REQ-3 | Transfers above 100,000 KZT require a 6-digit SMS code |
| REQ-4 | The code is valid for 120 seconds; three wrong attempts cancel the transfer |
| REQ-5 | If the amount and the daily limit are both violated, the amount error is shown |

## Scope

**In scope**
- Amount validation: range, whole tenge, empty and non-numeric input
- Daily limit check and the amount-error priority (REQ-5)
- SMS confirmation flow: correct code, wrong attempts, expiry, events after the transfer is finished
- Effect of every transfer on the balance, the statement and the daily total

**Out of scope**
- Transfers to other customers, other banks or cards
- Non-KZT accounts, fees, exchange rates
- SMS delivery time from the real provider (a stub is used in TEST-2)
- Performance, load and penetration testing
- Insufficient balance, code resend, and how cancelled transfers count toward the daily limit: **not specified in the brief**. Sent to the analyst as Q-1 … Q-3 (see the [traceability matrix](03-traceability-matrix.md)).

## Approach

- **Level and type:** system testing, functional, black-box, executed manually in TEST-2.
- **Techniques (Week 3 design):** equivalence partitioning and 3-value boundary value analysis for the amount; a decision table for approval; state transition testing for the SMS code at valid-transitions coverage, plus the three most dangerous invalid transitions.
- **Regression:** the 13 test cases become the regression suite for this feature and are the first candidates for automation (Week 5).
- **Release check:** the [SMS release checklist](04-sms-release-checklist.md) is run on the release candidate build.

## Environment and data

- **Environment:** TEST-2, app 4.11.0 (2291) on iOS 18.2 and Android 15.
- **SMS:** the code is read from the SMS stub inbox in TEST-2 (*SMS stub → Inbox*, filtered by the customer's phone number).
- **Where results are observed:**
  - balance: *Accounts* screen
  - transfer record: *Accounts → account → Statement*
  - daily total: *Profile → Limits → Used today*
- **Test customers:** CUST-014, CUST-015 and CUST-016, reset by the test data team before each run. Their accounts, balances and daily totals are listed at the top of the [test cases](02-test-cases.md#test-customers).

## Entry criteria

1. Build 4.11.0 (2291) deployed to TEST-2, and the smoke test passes: login, *Accounts* screen opens.
2. Test customers CUST-014, CUST-015 and CUST-016 loaded with the balances and daily totals listed in the [test cases](02-test-cases.md#test-customers).
3. The SMS stub inbox shows codes for the test phone numbers.

## Exit criteria

1. All 13 planned test cases executed. Any test that is still blocked is listed with its reason.
2. Zero open defects of severity Critical or High, or each open one accepted in writing by the product owner.
3. The [SMS release checklist](04-sms-release-checklist.md) is fully ticked on the release candidate build.
4. Questions Q-1 … Q-3 are answered, or their risk is accepted in writing and recorded in the test completion report.

## Top three product risks

| # | Risk | Impact | Mitigation in this plan |
|---|---|---|---|
| R-1 | A confirmed transfer executes twice: double tap or network retry | Customer loses money; regulatory incident | Checklist item 7; DEF-101 |
| R-2 | The daily limit resets at UTC midnight (05:00 Almaty) instead of Almaty midnight | Customers blocked for 5 hours or allowed to exceed the limit | TR-DAY-003, run at real midnight (project risk below); DEF-102 |
| R-3 | A code still works after expiry or after three wrong attempts | Time limit and brute-force protection bypassed | TR-OTP-002, TR-OTP-003; checklist items 5–6 |

**Project risk:** TEST-2 has no way to move the server clock, so the midnight reset (REQ-2) can only be tested at real midnight. This needs a tester on shift or a clock-control tool.
