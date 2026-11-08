# Future plan

Orb Foundry is a study, a class, and a show. The same seeded fight has to
serve all three, and the operation has to stay small enough to keep going.

This note is an exploration of what to build next. It is not a promise that
any piece is scheduled, funded, or already measured.

## What the project is for

- **Study.** The simulation is deterministic: fixed step of 1/120 second,
  one seed, one result. A later person can rerun the fight. That is the
  scientific habit the project is built on.
- **Learning and teaching.** The lab site lets someone move layer health and
  read who finishes in fewer body hits. Character cards name the rule.
  Published courses show that a short stack and a long stack can crown
  different fighters.
- **A show.** The YouTube channel is the public draw: Pacific noon and
  3:00 PM, Shorts and long-form, Friday's sixteen-orb tournament, Saturday's
  Everyone vs Infinity. Fun is part of the design. A fight people want to
  watch is how the study stays visible.
- **An operation that can last.** Sustainability means a weekly batch a
  person can run, a quality bar an upload has to clear, and costs that stay
  visible. Money, if it comes later from the channel, a season, or a class,
  does not get to change who wins.
- **One public operation.** The lab site, the YouTube channel, and any
  later channel (the Instagram reel path is the other one already in the
  repo) share one roster, one course list, and one calendar. A viewer who
  leaves a video for the site, or the site for a video, is still inside
  the same fight.

Three records stay separate, even when they describe the same matchup:

1. The **bounce reading** on the lab. It counts body hits at an equal
   contact rate. It is silent about travel, projectiles, and the seed.
2. The **seeded run**. One seed of the arena. Copies, shots, fuses, and
   path length are in this run. One video is one draw from it.
3. The **upload**. The file on YouTube, with its slot, title, and the
   presentation used that day. Slow motion, the announcer, and the frame
   rate are presentation. They do not decide the winner.

A results archive is the place those three meet. It does not exist yet.
Until it does, the site does not invent recorded winners, and a video title
is not a lab result.

## One operation across the channel and the site

The lab and the channel are two doors into the same roster. Today the site
header and footer open the YouTube channel, and the channel's courses are
the courses on the races pages: Short, Friday, long-form, Saturday. That
link is the start. The work is to keep it from splitting into a show with
one cast and a site with another.

One shared contract, used by the site, the YouTube publisher, and the
Instagram path:

- **The same ids.** Fighter id, display name, course id, and layer list
  come from one catalog. A rename or a new course lands in the lab, the
  title template, and the description together.
- **The same week.** The plan for Friday and Saturday is written once.
  The upload batch and the races pages both read it. The site can say
  what this Friday's course and cast are, and the video title uses those
  same names.
- **A path both ways.** A description can link to the lab pair
  (`/lab?a=&b=`) and the course page (`/races/{course}`). A character
  card and a course page can name the slot that uses them, and later the
  archive row for a specific upload. Watch stays one action, on the site
  and at the end of a video.
- **One question per public object.** The video asks the question its
  caption states. The page it links to answers that question, and labels
  the bounce reading, the seeded run, and the upload as the three records
  they are. The viewer is never handed a second, unexplained ranking.
- **One batch.** Rendering, upload, and the site update for that slot are
  steps of the same run. A channel that ships a course the site does not
  list, or a site that explains a tournament the channel did not run, is
  a broken week.

A new channel joins this contract. It uses the same ids, the same
calendar, and a link back to the same lab page. It does not grow its own
roster or its own names for the courses.

## Picture and sound

Today a headless browser paints `#socialCanvas`, MediaRecorder captures
that canvas, and ffmpeg writes the MP4. The picture is a capture of the
page. Resolution, type, lighting, and motion are whatever that canvas can
hold at 1080×1920 or the long-form frame.

The simulation stays the source of truth. A better picture is a new
renderer that reads the same state and the same events. The winner is
computed before any frame is drawn.

Directions worth trying, one match at a time, against the current canvas
as the control:

- **A sharper capture of the current canvas.** Higher internal resolution,
  type that stays readable on a phone, and a stable frame rate. This is
  the smallest step, and it keeps the daily batch on the tools it already
  uses (Chrome and ffmpeg).
- **An offline renderer.** Step the simulation, write the positions,
  hits, and layer changes, then draw the frames in a tool built for
  pictures: a game engine, Blender, or a dedicated 2D compositor. The
  engine draws. It does not run its own physics. Same seed, same winner,
  different image. The test is a side-by-side of one fight: what got
  clearer, how long it took, and whether the batch can afford it every day.
- **Sound as its own pass.** The announcer is already required before an
  upload. Music and hits can be mixed after the frames exist, so a better
  renderer does not have to record a live browser audio graph.

The recording already opens with fighter callouts, a 3 · 2 · 1, and
FIGHT, while the simulation is frozen, and it closes with a short winner
reveal. The ideas below make that opening and ending carry the character,
and make the winner unmistakable. They can be tried on the current canvas
before a new engine exists. The showcase already has an animated image and
a stick figure for each fighter. Those are the approved faces. The site
card and the video use the same face.

The body in the race is still a circle: an arc, a dark outline, and a
letter mark, drawn by `SocialBattleRenderer`. The renderer already knows
the position every frame, and it already uses `drawImage` for a few
weapons and summons. The character picture is the next thing to draw at
that position. The simulation keeps the x, the y, the hit, and the winner.
The picture follows.

Consistency is the rule for that picture and for every action it plays.

- **One face.** The circle is replaced by the catalog image for that id,
  sized to the orb. The stick figure is the fallback when the portrait is
  too busy at that size. Intro, background, celebration, and the site card
  use that same image. A frame that shows a different person does not ship.
- **One set of actions.** Each fighter gets a small fixed set: idle, hit,
  and win. The renderer picks the frame from the simulation event. A bounce
  plays the hit frame. A finish plays the win frame. The same event always
  plays the same frame, on the site and in every upload. A model may fill
  a missing frame in that set. It does not invent a new action for one
  video.
- **One clock.** The animation starts from the event, not from the wall
  clock and not from a fresh generation. Slow motion stretches the
  presentation. It does not choose a different move.

- **A 3–5 second character intro.** Before the countdown, each fighter
  gets a card: name, one line of the rule, and the animated character.
  The simulation stays frozen, as it does for the countdown. A long-form
  video can give each fighter the full 3–5 seconds. A Short keeps the
  pair inside one quick card, about 3–5 seconds together, so the opening
  does not swallow a 25-second race.
- **The character as the background.** Behind the arena, each side of the
  frame plays that fighter's animation, quietly, so the orbs and the
  layers stay readable. Left is one character, right is the other. The
  plate is the same art as the card, looped, not a new person drawn for
  that upload.
- **A celebration that names the winner.** When the fight ends, the frame
  belongs to the winner: their name in the same words as the title, their
  color, their animation, and one line for the win. Orb Race says they
  cleared the layers. Classic says they are the last team alive. A phone
  with the sound off can still read it. If the event log has the deciding
  moment, the celebration can replay that hit once.
- **An end card back to the lab.** After the celebration, the course name
  and the lab pair. The same ids as the description link. The video ends
  inside the same operation as the site.
- **Progress that stays on screen.** Names and layer progress remain
  readable during the race, at the size of a phone. The celebration is
  the conclusion, not the first time the viewer can tell who is ahead.

An image or video model is a way to fill a missing frame in that set, not
a new designer for each upload. It starts from the approved catalog art
and makes the idle, hit, and win frames, plus the intro card, the
background loop, and the celebration. A person checks the result before
it becomes that fighter's permanent plate. A generated frame that invents
a different face, a different action, or a licensed character does not
enter the catalog. The site card and the video have to be the same
character, doing the same moves.

A new engine earns a place in the daily batch only after that one-fight
comparison. Until then the canvas remains the picture the channel ships.
The intro, the background plate, and the celebration can ship on that
canvas first.

Every public file should be able to name its seed, course, build, and
slot. The picture can change. That label cannot.

## How the competition is organized

The channel already has a shape:

- Shorts use three layers, 750, 1,000, and 1,500.
- Friday afternoon is a sixteen-entrant tournament, five layers, titled
  "Who is the Best Orb?"
- Saturday afternoon is Everyone vs Infinity, fifty layers at 32,000.
- Other long-form slots run the fifty-layer ascending course.
- Regular videos are one matchup. The planner prefers a close finish,
  keeps a two-day cooldown on orbs, and fills a short action with
  deterministic slow motion when the race ends early. Classic fights are
  Shorts only.

That shape is a season waiting to be written down as a table. The next
organization work is bookkeeping a viewer and a student can both check.

- **Publish the rules before the week.** Roster, course, and seeding rule
  for Friday and Saturday go on the races pages when the week is planned,
  not only inside the upload title.
- **Keep contest types in their own columns.** A formula, a fuse, a
  projectile fighter, and a classic last-team fight are different
  questions. The lab already refuses to rank them on one bounce axis. The
  show can still pair them. The caption should say which question that
  video asked, and the season table should not collapse those questions
  into one ladder.
- **Store the bracket, not only the champion.** Friday's publisher already
  checks match ids, the champion, and one announcer sequence per match.
  A season table adds the path: entrant, round, seed, course, finisher.
  Someone can see whether a champion won a short course, a long one, or a
  deadline.
- **Separate the archive from the upload.** One row can point at the
  video, the seed, and the lab reading. The row says which of the three
  it is. A YouTube title stays a title.

`src/tournament.js` and its worker are dormant batch tools. They are a
candidate for running a bracket or a seed sweep without turning the
player menu back into a tournament UI.

## Models, data, and prediction

The lab currently answers two questions, and only for a body hit that is
a bounce rule: how many bounces clear this health, and where the lead
flips as health grows. Fuses, projectiles, seeded rolls, copied formulas,
and classic fights are named on the contest card and left off that chart.

The studies below are the reason to gather runs. None of them has a
fitted model yet.

| Study | Question | What has to be recorded |
| --- | --- | --- |
| Barrier check | Where does the bounce sum disagree with a seeded run? | Seed, course, pair, bounce count from the lab, finisher and time from the arena |
| Designed experiment | Which factor flips the finisher: course length, time limit, or seed? | The same pair, with one factor moved at a time, then two together |
| Survival | Did the climber finish, or did a fuse end the race? | Time to clear, and the fuse deadline in seconds. A bounce count is not a clock |
| Layer path | How long did they spend on each layer? | Layer index over time, until the absorbing "finished" state |
| Prediction | Given the formula family and the course, who finishes first, and how often across seeds? | Many seeds of the same pair and course. The misses published with the hits |
| Teaching slice | Can someone else rerun one row? | A small public set: seed, course, pair, and the outcome |

The prediction is only as good as that log. A model that ignores course
length will fail in the way the dial already demonstrates: the leader on
a short course can lose on a long one. Publishing that failure is part of
the lesson.

Copies, travel speed, and projectiles are the interesting errors. The
bounce sum leaves them out on purpose. A seeded run that finishes earlier
than the sum is evidence about contact rate, not a bug in the chart.

The dataset is rows, not videos. A row needs the seed, the course id, the
fighter ids, the build, the slot if a video was made, the question the
run was answering, and the outcome fields that question requires. Video
files stay out of the row. The row can point at one.

## Teaching

The site is the classroom surface.

- The dial remains the place a person moves one number and reads one
  sentence.
- The character card remains the reference for the rule, with a path from
  a plain description to a source.
- A methods note, when the archive exists, states what was held fixed,
  what the seed varied, and which change would crown a different fighter.
- A downloadable slice of the log lets a class leave the site and rerun
  the same seed.

The public site keeps labeling lab readings, seeded runs, and uploads as
different records. A lesson that mixes them teaches the wrong method.

## An operation that stays fun and solvent

The show is the part people come back for. The study is why the show is
worth keeping. The operation is what makes both possible on a Tuesday.

Principles, not a budget:

- **One schedule, one front door.** Pacific noon and 3:00 PM already
  exist. New formats join that calendar. The lab, YouTube, and any other
  channel publish from that same plan, so the week a person sees on the
  site is the week the channel runs.
- **One gate before upload.** Duration, announcer, and a planned matchup
  are already checked. A future renderer adds its own check: same seed as
  the simulation, readable names, and a frame rate the slot promised.
- **Costs stay on a list.** Render time, storage, announcer generation,
  and any offline renderer are counted before they become daily. A tool
  that cannot finish inside the batch stays an experiment.
- **Income stays outside the rules.** A membership, a class, or a sponsor
  can support the channel. None of them picks a seed, a course, or a
  winner. The simulation does.
- **The archive outlasts a single video.** A season can be taken down or
  a renderer can be replaced. The rows, the seeds, and the lab readings
  are what a later class or paper uses.

Fun is a design constraint. A close race, a fuse against a climber, and a
Saturday where the whole roster faces Infinity are the episodes. The
planner can keep preferring fights a person wants to finish watching,
while the archive keeps the dull seeds too. The dull seeds are how a
distribution is honest.

## Order of work

Each step is usable before the later ones exist.

1. **A results row, linked both ways.** For every upload, store the seed,
   course, fighter ids, build, slot, and which question the video asked.
   Point at the file, and point the file's description at the lab pair
   and the course page. The site and the channel use that same row. Do
   not score the upload as a lab reading.
2. **A seeded sweep.** Run a fixed set of pairs on the four published
   courses, across enough seeds to see a spread. Use the batch tools,
   not the recording pipeline.
3. **Show the spread on the lab.** Next to a bounce line, show the seeded
   finish times as runs. Label them as runs. Leave the line as the body-hit
   sum.
4. **One picture experiment.** First, on the current canvas: draw the
   catalog face in place of the circle, play idle, hit, and win from the
   simulation events, then add the intro, the side background, and a
   celebration that names the winner and the win rule. The same frames
   appear on the site card. Then render one seed a second time in a game
   engine or an offline compositor, using those same frames and events.
   Write down the difference in clarity, time, and cost. Decide whether
   that renderer joins the daily batch. A generated frame enters only
   when the face and the action match the set.
5. **A season table.** Friday's bracket and Saturday's roster, published
   on the races pages, with the same ids the archive uses.
6. **A small prediction.** Train on the sweep. Publish who it gets right,
   who it misses, and the course length where it flips. The miss is the
   teaching material.

The weekly improvement loop stays on small player-facing fixes. This
program is larger than one Monday run, and it should be chosen on
purpose.
