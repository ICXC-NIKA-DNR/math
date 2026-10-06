// Basic forms and the power rule. The whole category is "do the algebra before
// the calculus": nothing here needs a technique, only a rewrite.
export default [

/* ── d1: the rule itself ─────────────────────────────────── */
{tech:'power',d:1,t:'\\int (4x^3-6x^2+2)\\,dx',a:'x^4-2x^3+2x+C',
 h:'Power rule term by term.',
 s:['$4x^3\\to x^4$, $-6x^2\\to-2x^3$, $2\\to 2x$','$x^4-2x^3+2x+C$']},

{tech:'power',d:1,t:'\\int (x^5-3x^4+x)\\,dx',a:'\\frac{x^6}{6}-\\frac{3x^5}{5}+\\frac{x^2}{2}+C',
 h:'Bump each exponent, divide by the new one.',
 s:['$\\frac{x^6}{6}-\\frac{3x^5}{5}+\\frac{x^2}{2}+C$']},

{tech:'power',d:1,t:'\\int \\frac{3}{x^4}\\,dx',a:'-\\frac{1}{x^3}+C',
 h:'Rewrite as $3x^{-4}$ first.',
 s:['$\\int 3x^{-4}dx=3\\cdot\\frac{x^{-3}}{-3}=-x^{-3}$','$=-\\frac{1}{x^3}+C$']},

{tech:'power',d:1,t:'\\int x^{2/3}\\,dx',a:'\\frac{3}{5}x^{5/3}+C',
 h:'The rule does not care that the exponent is a fraction.',
 s:['$\\frac{x^{5/3}}{5/3}=\\frac{3}{5}x^{5/3}+C$']},

{tech:'power',d:1,t:'\\int \\sqrt[3]{x}\\,dx',a:'\\frac{3}{4}x^{4/3}+C',
 h:'$\\sqrt[3]{x}=x^{1/3}$.',
 s:['$\\int x^{1/3}dx=\\frac{x^{4/3}}{4/3}=\\frac{3}{4}x^{4/3}+C$']},

{tech:'power',d:1,t:'\\int \\frac{1}{\\sqrt{x}}\\,dx',a:'2\\sqrt{x}+C',
 h:'$1/\\sqrt x=x^{-1/2}$.',
 s:['$\\int x^{-1/2}dx=\\frac{x^{1/2}}{1/2}=2\\sqrt{x}+C$']},

{tech:'power',d:1,t:'\\int \\left(x^2+\\frac{1}{x^2}\\right)dx',a:'\\frac{x^3}{3}-\\frac{1}{x}+C',
 h:'Two power-rule terms; the second is $x^{-2}$.',
 s:['$\\int x^2dx=\\frac{x^3}{3}$','$\\int x^{-2}dx=-x^{-1}$','$\\frac{x^3}{3}-\\frac1x+C$']},

{tech:'power',d:1,t:'\\int \\frac{x^2+3x-1}{x}\\,dx',a:'\\frac{x^2}{2}+3x-\\ln|x|+C',
 h:'Split the fraction term by term — you may divide, not un-add.',
 s:['$=x+3-\\frac1x$','$\\frac{x^2}{2}+3x-\\ln|x|+C$']},

{tech:'power',d:1,t:'\\int \\frac{x^4-2\\sqrt{x}}{x^2}\\,dx',a:'\\frac{x^3}{3}+\\frac{4}{\\sqrt{x}}+C',
 h:'Divide both terms by $x^2$ and collect the exponents.',
 s:['$=x^2-2x^{-3/2}$','$\\int x^2dx=\\frac{x^3}{3}$','$\\int-2x^{-3/2}dx=-2\\cdot\\frac{x^{-1/2}}{-1/2}=4x^{-1/2}$','$\\frac{x^3}{3}+\\frac{4}{\\sqrt x}+C$']},

{tech:'power',d:1,t:'\\int (2x-5)^2\\,dx',a:'\\frac{(2x-5)^3}{6}+C',
 h:'Expand, or notice the inside is linear.',
 s:['Inside is linear, so divide by its slope: $\\frac{(2x-5)^3}{3\\cdot 2}$','$=\\frac{(2x-5)^3}{6}+C$'],
 w:'For a linear inside, $\\int f(ax+b)\\,dx=\\frac1a F(ax+b)$. That one fact replaces a whole page of expanding.'},

{tech:'power',d:1,t:'\\int (3x+1)^5\\,dx',a:'\\frac{(3x+1)^6}{18}+C',
 h:'Linear inside — integrate as usual, then divide by the slope.',
 s:['$\\frac{(3x+1)^6}{6}$, then divide by $3$','$=\\frac{(3x+1)^6}{18}+C$']},

{tech:'power',d:1,t:'\\int \\frac{dx}{(4x-7)^3}',a:'-\\frac{1}{8(4x-7)^2}+C',
 h:'Write it as $(4x-7)^{-3}$.',
 s:['$\\frac{(4x-7)^{-2}}{-2}$, divided by $4$','$=-\\frac{1}{8(4x-7)^2}+C$']},

{tech:'power',d:1,t:'\\int e^{5x}\\,dx',a:'\\frac{1}{5}e^{5x}+C',
 h:'Linear exponent: divide by its coefficient.',
 s:['$\\frac{1}{5}e^{5x}+C$']},

{tech:'power',d:1,t:'\\int \\left(e^{x}-\\frac{3}{x}\\right)dx',a:'e^{x}-3\\ln|x|+C',
 h:'Both are table forms.',
 s:['$e^x-3\\ln|x|+C$']},

{tech:'power',d:1,t:'\\int 2^{x}\\,dx',a:'\\frac{2^{x}}{\\ln 2}+C',
 h:'Write $2^x=e^{x\\ln 2}$ and the constant falls out.',
 s:['$2^x=e^{x\\ln 2}$','$\\int e^{x\\ln2}dx=\\frac{e^{x\\ln2}}{\\ln2}=\\frac{2^x}{\\ln2}+C$'],
 w:'Every exponential is $e^{kx}$ in disguise. Converting to base $e$ turns a memorised rule into the one you already know.'},

{tech:'power',d:1,t:'\\int 5^{3x}\\,dx',a:'\\frac{5^{3x}}{3\\ln 5}+C',
 h:'Base change, then the linear exponent.',
 s:['$5^{3x}=e^{3x\\ln5}$','$\\int e^{3x\\ln5}dx=\\frac{e^{3x\\ln5}}{3\\ln5}=\\frac{5^{3x}}{3\\ln5}+C$']},

{tech:'power',d:1,t:'\\int (4\\cos x+\\sin x)\\,dx',a:'4\\sin x-\\cos x+C',
 h:'Antidifferentiating sine picks up the minus sign.',
 s:['$4\\sin x-\\cos x+C$']},

{tech:'power',d:1,t:'\\int \\sec^2(3x)\\,dx',a:'\\frac{1}{3}\\tan(3x)+C',
 h:'$\\sec^2$ is the derivative of $\\tan$; the $3$ costs you a $\\frac13$.',
 s:['$\\frac13\\tan(3x)+C$']},

{tech:'power',d:1,t:'\\int \\csc^2 x\\,dx',a:'-\\cot x+C',
 h:'Read the cotangent derivative backwards.',
 s:['$\\frac{d}{dx}\\cot x=-\\csc^2x$','$\\int\\csc^2x\\,dx=-\\cot x+C$']},

{tech:'power',d:1,t:'\\int \\csc x\\cot x\\,dx',a:'-\\csc x+C',
 h:'One of the six table derivatives, backwards.',
 s:['$\\frac{d}{dx}\\csc x=-\\csc x\\cot x$','$=-\\csc x+C$']},

{tech:'power',d:1,t:'\\int \\frac{dx}{1+x^2}',a:'\\arctan x+C',
 h:'A table form worth knowing cold.',
 s:['$\\arctan x+C$']},

{tech:'power',d:1,t:'\\int \\frac{dx}{\\sqrt{1-x^2}}',a:'\\arcsin x+C',
 h:'The other table form worth knowing cold.',
 s:['$\\arcsin x+C$']},

{tech:'power',d:1,t:'\\int \\frac{dx}{9+x^2}',a:'\\frac{1}{3}\\arctan\\left(\\frac{x}{3}\\right)+C',
 h:'$\\int\\frac{dx}{a^2+x^2}=\\frac1a\\arctan\\frac xa$.',
 s:['$a=3$','$\\frac13\\arctan\\frac x3+C$']},

{tech:'power',d:1,t:'\\int \\frac{dx}{\\sqrt{25-x^2}}',a:'\\arcsin\\left(\\frac{x}{5}\\right)+C',
 h:'$\\int\\frac{dx}{\\sqrt{a^2-x^2}}=\\arcsin\\frac xa$.',
 s:['$a=5$','$\\arcsin\\frac x5+C$']},

{tech:'power',d:1,t:'\\int \\cosh x\\,dx',a:'\\sinh x+C',
 h:'The hyperbolic pair has no stray minus signs.',
 s:['$\\sinh x+C$']},

{tech:'power',d:1,t:'\\int \\sinh(4x)\\,dx',a:'\\frac{1}{4}\\cosh(4x)+C',
 h:'Same as the trig version, without the sign flip.',
 s:['$\\frac14\\cosh(4x)+C$']},

/* ── d2: algebra first ───────────────────────────────────── */
{tech:'power',d:2,t:'\\int \\frac{x^3-8}{x-2}\\,dx',a:'\\frac{x^3}{3}+x^2+4x+C',
 h:'Factor the difference of cubes and cancel.',
 s:['$x^3-8=(x-2)(x^2+2x+4)$','$\\int(x^2+2x+4)dx=\\frac{x^3}{3}+x^2+4x+C$']},

{tech:'power',d:2,t:'\\int \\frac{x^2}{x+1}\\,dx',a:'\\frac{x^2}{2}-x+\\ln|x+1|+C',
 h:'Top-heavy: divide first.',
 s:['$\\frac{x^2}{x+1}=x-1+\\frac{1}{x+1}$','$\\frac{x^2}{2}-x+\\ln|x+1|+C$'],
 w:'Whenever the numerator\'s degree is at least the denominator\'s, long division is not optional — no technique works until you do it.'},

{tech:'power',d:2,t:'\\int \\frac{2x^2+5}{x^2+1}\\,dx',a:'2x+3\\arctan x+C',
 h:'Equal degrees: pull out the constant part.',
 s:['$\\frac{2x^2+5}{x^2+1}=2+\\frac{3}{x^2+1}$','$2x+3\\arctan x+C$']},

{tech:'power',d:2,t:'\\int (\\sqrt{x}+1)^2\\,dx',a:'\\frac{x^2}{2}+\\frac{4}{3}x^{3/2}+x+C',
 h:'Expand — the cross term is the interesting one.',
 s:['$(\\sqrt x+1)^2=x+2x^{1/2}+1$','$\\int x\\,dx=\\frac{x^2}{2}$, $\\int2x^{1/2}dx=\\frac43x^{3/2}$, $\\int 1\\,dx=x$','$\\frac{x^2}{2}+\\frac43x^{3/2}+x+C$']},

{tech:'power',d:2,t:'\\int \\tan^2 x\\,dx',also:'trigint',a:'\\tan x-x+C',
 h:'There is no antiderivative of $\\tan^2$ in the table — but there is one of $\\sec^2$.',
 s:['$\\tan^2x=\\sec^2x-1$','$\\int(\\sec^2x-1)dx=\\tan x-x+C$'],
 w:'The Pythagorean identity is the only way in. Any even power of tangent reduces this way, one $\\sec^2$ at a time.'},

{tech:'power',d:2,t:'\\int \\cot^2 x\\,dx',also:'trigint',a:'-\\cot x-x+C',
 h:'The cotangent twin of the Pythagorean identity.',
 s:['$\\cot^2x=\\csc^2x-1$','$-\\cot x-x+C$']},

{tech:'power',d:2,t:'\\int \\sin^2 x\\,dx',also:'trigint',a:'\\frac{x}{2}-\\frac{\\sin(2x)}{4}+C',
 h:'Even power of sine: use the power-reduction identity.',
 s:['$\\sin^2x=\\frac{1-\\cos2x}{2}$','$\\int\\frac{1-\\cos2x}{2}dx=\\frac x2-\\frac{\\sin2x}{4}+C$']},

{tech:'power',d:2,t:'\\int \\cos^2 x\\,dx',also:'trigint',a:'\\frac{x}{2}+\\frac{\\sin(2x)}{4}+C',
 h:'Power reduction, with the sign the other way.',
 s:['$\\cos^2x=\\frac{1+\\cos2x}{2}$','$\\frac x2+\\frac{\\sin2x}{4}+C$']},

{tech:'power',d:2,t:'\\int \\frac{1+\\cos^2 x}{\\cos^2 x}\\,dx',a:'\\tan x+x+C',
 h:'Split the fraction — each piece is a table form.',
 s:['$=\\sec^2x+1$','$\\tan x+x+C$']},

{tech:'power',d:2,t:'\\int \\frac{\\cos(2x)}{\\cos x-\\sin x}\\,dx',a:'\\sin x-\\cos x+C',
 h:'$\\cos 2x$ factors as a difference of squares.',
 s:['$\\cos2x=\\cos^2x-\\sin^2x=(\\cos x-\\sin x)(\\cos x+\\sin x)$','Cancel: $\\int(\\cos x+\\sin x)dx$','$=\\sin x-\\cos x+C$'],
 w:'The double-angle identity is a difference of squares in disguise. Spotting that saves you from a Weierstrass substitution on a two-line problem.'},

{tech:'power',d:2,t:'\\int \\frac{dx}{1+\\cos x}',also:'trigint',a:'\\tan\\left(\\frac{x}{2}\\right)+C',
 h:'Multiply top and bottom by $1-\\cos x$, or use the half-angle identity directly.',
 s:['$1+\\cos x=2\\cos^2\\frac x2$','$\\int\\frac{dx}{2\\cos^2(x/2)}=\\frac12\\int\\sec^2\\tfrac x2\\,dx$','$=\\frac12\\cdot2\\tan\\frac x2=\\tan\\frac x2+C$']},

{tech:'power',d:2,t:'\\int \\frac{dx}{1-\\sin x}',also:'trigint',a:'\\tan x+\\sec x+C',
 h:'Rationalise: multiply top and bottom by $1+\\sin x$.',
 s:['$\\frac{1+\\sin x}{1-\\sin^2x}=\\frac{1+\\sin x}{\\cos^2x}=\\sec^2x+\\sec x\\tan x$','$\\tan x+\\sec x+C$'],
 w:'Rationalising a trig denominator is the same move as rationalising a surd: multiply by the conjugate and let the Pythagorean identity collapse it.'},

{tech:'power',d:2,t:'\\int \\frac{x}{x^2+4}\\,dx',a:'\\frac{1}{2}\\ln(x^2+4)+C',
 h:'The numerator is half the derivative of the denominator.',
 s:['$\\frac{d}{dx}(x^2+4)=2x$','$\\int\\frac{x}{x^2+4}dx=\\frac12\\ln(x^2+4)+C$']},

{tech:'power',d:2,t:'\\int \\frac{dx}{x\\sqrt{x^2-1}}',a:'\\operatorname{arcsec}|x|+C',
 h:'A table form — and the one where the absolute value matters.',
 s:['$\\int\\frac{dx}{x\\sqrt{x^2-1}}=\\operatorname{arcsec}|x|+C$'],
 w:'Without the $|x|$ the formula is wrong for $x<-1$: arcsecant is increasing on both branches, but $x$ changes sign.'},

{tech:'power',d:2,t:'\\int \\frac{4x+3}{x^2+1}\\,dx',a:'2\\ln(x^2+1)+3\\arctan x+C',
 h:'Split into the piece that logs and the piece that arctangents.',
 s:['$=\\frac{4x}{x^2+1}+\\frac{3}{x^2+1}$','$2\\ln(x^2+1)+3\\arctan x+C$'],
 w:'Any $\\frac{ax+b}{x^2+c}$ splits this way. The $x$ part is a log, the constant part is an arctangent — never one technique for both.'},

{tech:'power',d:2,t:'\\int \\frac{dx}{x^2+6x+13}',also:'partial',a:'\\frac{1}{2}\\arctan\\left(\\frac{x+3}{2}\\right)+C',
 h:'No real roots — complete the square.',
 s:['$x^2+6x+13=(x+3)^2+4$','$\\int\\frac{dx}{(x+3)^2+4}=\\frac12\\arctan\\frac{x+3}{2}+C$']},

{tech:'power',d:2,t:'\\int \\frac{dx}{\\sqrt{8-2x-x^2}}',also:'trigsub',a:'\\arcsin\\left(\\frac{x+1}{3}\\right)+C',
 h:'Complete the square under the root.',
 s:['$8-2x-x^2=9-(x+1)^2$','$\\int\\frac{dx}{\\sqrt{9-(x+1)^2}}=\\arcsin\\frac{x+1}{3}+C$']},

{tech:'power',d:2,t:'\\int \\frac{e^{2x}-1}{e^{x}}\\,dx',a:'e^{x}+e^{-x}+C',
 h:'Divide through by $e^x$ before anything else.',
 s:['$=e^x-e^{-x}$','$e^x+e^{-x}+C$']},

{tech:'power',d:2,t:'\\int \\frac{e^{3x}+e^{x}}{e^{2x}}\\,dx',a:'e^{x}-e^{-x}+C',
 h:'Split, then subtract exponents.',
 s:['$=e^x+e^{-x}$','$e^x-e^{-x}+C$']},

{tech:'power',d:2,t:'\\int \\tanh x\\,dx',a:'\\ln(\\cosh x)+C',
 h:'It is $\\frac{\\sinh}{\\cosh}$, and $\\cosh$ differentiates to $\\sinh$.',
 s:['$\\int\\frac{\\sinh x}{\\cosh x}dx=\\ln(\\cosh x)+C$'],
 w:'No absolute value is needed: $\\cosh x\\ge1$ is never negative, unlike $\\cos x$ in the ordinary $\\int\\tan$.'},

{tech:'power',d:2,t:'\\int \\operatorname{sech}^2(2x)\\,dx',a:'\\frac{1}{2}\\tanh(2x)+C',
 h:'The hyperbolic $\\sec^2$ rule, with a linear inside.',
 s:['$\\frac12\\tanh(2x)+C$']},

{tech:'power',d:2,t:'\\int \\frac{dx}{\\sqrt{x^2+9}}',also:'trigsub',a:'\\operatorname{arsinh}\\left(\\frac{x}{3}\\right)+C',
 h:'A table form if you know the inverse hyperbolic; otherwise a trig substitution.',
 s:['$\\int\\frac{dx}{\\sqrt{x^2+a^2}}=\\operatorname{arsinh}\\frac xa+C$','$a=3$'],
 w:'This equals $\\ln\\!\\left(x+\\sqrt{x^2+9}\\right)+C$ up to a constant. Both forms are standard; graders accept either.'},

{tech:'power',d:2,t:'\\int \\frac{x^2}{1+x^2}\\,dx',a:'x-\\arctan x+C',
 h:'Degrees are equal — add and subtract $1$ on top.',
 s:['$\\frac{x^2}{1+x^2}=1-\\frac{1}{1+x^2}$','$x-\\arctan x+C$']},

{tech:'power',d:2,t:'\\int \\frac{x^4}{1+x^2}\\,dx',a:'\\frac{x^3}{3}-x+\\arctan x+C',
 h:'Long division: $x^4=(x^2-1)(x^2+1)+1$.',
 s:['$\\frac{x^4}{1+x^2}=x^2-1+\\frac{1}{1+x^2}$','$\\frac{x^3}{3}-x+\\arctan x+C$']},

{tech:'power',d:2,t:'\\int \\frac{\\sqrt{x}+x}{x^{2}}\\,dx',a:'-\\frac{2}{\\sqrt{x}}+\\ln|x|+C',
 h:'Split, then collect exponents.',
 s:['$=x^{-3/2}+x^{-1}$','$\\int x^{-3/2}dx=-2x^{-1/2}$','$-\\frac{2}{\\sqrt x}+\\ln|x|+C$']},

];
