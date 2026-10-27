#!/bin/sh
# The conventions step (docs/eval-plan.md section 6; docs/TECH-SPEC.md section 13).
# Started by eval/inside.sh, inside the pinned Node 22 container, from the repository root.
# Node itself is the only tool; every check and every limit is in eval/conventions/check.mjs, which
# reads no configuration from app/. An absent or empty app/ passes (PRACTICES section C rule 3).
set -u
node eval/conventions/check.mjs app
