# 4. Release checklist: SMS code flow

Run on the release candidate build in TEST-2 with a fresh test customer (TC-014) and a transfer of 200,000 KZT, unless the item says otherwise. Every item traces to a state or boundary from the Week 3 design.

| # | Check | Traces to | ✓ |
|---|---|---|:-:|
| 1 | 100,000 KZT executes without a code; 100,001 KZT shows the code screen | REQ-3, threshold boundary | [ ] |
| 2 | The code arrives in the stub inbox within 30 s and has exactly 6 digits | REQ-3 | [ ] |
| 3 | The correct code entered within 120 s executes the transfer; balance debited once | REQ-4, W1 → Confirmed | [ ] |
| 4 | Two wrong codes, then the correct one: transfer executed on the third attempt | REQ-4, W3 → Confirmed | [ ] |
| 5 | A third wrong code cancels the transfer; the real code entered afterwards is rejected | REQ-4, W3 → Blocked, Blocked + correct | [ ] |
| 6 | A code entered after 130 s is rejected; nothing is debited | REQ-4, Expired + correct | [ ] |
| 7 | *Confirm* tapped twice quickly: exactly one debit and one statement entry | Confirmed + correct (double submit) | [ ] |
| 8 | After a successful confirmation, waiting past 120 s on the success screen does not cancel or reverse the transfer | Confirmed + 120 s | [ ] |
| 9 | Pressing *Back* from the code screen does not execute the transfer | Invalid exit from Waiting | [ ] |
| 10 | No code is sent for an invalid amount (500,001) or an exceeded limit | REQ-1, REQ-2 before REQ-3 | [ ] |
| 11 | After confirmation, *Used today* increases by exactly the transfer amount | REQ-2 | [ ] |
| 12 | The SMS text is correct in Kazakh, Russian and English | Localisation | [ ] |
