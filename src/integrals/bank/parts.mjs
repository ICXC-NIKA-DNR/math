// Integration by parts. LIATE picks u: logs, inverse trig, algebraic,
// trig, exponential — whichever appears first is the one you differentiate.
export default [

/* ── d2: one pass ────────────────────────────────────────── */
{tech:'parts',d:2,t:'\\int x e^{x}\\,dx',a:'xe^{x}-e^{x}+C',
 h:'$u=x$ — differentiating it makes it vanish.',
 s:['$u=x$, $dv=e^xdx$; $du=dx$, $v=e^x$','$xe^x-\\int e^xdx$','$=xe^x-e^x+C$']},

{tech:'parts',d:2,t:'\\int x e^{-x}\\,dx',a:'-xe^{-x}-e^{-x}+C',
 h:'Same shape; mind the sign in $v$.',
 s:['$u=x$, $dv=e^{-x}dx$, $v=-e^{-x}$','$-xe^{-x}+\\int e^{-x}dx$','$=-xe^{-x}-e^{-x}+C$']},

{tech:'parts',d:2,t:'\\int x\\sin x\\,dx',a:'-x\\cos x+\\sin x+C',
 h:'Algebraic beats trig, so $u=x$.',
 s:['$u=x$, $dv=\\sin x\\,dx$, $v=-\\cos x$','$-x\\cos x+\\int\\cos x\\,dx$','$=-x\\cos x+\\sin x+C$']},

{tech:'parts',d:2,t:'\\int x\\cos(3x)\\,dx',a:'\\frac{x\\sin(3x)}{3}+\\frac{\\cos(3x)}{9}+C',
 h:'$v=\\frac{\\sin 3x}{3}$ — the chain rule costs you a third each time.',
 s:['$u=x$, $v=\\frac{\\sin3x}{3}$','$\\frac{x\\sin3x}{3}-\\frac13\\int\\sin3x\\,dx$','$=\\frac{x\\sin3x}{3}+\\frac{\\cos3x}{9}+C$']},

{tech:'parts',d:2,t:'\\int \\ln x\\,dx',a:'x\\ln x-x+C',
 h:'There is only one sensible choice: $u=\\ln x$, $dv=dx$.',
 s:['$u=\\ln x$, $dv=dx$; $du=\\frac{dx}{x}$, $v=x$','$x\\ln x-\\int x\\cdot\\frac1x dx$','$=x\\ln x-x+C$'],
 w:'Parts works here with no visible product: the second factor is $1$. Any lone transcendental — $\\ln$, $\\arctan$, $\\arcsin$ — yields to this.'},

{tech:'parts',d:2,t:'\\int \\ln(3x)\\,dx',a:'x\\ln(3x)-x+C',
 h:'Same move; the constant inside does not change $du$ by much.',
 s:['$u=\\ln3x$, $du=\\frac{dx}{x}$, $v=x$','$x\\ln3x-\\int dx$','$=x\\ln3x-x+C$']},

{tech:'parts',d:2,t:'\\int x\\ln x\\,dx',a:'\\frac{x^2\\ln x}{2}-\\frac{x^2}{4}+C',
 h:'$\\ln$ comes before algebraic in LIATE — differentiate it.',
 s:['$u=\\ln x$, $dv=x\\,dx$, $v=\\frac{x^2}{2}$','$\\frac{x^2\\ln x}{2}-\\frac12\\int x\\,dx$','$=\\frac{x^2\\ln x}{2}-\\frac{x^2}{4}+C$']},

{tech:'parts',d:2,t:'\\int x^{3}\\ln x\\,dx',a:'\\frac{x^4\\ln x}{4}-\\frac{x^4}{16}+C',
 h:'Same split, higher power.',
 s:['$u=\\ln x$, $v=\\frac{x^4}{4}$','$\\frac{x^4\\ln x}{4}-\\frac14\\int x^3dx$','$=\\frac{x^4\\ln x}{4}-\\frac{x^4}{16}+C$']},

{tech:'parts',d:2,t:'\\int \\frac{\\ln x}{x^{3}}\\,dx',a:'-\\frac{\\ln x}{2x^2}-\\frac{1}{4x^2}+C',
 h:'$dv=x^{-3}dx$.',
 s:['$u=\\ln x$, $v=-\\frac{1}{2x^2}$','$-\\frac{\\ln x}{2x^2}+\\frac12\\int x^{-3}dx$','$=-\\frac{\\ln x}{2x^2}-\\frac{1}{4x^2}+C$']},

{tech:'parts',d:2,t:'\\int \\arctan x\\,dx',a:'x\\arctan x-\\frac{1}{2}\\ln(1+x^{2})+C',
 h:'$u=\\arctan x$, $dv=dx$; the leftover is a $u$-sub.',
 s:['$x\\arctan x-\\int\\frac{x}{1+x^2}dx$','$\\int\\frac{x}{1+x^2}dx=\\frac12\\ln(1+x^2)$','$=x\\arctan x-\\frac12\\ln(1+x^2)+C$']},

{tech:'parts',d:2,t:'\\int \\arcsin x\\,dx',a:'x\\arcsin x+\\sqrt{1-x^{2}}+C',
 h:'Same pattern; the leftover is $\\int\\frac{x\\,dx}{\\sqrt{1-x^2}}$.',
 s:['$x\\arcsin x-\\int\\frac{x}{\\sqrt{1-x^2}}dx$','$\\int\\frac{x}{\\sqrt{1-x^2}}dx=-\\sqrt{1-x^2}$','$=x\\arcsin x+\\sqrt{1-x^2}+C$']},

{tech:'parts',d:2,t:'\\int \\arccos x\\,dx',a:'x\\arccos x-\\sqrt{1-x^{2}}+C',
 h:'The arcsine answer with both signs flipped.',
 s:['$x\\arccos x+\\int\\frac{x}{\\sqrt{1-x^2}}dx$','$=x\\arccos x-\\sqrt{1-x^2}+C$']},

{tech:'parts',d:2,t:'\\int x\\sec^{2}x\\,dx',a:'x\\tan x+\\ln|\\cos x|+C',
 h:'$dv=\\sec^2x\\,dx$ gives $v=\\tan x$.',
 s:['$x\\tan x-\\int\\tan x\\,dx$','$\\int\\tan x\\,dx=-\\ln|\\cos x|$','$=x\\tan x+\\ln|\\cos x|+C$']},

{tech:'parts',d:2,t:'\\int \\frac{x}{e^{x}}\\,dx',a:'-\\frac{x}{e^{x}}-\\frac{1}{e^{x}}+C',
 h:'Rewrite as $xe^{-x}$ first.',
 s:['$u=x$, $v=-e^{-x}$','$-xe^{-x}+\\int e^{-x}dx=-xe^{-x}-e^{-x}+C$']},

{tech:'parts',d:2,t:'\\int x\\sinh x\\,dx',a:'x\\cosh x-\\sinh x+C',
 h:'Hyperbolic version — no sign surprises.',
 s:['$u=x$, $v=\\cosh x$','$x\\cosh x-\\int\\cosh x\\,dx$','$=x\\cosh x-\\sinh x+C$']},

{tech:'parts',d:2,t:'\\int x\\,2^{x}\\,dx',a:'\\frac{x\\,2^{x}}{\\ln 2}-\\frac{2^{x}}{(\\ln 2)^{2}}+C',
 h:'$v=\\frac{2^x}{\\ln 2}$.',
 s:['$u=x$, $dv=2^xdx$, $v=\\frac{2^x}{\\ln2}$','$\\frac{x2^x}{\\ln2}-\\frac{1}{\\ln2}\\int2^xdx$','$=\\frac{x2^x}{\\ln2}-\\frac{2^x}{(\\ln2)^2}+C$']},

/* ── d3: two passes, or a loop ───────────────────────────── */
{tech:'parts',d:3,t:'\\int x^{2}e^{x}\\,dx',a:'x^{2}e^{x}-2xe^{x}+2e^{x}+C',
 h:'Parts twice — the power drops by one each time.',
 s:['First pass: $x^2e^x-2\\int xe^xdx$','$\\int xe^xdx=xe^x-e^x$','$=x^2e^x-2xe^x+2e^x+C$'],
 w:'With $x^n$ against $e^{ax}$ the tabular layout is faster: differentiate $x^n$ down to zero, integrate $e^{ax}$ alongside, and alternate signs.'},

{tech:'parts',d:3,t:'\\int x^{2}\\sin x\\,dx',a:'-x^{2}\\cos x+2x\\sin x+2\\cos x+C',
 h:'Two passes; the trig cycles, the power falls.',
 s:['$-x^2\\cos x+2\\int x\\cos x\\,dx$','$\\int x\\cos x\\,dx=x\\sin x+\\cos x$','$=-x^2\\cos x+2x\\sin x+2\\cos x+C$']},

{tech:'parts',d:3,t:'\\int x^{2}\\cos(2x)\\,dx',a:'\\frac{x^{2}\\sin(2x)}{2}+\\frac{x\\cos(2x)}{2}-\\frac{\\sin(2x)}{4}+C',
 h:'Two passes, and every integration of the trig costs a $\\frac12$.',
 s:['$\\frac{x^2\\sin2x}{2}-\\int x\\sin2x\\,dx$','$\\int x\\sin2x\\,dx=-\\frac{x\\cos2x}{2}+\\frac{\\sin2x}{4}$','Combine']},

{tech:'parts',d:3,t:'\\int x^{3}e^{x}\\,dx',a:'x^{3}e^{x}-3x^{2}e^{x}+6xe^{x}-6e^{x}+C',
 h:'Three passes, or one tabular column.',
 s:['Signs alternate: $+x^3e^x-3x^2e^x+6xe^x-6e^x$','$+C$']},

{tech:'parts',d:3,t:'\\int e^{x}\\sin x\\,dx',a:'\\frac{e^{x}(\\sin x-\\cos x)}{2}+C',
 h:'Parts twice brings the original integral back. Solve for it.',
 s:['$I=e^x\\sin x-\\int e^x\\cos x\\,dx$','$\\int e^x\\cos x\\,dx=e^x\\cos x+I$','$I=e^x\\sin x-e^x\\cos x-I\\Rightarrow 2I=e^x(\\sin x-\\cos x)$'],
 w:'The integral reappearing is not failure, it is the method. Treat $I$ as an unknown and solve the equation.'},

{tech:'parts',d:3,t:'\\int e^{x}\\cos x\\,dx',a:'\\frac{e^{x}(\\sin x+\\cos x)}{2}+C',
 h:'Same loop, other starting point.',
 s:['$2I=e^x(\\sin x+\\cos x)$','$I=\\frac{e^x(\\sin x+\\cos x)}{2}+C$']},

{tech:'parts',d:3,t:'\\int e^{2x}\\sin(3x)\\,dx',a:'\\frac{e^{2x}\\left(2\\sin(3x)-3\\cos(3x)\\right)}{13}+C',
 h:'The same loop; the denominator is $a^2+b^2$.',
 s:['With $a=2$, $b=3$: $\\int e^{ax}\\sin bx\\,dx=\\frac{e^{ax}(a\\sin bx-b\\cos bx)}{a^2+b^2}$','$a^2+b^2=13$'],
 w:'$a^2+b^2$ in the denominator is not a coincidence — it is $|a+bi|^2$. The real shortcut is $\\int e^{(a+bi)x}dx$ and taking the imaginary part.'},

{tech:'parts',d:3,t:'\\int e^{-x}\\cos(2x)\\,dx',a:'\\frac{e^{-x}\\left(2\\sin(2x)-\\cos(2x)\\right)}{5}+C',
 h:'$a=-1$, $b=2$, so the denominator is $5$.',
 s:['$\\int e^{ax}\\cos bx\\,dx=\\frac{e^{ax}(a\\cos bx+b\\sin bx)}{a^2+b^2}$','$=\\frac{e^{-x}(-\\cos2x+2\\sin2x)}{5}+C$']},

{tech:'parts',d:3,t:'\\int (\\ln x)^{2}\\,dx',a:'x(\\ln x)^{2}-2x\\ln x+2x+C',
 h:'$u=(\\ln x)^2$, $dv=dx$; the leftover is $\\int\\ln x\\,dx$.',
 s:['$x(\\ln x)^2-2\\int\\ln x\\,dx$','$\\int\\ln x\\,dx=x\\ln x-x$','$=x(\\ln x)^2-2x\\ln x+2x+C$']},

{tech:'parts',d:3,t:'\\int \\sec^{3}x\\,dx',also:'trigsub',a:'\\frac{\\sec x\\tan x}{2}+\\frac{\\ln|\\sec x+\\tan x|}{2}+C',
 h:'Split as $\\sec x\\cdot\\sec^2x$, then use $\\tan^2=\\sec^2-1$ to make it loop.',
 s:['$I=\\sec x\\tan x-\\int\\sec x\\tan^2x\\,dx$','$\\tan^2=\\sec^2-1$ gives $I=\\sec x\\tan x-I+\\int\\sec x\\,dx$','$2I=\\sec x\\tan x+\\ln|\\sec x+\\tan x|$'],
 w:'This is the integral every trig substitution eventually lands on. Learn it once and the $\\sqrt{x^2+a^2}$ family stops being frightening.'},

{tech:'parts',d:3,t:'\\int \\csc^{3}x\\,dx',also:'trigint',a:'-\\frac{\\csc x\\cot x}{2}-\\frac{\\ln|\\csc x+\\cot x|}{2}+C',
 h:'Mirror image of $\\int\\sec^3$.',
 s:['$2I=-\\csc x\\cot x-\\ln|\\csc x+\\cot x|$']},

{tech:'parts',d:3,t:'\\int x\\arctan x\\,dx',a:'\\frac{x^{2}\\arctan x}{2}-\\frac{x}{2}+\\frac{\\arctan x}{2}+C',
 h:'$u=\\arctan x$, $dv=x\\,dx$; then long-divide the leftover.',
 s:['$\\frac{x^2\\arctan x}{2}-\\frac12\\int\\frac{x^2}{1+x^2}dx$','$\\frac{x^2}{1+x^2}=1-\\frac{1}{1+x^2}$','$=\\frac{x^2\\arctan x}{2}-\\frac x2+\\frac{\\arctan x}{2}+C$']},

{tech:'parts',d:3,t:'\\int x\\arcsin x\\,dx',also:'trigsub',a:'\\frac{x^{2}\\arcsin x}{2}-\\frac{\\arcsin x}{4}+\\frac{x\\sqrt{1-x^{2}}}{4}+C',
 h:'$u=\\arcsin x$; the leftover is $\\int\\frac{x^2}{\\sqrt{1-x^2}}dx$.',
 s:['$\\frac{x^2\\arcsin x}{2}-\\frac12\\int\\frac{x^2dx}{\\sqrt{1-x^2}}$','$\\int\\frac{x^2dx}{\\sqrt{1-x^2}}=\\frac{\\arcsin x}{2}-\\frac{x\\sqrt{1-x^2}}{2}$','Combine']},

{tech:'parts',d:3,t:'\\int \\ln\\left(x^{2}+1\\right)dx',also:'partial',a:'x\\ln\\left(x^{2}+1\\right)-2x+2\\arctan x+C',
 h:'$u=\\ln(x^2+1)$, $dv=dx$.',
 s:['$x\\ln(x^2+1)-\\int\\frac{2x^2}{x^2+1}dx$','$\\frac{2x^2}{x^2+1}=2-\\frac{2}{x^2+1}$','$=x\\ln(x^2+1)-2x+2\\arctan x+C$']},

{tech:'parts',d:3,t:'\\int \\frac{x e^{x}}{(1+x)^{2}}\\,dx',a:'\\frac{e^{x}}{1+x}+C',
 h:'Write $x=(1+x)-1$ and split — one piece is a reverse product rule.',
 s:['$\\frac{xe^x}{(1+x)^2}=\\frac{e^x}{1+x}-\\frac{e^x}{(1+x)^2}$','That is exactly $\\frac{d}{dx}\\left(\\frac{e^x}{1+x}\\right)$','$=\\frac{e^x}{1+x}+C$'],
 w:'$\\int e^x\\left(f+f\'\\right)dx=e^xf$. Spotting an $f$ and its derivative inside the brackets turns a hard integral into no work at all.'},

{tech:'parts',d:3,t:'\\int e^{x}\\left(\\frac{1}{x}-\\frac{1}{x^{2}}\\right)dx',a:'\\frac{e^{x}}{x}+C',
 h:'$f=\\frac1x$ and $f\'=-\\frac{1}{x^2}$ are both sitting there.',
 s:['$\\int e^x(f+f\')dx=e^xf$','$f=\\frac1x$','$=\\frac{e^x}{x}+C$']},

{tech:'parts',d:3,t:'\\int e^{x}\\left(\\tan x+\\sec^{2}x\\right)dx',a:'e^{x}\\tan x+C',
 h:'Same reverse product rule.',
 s:['$f=\\tan x$, $f\'=\\sec^2x$','$=e^x\\tan x+C$']},

{tech:'parts',d:3,t:'\\int \\frac{\\ln x}{\\left(x+1\\right)^{2}}\\,dx',also:'partial',a:'-\\frac{\\ln x}{x+1}+\\ln|x|-\\ln|x+1|+C',
 h:'$dv=(x+1)^{-2}dx$, then partial-fraction the leftover.',
 s:['$u=\\ln x$, $v=-\\frac{1}{x+1}$','$-\\frac{\\ln x}{x+1}+\\int\\frac{dx}{x(x+1)}$','$\\int\\frac{dx}{x(x+1)}=\\ln|x|-\\ln|x+1|$']},

{tech:'parts',d:3,t:'\\int x^{2}\\ln x\\,dx',a:'\\frac{x^{3}\\ln x}{3}-\\frac{x^{3}}{9}+C',
 h:'Standard $u=\\ln x$.',
 s:['$\\frac{x^3\\ln x}{3}-\\frac13\\int x^2dx$','$=\\frac{x^3\\ln x}{3}-\\frac{x^3}{9}+C$']},

{tech:'parts',d:3,t:'\\int \\sin(\\ln x)\\,dx',also:'usub',a:'\\frac{x\\left(\\sin(\\ln x)-\\cos(\\ln x)\\right)}{2}+C',
 h:'Substitute $x=e^{t}$ first, and it becomes the $e^t\\sin t$ loop.',
 s:['$x=e^t$, $dx=e^tdt$','$\\int e^t\\sin t\\,dt=\\frac{e^t(\\sin t-\\cos t)}{2}$','$t=\\ln x$, $e^t=x$']},

{tech:'parts',d:3,t:'\\int \\cos(\\ln x)\\,dx',also:'usub',a:'\\frac{x\\left(\\sin(\\ln x)+\\cos(\\ln x)\\right)}{2}+C',
 h:'Same substitution, the cosine loop.',
 s:['$x=e^t$ turns it into $\\int e^t\\cos t\\,dt$','$=\\frac{e^t(\\sin t+\\cos t)}{2}$']},

/* ── d4: harder loops and leftovers ──────────────────────── */
{tech:'parts',d:4,t:'\\int x^{3}e^{x^{2}}\\,dx',also:'usub',a:'\\frac{x^{2}e^{x^{2}}}{2}-\\frac{e^{x^{2}}}{2}+C',
 h:'Substitute $t=x^{2}$ first — parts alone will not touch it.',
 s:['$t=x^2$, $x\\,dx=\\frac{dt}{2}$, $x^3dx=\\frac{t\\,dt}{2}$','$\\frac12\\int te^tdt=\\frac12(te^t-e^t)$','$=\\frac{x^2e^{x^2}}{2}-\\frac{e^{x^2}}{2}+C$'],
 w:'Substitute before you integrate by parts. $\\int x^3e^{x^2}$ is hopeless as a product but trivial once $t=x^2$ absorbs two of the three $x$\'s.'},

{tech:'parts',d:4,t:'\\int x\\left(\\ln x\\right)^{2}dx',a:'\\frac{x^{2}(\\ln x)^{2}}{2}-\\frac{x^{2}\\ln x}{2}+\\frac{x^{2}}{4}+C',
 h:'Two passes, both with $u$ a power of $\\ln$.',
 s:['$\\frac{x^2(\\ln x)^2}{2}-\\int x\\ln x\\,dx$','$\\int x\\ln x\\,dx=\\frac{x^2\\ln x}{2}-\\frac{x^2}{4}$','Combine']},

{tech:'parts',d:4,t:'\\int \\arctan\\left(\\sqrt{x}\\right)dx',also:'usub',a:'x\\arctan\\left(\\sqrt{x}\\right)-\\sqrt{x}+\\arctan\\left(\\sqrt{x}\\right)+C',
 h:'Parts with $dv=dx$, then a root substitution on the leftover.',
 s:['$x\\arctan\\sqrt x-\\int\\frac{x}{2\\sqrt x(1+x)}dx$','$=x\\arctan\\sqrt x-\\frac12\\int\\frac{\\sqrt x}{1+x}dx$','With $t=\\sqrt x$: $\\int\\frac{t^2}{1+t^2}\\cdot 2\\,dt\\cdot\\frac12=t-\\arctan t$','$=x\\arctan\\sqrt x-\\sqrt x+\\arctan\\sqrt x+C$']},

{tech:'parts',d:4,t:'\\int \\frac{x e^{x}}{\\sqrt{1+e^{x}}}\\,dx',also:'usub',a:'2x\\sqrt{1+e^{x}}-4\\sqrt{1+e^{x}}-2\\ln\\left(\\sqrt{1+e^{x}}-1\\right)+2\\ln\\left(\\sqrt{1+e^{x}}+1\\right)+C',
 h:'$dv=\\frac{e^xdx}{\\sqrt{1+e^x}}$ gives $v=2\\sqrt{1+e^x}$.',
 s:['$u=x$, $v=2\\sqrt{1+e^x}$','$2x\\sqrt{1+e^x}-2\\int\\sqrt{1+e^x}\\,dx$','With $t=\\sqrt{1+e^x}$: $\\int\\sqrt{1+e^x}\\,dx=2t+\\ln\\left|\\frac{t-1}{t+1}\\right|$','$=2x\\sqrt{1+e^x}-4\\sqrt{1+e^x}-2\\ln\\left|\\frac{t-1}{t+1}\\right|+C$']},

{tech:'parts',d:4,t:'\\int x\\sec x\\tan x\\,dx',a:'x\\sec x-\\ln|\\sec x+\\tan x|+C',
 h:'$dv=\\sec x\\tan x\\,dx$, so $v=\\sec x$.',
 s:['$x\\sec x-\\int\\sec x\\,dx$','$=x\\sec x-\\ln|\\sec x+\\tan x|+C$']},

{tech:'parts',d:4,t:'\\int \\frac{x\\arctan x}{\\left(1+x^{2}\\right)^{2}}\\,dx',also:'trigsub',a:'-\\frac{\\arctan x}{2(1+x^{2})}+\\frac{\\arctan x}{4}+\\frac{x}{4(1+x^{2})}+C',
 h:'$dv=\\frac{x\\,dx}{(1+x^2)^2}$ integrates to $-\\frac{1}{2(1+x^2)}$.',
 s:['$u=\\arctan x$, $v=-\\frac{1}{2(1+x^2)}$','$-\\frac{\\arctan x}{2(1+x^2)}+\\frac12\\int\\frac{dx}{(1+x^2)^2}$','$\\int\\frac{dx}{(1+x^2)^2}=\\frac{\\arctan x}{2}+\\frac{x}{2(1+x^2)}$','Combine']},

{tech:'parts',d:4,t:'\\int \\frac{\\arctan x}{x^{2}}\\,dx',also:'partial',a:'-\\frac{\\arctan x}{x}+\\ln|x|-\\frac{1}{2}\\ln\\left(1+x^{2}\\right)+C',
 h:'$dv=x^{-2}dx$, then split the leftover.',
 s:['$-\\frac{\\arctan x}{x}+\\int\\frac{dx}{x(1+x^2)}$','$\\frac{1}{x(1+x^2)}=\\frac1x-\\frac{x}{1+x^2}$','$=-\\frac{\\arctan x}{x}+\\ln|x|-\\frac12\\ln(1+x^2)+C$']},

{tech:'parts',d:4,t:'\\int e^{\\sqrt{x}}\\,dx',also:'usub',a:'2\\sqrt{x}e^{\\sqrt{x}}-2e^{\\sqrt{x}}+C',
 h:'Substitute $t=\\sqrt x$ first, then parts.',
 s:['$t=\\sqrt x$, $dx=2t\\,dt$','$2\\int te^tdt=2(te^t-e^t)$','$=2\\sqrt xe^{\\sqrt x}-2e^{\\sqrt x}+C$']},

{tech:'parts',d:4,t:'\\int \\sin\\left(\\sqrt{x}\\right)dx',also:'usub',a:'2\\sin\\left(\\sqrt{x}\\right)-2\\sqrt{x}\\cos\\left(\\sqrt{x}\\right)+C',
 h:'Same substitution, then parts on $\\int t\\sin t\\,dt$.',
 s:['$t=\\sqrt x$, $dx=2t\\,dt$','$2\\int t\\sin t\\,dt=2(-t\\cos t+\\sin t)$','$=2\\sin\\sqrt x-2\\sqrt x\\cos\\sqrt x+C$']},

{tech:'parts',d:4,t:'\\int x^{2}\\arctan x\\,dx',also:'partial',a:'\\frac{x^{3}\\arctan x}{3}-\\frac{x^{2}}{6}+\\frac{\\ln\\left(1+x^{2}\\right)}{6}+C',
 h:'$dv=x^2dx$, then long-divide $\\frac{x^3}{1+x^2}$.',
 s:['$\\frac{x^3\\arctan x}{3}-\\frac13\\int\\frac{x^3}{1+x^2}dx$','$\\frac{x^3}{1+x^2}=x-\\frac{x}{1+x^2}$','$=\\frac{x^3\\arctan x}{3}-\\frac{x^2}{6}+\\frac{\\ln(1+x^2)}{6}+C$']},

];
