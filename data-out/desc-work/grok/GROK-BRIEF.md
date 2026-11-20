# Brief for Grok: write the remaining Font Pond pairing descriptions

You are finishing a writing job on Font Pond, a font-browsing site. Each font pairing (a heading font plus a body font) has a two-sentence description. About 5,600 are still missing or need a rewrite. You write them. A checking script judges every one. You keep going until the script accepts all of them.

Work only inside `/Users/eddy/Developer/projects/font-pond`. Do not edit anything under `src/`, do not run git, do not deploy, do not call any paid API, and do not edit the scripts. Your only outputs are the JSON files described in step 2.

## Where things stand

- Another model (Claude Sonnet) already wrote about 35,000 descriptions that pass the checker. Those are done and must not be redone.
- The Sonnet run ran out of usage. What is left is the batches in `data-out/desc-work/grok/batches/`.
- The checker (`scripts/descriptions/check.py`) is strict. Last time most rejections came from sentence length, so count words.

## The loop

All commands run from `/Users/eddy/Developer/projects/font-pond/scripts/descriptions`.

1. Run `python3 -I grok-kit.py make --size 15`. This prints how many descriptions are left and writes the batch files. It also writes `data-out/desc-work/grok/system-prompt.txt`.
2. Read `data-out/desc-work/grok/system-prompt.txt` once, carefully. It holds every writing rule. Follow it exactly. Then, for each file `data-out/desc-work/grok/batches/gNNNN.txt` (start at g0001, go in order):
   - The file holds up to 15 briefs. Each starts with an id in square brackets, like `[curated-gf-kapakana-gf-spectral-sc]`.
   - Write one description per id, using only the facts in that brief.
   - Save the answer to `data-out/desc-work/grok/out/gNNNN.json` (same number). It must be one JSON object that maps each id, spelled exactly as in the brief and without the brackets, to its description text. No other text in the file, no code fence.
   - Some briefs end with a line `FIX THIS ONE: ...`. That is a rewrite. The line says which rule the last try broke. Fix exactly that and keep the other rules.
3. After every 10 or so batch files, run `python3 -I grok-kit.py check`. It keeps what passes and queues what fails, and prints the most common failures. Read that list and adjust your writing for it.
4. When all batch files are done, run `check`, then `make` again. `make` rebuilds the batch files with only what is still missing, including the rewrites with their `FIX THIS ONE` lines. Delete nothing by hand. Repeat steps 2 to 4 until `make` reports 0 left. Then run `python3 -I grok-kit.py status` to confirm.

If a batch is rewritten and still fails after three rounds, leave it. It stays in the retry list and the report will list it.

## How to write one description (the short version; the system prompt is the authority)

- Exactly two sentences. 26 to 40 words in total. Each sentence 8 to 24 words. Count them every time. A 6 or 7 word sentence is rejected, and so is one of 25 or more.
- Both font names appear exactly as the brief spells them (capitals and numerals included).
- Use only facts in the brief. Pick the two or three that make this pair feel distinct. The difference between the two fonts is usually best.
- Follow the brief's own lines: Open, Second sentence, Rhythm and the mention line. They set how this description is built. They are there so the descriptions do not all read alike.
- Voice: a knowledgeable friend glancing at the pair. Specific, plain words, a little personality. Not a spec sheet.
- Never name a type of person (designer, writer, studio, reader, people, audience, brand).
- Never use the banned words and phrases listed in the system prompt. Avoid repeating any stock wording from one description to the next. Vary openings, sentence shapes and endings across a batch.
- Do not name a project or a use when the brief says `none`.

## Checks before you save a batch

For every description, in your head: two sentences? Each 8 to 24 words? Total 26 to 40? Both names present and spelled right? No banned phrase? Not the same opening or ending as another in this batch? Fix anything that fails before writing the file. This saves most of the rewrite rounds.

## Pace and stopping

- Work through the batches in order and keep going without asking for confirmation between batches.
- If you hit a usage or rate limit, stop. Everything saved so far is safe, because the files in `out/` are the progress. Running `check` then `make` later picks up exactly where you left off.
- Do not start over or rewrite batches the checker already accepted.

## When you finish, report in plain words

1. How many descriptions are accepted in total and how many are left (from `status`).
2. The list of ids still failing, if any, and which rule keeps breaking them.
3. Anything odd you noticed, such as a brief with contradictory facts.

Do not save anything into the site. A person reviews your results first.
