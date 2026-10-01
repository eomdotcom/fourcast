# Photosphere — FourCast

Adviser-facing proof-of-concept for INFOMGMT 399 (Project 2: early-warning tool for student engagement).

Photosphere places students in three zones (Calm Orbit, Steady Star, Solar Flare Zone) using a
transparent, rule-based score from early-semester engagement data. Each student page explains
in plain language which factors contributed. A light fairness check shows how demographic groups
are spread across zones; demographic fields are never used in the score.

**All data is synthetic.** The tool does not predict dropout or make decisions. Advisers decide
on any follow-up.

## Team
Esuru Nanayakkara, Hani Patel, Rafael Carreon, Sophia Kwong

## Run it
Open `index.html` in a browser (or use VS Code "Go Live"), then upload a CSV or click
"Use the sample dataset instead".

## Pages
- `index.html`: upload a CSV, saved to the browser database (IndexedDB)
- `dashboard.html`: zone map, week toggle (1/5/9), students worth a look, fairness check
- `student.html`: searchable student list and each student's score breakdown and notes
