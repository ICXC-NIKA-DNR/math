// Trigonometric substitution. Three patterns, one triangle each:
//   sqrt(a^2 - x^2)  ->  x = a sin t
//   sqrt(a^2 + x^2)  ->  x = a tan t
//   sqrt(x^2 - a^2)  ->  x = a sec t
// Everything else in the category is completing the square to get there.
export default [

/* ── d2: the three patterns, bare ────────────────────────── */
{tech:'trigsub',d:2,t:'\\int \\frac{dx}{\\sqrt{4-x^{2}}}',a:'\\arcsin\\left(\\frac{x}{2}\\right)+C',
 h:'$x=2\\sin t$ — or recognise the table form.',
 s:['$x=2\\sin t$, $dx=2\\cos t\\,dt$, $\\sqrt{4-x^2}=2\\cos t$','$\\int dt=t=\\arcsin\\frac x2+C$']},

{tech:'trigsub',d:2,t:'\\int \\sqrt{9-x^{2}}\\,dx',a:'\\frac{9\\arcsin\\left(\\frac{x}{3}\\right)}{2}+\\frac{x\\sqrt{9-x^{2}}}{2}+C',
 h:'$x=3\\sin t$; you will need the power-reduction identity for $\\cos^2t$.',
 s:['$x=3\\sin t$: $\\int9\\cos^2t\\,dt=\\frac92\\left(t+\\sin t\\cos t\\right)$','$t=\\arcsin\\frac x3$, $\\sin t\\cos t=\\frac{x\\sqrt{9-x^2}}{9}$','$=\\frac92\\arcsin\\frac x3+\\frac{x\\sqrt{9-x^2}}{2}+C$'],
 w:'The answer is the area formula for a circular segment. Trig substitution is just doing that geometry with algebra.'},

{tech:'trigsub',d:2,t:'\\int \\frac{x^{2}}{\\sqrt{4-x^{2}}}\\,dx',a:'2\\arcsin\\left(\\frac{x}{2}\\right)-\\frac{x\\sqrt{4-x^{2}}}{2}+C',
 h:'$x=2\\sin t$ leaves $\\int4\\sin^2t\\,dt$.',
 s:['$\\int 4\\sin^2t\\,dt=2t-2\\sin t\\cos t$','$t=\\arcsin\\frac x2$, $\\sin t\\cos t=\\frac{x\\sqrt{4-x^2}}{4}$']},

{tech:'trigsub',d:2,t:'\\int \\frac{dx}{\\sqrt{x^{2}+16}}',a:'\\ln\\left|x+\\sqrt{x^{2}+16}\\right|+C',
 h:'$x=4\\tan t$ leaves $\\int\\sec t\\,dt$.',
 s:['$x=4\\tan t$: $\\int\\sec t\\,dt=\\ln|\\sec t+\\tan t|$','$\\sec t=\\frac{\\sqrt{x^2+16}}{4}$, $\\tan t=\\frac x4$','Absorb the $\\frac14$ into $C$']},

{tech:'trigsub',d:2,t:'\\int \\frac{dx}{x^{2}\\sqrt{x^{2}+9}}',a:'-\\frac{\\sqrt{x^{2}+9}}{9x}+C',
 h:'$x=3\\tan t$; the integral becomes $\\frac19\\int\\frac{\\cos t}{\\sin^2t}dt$.',
 s:['$x=3\\tan t$, $dx=3\\sec^2t\\,dt$, $\\sqrt{x^2+9}=3\\sec t$','$\\frac19\\int\\frac{dt}{\\tan^2t\\sec t}=\\frac19\\int\\frac{\\cos t}{\\sin^2t}dt=-\\frac{1}{9\\sin t}$','$\\sin t=\\frac{x}{\\sqrt{x^2+9}}$']},

{tech:'trigsub',d:2,t:'\\int \\frac{dx}{\\left(x^{2}+1\\right)^{3/2}}',a:'\\frac{x}{\\sqrt{x^{2}+1}}+C',
 h:'$x=\\tan t$ collapses it to $\\int\\cos t\\,dt$.',
 s:['$x=\\tan t$, $dx=\\sec^2t\\,dt$, $(x^2+1)^{3/2}=\\sec^3t$','$\\int\\cos t\\,dt=\\sin t$','$\\sin t=\\frac{x}{\\sqrt{x^2+1}}$'],
 w:'A $\\frac32$ power in the denominator almost always collapses completely. That is the signal to reach for $x=a\\tan t$ rather than anything else.'},

{tech:'trigsub',d:2,t:'\\int \\frac{dx}{\\left(x^{2}+4\\right)^{3/2}}',a:'\\frac{x}{4\\sqrt{x^{2}+4}}+C',
 h:'Same collapse with $a=2$.',
 s:['$x=2\\tan t$: $\\frac14\\int\\cos t\\,dt=\\frac{\\sin t}{4}$','$\\sin t=\\frac{x}{\\sqrt{x^2+4}}$']},

{tech:'trigsub',d:2,t:'\\int \\frac{dx}{\\sqrt{x^{2}-4}}',a:'\\ln\\left|x+\\sqrt{x^{2}-4}\\right|+C',
 h:'$x=2\\sec t$ leaves $\\int\\sec t\\,dt$ again.',
 s:['$x=2\\sec t$, $dx=2\\sec t\\tan t\\,dt$, $\\sqrt{x^2-4}=2\\tan t$','$\\int\\sec t\\,dt=\\ln|\\sec t+\\tan t|$','$=\\ln\\left|\\frac x2+\\frac{\\sqrt{x^2-4}}{2}\\right|$']},

{tech:'trigsub',d:2,t:'\\int \\frac{\\sqrt{x^{2}-9}}{x}\\,dx',a:'\\sqrt{x^{2}-9}-3\\arctan\\left(\\frac{\\sqrt{x^{2}-9}}{3}\\right)+C',
 h:'$x=3\\sec t$ leaves $3\\int\\tan^{2}t\\,dt$.',
 s:['$3\\int\\tan^2t\\,dt=3(\\tan t-t)$','$\\tan t=\\frac{\\sqrt{x^2-9}}{3}$','Writing $t$ back as $\\arctan\\frac{\\sqrt{x^2-9}}{3}$ keeps the formula correct on both branches'],
 w:'$\\operatorname{arcsec}\\frac x3$ is the obvious way to undo the substitution and it is wrong for $x<-3$ — the arctangent form is right on both branches.'},

{tech:'trigsub',d:2,t:'\\int \\frac{dx}{x\\sqrt{4-x^{2}}}',a:'-\\frac{\\ln\\left|\\frac{2+\\sqrt{4-x^{2}}}{x}\\right|}{2}+C',
 h:'$x=2\\sin t$ gives $\\frac12\\int\\csc t\\,dt$.',
 s:['$\\frac12\\int\\csc t\\,dt=-\\frac12\\ln|\\csc t+\\cot t|$','$\\csc t=\\frac2x$, $\\cot t=\\frac{\\sqrt{4-x^2}}{x}$']},

{tech:'trigsub',d:2,t:'\\int \\frac{x^{2}}{\\sqrt{x^{2}+1}}\\,dx',also:'parts',a:'\\frac{x\\sqrt{x^{2}+1}}{2}-\\frac{\\ln\\left|x+\\sqrt{x^{2}+1}\\right|}{2}+C',
 h:'$x=\\tan t$ turns it into $\\int\\tan^2t\\sec t\\,dt$ — and that needs $\\int\\sec^3$.',
 s:['$\\int(\\sec^3t-\\sec t)dt$','$\\int\\sec^3=\\frac{\\sec t\\tan t+\\ln|\\sec t+\\tan t|}{2}$','Subtract $\\int\\sec t$ and substitute back']},

{tech:'trigsub',d:2,t:'\\int \\sqrt{x^{2}+1}\\,dx',also:'parts',a:'\\frac{x\\sqrt{x^{2}+1}}{2}+\\frac{\\ln\\left|x+\\sqrt{x^{2}+1}\\right|}{2}+C',
 h:'$x=\\tan t$ gives $\\int\\sec^3t\\,dt$ directly.',
 s:['$\\int\\sec^3t\\,dt=\\frac{\\sec t\\tan t}{2}+\\frac{\\ln|\\sec t+\\tan t|}{2}$','$\\sec t=\\sqrt{x^2+1}$, $\\tan t=x$'],
 w:'Every $\\int\\sqrt{x^2+a^2}$ is $\\int\\sec^3$ in disguise. That is why $\\int\\sec^3$ is worth memorising.'},

{tech:'trigsub',d:2,t:'\\int \\sqrt{4x^{2}+1}\\,dx',also:'parts',a:'\\frac{x\\sqrt{4x^{2}+1}}{2}+\\frac{\\ln\\left|2x+\\sqrt{4x^{2}+1}\\right|}{4}+C',
 h:'Factor the $4$ out first: $\\sqrt{4x^2+1}=2\\sqrt{x^2+\\frac14}$.',
 s:['$2x=\\tan t$','Same $\\int\\sec^3$, rescaled','Substitute back with $\\tan t=2x$']},

/* ── d3: complete the square, or a harder leftover ───────── */
{tech:'trigsub',d:3,t:'\\int \\frac{dx}{\\sqrt{x^{2}+4x+5}}',a:'\\ln\\left|x+2+\\sqrt{x^{2}+4x+5}\\right|+C',
 h:'$(x+2)^2+1$ — shift first, substitute second.',
 s:['$x^2+4x+5=(x+2)^2+1$','$u=x+2$: $\\int\\frac{du}{\\sqrt{u^2+1}}=\\ln\\left|u+\\sqrt{u^2+1}\\right|$']},

{tech:'trigsub',d:3,t:'\\int \\frac{dx}{\\sqrt{x^{2}-6x+8}}',a:'\\ln\\left|x-3+\\sqrt{x^{2}-6x+8}\\right|+C',
 h:'$(x-3)^2-1$ — the $\\sec$ pattern.',
 s:['$u=x-3$: $\\int\\frac{du}{\\sqrt{u^2-1}}=\\ln\\left|u+\\sqrt{u^2-1}\\right|$']},

{tech:'trigsub',d:3,t:'\\int \\sqrt{3-2x-x^{2}}\\,dx',a:'2\\arcsin\\left(\\frac{x+1}{2}\\right)+\\frac{(x+1)\\sqrt{3-2x-x^{2}}}{2}+C',
 h:'$4-(x+1)^2$ — the $\\sin$ pattern after a shift.',
 s:['$3-2x-x^2=4-(x+1)^2$','$u=x+1$: $\\int\\sqrt{4-u^2}\\,du=2\\arcsin\\frac u2+\\frac{u\\sqrt{4-u^2}}{2}$']},

{tech:'trigsub',d:3,t:'\\int \\frac{x\\,dx}{\\sqrt{x^{2}+2x+2}}',a:'\\sqrt{x^{2}+2x+2}-\\ln\\left|x+1+\\sqrt{x^{2}+2x+2}\\right|+C',
 h:'Complete the square, then split the numerator into $(x+1)-1$.',
 s:['$u=x+1$: $\\int\\frac{u-1}{\\sqrt{u^2+1}}du$','$\\int\\frac{u\\,du}{\\sqrt{u^2+1}}=\\sqrt{u^2+1}$','$-\\int\\frac{du}{\\sqrt{u^2+1}}=-\\ln\\left|u+\\sqrt{u^2+1}\\right|$']},

{tech:'trigsub',d:3,t:'\\int \\frac{dx}{\\left(4-x^{2}\\right)^{3/2}}',a:'\\frac{x}{4\\sqrt{4-x^{2}}}+C',
 h:'$x=2\\sin t$; the $\\frac32$ power collapses again.',
 s:['$x=2\\sin t$: $\\frac14\\int\\sec^2t\\,dt=\\frac{\\tan t}{4}$','$\\tan t=\\frac{x}{\\sqrt{4-x^2}}$']},

{tech:'trigsub',d:3,t:'\\int \\frac{x^{2}}{\\left(x^{2}+9\\right)^{3/2}}\\,dx',a:'-\\frac{x}{\\sqrt{x^{2}+9}}+\\ln\\left|x+\\sqrt{x^{2}+9}\\right|+C',
 h:'$x=3\\tan t$ gives $\\int\\frac{\\sin^2t}{\\cos t}dt$.',
 s:['$\\int\\frac{\\tan^2t}{\\sec t}dt=\\int(\\sec t-\\cos t)dt=\\ln|\\sec t+\\tan t|-\\sin t$','$\\sin t=\\frac{x}{\\sqrt{x^2+9}}$']},

{tech:'trigsub',d:3,t:'\\int \\frac{\\sqrt{4-x^{2}}}{x^{2}}\\,dx',a:'-\\frac{\\sqrt{4-x^{2}}}{x}-\\arcsin\\left(\\frac{x}{2}\\right)+C',
 h:'$x=2\\sin t$ gives $\\int\\cot^2t\\,dt$.',
 s:['$\\int\\cot^2t\\,dt=-\\cot t-t$','$\\cot t=\\frac{\\sqrt{4-x^2}}{x}$, $t=\\arcsin\\frac x2$']},

{tech:'trigsub',d:3,t:'\\int \\frac{dx}{x^{2}\\sqrt{x^{2}-1}}',a:'\\frac{\\sqrt{x^{2}-1}}{x}+C',
 h:'$x=\\sec t$ gives $\\int\\cos t\\,dt$.',
 s:['$x=\\sec t$, $dx=\\sec t\\tan t\\,dt$, $\\sqrt{x^2-1}=\\tan t$','$\\int\\frac{\\sec t\\tan t}{\\sec^2t\\tan t}dt=\\int\\cos t\\,dt=\\sin t$','$\\sin t=\\frac{\\sqrt{x^2-1}}{x}$']},

{tech:'trigsub',d:3,t:'\\int \\frac{dx}{\\left(x^{2}+1\\right)^{2}}',also:'partial',a:'\\frac{\\arctan x}{2}+\\frac{x}{2\\left(x^{2}+1\\right)}+C',
 h:'$x=\\tan t$ gives $\\int\\cos^2t\\,dt$.',
 s:['$\\int\\cos^2t\\,dt=\\frac t2+\\frac{\\sin t\\cos t}{2}$','$t=\\arctan x$, $\\sin t\\cos t=\\frac{x}{1+x^2}$'],
 w:'This integral is the workhorse behind repeated irreducible quadratics in partial fractions. Learn it as a formula.'},

{tech:'trigsub',d:3,t:'\\int \\frac{dx}{\\left(x^{2}+4\\right)^{2}}',also:'partial',a:'\\frac{\\arctan\\left(\\frac{x}{2}\\right)}{16}+\\frac{x}{8\\left(x^{2}+4\\right)}+C',
 h:'Same shape with $a=2$; watch the powers of $a$.',
 s:['$x=2\\tan t$: $\\frac18\\int\\cos^2t\\,dt$','$=\\frac{t}{16}+\\frac{\\sin t\\cos t}{16}$','$\\sin t\\cos t=\\frac{2x}{x^2+4}$']},

{tech:'trigsub',d:3,t:'\\int \\frac{x\\,dx}{\\sqrt{x^{2}-9}}',also:'usub',a:'\\sqrt{x^{2}-9}+C',
 h:'No triangle needed — this is a plain $u$-substitution.',
 s:['$u=x^2-9$, $x\\,dx=\\frac{du}{2}$','$\\frac12\\int u^{-1/2}du=\\sqrt u$'],
 w:'Check for a stray $x$ before drawing a triangle. An odd power of $x$ outside the root means $u=x^2\\pm a^2$ does the job in one line.'},

{tech:'trigsub',d:3,t:'\\int \\frac{x^{3}\\,dx}{\\sqrt{x^{2}+4}}',also:'usub',a:'\\frac{\\left(x^{2}+4\\right)^{3/2}}{3}-4\\sqrt{x^{2}+4}+C',
 h:'Odd power of $x$ — substitute, do not draw a triangle.',
 s:['$u=x^2+4$, $x^2=u-4$','$\\frac12\\int\\frac{u-4}{\\sqrt u}du=\\frac13u^{3/2}-4u^{1/2}$']},

{tech:'trigsub',d:3,t:'\\int \\frac{dx}{\\sqrt{\\left(1-x^{2}\\right)^{3}}}',a:'\\frac{x}{\\sqrt{1-x^{2}}}+C',
 h:'It is $(1-x^2)^{-3/2}$. Use $x=\\sin t$.',
 s:['$x=\\sin t$: $\\int\\sec^2t\\,dt=\\tan t$','$\\tan t=\\frac{x}{\\sqrt{1-x^2}}$']},

{tech:'trigsub',d:3,t:'\\int \\sqrt{\\frac{1-x}{1+x}}\\,dx',also:'usub',a:'\\arcsin x+\\sqrt{1-x^{2}}+C',
 h:'Rationalise: multiply inside by $\\frac{1-x}{1-x}$ to get $\\frac{1-x}{\\sqrt{1-x^{2}}}$.',
 s:['$\\sqrt{\\frac{1-x}{1+x}}=\\frac{1-x}{\\sqrt{1-x^2}}$','$\\int\\frac{dx}{\\sqrt{1-x^2}}=\\arcsin x$','$-\\int\\frac{x\\,dx}{\\sqrt{1-x^2}}=\\sqrt{1-x^2}$']},

{tech:'trigsub',d:3,t:'\\int x^{2}\\sqrt{1-x^{2}}\\,dx',also:'trigint',a:'\\frac{\\arcsin x}{8}-\\frac{x\\sqrt{1-x^{2}}\\left(1-2x^{2}\\right)}{8}+C',
 h:'$x=\\sin t$ gives $\\int\\sin^2t\\cos^2t\\,dt$ — a power-reduction problem.',
 s:['$\\int\\sin^2t\\cos^2t\\,dt=\\frac t8-\\frac{\\sin4t}{32}$','$\\sin4t=2\\sin2t\\cos2t=4\\sin t\\cos t(1-2\\sin^2t)$','Substitute $\\sin t=x$']},

/* ── d4: the long ones ───────────────────────────────────── */
{tech:'trigsub',d:4,t:'\\int \\frac{dx}{x\\sqrt{x^{2}+4}}',a:'\\frac{\\ln\\left|\\frac{\\sqrt{x^{2}+4}-2}{x}\\right|}{2}+C',
 h:'$x=2\\tan t$ leaves $\\frac12\\int\\csc t\\,dt$.',
 s:['$\\frac12\\int\\csc t\\,dt=-\\frac12\\ln|\\csc t+\\cot t|$','$\\csc t=\\frac{\\sqrt{x^2+4}}{x}$, $\\cot t=\\frac2x$','$-\\frac12\\ln\\left|\\frac{\\sqrt{x^2+4}+2}{x}\\right|$, which is the stated form']},

{tech:'trigsub',d:4,t:'\\int \\frac{\\sqrt{x^{2}-1}}{x^{4}}\\,dx',a:'\\frac{\\left(x^{2}-1\\right)^{3/2}}{3x^{3}}+C',
 h:'$x=\\sec t$ gives $\\int\\sin^2t\\cos t\\,dt$.',
 s:['$x=\\sec t$: $\\int\\frac{\\tan t\\cdot\\sec t\\tan t}{\\sec^4t}dt=\\int\\sin^2t\\cos t\\,dt$','$=\\frac{\\sin^3t}{3}$','$\\sin t=\\frac{\\sqrt{x^2-1}}{x}$']},

{tech:'trigsub',d:4,t:'\\int \\frac{dx}{\\left(x^{2}-1\\right)^{3/2}}',a:'-\\frac{x}{\\sqrt{x^{2}-1}}+C',
 h:'$x=\\sec t$ gives $\\int\\frac{\\cos t}{\\sin^{2}t}dt$.',
 s:['$\\int\\csc t\\cot t\\,dt=-\\csc t$','$\\csc t=\\frac{x}{\\sqrt{x^2-1}}$']},

{tech:'trigsub',d:4,t:'\\int \\frac{x^{2}}{\\left(1-x^{2}\\right)^{3/2}}\\,dx',a:'\\frac{x}{\\sqrt{1-x^{2}}}-\\arcsin x+C',
 h:'$x=\\sin t$ turns the whole thing into $\\int\\tan^{2}t\\,dt$.',
 s:['$x=\\sin t$: $\\int\\tan^2t\\,dt=\\tan t-t$','$\\tan t=\\frac{x}{\\sqrt{1-x^2}}$, $t=\\arcsin x$']},

{tech:'trigsub',d:4,t:'\\int \\sqrt{x^{2}-4}\\,dx',also:'parts',a:'\\frac{x\\sqrt{x^{2}-4}}{2}-2\\ln\\left|x+\\sqrt{x^{2}-4}\\right|+C',
 h:'$x=2\\sec t$ gives $4\\int\\sec t\\tan^{2}t\\,dt$.',
 s:['$4\\int(\\sec^3t-\\sec t)dt$','$=2\\sec t\\tan t-2\\ln|\\sec t+\\tan t|$','Substitute back']},

{tech:'trigsub',d:4,t:'\\int \\frac{dx}{\\left(1+x^{2}\\right)^{3}}',also:'trigint',a:'\\frac{3\\arctan x}{8}+\\frac{3x}{8\\left(1+x^{2}\\right)}+\\frac{x}{4\\left(1+x^{2}\\right)^{2}}+C',
 h:'$x=\\tan t$ gives $\\int\\cos^{4}t\\,dt$.',
 s:['$\\int\\cos^4t\\,dt=\\frac{3t}{8}+\\frac{\\sin2t}{4}+\\frac{\\sin4t}{32}$','Rewrite in $x$ using $\\sin t\\cos t=\\frac{x}{1+x^2}$ and $\\cos^2t=\\frac{1}{1+x^2}$'],
 w:'Each extra power in $(1+x^2)^{-n}$ costs you one more power of cosine. The reduction formula for $\\int\\cos^n$ is the general answer.'},

{tech:'trigsub',d:4,t:'\\int \\frac{\\sqrt{9-x^{2}}}{x^{4}}\\,dx',a:'-\\frac{\\left(9-x^{2}\\right)^{3/2}}{27x^{3}}+C',
 h:'$x=3\\sin t$ gives $\\frac19\\int\\cot^{2}t\\csc^{2}t\\,dt$.',
 s:['$\\frac{1}{9}\\int\\frac{\\cos^2t}{\\sin^4t}dt=-\\frac{\\cot^3t}{27}$','$\\cot t=\\frac{\\sqrt{9-x^2}}{x}$']},

{tech:'trigsub',d:4,t:'\\int \\frac{x\\,dx}{\\sqrt{x-x^{2}}}',also:'usub',a:'\\frac{\\arcsin\\left(2x-1\\right)}{2}-\\sqrt{x-x^{2}}+C',
 h:'Complete the square under the root: $x-x^{2}=\\frac14-\\left(x-\\frac12\\right)^{2}$.',
 s:['$x-x^2=\\frac14-\\left(x-\\frac12\\right)^2$','$u=x-\\frac12$: $\\int\\frac{u+\\frac12}{\\sqrt{\\frac14-u^2}}du$','$=-\\sqrt{\\tfrac14-u^2}+\\tfrac12\\arcsin(2u)$']},

{tech:'trigsub',d:4,t:'\\int \\frac{dx}{\\sqrt{\\left(x^{2}+1\\right)^{5}}}',a:'\\frac{x}{\\sqrt{x^{2}+1}}-\\frac{x^{3}}{3\\left(x^{2}+1\\right)^{3/2}}+C',
 h:'$x=\\tan t$ gives $\\int\\cos^{3}t\\,dt$.',
 s:['$\\int\\cos^3t\\,dt=\\sin t-\\frac{\\sin^3t}{3}$','$\\sin t=\\frac{x}{\\sqrt{x^2+1}}$','$=\\frac{x}{\\sqrt{x^2+1}}-\\frac{x^3}{3(x^2+1)^{3/2}}+C$']},

];
