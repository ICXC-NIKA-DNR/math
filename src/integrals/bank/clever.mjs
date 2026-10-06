// Clever tricks, rebuilt for indefinite integrals. The symmetry, King's-rule
// and Feynman moves that used to live here are definite-only, so this is the
// other half of the bee repertoire: substitutions and splits you would never
// reach by running the standard checklist top to bottom.
export default [

/* ── d3: reverse product rule, manufactured substitutions ── */
{tech:'clever',d:3,t:'\\int e^{x}\\left(\\frac{x-1}{x^{2}}\\right)dx',a:'\\frac{e^{x}}{x}+C',
 h:'Split the fraction. Is one piece the derivative of the other?',
 s:['$\\frac{x-1}{x^2}=\\frac1x-\\frac{1}{x^2}$','$f=\\frac1x$ and $f\'=-\\frac{1}{x^2}$','$\\int e^x\\left(f+f\'\\right)dx=e^xf=\\frac{e^x}{x}+C$'],
 w:'$\\int e^x\\left(f+f\'\\right)dx=e^xf$ is the product rule read backwards. Whenever $e^x$ multiplies a sum, check whether one term differentiates into the other.'},

{tech:'clever',d:3,t:'\\int \\frac{(x-1)e^{x}}{(x+1)^{3}}\\,dx',a:'\\frac{e^{x}}{(x+1)^{2}}+C',
 h:'Guess $\\frac{e^{x}}{(x+1)^{2}}$ and differentiate it.',
 s:['$\\frac{d}{dx}\\frac{e^x}{(x+1)^2}=\\frac{e^x}{(x+1)^2}-\\frac{2e^x}{(x+1)^3}$','$=\\frac{e^x\\left[(x+1)-2\\right]}{(x+1)^3}=\\frac{(x-1)e^x}{(x+1)^3}$'],
 w:'Guessing the answer and differentiating is a legitimate method, not cheating. For $e^x$ times a rational function the answer is almost always $e^x$ times a simpler rational function.'},

{tech:'clever',d:3,t:'\\int \\frac{e^{x}(1-x)^{2}}{\\left(1+x^{2}\\right)^{2}}\\,dx',a:'\\frac{e^{x}}{1+x^{2}}+C',
 h:'$(1-x)^{2}=\\left(1+x^{2}\\right)-2x$. Now it is the $f+f\'$ pattern.',
 s:['$\\frac{(1-x)^2}{(1+x^2)^2}=\\frac{1}{1+x^2}-\\frac{2x}{(1+x^2)^2}$','$f=\\frac{1}{1+x^2}$, $f\'=-\\frac{2x}{(1+x^2)^2}$','$=\\frac{e^x}{1+x^2}+C$']},

{tech:'clever',d:3,t:'\\int \\frac{\\ln x-1}{(\\ln x)^{2}}\\,dx',a:'\\frac{x}{\\ln x}+C',
 h:'Differentiate $\\frac{x}{\\ln x}$ and compare.',
 s:['$\\frac{d}{dx}\\frac{x}{\\ln x}=\\frac{\\ln x-1}{(\\ln x)^2}$','$=\\frac{x}{\\ln x}+C$'],
 w:'The quotient rule read backwards. $\\frac{x}{g(\\ln x)}$ is worth trying whenever the integrand is a ratio of expressions in $\\ln x$ with no $\\frac1x$ in sight.'},

{tech:'clever',d:3,t:'\\int \\frac{\\ln x}{(1+\\ln x)^{2}}\\,dx',a:'\\frac{x}{1+\\ln x}+C',
 h:'Write $\\ln x=(1+\\ln x)-1$.',
 s:['$\\frac{\\ln x}{(1+\\ln x)^2}=\\frac{1}{1+\\ln x}-\\frac{1}{(1+\\ln x)^2}$','$\\frac{d}{dx}\\frac{x}{1+\\ln x}=\\frac{(1+\\ln x)-1}{(1+\\ln x)^2}$','$=\\frac{x}{1+\\ln x}+C$']},

{tech:'clever',d:3,t:'\\int \\left(\\ln(\\ln x)+\\frac{1}{\\ln x}\\right)dx',a:'x\\ln(\\ln x)+C',
 h:'Neither piece is integrable alone. Together they are a product rule.',
 s:['$\\frac{d}{dx}\\left[x\\ln(\\ln x)\\right]=\\ln(\\ln x)+x\\cdot\\frac{1}{\\ln x}\\cdot\\frac1x$','$=\\ln(\\ln x)+\\frac{1}{\\ln x}$'],
 w:'$\\int\\frac{dx}{\\ln x}$ has no elementary form on its own. Pairing it with $\\ln(\\ln x)$ is what makes the sum integrable — a reminder that "elementary" is a property of the whole integrand.'},

{tech:'clever',d:3,t:'\\int \\frac{\\sec x}{\\sec x+\\tan x}\\,dx',also:'trigint',a:'\\tan x-\\sec x+C',
 h:'Multiply top and bottom by $\\sec x-\\tan x$; the denominator becomes $1$.',
 s:['$(\\sec x+\\tan x)(\\sec x-\\tan x)=\\sec^2x-\\tan^2x=1$','$\\int\\left(\\sec^2x-\\sec x\\tan x\\right)dx$','$=\\tan x-\\sec x+C$']},

{tech:'clever',d:3,t:'\\int \\frac{dx}{x\\left(x^{10}+1\\right)}',a:'\\ln|x|-\\frac{\\ln\\left(x^{10}+1\\right)}{10}+C',
 h:'Multiply top and bottom by $x^{9}$ to manufacture $du$.',
 s:['$=\\int\\frac{x^9\\,dx}{x^{10}\\left(x^{10}+1\\right)}$','$u=x^{10}$: $\\frac{1}{10}\\int\\frac{du}{u(u+1)}=\\frac{1}{10}\\ln\\left|\\frac{u}{u+1}\\right|$','$=\\ln|x|-\\frac{1}{10}\\ln\\left(x^{10}+1\\right)+C$'],
 w:'Multiplying by $\\frac{x^{n-1}}{x^{n-1}}$ turns $\\frac{1}{x\\left(x^n+a\\right)}$ into a two-term partial fraction in $u=x^n$. No other route is shorter.'},

{tech:'clever',d:3,t:'\\int \\frac{dx}{\\sqrt{x}+\\sqrt[3]{x}}',also:'usub',a:'2\\sqrt{x}-3\\sqrt[3]{x}+6\\sqrt[6]{x}-6\\ln\\left(1+\\sqrt[6]{x}\\right)+C',
 h:'Two root indices — substitute $x=u^{6}$ and both disappear.',
 s:['$x=u^6$, $dx=6u^5du$','$\\int\\frac{6u^5}{u^3+u^2}du=6\\int\\frac{u^3}{u+1}du$','$\\frac{u^3}{u+1}=u^2-u+1-\\frac{1}{u+1}$','$=2u^3-3u^2+6u-6\\ln|1+u|$ with $u=x^{1/6}$']},

{tech:'clever',d:3,t:'\\int \\frac{x^{4}+1}{x^{6}+1}\\,dx',also:'partial',a:'\\arctan x+\\frac{\\arctan\\left(x^{3}\\right)}{3}+C',
 h:'$x^{6}+1=\\left(x^{2}+1\\right)\\left(x^{4}-x^{2}+1\\right)$, and $x^{4}+1=\\left(x^{4}-x^{2}+1\\right)+x^{2}$.',
 s:['$\\frac{x^4+1}{x^6+1}=\\frac{1}{x^2+1}+\\frac{x^2}{x^6+1}$','$\\int\\frac{x^2dx}{x^6+1}=\\frac13\\arctan\\left(x^3\\right)$','$=\\arctan x+\\frac13\\arctan\\left(x^3\\right)+C$'],
 w:'Splitting the numerator so that one piece cancels a factor of the denominator is the whole move. Partial fractions on $x^6+1$ directly is an afternoon of work.'},

{tech:'clever',d:3,t:'\\int \\frac{dx}{x^{6}+x^{4}}',also:'partial',a:'-\\frac{1}{3x^{3}}+\\frac{1}{x}+\\arctan x+C',
 h:'Factor out $x^{4}$, then unwind $\\frac{1}{x^{4}\\left(x^{2}+1\\right)}$.',
 s:['$\\frac{1}{x^4\\left(x^2+1\\right)}=\\frac{1}{x^4}-\\frac{1}{x^2}+\\frac{1}{x^2+1}$','Integrate each term'],
 w:'That split is a geometric series: $\\frac{1}{x^4(1+x^2)}=\\frac{1}{x^4}\\left(1-x^2+x^4-\\cdots\\right)$ truncated exactly, because $\\frac{1}{1+x^2}$ closes the sum.'},

{tech:'clever',d:3,t:'\\int \\sqrt{\\frac{x}{1-x}}\\,dx',also:'trigsub',a:'\\arcsin\\left(\\sqrt{x}\\right)-\\sqrt{x-x^{2}}+C',
 h:'$x=\\sin^{2}t$ clears the whole expression at once.',
 s:['$x=\\sin^2t$, $dx=2\\sin t\\cos t\\,dt$, $\\sqrt{\\frac{x}{1-x}}=\\tan t$','$\\int2\\sin^2t\\,dt=t-\\sin t\\cos t$','$t=\\arcsin\\sqrt x$, $\\sin t\\cos t=\\sqrt{x-x^2}$']},

/* ── d4: the bee repertoire ──────────────────────────────── */
{tech:'clever',d:4,t:'\\int \\frac{x^{2}+1}{x^{4}+1}\\,dx',a:'\\frac{\\arctan\\left(\\frac{x^{2}-1}{x\\sqrt{2}}\\right)}{\\sqrt{2}}+C',
 h:'Divide top and bottom by $x^{2}$ and the substitution appears.',
 s:['$\\frac{x^2+1}{x^4+1}=\\frac{1+\\frac{1}{x^2}}{x^2+\\frac{1}{x^2}}$','$t=x-\\frac1x$, $dt=\\left(1+\\frac{1}{x^2}\\right)dx$, $x^2+\\frac{1}{x^2}=t^2+2$','$\\int\\frac{dt}{t^2+2}=\\frac{1}{\\sqrt2}\\arctan\\frac{t}{\\sqrt2}$'],
 w:'$t=x\\pm\\frac1x$ is the entire $x^4+1$ toolkit, because $\\left(x\\pm\\frac1x\\right)^2=x^2+\\frac{1}{x^2}\\pm2$. Dividing by $x^2$ is what makes it visible.'},

{tech:'clever',d:4,t:'\\int \\frac{x^{2}-1}{x^{4}+1}\\,dx',a:'\\frac{\\ln\\left|\\frac{x^{2}-\\sqrt{2}x+1}{x^{2}+\\sqrt{2}x+1}\\right|}{2\\sqrt{2}}+C',
 h:'Same division, the other substitution: $t=x+\\frac{1}{x}$.',
 s:['$\\frac{x^2-1}{x^4+1}=\\frac{1-\\frac{1}{x^2}}{x^2+\\frac{1}{x^2}}$','$t=x+\\frac1x$, $x^2+\\frac{1}{x^2}=t^2-2$','$\\int\\frac{dt}{t^2-2}=\\frac{1}{2\\sqrt2}\\ln\\left|\\frac{t-\\sqrt2}{t+\\sqrt2}\\right|$','$t\\mp\\sqrt2=\\frac{x^2\\mp\\sqrt2x+1}{x}$']},

{tech:'clever',d:4,t:'\\int \\frac{dx}{x^{4}+1}',also:'partial',a:'\\frac{\\arctan\\left(\\frac{x^{2}-1}{x\\sqrt{2}}\\right)}{2\\sqrt{2}}-\\frac{\\ln\\left|\\frac{x^{2}-\\sqrt{2}x+1}{x^{2}+\\sqrt{2}x+1}\\right|}{4\\sqrt{2}}+C',
 h:'Write $1=\\frac{\\left(x^{2}+1\\right)-\\left(x^{2}-1\\right)}{2}$ and use both previous results.',
 s:['$\\frac{1}{x^4+1}=\\frac12\\cdot\\frac{x^2+1}{x^4+1}-\\frac12\\cdot\\frac{x^2-1}{x^4+1}$','Each half is one of the $t=x\\mp\\frac1x$ substitutions','Halve each answer and subtract'],
 w:'The famous $\\int\\frac{dx}{x^4+1}$ is not one trick but two, glued together by splitting $1$ into $\\frac{\\left(x^2+1\\right)-\\left(x^2-1\\right)}{2}$.'},

{tech:'clever',d:4,t:'\\int \\frac{x^{2}-1}{\\left(x^{2}+1\\right)\\sqrt{x^{4}+1}}\\,dx',a:'\\frac{\\arctan\\left(\\frac{\\sqrt{x^{4}+1}}{\\sqrt{2}\\,x}\\right)}{\\sqrt{2}}+C',
 h:'Divide through by $x^{2}$ and watch $x+\\frac{1}{x}$ appear in three places at once.',
 s:['Dividing by $x^2$: $\\frac{1-\\frac{1}{x^2}}{\\left(x+\\frac1x\\right)\\sqrt{x^2+\\frac{1}{x^2}}}$','$t=x+\\frac1x$, $dt=\\left(1-\\frac{1}{x^2}\\right)dx$, $x^2+\\frac{1}{x^2}=t^2-2$','$\\int\\frac{dt}{t\\sqrt{t^2-2}}=\\frac{1}{\\sqrt2}\\arctan\\frac{\\sqrt{t^2-2}}{\\sqrt2}$'],
 w:'Three separate pieces of the integrand collapse onto the same $t$. That is the signature of this family — if only two collapse, you picked the wrong sign.'},

{tech:'clever',d:4,t:'\\int \\frac{dx}{1+\\sin x+\\cos x}',also:'trigint',a:'\\ln\\left|1+\\tan\\left(\\frac{x}{2}\\right)\\right|+C',
 h:'Weierstrass: $t=\\tan\\frac{x}{2}$ makes any rational trig integrand rational.',
 s:['$\\sin x=\\frac{2t}{1+t^2}$, $\\cos x=\\frac{1-t^2}{1+t^2}$, $dx=\\frac{2\\,dt}{1+t^2}$','Denominator becomes $\\frac{2+2t}{1+t^2}$','$\\int\\frac{dt}{1+t}=\\ln|1+t|$'],
 w:'Weierstrass always works on $\\int R(\\sin x,\\cos x)\\,dx$ and is almost always the slowest route. Reach for it only after the identities have failed.'},

{tech:'clever',d:4,t:'\\int \\frac{dx}{5+4\\cos x}',also:'trigint',a:'\\frac{2\\arctan\\left(\\frac{\\tan\\left(\\frac{x}{2}\\right)}{3}\\right)}{3}+C',
 h:'Weierstrass — and here it really is the right tool.',
 s:['$t=\\tan\\frac x2$: $5+4\\cos x=\\frac{9+t^2}{1+t^2}$','$\\int\\frac{2\\,dt}{9+t^2}=\\frac23\\arctan\\frac t3$']},

{tech:'clever',d:4,t:'\\int \\frac{dx}{2+\\cos x}',also:'trigint',a:'\\frac{2\\arctan\\left(\\frac{\\tan\\left(\\frac{x}{2}\\right)}{\\sqrt{3}}\\right)}{\\sqrt{3}}+C',
 h:'Same substitution; the denominator becomes $\\frac{3+t^{2}}{1+t^{2}}$.',
 s:['$t=\\tan\\frac x2$','$\\int\\frac{2\\,dt}{3+t^2}=\\frac{2}{\\sqrt3}\\arctan\\frac{t}{\\sqrt3}$']},

{tech:'clever',d:4,t:'\\int \\frac{dx}{\\sin x+2\\cos x+3}',also:'trigint',a:'\\frac{2\\arctan\\left(\\frac{\\tan\\left(\\frac{x}{2}\\right)+1}{2}\\right)}{2}+C',
 h:'Weierstrass, then complete the square in $t$.',
 s:['$t=\\tan\\frac x2$: the denominator becomes $\\frac{t^2+2t+5}{1+t^2}$','$\\int\\frac{2\\,dt}{t^2+2t+5}=\\int\\frac{2\\,dt}{(t+1)^2+4}$','$=\\arctan\\frac{t+1}{2}$']},

{tech:'clever',d:4,t:'\\int \\frac{x^{2}\\,dx}{\\left(x\\sin x+\\cos x\\right)^{2}}',a:'\\frac{\\sin x-x\\cos x}{x\\sin x+\\cos x}+C',
 h:'$\\frac{d}{dx}\\left(x\\sin x+\\cos x\\right)=x\\cos x$. Split the numerator to put that in.',
 s:['$\\frac{x^2}{D^2}=\\frac{x}{\\cos x}\\cdot\\frac{x\\cos x}{D^2}$ with $D=x\\sin x+\\cos x$','Parts: $u=\\frac{x}{\\cos x}$, $dv=\\frac{x\\cos x\\,dx}{D^2}$, $v=-\\frac1D$','$\\frac{d}{dx}\\frac{x}{\\cos x}=\\frac{D}{\\cos^2x}$, so the leftover is $\\int\\sec^2x\\,dx=\\tan x$','$\\tan x-\\frac{x}{D\\cos x}=\\frac{\\sin x-x\\cos x}{D}$'],
 w:'The engineered factor $\\frac{x}{\\cos x}$ looks arbitrary until you notice its derivative is $\\frac{D}{\\cos^2 x}$ — the $D$ cancels the one left by $v$, and a bare $\\sec^2$ survives.'},

{tech:'clever',d:4,t:'\\int \\frac{dx}{\\left(x^{2}+1\\right)\\sqrt{x^{2}-1}}',also:'trigsub',a:'\\frac{\\ln\\left|\\frac{\\sqrt{2}x+\\sqrt{x^{2}-1}}{\\sqrt{2}x-\\sqrt{x^{2}-1}}\\right|}{2\\sqrt{2}}+C',
 h:'$x=\\sec t$, and then everything is in $\\sin t$.',
 s:['$x=\\sec t$: $\\int\\frac{\\cos t\\,dt}{1+\\cos^2t}=\\int\\frac{\\cos t\\,dt}{2-\\sin^2t}$','$s=\\sin t$: $\\int\\frac{ds}{2-s^2}=\\frac{1}{2\\sqrt2}\\ln\\left|\\frac{\\sqrt2+s}{\\sqrt2-s}\\right|$','$s=\\frac{\\sqrt{x^2-1}}{x}$']},

{tech:'clever',d:4,t:'\\int \\frac{1+x^{2}}{\\left(1-x^{2}\\right)\\sqrt{1+x^{4}}}\\,dx',a:'\\frac{\\ln\\left|\\frac{\\sqrt{2}+\\frac{\\sqrt{x^{4}+1}}{x}}{\\sqrt{2}-\\frac{\\sqrt{x^{4}+1}}{x}}\\right|}{2\\sqrt{2}}+C',
 h:'Divide by $x^{2}$; this time the right substitution is $t=x-\\frac{1}{x}$.',
 s:['Dividing by $x^2$: $\\frac{\\frac{1}{x^2}+1}{\\left(\\frac1x-x\\right)\\sqrt{x^2+\\frac{1}{x^2}}}$','$t=x-\\frac1x$, $dt=\\left(1+\\frac{1}{x^2}\\right)dx$, $x^2+\\frac{1}{x^2}=t^2+2$','$-\\int\\frac{dt}{t\\sqrt{t^2+2}}$, a standard form']},

{tech:'clever',d:4,t:'\\int \\frac{dx}{x\\sqrt{x^{4}+1}}',also:'usub',a:'\\frac{\\ln\\left|\\frac{\\sqrt{x^{4}+1}-1}{\\sqrt{x^{4}+1}+1}\\right|}{4}+C',
 h:'Multiply top and bottom by $x^{3}$, then substitute $u=x^{4}$.',
 s:['$=\\int\\frac{x^3dx}{x^4\\sqrt{x^4+1}}$','$u=x^4$: $\\frac14\\int\\frac{du}{u\\sqrt{u+1}}$','$w=\\sqrt{u+1}$: $\\frac12\\int\\frac{dw}{w^2-1}=\\frac14\\ln\\left|\\frac{w-1}{w+1}\\right|$']},

{tech:'clever',d:4,t:'\\int \\frac{\\sqrt{x}}{\\sqrt{x}-\\sqrt[3]{x}}\\,dx',also:'usub',a:'x+\\frac{6x^{5/6}}{5}+\\frac{3x^{2/3}}{2}+2\\sqrt{x}+3\\sqrt[3]{x}+6\\sqrt[6]{x}+6\\ln\\left|\\sqrt[6]{x}-1\\right|+C',
 h:'$x=u^{6}$, then long-divide the rational function that appears.',
 s:['$x=u^6$: $\\int\\frac{u^3\\cdot6u^5}{u^3-u^2}du=6\\int\\frac{u^6}{u-1}du$','Divide: $\\frac{u^6}{u-1}=u^5+u^4+u^3+u^2+u+1+\\frac{1}{u-1}$','$=u^6+\\frac{6u^5}{5}+\\frac{3u^4}{2}+2u^3+3u^2+6u+6\\ln|u-1|$','Put $u=x^{1/6}$ back'],
 w:'Six terms from one substitution is normal here. The point of $x=u^{\\mathrm{lcm}}$ is not brevity, it is that a rational function always has an elementary antiderivative.'},

];
