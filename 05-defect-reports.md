# 5. Defect reports

> These are **mock defects** written for the assignment. They show how defects in the risk areas of the test plan would be reported. DEF-103 comes from a missing requirement.

---

## DEF-101: Transfers: a transfer above 100,000 KZT is debited twice when *Confirm* is tapped twice quickly

| Field | Value |
|---|---|
| **Environment** | TEST-2 · iOS 18.2, iPhone 13 · app 4.11.0 (2291) · network: Wi-Fi |
| **Preconditions** | Test customer TC-014, balance 1,000,000 KZT, daily total 0 |
| **Reproducibility** | 4 of 5 attempts (needs two taps within ~0.5 s) |
| **Severity** | Critical: money debited twice from a customer's account |
| **Priority** | High: blocks the release (exit criterion 2) |
| **Traces to** | REQ-4 · checklist item 7 · risk R-1 |
| **Status** | New |

**Steps to reproduce**
1. Log in as TC-014.
2. Tap *Transfers → Between my accounts*.
3. *From*: current account ending 1102; *To*: deposit ending 4417.
4. Enter `200000` and tap *Continue*.
5. Read the code from the SMS stub inbox and enter it.
6. Tap *Confirm* twice in quick succession.
7. Open *Accounts → current account ending 1102 → Statement*.

**Expected result:** one transfer of 200,000 KZT; balance 800,000; *Used today* 200,000.

**Actual result:** two statement entries of −200,000 KZT with the same timestamp; balance 600,000; *Used today* 400,000. The deposit shows +400,000.

**Evidence:** screen recording `DEF-101.mp4`; request IDs `7f3a…c21` and `7f3a…c22` (two `POST /transfers/confirm` calls with the same transfer ID).

---

## DEF-102: Limits: the daily limit resets at 05:00 Almaty time instead of midnight

| Field | Value |
|---|---|
| **Environment** | TEST-2 · Android 15, Pixel 7 · app 4.11.0 (2291) · server time zone: UTC |
| **Preconditions** | Test customer TC-016, balance 2,000,000 KZT. Transfers totalling 950,000 KZT made the previous day; *Used today* shows 950,000 before midnight |
| **Reproducibility** | 2 of 2 nights (needs the real clock between 00:00 and 05:00 Almaty time) |
| **Severity** | High: customers cannot use their limit for 5 hours, and the limit can be exceeded around 05:00 |
| **Priority** | High: affects every customer every night |
| **Traces to** | REQ-2 · risk R-2 |
| **Status** | New |

**Steps to reproduce**
1. At 00:30 Almaty time (UTC+5), log in as TC-016.
2. Open *Profile → Limits* and note *Used today*.
3. Tap *Transfers → Between my accounts*; *From*: current account ending 1304; *To*: deposit ending 4619.
4. Enter `60000` and tap *Continue*.

**Expected result:** *Used today* shows 0 after midnight Almaty time, and the 60,000 KZT transfer executes.

**Actual result:** *Used today* still shows 950,000, and the daily limit error is shown. Repeated at 05:05 Almaty time (00:05 UTC): *Used today* shows 0 and the transfer executes.

**Evidence:** screenshots of *Profile → Limits* at 00:30 and 05:05 with the device clock visible; request IDs for both attempts.

---

## DEF-103: Transfers: with insufficient balance, the SMS code is sent and the transfer fails only after the code with a generic error

| Field | Value |
|---|---|
| **Environment** | TEST-2 · iOS 18.2, iPhone 13 · app 4.11.0 (2291) |
| **Preconditions** | Test customer TC-014 with the balance set to 150,000 KZT, daily total 0 |
| **Reproducibility** | 5 of 5 attempts |
| **Severity** | Medium: no money is lost, but the customer gets an SMS and a misleading error |
| **Priority** | Medium: fix together with the answer to Q-1 |
| **Traces to** | **No requirement:** insufficient balance is not specified (traceability matrix, Q-1) |
| **Status** | New: may be reclassified as a requirement change during triage |

**Steps to reproduce**
1. Log in as TC-014 (balance 150,000).
2. Tap *Transfers → Between my accounts*; *From*: current account ending 1102; *To*: deposit ending 4417.
3. Enter `200000` and tap *Continue*.
4. Read the code from the SMS stub inbox and enter it.

**Expected result:** not specified in the brief. The reasonable expectation: the balance is checked before the code is sent, an insufficient-balance error is shown in step 3, and no SMS is sent.

**Actual result:** in step 3 the code screen appears and an SMS is sent. After step 4: "Something went wrong. Try again later." No debit; balance 150,000.

**Evidence:** screen recording `DEF-103.mp4`; SMS stub inbox entry; request ID for the failed confirmation.
