# 2. Test cases

Twelve test cases from the Week 3 design work. All of them run in TEST-2 on app 4.11.0 (2291). Test customers and observation points are defined in the [test plan](01-test-plan.md#environment-and-data).

**Common steps "open the transfer form"**, referred to below as *Open form (customer)*:
1. Log in to the app as the given test customer.
2. Tap *Transfers → Between my accounts*.
3. *From*: the customer's current account. *To*: the customer's deposit.

**Each test is independent:** the customer's data must be reset to the values in the test plan before every test.

| ID | Title | Traces to | Technique |
|---|---|---|---|
| TR-AMT-001 | 99 KZT is rejected | REQ-1 | BVA |
| TR-AMT-002 | 100 KZT executes without a code | REQ-1, REQ-3 | BVA |
| TR-AMT-003 | 100,000 KZT executes without a code | REQ-1, REQ-3 | BVA |
| TR-AMT-004 | 100,001 KZT requires an SMS code | REQ-3 | BVA |
| TR-AMT-005 | 500,000 KZT is accepted and requires a code | REQ-1, REQ-3 | BVA |
| TR-AMT-006 | 500,001 KZT is rejected | REQ-1 | BVA |
| TR-AMT-007 | A decimal amount is rejected | REQ-1 | EP |
| TR-DAY-001 | A transfer over the daily limit is rejected | REQ-2 | Decision table |
| TR-DAY-002 | Invalid amount and exceeded limit: the amount error wins | REQ-5 | Decision table |
| TR-OTP-001 | Correct code on the third attempt | REQ-4 | State transition |
| TR-OTP-002 | Three wrong codes cancel the transfer | REQ-4 | State transition |
| TR-OTP-003 | Code entered after expiry is rejected | REQ-4 | State transition (invalid) |

---

### TR-AMT-001: 99 KZT is rejected
- **Traces to:** REQ-1 · **Technique:** 3-value BVA, lower boundary (invalid side) · **Priority:** High
- **Preconditions:** TC-014, balance 1,000,000 KZT, daily total 0
- **Steps:**
  1. *Open form (TC-014)*
  2. Enter `99` in *Amount*
  3. Tap *Continue*
- **Expected result:** the transfer is not submitted; an amount error is shown; no SMS code screen; no SMS in the stub inbox
- **Postconditions:** balance 1,000,000; no new statement entry; *Used today* 0

### TR-AMT-002: 100 KZT executes without a code
- **Traces to:** REQ-1, REQ-3 · **Technique:** 3-value BVA, lower boundary (valid side) · **Priority:** High
- **Preconditions:** TC-014, balance 1,000,000 KZT, daily total 0
- **Steps:**
  1. *Open form (TC-014)*
  2. Enter `100` in *Amount*
  3. Tap *Continue*
- **Expected result:** the transfer executes immediately; no SMS code screen; success screen shown
- **Postconditions:** balance 999,900; one statement entry of −100 KZT; deposit +100 KZT; *Used today* 100

### TR-AMT-003: 100,000 KZT executes without a code
- **Traces to:** REQ-1, REQ-3 · **Technique:** 3-value BVA, SMS threshold (no-code side) · **Priority:** High
- **Preconditions:** TC-014, balance 1,000,000 KZT, daily total 0
- **Steps:**
  1. *Open form (TC-014)*
  2. Enter `100000` in *Amount*
  3. Tap *Continue*
- **Expected result:** the transfer executes immediately; no SMS code screen; no SMS in the stub inbox
- **Postconditions:** balance 900,000; one statement entry of −100,000 KZT; *Used today* 100,000

### TR-AMT-004: 100,001 KZT requires an SMS code
- **Traces to:** REQ-3 · **Technique:** 3-value BVA, SMS threshold (code side) · **Priority:** High
- **Preconditions:** TC-014, balance 1,000,000 KZT, daily total 0
- **Steps:**
  1. *Open form (TC-014)*
  2. Enter `100001` in *Amount*
  3. Tap *Continue*
- **Expected result:** the SMS code screen appears; a 6-digit code arrives in the stub inbox for +7 700 000 0014; nothing is debited yet
- **Postconditions:** balance 1,000,000; no statement entry; transfer waiting for the code. Log out without entering the code.

### TR-AMT-005: 500,000 KZT is accepted and requires a code
- **Traces to:** REQ-1, REQ-3 · **Technique:** 3-value BVA, upper boundary (valid side) · **Priority:** High
- **Preconditions:** TC-014, balance 1,000,000 KZT, daily total 0
- **Steps:**
  1. *Open form (TC-014)*
  2. Enter `500000` in *Amount*
  3. Tap *Continue*
  4. Read the code from the stub inbox and enter it
- **Expected result:** after step 3, the SMS code screen appears with no amount error; after step 4, the transfer executes and a success screen is shown
- **Postconditions:** balance 500,000; one statement entry of −500,000 KZT; *Used today* 500,000

### TR-AMT-006: 500,001 KZT is rejected
- **Traces to:** REQ-1 · **Technique:** 3-value BVA, upper boundary (invalid side) · **Priority:** High
- **Preconditions:** TC-014, balance 1,000,000 KZT, daily total 0
- **Steps:**
  1. *Open form (TC-014)*
  2. Enter `500001` in *Amount*
  3. Tap *Continue*
- **Expected result:** the transfer is not submitted; an amount error is shown; no SMS code screen; no SMS in the stub inbox
- **Postconditions:** balance 1,000,000; no statement entry; *Used today* 0

### TR-AMT-007: A decimal amount is rejected
- **Traces to:** REQ-1 ("whole tenge only") · **Technique:** EP, invalid partition "not an integer" · **Priority:** Medium
- **Preconditions:** TC-014, balance 1,000,000 KZT, daily total 0
- **Steps:**
  1. *Open form (TC-014)*
  2. Type `1000.50` in *Amount*
  3. Tap *Continue*
- **Expected result:** the transfer is not submitted. Either the decimal separator cannot be typed (the field then shows `100050`, which must **not** be submitted as 100,050 without the user noticing), or an amount format error is shown.
- **Postconditions:** balance 1,000,000; no statement entry; *Used today* 0
- **Note:** the error text is not specified in the brief (see Q-4).

### TR-DAY-001: A transfer over the daily limit is rejected
- **Traces to:** REQ-2 · **Technique:** decision table, collapsed column "amount valid, limit exceeded" · **Priority:** High
- **Preconditions:** TC-016, balance 2,000,000 KZT, daily total 950,000
- **Steps:**
  1. *Open form (TC-016)*
  2. Enter `60000` in *Amount*: valid on its own, but 950,000 + 60,000 = 1,010,000
  3. Tap *Continue*
- **Expected result:** the transfer is not submitted; a daily limit error is shown; no SMS code screen
- **Postconditions:** balance 2,000,000; no statement entry; *Used today* 950,000

### TR-DAY-002: Invalid amount and exceeded limit: the amount error wins
- **Traces to:** REQ-5 · **Technique:** decision table, collapsed column "amount invalid" · **Priority:** High
- **Preconditions:** TC-015, balance 2,000,000 KZT, daily total 600,000
- **Steps:**
  1. *Open form (TC-015)*
  2. Enter `600000` in *Amount*: above 500,000, and 600,000 + 600,000 is above the daily limit
  3. Tap *Continue*
- **Expected result:** the **amount** error is shown; the daily limit error is **not** shown; no SMS code screen
- **Postconditions:** balance 2,000,000; no statement entry; *Used today* 600,000

### TR-OTP-001: Correct code on the third attempt
- **Traces to:** REQ-4 · **Technique:** state transition, path W1 → W2 → W3 → Confirmed · **Priority:** High
- **Preconditions:** TC-014, balance 1,000,000 KZT, daily total 0
- **Steps:**
  1. *Open form (TC-014)*, enter `200000`, tap *Continue*
  2. Read the real code from the stub inbox. Make a wrong code by changing its last digit (e.g. `483915` → `483916`).
  3. Enter the wrong code
  4. Enter the wrong code again
  5. Enter the real code. Finish steps 3–5 within 120 s of step 1.
- **Expected result:** after steps 3 and 4, a wrong-code message is shown and the code screen stays open; after step 5, the transfer executes and a success screen is shown
- **Postconditions:** balance 800,000; exactly **one** statement entry of −200,000 KZT; *Used today* 200,000

### TR-OTP-002: Three wrong codes cancel the transfer
- **Traces to:** REQ-4 · **Technique:** state transition, path W1 → W2 → W3 → Blocked · **Priority:** High
- **Preconditions:** TC-014, balance 1,000,000 KZT, daily total 0
- **Steps:**
  1. *Open form (TC-014)*, enter `200000`, tap *Continue*
  2. Make a wrong code as in TR-OTP-001
  3. Enter the wrong code three times, within 120 s
  4. If the code field is still available, enter the **real** code
- **Expected result:** after the third wrong code, the transfer is cancelled and a cancellation message is shown; in step 4 the real code is not accepted
- **Postconditions:** balance 1,000,000; no statement entry; *Used today* 0

### TR-OTP-003: Code entered after expiry is rejected
- **Traces to:** REQ-4 · **Technique:** state transition, invalid event "correct code" in state Expired · **Priority:** High
- **Preconditions:** TC-014, balance 1,000,000 KZT, daily total 0
- **Steps:**
  1. *Open form (TC-014)*, enter `200000`, tap *Continue*. Start a stopwatch when the code screen appears.
  2. Read the real code from the stub inbox and do not enter it
  3. Wait until the stopwatch shows 130 s. The extra 10 s keep the test clear of the exact 120 s boundary (see Q-5).
  4. Enter the real code
- **Expected result:** the code is rejected because it has expired; the transfer is not executed
- **Postconditions:** balance 1,000,000; no statement entry; *Used today* 0
