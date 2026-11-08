import { ROSTER } from "./briefings-roster";

export type BriefingLink = { href: string; label: string };

export type Briefing = {
  what: string;
  characteristic: string;
  matters: string;
  links: BriefingLink[];
};

function wiki(slug: string, label: string): BriefingLink {
  return { href: `https://en.wikipedia.org/wiki/${slug}`, label };
}

function mathworld(slug: string, label: string): BriefingLink {
  return { href: `https://mathworld.wolfram.com/${slug}.html`, label };
}

function oeis(id: string, label: string): BriefingLink {
  return { href: `https://oeis.org/${id}`, label };
}

export const BRIEFINGS: Record<string, Briefing> = {
  fibonacci: {
    what: "A Fibonacci number is made by adding the two numbers that came before it. Start from 0 and 1 and the list runs 1, 1, 2, 3, 5, 8, 13, 21. The race uses that list as the hit: the first two contacts are 1, then 2, then 3, and so on.",
    characteristic:
      "Early on, a square hit (n²) is larger. Fibonacci starts slowly and then pulls ahead, because adding the last two terms makes the sequence grow like a fixed percentage each step. On one layer, that handover is at 1,241 health. A short published course can still favor the square; a long stack of health favors Fibonacci.",
    matters:
      "The ratio of one Fibonacci number to the previous one settles toward the golden ratio, about 1.618. Binet's formula rebuilds the nth term from that ratio and a second, smaller one that fades away. The same count shows up in rabbit puzzles, pine-cone spirals, and the worst-case cost of Euclid's algorithm for the greatest common divisor. Fun piece: the number of ways to tile a 2-by-n board with dominoes is a Fibonacci number.",
    links: [
      wiki("Fibonacci_sequence", "Fibonacci sequence"),
      mathworld("FibonacciNumber", "MathWorld: Fibonacci number"),
      oeis("A000045", "OEIS A000045"),
      wiki("Golden_ratio", "Golden ratio"),
    ],
  },
  "x-squared": {
    what: "On bounce n the hit is n². Bounce 1 deals 1, bounce 2 deals 4, bounce 3 deals 9, bounce 10 deals 100. Squaring means the hit is the bounce count multiplied by itself.",
    characteristic:
      "The total damage after N bounces is the sum of the first N squares, N(N+1)(2N+1)/6. That total climbs faster than a straight line and slower than an exponential. Against Fibonacci, the square leads on a modest layer and loses the lead once the layer is large enough for the exponential to wake up.",
    matters:
      "Sums of squares are one of the oldest closed forms in arithmetic. The same polynomial shows up as the number of lattice points under a line and as the variance calculation in statistics, where a spread is an average of squared distances. A square is a polynomial of degree 2. Polynomials of fixed degree always lose, eventually, to any exponential that keeps multiplying.",
    links: [
      wiki("Square_number", "Square number"),
      mathworld("SquareNumber", "MathWorld: square number"),
      oeis("A000290", "OEIS A000290, the squares"),
      wiki("Faulhaber%27s_formula", "Faulhaber's formula for summing powers"),
    ],
  },
  cubed: {
    what: "On bounce n the hit is n³: 1, 8, 27, 64, 125. A cube is the bounce count multiplied by itself twice.",
    characteristic:
      "Cubing outruns squaring as soon as the bounce count is bigger than 1, and it still loses to an exponential later. The sum of the first N cubes has a famous shortcut: it equals (N(N+1)/2)², the square of the triangular number.",
    matters:
      "Nicomachus noticed that shortcut in the first century. Degree still decides the long race: n³ is a polynomial, and 2ⁿ or the Fibonacci sequence will pass any fixed power. The race is a picture of that theorem you can watch on a health dial.",
    links: [
      wiki("Cube_(algebra)", "Cube (algebra)"),
      oeis("A000578", "OEIS A000578, the cubes"),
      wiki("Squared_triangular_number", "Squared triangular number"),
    ],
  },
  slammy: {
    what: "Slammy hits for 1 + 2n. The hits run 3, 5, 7, 9 if you count n from 1: an odd number that grows by 2 each bounce. The damage is a straight ramp, not a curve that bends upward.",
    characteristic:
      "Add those hits and the total after N bounces is N(N+2). A straight ramp beats a flat hit, and it leads a square only while the layer is tiny. Published courses are already past that handover, so on those courses a square finishes the barrier sum in fewer bounces.",
    matters:
      "1 + 2n is an arithmetic sequence: a constant added every step. Arithmetic growth is the first model a data student fits, and it is the one a long course leaves behind. The odd numbers themselves sum to a square, which is why the closed form is so tidy.",
    links: [
      wiki("Arithmetic_progression", "Arithmetic progression"),
      mathworld("ArithmeticSeries", "MathWorld: arithmetic series"),
      oeis("A005408", "OEIS A005408, the odd numbers"),
    ],
  },
  "super-slammy": {
    what: "Super Slammy is the same idea as Slammy with a steeper ramp: 1 + 5n. Each bounce adds 5 instead of 2.",
    characteristic:
      "A steeper line clears a small layer faster and is still a straight line. Any exponential, and the square once the bounce count is large, will pass a line. The slope changes the meeting point. It does not change which family wins the long race.",
    matters:
      "In a plot of damage against bounces, the 5 is the slope. Comparing Slammy with Super Slammy is a lesson in intercept and slope before a student meets curves. Two lines can be ranked by slope. A line and a curve cannot, until you say how far you look.",
    links: [
      wiki("Slope", "Slope"),
      wiki("Linear_function", "Linear function"),
    ],
  },
  sylvester: {
    what: "The Sylvester sequence starts at 2. The next term is the current term times one less than itself, plus one: 2, 3, 7, 43, 1807, and then a number with millions of digits. The race uses that recurrence as the hit.",
    characteristic:
      "The terms are pairwise coprime: no prime divides more than one of them. They also explode so fast that a handful of bounces reaches the race's damage ceiling of 1×10²¹. After that the hit cannot grow any further, even though the mathematical sequence still would.",
    matters:
      "James Joseph Sylvester studied the sequence in 1880 while writing Egyptian fractions, sums of unit fractions. Because the terms share no prime factors, the sequence is one of the clean proofs that there are infinitely many primes. It is also a warning about double exponential growth: a recurrence that squares itself leaves every polynomial behind in a few steps.",
    links: [
      wiki("Sylvester%27s_sequence", "Sylvester's sequence"),
      mathworld("SylvestersSequence", "MathWorld: Sylvester's sequence"),
      oeis("A000058", "OEIS A000058"),
    ],
  },
  lucas: {
    what: "Lucas numbers follow the same addition rule as Fibonacci, with a different start. The full list begins 2, 1, 3, 4, 7, 11. The race calls the first hit L₁, which is 1, then 3, 4, 7, 11.",
    characteristic:
      "Lucas and Fibonacci grow at the same percentage, the golden ratio, so they trade places with a square in the same kind of way. The early terms differ, which moves the exact health where the lead flips. Same growth rate, different starting point: that is enough to change a short course.",
    matters:
      "Édouard Lucas named the Fibonacci numbers and studied this companion sequence in the nineteenth century. Round(φⁿ) equals the nth Lucas number. Lucas also used a related test that can prove a number is prime, the Lucas–Lehmer test behind the record Mersenne primes.",
    links: [
      wiki("Lucas_number", "Lucas number"),
      mathworld("LucasNumber", "MathWorld: Lucas number"),
      oeis("A000032", "OEIS A000032"),
    ],
  },
  tetration: {
    what: "Tetration stacks exponents. For base 2 the race uses the ladder people write 2, 4, 16, 65536: two, two squared, two to the fourth, two to the sixteenth. The next stack is so large that the race's ceiling of 1×10²¹ stops it.",
    characteristic:
      "Four bounces are enough to hit the cap. A fighter this steep looks idle only if you stare at the first hit. The fourth hit is already 65,536, and the fifth cannot be written out in ordinary digits inside the simulator.",
    matters:
      "Knuth's up-arrow notation was invented so mathematicians could name operations past exponentiation. Height 2 is ordinary powers. Height 3 is tetration. Ackermann's function and the busy-beaver problem use the same idea to build functions that outgrow every primitive recursion. The cap in the race is a reminder that a computer stores a finite number even when the mathematics does not.",
    links: [
      wiki("Tetration", "Tetration"),
      wiki("Knuth%27s_up-arrow_notation", "Knuth's up-arrow notation"),
      mathworld("PowerTower", "MathWorld: power tower"),
    ],
  },
  phi: {
    what: "φ, the golden ratio, is (1 + √5) / 2, about 1.618. The hit on bounce n is φⁿ rounded to the nearest whole number. Those hits are 2, 3, 4, 7, 11, 18.",
    characteristic:
      "Rounding powers of φ reproduces the Lucas numbers. So this fighter and Lucas Sequence are two writings of one growth rate. The early terms still differ from Fibonacci, and the course dial is where that difference becomes a different winner.",
    matters:
      "φ is the number x such that x² = x + 1. That single equation is why the Fibonacci ratio converges to it, why a pentagon's diagonals stand in this ratio, and why the continued fraction of φ is the slowest to converge: all ones. A fun closed form sits next to it. Binet's formula says the nth Fibonacci number is the nearest integer to φⁿ / √5.",
    links: [
      wiki("Golden_ratio", "Golden ratio"),
      mathworld("GoldenRatio", "MathWorld: golden ratio"),
      wiki("Binet%27s_formula", "Binet's formula"),
    ],
  },
  factorial: {
    what: "n! means n × (n − 1) × … × 1. Bounce 1 deals 1, bounce 4 deals 24, bounce 6 deals 720, bounce 10 deals 3,628,800. The race multiplies in the next integer on every bounce.",
    characteristic:
      "Factorial passes every fixed power and every fixed-base exponential. 10! is already millions, and 20! is past the race's ceiling of 1×10²¹, so later hits sit on that cap. A short course barely notices. A medium course is over as soon as the product gets going.",
    matters:
      "Factorials count arrangements: 52 cards can be shuffled in 52! orders, a number with 68 digits. Stirling's approximation, n! ≈ √(2πn) (n/e)ⁿ, is how analysts estimate that product without multiplying every term. The gamma function extends the factorial to numbers that are not whole, which is why it shows up in probability densities.",
    links: [
      wiki("Factorial", "Factorial"),
      mathworld("Factorial", "MathWorld: factorial"),
      wiki("Stirling%27s_approximation", "Stirling's approximation"),
      oeis("A000142", "OEIS A000142"),
    ],
  },
  prime: {
    what: "A prime is a whole number greater than 1 whose only factors are 1 and itself: 2, 3, 5, 7, 11. The hit is the nth prime. Bounce 1 deals 2, bounce 5 deals 11, bounce 10 deals 29.",
    characteristic:
      "Primes keep growing, but slowly. The nth prime is roughly n log n. That is faster than a straight line and far slower than a square, an exponential, or Fibonacci. On a long course, Prime is a steady climber, not a late explosion.",
    matters:
      "Euclid's proof that the primes never run out is still the standard one: assume a finite list, multiply them, add one, and you have a number none of them divides. The prime-number theorem says the density of primes near x is about 1 / log x. Modern life uses that sparseness: public-key cryptography hides a message behind the difficulty of factoring a product of two large primes.",
    links: [
      wiki("Prime_number", "Prime number"),
      wiki("Prime_number_theorem", "Prime number theorem"),
      oeis("A000040", "OEIS A000040"),
      mathworld("PrimeNumber", "MathWorld: prime number"),
    ],
  },
  integral: {
    what: "The hit is n(n+1)/2: 1, 3, 6, 10, 15, 21. These are the triangular numbers, the number of dots in a triangle with n rows, and they are also the sum of the first n whole numbers.",
    characteristic:
      "The name on the card says integral, and the discrete version of an integral is exactly this kind of running sum. The hit grows like n²/2, a square with a smaller slope than X². It will lead a linear fighter and lose to a true exponential.",
    matters:
      "Gauss, as a schoolboy story goes, summed 1 through 100 by pairing terms to get this formula. In calculus, integrating x gives x²/2, the smooth cousin of n(n+1)/2. The gap between the sum and the integral is what Euler–Maclaurin sums estimate. Faulhaber's formula is the general machine for summing powers.",
    links: [
      wiki("Triangular_number", "Triangular number"),
      oeis("A000217", "OEIS A000217"),
      wiki("Summation", "Summation and the discrete integral"),
    ],
  },
  quadratic: {
    what: "The card is named Quadratic, and the hit is 2ⁿ: 2, 4, 8, 16, 32. In school, quadratic means a square, x². That rule is the other fighter, X². This fighter doubles every bounce.",
    characteristic:
      "Doubling is an exponential. It is ahead of n² from the first bounce, so it does not teach the late flip that Fibonacci teaches. The exponent is capped before the power overflows the race's ceiling of 1×10²¹. Double uses the same 2ⁿ hit. The name on this card is the part a reader has to check against the formula.",
    matters:
      "A quadratic equation is ax² + bx + c = 0, solved by the quadratic formula. An exponential is a·bⁿ. Mixing the two names is a real source of confusion in first-year math, and this roster puts both ideas on separate cards so the formulas can be compared on the dial.",
    links: [
      wiki("Quadratic_function", "Quadratic function, the school meaning"),
      wiki("Exponential_function", "Exponential function, the rule on this card"),
      wiki("Power_of_two", "Power of two"),
      oeis("A000079", "OEIS A000079"),
    ],
  },
  double: {
    what: "Double hits for 2ⁿ. Each bounce doubles the hit: 2, 4, 8, 16, 32, 64.",
    characteristic:
      "A doubling process is ahead of squaring immediately, so the course dial does not show a dramatic late takeover against X². The interesting comparison is with Fibonacci, which also grows by a percentage, a smaller one, and with Tripler, which triples instead. The exponent stops at the race's ceiling of 1×10²¹.",
    matters:
      "Doubling time is the plain-language form of an exponential. A population, a savings account, or a chain reaction that doubles on a schedule is this sequence. Logarithms were invented to turn that multiplication back into addition. The same powers of two are the sizes of computer memory and the number of subsets of an n-element set.",
    links: [
      wiki("Exponential_growth", "Exponential growth"),
      wiki("Doubling_time", "Doubling time"),
      oeis("A000079", "OEIS A000079"),
    ],
  },
  tripler: {
    what: "Tripler hits for 3ⁿ: 3, 9, 27, 81, 243. Each bounce multiplies the hit by 3.",
    characteristic:
      "Base 3 pulls away from base 2 immediately and reaches the damage ceiling sooner. Against a polynomial the winner is never in doubt once the bounce count leaves the first few steps. Against another exponential, the base is the whole comparison.",
    matters:
      "The base of an exponential is the growth factor. Changing it from 2 to 3 does not change the family of the curve, and it changes every forecast. Ternary, base 3, is also a real numeral system. Balanced ternary can write every integer with digits −1, 0, and 1.",
    links: [
      wiki("Exponential_growth", "Exponential growth"),
      wiki("Ternary_numeral_system", "Ternary numeral system"),
      oeis("A000244", "OEIS A000244, powers of 3"),
    ],
  },
  "100x": {
    what: "100X hits for 100ⁿ. Bounce 1 deals 100, bounce 2 deals 10,000, bounce 3 deals 1,000,000. A few bounces later the race's ceiling of 1×10²¹ is the hit.",
    characteristic:
      "A base of 100 makes the explosion almost immediate. There is no long region where a square or a Fibonacci number can lead. The card is useful as an extreme: when the growth factor is this large, course length stops being the story.",
    matters:
      "Scientific notation is built on powers of 10, and 100ⁿ is 10 to the 2n. Orders of magnitude are how scientists compare a cell, a city, and a galaxy without writing out the zeros. The ceiling in the race is what a floating-point number does in real software: past a point, distinct mathematical values collapse into one stored cap.",
    links: [
      wiki("Order_of_magnitude", "Order of magnitude"),
      wiki("Scientific_notation", "Scientific notation"),
      wiki("Double-precision_floating-point_format", "Why computers cap a number"),
    ],
  },
  "x-power": {
    what: "On bounce n the hit is nⁿ: 1, 4, 27, 256, 3125. The base and the exponent are the same number, and both grow.",
    characteristic:
      "nⁿ grows much faster than n² and faster than cⁿ for any fixed base c, once n passes that base. It is still a single exponentiation, not a stack of them. Super X^X is the card that stacks another exponent on top, and that stack is capped so the race stays finite.",
    matters:
      "xˣ shows up in the prime-number theorem's estimates, in the number of trees on n labeled vertices (nⁿ⁻² is Cayley's formula, a near neighbor), and in the softmax and entropy calculations that treat n log n. Sophomore's dream is a calculus curiosity: a definite integral of x⁻ˣ equals a series of these terms.",
    links: [
      wiki("Exponentiation", "Exponentiation"),
      wiki("Cayley%27s_formula", "Cayley's formula"),
      wiki("Sophomore%27s_dream", "Sophomore's dream"),
    ],
  },
  "super-x-power": {
    what: "The hit is n raised to (nⁿ), a power tower of three n's, written n^(nⁿ). The inner exponent is capped at 16 so the value does not become a computer infinity in the middle of a frame.",
    characteristic:
      "Even with the cap, the hit reaches the race's ceiling of 1×10²¹ within a few bounces. The cap is part of the rule. Without it the simulator could not store the hit as an ordinary number, and the race would stop being deterministic in a useful way.",
    matters:
      "A power tower is tetration when the height grows, and it is associated with Knuth's up-arrows. The inner cap is an example of a regulated function: mathematicians and engineers replace an unbounded expression with a bounded one so a model remains defined. Knowing where the bound sits is part of reading the model.",
    links: [
      wiki("Tetration", "Tetration"),
      wiki("Knuth%27s_up-arrow_notation", "Knuth's up-arrow notation"),
      mathworld("PowerTower", "MathWorld: power tower"),
    ],
  },
  pi: {
    what: "π is the ratio of a circle's circumference to its diameter, starting 3.14159265…. In the race the digits are multipliers. The hit starts at 1 and is multiplied by the next digit on each bounce: ×3, ×1, ×4, ×1, ×5.",
    characteristic:
      "A digit of 0 would freeze the product, and π's early digits do not contain a 0. The product still runs away because digits larger than 1 keep multiplying in. The sequence of digits is treated as known and fixed, so the same bounce count always gives the same hit.",
    matters:
      "π is irrational: its digits never settle into a repeating block. Whether it is normal, meaning every digit string appears as often as chance would suggest, is still open. The Bailey–Borwein–Plouffe formula can compute the nth hexadecimal digit of π without computing the ones before it. Archimedes bounded π by polygons. A modern computer has passed a hundred trillion digits, and the race only needs the first few dozen.",
    links: [
      wiki("Pi", "Pi"),
      mathworld("Pi", "MathWorld: pi"),
      wiki("Bailey%E2%80%93Borwein%E2%80%93Plouffe_formula", "BBP formula"),
    ],
  },
  "square-root": {
    what: "A square root of a number is the number which, multiplied by itself, gives it back. √100 is 10. This fighter removes health − √health, so a layer is left sitting at its own square root.",
    characteristic:
      "One hit turns 10,000 into 100. The next turns 100 into 10. Huge layers collapse in a few contacts, and the last stretch, from a small number down to zero, is the slow part. The simulator adds a landing rule near 2 health so the layer actually reaches zero instead of creeping toward 1 forever.",
    matters:
      "Iterating a square root is a logarithm in disguise: you are counting how many times you can take a root before the number is small. Integer square root is a standard algorithm. Newton's method finds roots by using the slope of a curve, and it is the ancestor of a great deal of scientific computing.",
    links: [
      wiki("Square_root", "Square root"),
      wiki("Integer_square_root", "Integer square root"),
      wiki("Newton%27s_method", "Newton's method"),
    ],
  },
  centy: {
    what: "Centy removes a percent of the layer's original maximum. It starts at 1% and adds 0.1 of a percentage point after every bounce. The percent carries from one layer to the next.",
    characteristic:
      "Because the percent is of the layer's original size, a bigger layer takes the same number of hits as a smaller one. One layer, of any size, takes 37 Centy hits. The percents 1.0, 1.1, 1.2, … are an arithmetic series, and they pass 100% on the 37th term. Course length, measured in layers, is what changes Centy's bounce count. Making each layer thicker does not.",
    matters:
      "A percent of the original amount is simple interest. A percent of what remains is compound interest. They are different models and they forecast different totals. Centy is the simple one, which is why layer size cancels out. That cancellation is the sort of thing a data student should notice before fitting a model.",
    links: [
      wiki("Percentage", "Percentage"),
      wiki("Interest", "Simple and compound interest"),
      wiki("Arithmetic_progression", "Arithmetic progression"),
    ],
  },
  infinity: {
    what: "Infinity, in mathematics, is not a very large number. It is the idea of a process that does not end. In this race the hit is 1×10²¹, one sextillion, which is the same ceiling the other math fighters are not allowed to pass.",
    characteristic:
      "That hit is larger than any published layer, so one contact removes one layer. The bounce count equals the number of layers. A short course is three contacts. A fifty-layer course is fifty. Travel speed is not in this count. A fast orb can still spend less clock time on a short course even when Infinity needs fewer contacts.",
    matters:
      "Georg Cantor showed there are different sizes of infinity: the whole numbers and the real numbers are not the same kind of endless. Calculus uses limits so a symbol like ∞ can appear in an argument that still ends in a finite answer. The race uses a finite stand-in on purpose. Calling it infinity is the card's name. The rule is a flat hit at the cap.",
    links: [
      wiki("Infinity", "Infinity"),
      wiki("Actual_infinity", "Actual and potential infinity"),
      mathworld("Infinity", "MathWorld: infinity"),
    ],
  },
  "speed-impact": {
    what: "Slow starts at 50 and then adds 100 on every bounce: 50, 150, 250, 350. The name says slow. The hit is a steep arithmetic ramp.",
    characteristic:
      "A large opening hit matters on a thin layer and matters less once the course is a long sum. Adding a constant each bounce is the same family as Slammy, with a different start and a different step. The dial will show those constants as a shift, not as a new shape of curve.",
    matters:
      "An arithmetic sequence is determined by two numbers, the first term and the common difference. Estimating them from data is linear regression in its smallest form. The name on the card and the formula on the card can disagree in tone. The formula is the one the model uses.",
    links: [
      wiki("Arithmetic_progression", "Arithmetic progression"),
      wiki("Linear_regression", "Linear regression"),
    ],
  },
  professor: {
    what: "Professor copies another fighter's math formula. Until a formula is copied, the body hit is 0. After that, the hit is the copied rule, evaluated at Professor's own bounce count.",
    characteristic:
      "The interesting question is which formula gets copied, and when. A late copy of a steep rule can still win a long course. An early copy of a mild rule spends the race on a small slope. Zero while idle means the opening of the race is a waiting time, like a fuse with a random lesson attached.",
    matters:
      "This is model selection inside a match. A researcher who picks a formula after seeing the data has a different error rate from one who picked it first. That difference is overfitting. Professor makes the choice visible: the card's power is the power of whichever formula is active, and the record should say which one.",
    links: [
      wiki("Model_selection", "Model selection"),
      wiki("Overfitting", "Overfitting"),
    ],
  },
  ...ROSTER,
};

export function briefingFor(id: string): Briefing {
  const briefing = BRIEFINGS[id];
  if (!briefing) throw new Error(`Missing briefing for ${id}`);
  return briefing;
}
