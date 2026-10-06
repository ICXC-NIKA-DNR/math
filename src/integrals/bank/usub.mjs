// Substitution. Sorted by what you have to notice: the derivative sitting in
// plain sight (d1), a derivative that needs a constant adjusted or an identity
// applied (d2), and substitutions that leave debris you have to convert back
// (d3).
export default [

/* ── d1: the derivative is right there ───────────────────── */
{tech:'usub',d:1,t:'\\int 3x^2\\cos(x^3)\\,dx',a:'\\sin(x^3)+C',
 h:'What is the derivative of the inside?',
 s:['$u=x^3$, $du=3x^2dx$','$\\int\\cos u\\,du=\\sin u$','$=\\sin(x^3)+C$']},

{tech:'usub',d:1,t:'\\int \\frac{3x^2}{x^3+2}\\,dx',a:'\\ln|x^3+2|+C',
 h:'Top is exactly the derivative of the bottom.',
 s:['$u=x^3+2$, $du=3x^2dx$','$\\int\\frac{du}{u}=\\ln|u|$','$=\\ln|x^3+2|+C$']},

{tech:'usub',d:1,t:'\\int x^3 e^{x^4}\\,dx',a:'\\frac{1}{4}e^{x^4}+C',
 h:'$u=x^4$ — you are one constant short.',
 s:['$u=x^4$, $du=4x^3dx$, so $x^3dx=\\frac{du}{4}$','$\\frac14\\int e^udu=\\frac14e^u$','$=\\frac14e^{x^4}+C$']},

{tech:'usub',d:1,t:'\\int \\cos^4 x\\sin x\\,dx',a:'-\\frac{\\cos^5 x}{5}+C',
 h:'$u=\\cos x$ brings its own minus sign.',
 s:['$u=\\cos x$, $du=-\\sin x\\,dx$','$-\\int u^4du=-\\frac{u^5}{5}$','$=-\\frac{\\cos^5x}{5}+C$']},

{tech:'usub',d:1,t:'\\int \\frac{\\sin x}{\\cos^2 x}\\,dx',a:'\\sec x+C',
 h:'$u=\\cos x$ — or read $\\sec x\\tan x$ out of it.',
 s:['$u=\\cos x$, $du=-\\sin x\\,dx$','$-\\int u^{-2}du=u^{-1}=\\frac{1}{\\cos x}$','$=\\sec x+C$']},

{tech:'usub',d:1,t:'\\int \\frac{(\\ln x)^3}{x}\\,dx',a:'\\frac{(\\ln x)^4}{4}+C',
 h:'$\\frac1x$ is exactly $d(\\ln x)$.',
 s:['$u=\\ln x$, $du=\\frac{dx}{x}$','$\\int u^3du=\\frac{u^4}{4}$','$=\\frac{(\\ln x)^4}{4}+C$']},

{tech:'usub',d:1,t:'\\int \\frac{dx}{x\\ln x}',a:'\\ln|\\ln x|+C',
 h:'Same substitution, one power lower.',
 s:['$u=\\ln x$, $du=\\frac{dx}{x}$','$\\int\\frac{du}{u}=\\ln|u|$','$=\\ln|\\ln x|+C$']},

{tech:'usub',d:1,t:'\\int x\\sqrt{4-x^2}\\,dx',a:'-\\frac{1}{3}(4-x^2)^{3/2}+C',
 h:'The stray $x$ is half the derivative of the inside.',
 s:['$u=4-x^2$, $du=-2x\\,dx$','$-\\frac12\\int u^{1/2}du=-\\frac13u^{3/2}$','$=-\\frac13(4-x^2)^{3/2}+C$']},

{tech:'usub',d:1,t:'\\int \\frac{x}{\\sqrt{x^2+9}}\\,dx',a:'\\sqrt{x^2+9}+C',
 h:'$u=x^2+9$; the $x$ supplies $du$ up to a factor.',
 s:['$u=x^2+9$, $x\\,dx=\\frac{du}{2}$','$\\frac12\\int u^{-1/2}du=u^{1/2}$','$=\\sqrt{x^2+9}+C$']},

{tech:'usub',d:1,t:'\\int \\sec^2 x\\,e^{\\tan x}\\,dx',a:'e^{\\tan x}+C',
 h:'The exponent\'s derivative is the rest of the integrand.',
 s:['$u=\\tan x$, $du=\\sec^2x\\,dx$','$\\int e^udu=e^u$','$=e^{\\tan x}+C$']},

{tech:'usub',d:1,t:'\\int \\frac{e^{\\sqrt{x}}}{\\sqrt{x}}\\,dx',a:'2e^{\\sqrt{x}}+C',
 h:'$u=\\sqrt x$, and $du=\\frac{dx}{2\\sqrt x}$.',
 s:['$u=\\sqrt x$, $dx=2\\sqrt x\\,du$','$\\int e^u\\cdot 2\\,du=2e^u$','$=2e^{\\sqrt x}+C$']},

{tech:'usub',d:1,t:'\\int \\frac{dx}{(1+x)^2}',a:'-\\frac{1}{1+x}+C',
 h:'Linear inside — a one-line substitution.',
 s:['$u=1+x$, $du=dx$','$\\int u^{-2}du=-u^{-1}$','$=-\\frac{1}{1+x}+C$']},

{tech:'usub',d:1,t:'\\int x(x^2-7)^{12}\\,dx',a:'\\frac{(x^2-7)^{13}}{26}+C',
 h:'Do not expand. Ever.',
 s:['$u=x^2-7$, $x\\,dx=\\frac{du}{2}$','$\\frac12\\cdot\\frac{u^{13}}{13}$','$=\\frac{(x^2-7)^{13}}{26}+C$']},

{tech:'usub',d:1,t:'\\int \\frac{\\arctan x}{1+x^2}\\,dx',a:'\\frac{(\\arctan x)^2}{2}+C',
 h:'The denominator is the derivative of the numerator.',
 s:['$u=\\arctan x$, $du=\\frac{dx}{1+x^2}$','$\\int u\\,du=\\frac{u^2}{2}$','$=\\frac{(\\arctan x)^2}{2}+C$']},

{tech:'usub',d:1,t:'\\int \\frac{\\arcsin x}{\\sqrt{1-x^2}}\\,dx',a:'\\frac{(\\arcsin x)^2}{2}+C',
 h:'Same shape as the last one.',
 s:['$u=\\arcsin x$, $du=\\frac{dx}{\\sqrt{1-x^2}}$','$\\frac{u^2}{2}$','$=\\frac{(\\arcsin x)^2}{2}+C$']},

{tech:'usub',d:1,t:'\\int \\frac{dx}{\\sqrt{1-x^2}\\,\\arcsin x}',a:'\\ln|\\arcsin x|+C',
 h:'Same substitution again — now it logs.',
 s:['$u=\\arcsin x$','$\\int\\frac{du}{u}=\\ln|u|$','$=\\ln|\\arcsin x|+C$']},

{tech:'usub',d:1,t:'\\int \\sin(5x+2)\\,dx',a:'-\\frac{1}{5}\\cos(5x+2)+C',
 h:'Linear inside: integrate normally, divide by the slope.',
 s:['$-\\frac15\\cos(5x+2)+C$']},

{tech:'usub',d:1,t:'\\int \\frac{dx}{3x-4}',a:'\\frac{1}{3}\\ln|3x-4|+C',
 h:'Linear inside a logarithm.',
 s:['$u=3x-4$, $du=3dx$','$\\frac13\\ln|u|$','$=\\frac13\\ln|3x-4|+C$']},

{tech:'usub',d:1,t:'\\int \\frac{2x+1}{x^2+x+5}\\,dx',a:'\\ln|x^2+x+5|+C',
 h:'Check the derivative of the denominator before anything else.',
 s:['$\\frac{d}{dx}(x^2+x+5)=2x+1$','$\\int\\frac{du}{u}=\\ln|u|$','$=\\ln|x^2+x+5|+C$'],
 w:'Always test $\\frac{f\'}{f}$ first on a rational function. If it fits you are done in one line; partial fractions would have cost you ten.'},

{tech:'usub',d:1,t:'\\int \\frac{\\cos x}{1+\\sin x}\\,dx',a:'\\ln(1+\\sin x)+C',
 h:'$\\frac{f\'}{f}$ again.',
 s:['$u=1+\\sin x$, $du=\\cos x\\,dx$','$\\ln|u|$','$=\\ln(1+\\sin x)+C$']},

{tech:'usub',d:1,t:'\\int \\frac{e^{2x}}{1+e^{2x}}\\,dx',a:'\\frac{1}{2}\\ln(1+e^{2x})+C',
 h:'The top is half the derivative of the bottom.',
 s:['$u=1+e^{2x}$, $du=2e^{2x}dx$','$\\frac12\\ln|u|$','$=\\frac12\\ln(1+e^{2x})+C$']},

{tech:'usub',d:1,t:'\\int \\frac{dx}{x(1+\\ln x)^2}',a:'-\\frac{1}{1+\\ln x}+C',
 h:'$u=1+\\ln x$.',
 s:['$u=1+\\ln x$, $du=\\frac{dx}{x}$','$\\int u^{-2}du=-u^{-1}$','$=-\\frac{1}{1+\\ln x}+C$']},

{tech:'usub',d:1,t:'\\int \\sin x\\cos x\\,dx',a:'\\frac{\\sin^2 x}{2}+C',
 h:'Either factor can be $u$ — pick one.',
 s:['$u=\\sin x$, $du=\\cos x\\,dx$','$\\frac{u^2}{2}$','$=\\frac{\\sin^2x}{2}+C$'],
 w:'$-\\frac{\\cos^2x}{2}$ and $-\\frac{\\cos2x}{4}$ are the same answer. All three differ by constants, which is exactly what $+C$ is for.'},

{tech:'usub',d:1,t:'\\int \\frac{\\sec^2 x}{\\tan x}\\,dx',a:'\\ln|\\tan x|+C',
 h:'$\\frac{f\'}{f}$ with $f=\\tan x$.',
 s:['$u=\\tan x$, $du=\\sec^2x\\,dx$','$\\ln|u|$','$=\\ln|\\tan x|+C$']},

/* ── d2: adjust, or rewrite first ────────────────────────── */
{tech:'usub',d:2,t:'\\int \\cot x\\,dx',a:'\\ln|\\sin x|+C',
 h:'Write it as $\\frac{\\cos x}{\\sin x}$.',
 s:['$u=\\sin x$, $du=\\cos x\\,dx$','$\\int\\frac{du}{u}=\\ln|u|$','$=\\ln|\\sin x|+C$']},

{tech:'usub',d:2,t:'\\int \\sec x\\,dx',also:'trigint',a:'\\ln|\\sec x+\\tan x|+C',
 h:'Multiply by $\\frac{\\sec x+\\tan x}{\\sec x+\\tan x}$ and watch what the numerator becomes.',
 s:['$\\sec x\\cdot\\frac{\\sec x+\\tan x}{\\sec x+\\tan x}=\\frac{\\sec^2x+\\sec x\\tan x}{\\sec x+\\tan x}$','The top is the derivative of the bottom','$=\\ln|\\sec x+\\tan x|+C$'],
 w:'This trick looks unmotivated because it is — it was found by working backwards from the answer. Memorise the result, not the derivation.'},

{tech:'usub',d:2,t:'\\int \\csc x\\,dx',also:'trigint',a:'-\\ln|\\csc x+\\cot x|+C',
 h:'Same trick, multiply by $\\frac{\\csc x+\\cot x}{\\csc x+\\cot x}$.',
 s:['Numerator becomes $-(\\csc x+\\cot x)\'$','$=-\\ln|\\csc x+\\cot x|+C$']},

{tech:'usub',d:2,t:'\\int x\\sqrt{x+3}\\,dx',a:'\\frac{2}{5}(x+3)^{5/2}-2(x+3)^{3/2}+C',
 h:'$u=x+3$, then write the stray $x$ as $u-3$.',
 s:['$u=x+3$, $x=u-3$, $dx=du$','$\\int(u-3)u^{1/2}du=\\int(u^{3/2}-3u^{1/2})du$','$=\\frac25u^{5/2}-2u^{3/2}$','$=\\frac25(x+3)^{5/2}-2(x+3)^{3/2}+C$'],
 w:'When the substitution leaves a stray $x$, do not give up — solve the substitution for $x$ and put it back in. This is the single most useful move in the whole category.'},

{tech:'usub',d:2,t:'\\int \\frac{x}{\\sqrt{x-1}}\\,dx',a:'\\frac{2}{3}(x-1)^{3/2}+2\\sqrt{x-1}+C',
 h:'$u=x-1$ and replace $x$ by $u+1$.',
 s:['$\\int\\frac{u+1}{\\sqrt u}du=\\int(u^{1/2}+u^{-1/2})du$','$=\\frac23u^{3/2}+2u^{1/2}$','$=\\frac23(x-1)^{3/2}+2\\sqrt{x-1}+C$']},

{tech:'usub',d:2,t:'\\int x^2\\sqrt{x+1}\\,dx',a:'\\frac{2}{7}(x+1)^{7/2}-\\frac{4}{5}(x+1)^{5/2}+\\frac{2}{3}(x+1)^{3/2}+C',
 h:'$u=x+1$, so $x^2=(u-1)^2$. Expand.',
 s:['$\\int(u-1)^2u^{1/2}du=\\int(u^{5/2}-2u^{3/2}+u^{1/2})du$','$=\\frac27u^{7/2}-\\frac45u^{5/2}+\\frac23u^{3/2}$','Put $u=x+1$ back']},

{tech:'usub',d:2,t:'\\int \\frac{x^3}{\\sqrt{x^2+1}}\\,dx',a:'\\frac{1}{3}(x^2+1)^{3/2}-\\sqrt{x^2+1}+C',
 h:'$u=x^2+1$ eats two of the three $x$\'s; write $x^2=u-1$.',
 s:['$u=x^2+1$, $x\\,dx=\\frac{du}{2}$, $x^2=u-1$','$\\frac12\\int\\frac{u-1}{\\sqrt u}du=\\frac12\\int(u^{1/2}-u^{-1/2})du$','$=\\frac13u^{3/2}-u^{1/2}$','$=\\frac13(x^2+1)^{3/2}-\\sqrt{x^2+1}+C$']},

{tech:'usub',d:2,t:'\\int \\frac{dx}{1+e^{x}}',a:'x-\\ln(1+e^{x})+C',
 h:'Add and subtract $e^x$ on top, or substitute $u=1+e^x$.',
 s:['$\\frac{1}{1+e^x}=\\frac{1+e^x-e^x}{1+e^x}=1-\\frac{e^x}{1+e^x}$','$\\int1\\,dx-\\int\\frac{e^x}{1+e^x}dx$','$=x-\\ln(1+e^x)+C$'],
 w:'Adding zero cleverly — $+e^x-e^x$ — is a technique in its own right. It turns an unrecognisable fraction into a constant plus an $\\frac{f\'}{f}$.'},

{tech:'usub',d:2,t:'\\int \\frac{e^{x}}{e^{2x}+1}\\,dx',a:'\\arctan(e^{x})+C',
 h:'Let $u=e^x$ and look at what is left.',
 s:['$u=e^x$, $du=e^xdx$','$\\int\\frac{du}{u^2+1}=\\arctan u$','$=\\arctan(e^x)+C$']},

{tech:'usub',d:2,t:'\\int \\frac{dx}{e^{x}+e^{-x}}',a:'\\arctan(e^{x})+C',
 h:'Multiply top and bottom by $e^x$.',
 s:['$=\\int\\frac{e^x}{e^{2x}+1}dx$','$u=e^x$','$=\\arctan(e^x)+C$']},

{tech:'usub',d:2,t:'\\int \\frac{dx}{\\sqrt{x}(1+x)}',a:'2\\arctan(\\sqrt{x})+C',
 h:'$u=\\sqrt x$ turns $1+x$ into $1+u^2$.',
 s:['$u=\\sqrt x$, $dx=2u\\,du$','$\\int\\frac{2u\\,du}{u(1+u^2)}=2\\int\\frac{du}{1+u^2}$','$=2\\arctan\\sqrt x+C$']},

{tech:'usub',d:2,t:'\\int \\frac{dx}{x^2+4x+8}',a:'\\frac{1}{2}\\arctan\\left(\\frac{x+2}{2}\\right)+C',
 h:'Complete the square, then it is a shifted arctangent.',
 s:['$=(x+2)^2+4$','$u=x+2$','$\\frac12\\arctan\\frac{x+2}{2}+C$']},

{tech:'usub',d:2,t:'\\int \\frac{x+1}{x^2+4x+8}\\,dx',a:'\\frac{1}{2}\\ln(x^2+4x+8)-\\frac{1}{2}\\arctan\\left(\\frac{x+2}{2}\\right)+C',
 h:'Split the numerator into "half the denominator\'s derivative" plus a constant.',
 s:['$x+1=\\frac12(2x+4)-1$','$\\frac12\\int\\frac{2x+4}{x^2+4x+8}dx=\\frac12\\ln(x^2+4x+8)$','$-\\int\\frac{dx}{(x+2)^2+4}=-\\frac12\\arctan\\frac{x+2}{2}$'],
 w:'Every $\\frac{\\text{linear}}{\\text{irreducible quadratic}}$ splits into exactly these two pieces. Force the numerator to contain the denominator\'s derivative and the rest is a constant.'},

{tech:'usub',d:2,t:'\\int \\frac{2x-3}{x^2+9}\\,dx',a:'\\ln(x^2+9)-\\arctan\\left(\\frac{x}{3}\\right)+C',
 h:'Split into the log part and the arctangent part.',
 s:['$\\int\\frac{2x}{x^2+9}dx=\\ln(x^2+9)$','$-3\\int\\frac{dx}{x^2+9}=-3\\cdot\\frac13\\arctan\\frac x3$','$=\\ln(x^2+9)-\\arctan\\frac x3+C$']},

{tech:'usub',d:2,t:'\\int \\frac{dx}{\\sqrt{x}+x}',a:'2\\ln(1+\\sqrt{x})+C',
 h:'Factor $\\sqrt x$ out of the denominator, then $u=\\sqrt x$.',
 s:['$\\sqrt x+x=\\sqrt x(1+\\sqrt x)$','$u=\\sqrt x$, $dx=2u\\,du$','$\\int\\frac{2u\\,du}{u(1+u)}=2\\ln|1+u|$','$=2\\ln(1+\\sqrt x)+C$']},

{tech:'usub',d:2,t:'\\int \\frac{dx}{1+\\sqrt[3]{x}}',a:'\\frac{3}{2}x^{2/3}-3x^{1/3}+3\\ln\\left(1+x^{1/3}\\right)+C',
 h:'$x=u^3$ clears the root; then divide.',
 s:['$x=u^3$, $dx=3u^2du$','$\\int\\frac{3u^2}{1+u}du=3\\int\\left(u-1+\\frac{1}{1+u}\\right)du$','$=\\frac32u^2-3u+3\\ln|1+u|$','$u=x^{1/3}$'],
 w:'A root of index $n$ always yields to $x=u^n$. The integral becomes rational, and rational is a solved problem.'},

{tech:'usub',d:2,t:'\\int \\frac{\\sqrt{x}}{1+\\sqrt{x}}\\,dx',a:'x-2\\sqrt{x}+2\\ln\\left(1+\\sqrt{x}\\right)+C',
 h:'$x=u^2$, then long-divide.',
 s:['$x=u^2$, $dx=2u\\,du$','$\\int\\frac{2u^2}{1+u}du=2\\int\\left(u-1+\\frac{1}{1+u}\\right)du$','$=u^2-2u+2\\ln|1+u|$','$u=\\sqrt x$']},

{tech:'usub',d:2,t:'\\int \\sin^3 x\\,dx',also:'trigint',a:'-\\cos x+\\frac{\\cos^3 x}{3}+C',
 h:'Odd power: peel off one $\\sin x$ for $du$.',
 s:['$\\sin^3x=(1-\\cos^2x)\\sin x$','$u=\\cos x$, $du=-\\sin x\\,dx$','$-\\int(1-u^2)du=-u+\\frac{u^3}{3}$','$=-\\cos x+\\frac{\\cos^3x}{3}+C$']},

{tech:'usub',d:2,t:'\\int \\cos^3 x\\,dx',also:'trigint',a:'\\sin x-\\frac{\\sin^3 x}{3}+C',
 h:'Peel off one cosine, convert the rest.',
 s:['$\\cos^3x=(1-\\sin^2x)\\cos x$','$u=\\sin x$','$u-\\frac{u^3}{3}$','$=\\sin x-\\frac{\\sin^3x}{3}+C$']},

{tech:'usub',d:2,t:'\\int \\frac{dx}{x^2}\\cos\\left(\\frac{1}{x}\\right)',a:'-\\sin\\left(\\frac{1}{x}\\right)+C',
 h:'$u=\\frac1x$ has derivative $-\\frac{1}{x^2}$.',
 s:['$u=\\frac1x$, $du=-\\frac{dx}{x^2}$','$-\\int\\cos u\\,du=-\\sin u$','$=-\\sin\\frac1x+C$']},

{tech:'usub',d:2,t:'\\int \\frac{\\ln(\\ln x)}{x\\ln x}\\,dx',a:'\\frac{\\left(\\ln(\\ln x)\\right)^2}{2}+C',
 h:'Two layers — substitute the outer one.',
 s:['$u=\\ln(\\ln x)$, $du=\\frac{dx}{x\\ln x}$','$\\int u\\,du=\\frac{u^2}{2}$']},

{tech:'usub',d:2,t:'\\int \\frac{dx}{x\\sqrt{\\ln x}}',a:'2\\sqrt{\\ln x}+C',
 h:'$u=\\ln x$.',
 s:['$u=\\ln x$, $du=\\frac{dx}{x}$','$\\int u^{-1/2}du=2\\sqrt u$','$=2\\sqrt{\\ln x}+C$']},

{tech:'usub',d:2,t:'\\int \\tan^3 x\\sec^2 x\\,dx',also:'trigint',a:'\\frac{\\tan^4 x}{4}+C',
 h:'$u=\\tan x$ takes the $\\sec^2$ with it.',
 s:['$u=\\tan x$, $du=\\sec^2x\\,dx$','$\\frac{u^4}{4}$']},

{tech:'usub',d:2,t:'\\int \\sec^3 x\\tan x\\,dx',also:'trigint',a:'\\frac{\\sec^3 x}{3}+C',
 h:'Group it as $\\sec^2x\\cdot(\\sec x\\tan x)$.',
 s:['$u=\\sec x$, $du=\\sec x\\tan x\\,dx$','$\\int u^2du=\\frac{u^3}{3}$','$=\\frac{\\sec^3x}{3}+C$']},

{tech:'usub',d:2,t:'\\int \\frac{dx}{\\sqrt{x}\\sqrt{1-x}}',a:'2\\arcsin\\left(\\sqrt{x}\\right)+C',
 h:'$u=\\sqrt x$ turns this into an arcsine.',
 s:['$u=\\sqrt x$, $dx=2u\\,du$','$\\int\\frac{2u\\,du}{u\\sqrt{1-u^2}}=2\\arcsin u$','$=2\\arcsin\\sqrt x+C$']},

{tech:'usub',d:2,t:'\\int \\frac{x}{x^4+1}\\,dx',a:'\\frac{1}{2}\\arctan(x^2)+C',
 h:'$x^4=(x^2)^2$, and the $x$ outside is half of $d(x^2)$.',
 s:['$u=x^2$, $x\\,dx=\\frac{du}{2}$','$\\frac12\\int\\frac{du}{u^2+1}=\\frac12\\arctan u$','$=\\frac12\\arctan(x^2)+C$']},

{tech:'usub',d:2,t:'\\int \\frac{x^2}{\\sqrt{1-x^6}}\\,dx',a:'\\frac{1}{3}\\arcsin(x^3)+C',
 h:'$x^6=(x^3)^2$.',
 s:['$u=x^3$, $x^2dx=\\frac{du}{3}$','$\\frac13\\arcsin u$','$=\\frac13\\arcsin(x^3)+C$']},

{tech:'usub',d:2,t:'\\int \\frac{dx}{x\\sqrt{x^4-1}}',a:'\\frac{1}{2}\\operatorname{arcsec}(x^2)+C',
 h:'Multiply top and bottom by $x$, then $u=x^2$.',
 s:['$=\\int\\frac{x\\,dx}{x^2\\sqrt{x^4-1}}$','$u=x^2$, $x\\,dx=\\frac{du}{2}$','$\\frac12\\int\\frac{du}{u\\sqrt{u^2-1}}=\\frac12\\operatorname{arcsec}u$']},

{tech:'usub',d:2,t:'\\int \\frac{\\sin(2x)}{1+\\cos^2 x}\\,dx',a:'-\\ln(1+\\cos^2 x)+C',
 h:'$\\sin 2x=2\\sin x\\cos x$, and $u=\\cos^2x$.',
 s:['$u=1+\\cos^2x$, $du=-2\\cos x\\sin x\\,dx=-\\sin(2x)dx$','$-\\int\\frac{du}{u}=-\\ln|u|$','$=-\\ln(1+\\cos^2x)+C$']},

{tech:'usub',d:2,t:'\\int e^{x}\\sqrt{1+e^{x}}\\,dx',a:'\\frac{2}{3}(1+e^{x})^{3/2}+C',
 h:'$u=1+e^x$.',
 s:['$du=e^xdx$','$\\int u^{1/2}du=\\frac23u^{3/2}$']},

{tech:'usub',d:2,t:'\\int \\frac{dx}{\\sqrt{e^{x}-1}}',a:'2\\arctan\\left(\\sqrt{e^{x}-1}\\right)+C',
 h:'$u=\\sqrt{e^x-1}$, so $e^x=u^2+1$.',
 s:['$u^2=e^x-1$, $2u\\,du=e^xdx=(u^2+1)dx$','$dx=\\frac{2u\\,du}{u^2+1}$','$\\int\\frac{1}{u}\\cdot\\frac{2u}{u^2+1}du=2\\arctan u$']},

{tech:'usub',d:2,t:'\\int \\frac{\\cos x}{\\sin^2 x+1}\\,dx',a:'\\arctan(\\sin x)+C',
 h:'$u=\\sin x$.',
 s:['$du=\\cos x\\,dx$','$\\int\\frac{du}{u^2+1}=\\arctan u$']},

{tech:'usub',d:2,t:'\\int \\frac{dx}{x(\\ln x)^2+x}',a:'\\arctan(\\ln x)+C',
 h:'Factor the $x$ out of the denominator.',
 s:['$=\\int\\frac{dx}{x\\left((\\ln x)^2+1\\right)}$','$u=\\ln x$','$\\arctan(\\ln x)+C$']},

{tech:'usub',d:2,t:'\\int \\frac{\\sin(\\sqrt{x})}{\\sqrt{x}}\\,dx',a:'-2\\cos\\left(\\sqrt{x}\\right)+C',
 h:'$u=\\sqrt x$.',
 s:['$dx=2\\sqrt x\\,du$','$2\\int\\sin u\\,du=-2\\cos u$']},

{tech:'usub',d:2,t:'\\int \\frac{dx}{\\cos^2 x\\sqrt{1+\\tan x}}',a:'2\\sqrt{1+\\tan x}+C',
 h:'$\\frac{1}{\\cos^2x}=\\sec^2x$, the derivative of $\\tan x$.',
 s:['$u=1+\\tan x$, $du=\\sec^2x\\,dx$','$\\int u^{-1/2}du=2\\sqrt u$']},

{tech:'usub',d:2,t:'\\int x^{5}\\sqrt{x^{3}+1}\\,dx',a:'\\frac{2}{15}(x^3+1)^{5/2}-\\frac{2}{9}(x^3+1)^{3/2}+C',
 h:'$u=x^3+1$, and $x^3=u-1$ handles the leftover.',
 s:['$u=x^3+1$, $x^2dx=\\frac{du}{3}$, $x^3=u-1$','$\\frac13\\int(u-1)u^{1/2}du=\\frac13\\left(\\frac25u^{5/2}-\\frac23u^{3/2}\\right)$','$=\\frac{2}{15}(x^3+1)^{5/2}-\\frac29(x^3+1)^{3/2}+C$']},

/* ── d3: the substitution is not obvious ─────────────────── */
{tech:'usub',d:3,t:'\\int \\frac{dx}{x\\sqrt{1-x^2}}',also:'trigsub',a:'-\\ln\\left|\\frac{1+\\sqrt{1-x^2}}{x}\\right|+C',
 h:'Try $u=\\sqrt{1-x^2}$, or substitute $x=1/t$.',
 s:['$u=\\sqrt{1-x^2}$, $u\\,du=-x\\,dx$','$\\int\\frac{dx}{x\\sqrt{1-x^2}}=\\int\\frac{x\\,dx}{x^2\\sqrt{1-x^2}}=-\\int\\frac{du}{1-u^2}$','$=-\\frac12\\ln\\left|\\frac{1+u}{1-u}\\right|$, which rearranges to the stated form']},

{tech:'usub',d:3,t:'\\int \\frac{dx}{x^{2}\\sqrt{x^{2}-1}}',also:'trigsub',a:'\\frac{\\sqrt{x^2-1}}{x}+C',
 h:'Divide through by $x$ twice and try $u=\\frac1x$.',
 s:['$u=\\frac1x$, $du=-\\frac{dx}{x^2}$','$\\sqrt{x^2-1}=\\frac{\\sqrt{1-u^2}}{|u|}$','The integral becomes $-\\int\\frac{du}{\\sqrt{1-u^2}}\\cdot$ (sign bookkeeping), giving $\\frac{\\sqrt{x^2-1}}{x}+C$'],
 w:'Differentiate $\\frac{\\sqrt{x^2-1}}{x}$ to check: the quotient rule gives exactly $\\frac{1}{x^2\\sqrt{x^2-1}}$.'},

{tech:'usub',d:3,t:'\\int \\frac{\\ln x}{x^{2}}\\,dx',a:'-\\frac{\\ln x}{x}-\\frac{1}{x}+C',
 h:'This one is really parts — but $u=\\ln x$ gets you there too.',
 s:['By parts with $u=\\ln x$, $dv=x^{-2}dx$','$=-\\frac{\\ln x}{x}+\\int\\frac{dx}{x^2}=-\\frac{\\ln x}{x}-\\frac1x+C$']},

{tech:'usub',d:3,t:'\\int \\frac{dx}{1+\\sqrt{x+1}}',a:'2\\sqrt{x+1}-2\\ln\\left(1+\\sqrt{x+1}\\right)+C',
 h:'$u=\\sqrt{x+1}$ clears the root; then divide.',
 s:['$u=\\sqrt{x+1}$, $x=u^2-1$, $dx=2u\\,du$','$\\int\\frac{2u}{1+u}du=2\\int\\left(1-\\frac{1}{1+u}\\right)du$','$=2u-2\\ln|1+u|$']},

{tech:'usub',d:3,t:'\\int \\frac{x\\,dx}{\\sqrt{x+4}-2}',a:'\\frac{2}{3}(x+4)^{3/2}+2x+C',
 h:'Rationalise the denominator first — multiply by $\\sqrt{x+4}+2$.',
 s:['$\\frac{x\\left(\\sqrt{x+4}+2\\right)}{(x+4)-4}=\\frac{x\\left(\\sqrt{x+4}+2\\right)}{x}=\\sqrt{x+4}+2$','$\\int\\left(\\sqrt{x+4}+2\\right)dx=\\frac23(x+4)^{3/2}+2x+C$'],
 w:'The whole integral collapses because the conjugate turns the denominator into exactly the $x$ sitting on top. Always try the conjugate on $\\sqrt{\\ }\\pm$ constant.'},

{tech:'usub',d:3,t:'\\int \\frac{dx}{\\sqrt{x}\\left(1+\\sqrt[3]{x}\\right)}',a:'6\\sqrt[6]{x}-6\\arctan\\left(\\sqrt[6]{x}\\right)+C',
 h:'Two different roots — substitute $x=u^6$, the least common index.',
 s:['$x=u^6$, $dx=6u^5du$','$\\int\\frac{6u^5}{u^3(1+u^2)}du=6\\int\\frac{u^2}{1+u^2}du$','$=6\\int\\left(1-\\frac{1}{1+u^2}\\right)du=6u-6\\arctan u$'],
 w:'With roots of several indices, $x=u^{\\text{lcm}}$ clears them all at once. Here lcm$(2,3)=6$.'},

{tech:'usub',d:3,t:'\\int \\frac{e^{2x}}{\\sqrt{e^{x}+1}}\\,dx',a:'\\frac{2}{3}(e^{x}+1)^{3/2}-2\\sqrt{e^{x}+1}+C',
 h:'$u=e^x+1$, and $e^{2x}=e^x\\cdot e^x$.',
 s:['$u=e^x+1$, $du=e^xdx$, $e^x=u-1$','$\\int\\frac{u-1}{\\sqrt u}du=\\frac23u^{3/2}-2u^{1/2}$']},

{tech:'usub',d:3,t:'\\int \\frac{dx}{x^{2}+x}',also:'partial',a:'\\ln\\left|\\frac{x}{x+1}\\right|+C',
 h:'Factor, then either split or notice the shape.',
 s:['$\\frac{1}{x(x+1)}=\\frac1x-\\frac{1}{x+1}$','$\\ln|x|-\\ln|x+1|=\\ln\\left|\\frac{x}{x+1}\\right|+C$']},

{tech:'usub',d:3,t:'\\int \\frac{\\sqrt{\\ln x}}{x}\\,dx',a:'\\frac{2}{3}(\\ln x)^{3/2}+C',
 h:'$u=\\ln x$.',
 s:['$\\int u^{1/2}du=\\frac23u^{3/2}$']},

{tech:'usub',d:3,t:'\\int \\frac{dx}{\\left(1+x^{2}\\right)\\arctan x}',a:'\\ln|\\arctan x|+C',
 h:'$u=\\arctan x$.',
 s:['$du=\\frac{dx}{1+x^2}$','$\\int\\frac{du}{u}=\\ln|u|$']},

{tech:'usub',d:3,t:'\\int \\frac{2^{x}}{1+4^{x}}\\,dx',a:'\\frac{\\arctan(2^{x})}{\\ln 2}+C',
 h:'$4^x=(2^x)^2$; let $u=2^x$.',
 s:['$u=2^x$, $du=2^x\\ln2\\,dx$','$\\frac{1}{\\ln2}\\int\\frac{du}{1+u^2}=\\frac{\\arctan u}{\\ln2}$']},

{tech:'usub',d:3,t:'\\int \\frac{\\sin x\\cos x}{\\sin^{4}x+\\cos^{4}x}\\,dx',a:'\\frac{1}{2}\\arctan\\left(\\sin^{2}x-\\cos^{2}x\\right)+C',
 h:'Write the bottom in terms of $\\sin^2x\\cos^2x$, then substitute $u=\\sin^2x-\\cos^2x$.',
 s:['$\\sin^4+\\cos^4=1-2\\sin^2\\cos^2$','With $u=\\sin^2x-\\cos^2x$: $u^2=1-4\\sin^2\\cos^2$, so $1-2\\sin^2\\cos^2=\\frac{1+u^2}{2}$','$du=4\\sin x\\cos x\\,dx$','$\\int\\frac{du/4}{(1+u^2)/2}=\\frac12\\arctan u$']},

{tech:'usub',d:3,t:'\\int \\frac{dx}{\\sqrt{x}\\left(1+x\\right)^{2}}',also:'trigsub',a:'\\arctan\\left(\\sqrt{x}\\right)+\\frac{\\sqrt{x}}{1+x}+C',
 h:'$u=\\sqrt x$, then a standard $\\frac{du}{(1+u^2)^2}$.',
 s:['$u=\\sqrt x$, $dx=2u\\,du$','$2\\int\\frac{du}{(1+u^2)^2}$','$\\int\\frac{du}{(1+u^2)^2}=\\frac12\\arctan u+\\frac{u}{2(1+u^2)}$','Double it and substitute back']},

{tech:'usub',d:3,t:'\\int x\\,5^{x^{2}}\\,dx',a:'\\frac{5^{x^{2}}}{2\\ln 5}+C',
 h:'$u=x^2$, then the base-change rule.',
 s:['$u=x^2$, $x\\,dx=\\frac{du}{2}$','$\\frac12\\int5^udu=\\frac{5^u}{2\\ln5}$']},

{tech:'usub',d:3,t:'\\int \\frac{\\ln x}{x\\sqrt{1+\\ln x}}\\,dx',a:'\\frac{2}{3}(1+\\ln x)^{3/2}-2\\sqrt{1+\\ln x}+C',
 h:'$u=1+\\ln x$, then $\\ln x=u-1$.',
 s:['$\\int\\frac{u-1}{\\sqrt u}du=\\frac23u^{3/2}-2u^{1/2}$']},

{tech:'usub',d:3,t:'\\int \\frac{dx}{x\\left(x^{5}+1\\right)}',also:'partial',a:'\\frac{1}{5}\\ln\\left|\\frac{x^{5}}{x^{5}+1}\\right|+C',
 h:'Multiply top and bottom by $x^4$ and let $u=x^5$.',
 s:['$=\\int\\frac{x^4dx}{x^5(x^5+1)}$','$u=x^5$, $x^4dx=\\frac{du}{5}$','$\\frac15\\int\\frac{du}{u(u+1)}=\\frac15\\ln\\left|\\frac{u}{u+1}\\right|$'],
 w:'Multiplying by $\\frac{x^{n-1}}{x^{n-1}}$ to manufacture $du$ is the standard rescue for $\\frac{1}{x(x^n+a)}$.'},

{tech:'usub',d:3,t:'\\int \\frac{x^{3}}{\\left(x^{2}+4\\right)^{3}}\\,dx',a:'-\\frac{1}{2(x^{2}+4)}+\\frac{1}{(x^{2}+4)^{2}}+C',
 h:'$u=x^2+4$ and $x^2=u-4$.',
 s:['$u=x^2+4$, $x\\,dx=\\frac{du}{2}$','$\\frac12\\int\\frac{u-4}{u^3}du=\\frac12\\int(u^{-2}-4u^{-3})du$','$=\\frac12\\left(-u^{-1}+2u^{-2}\\right)$']},

{tech:'usub',d:3,t:'\\int \\sqrt{1+\\sqrt{x}}\\,dx',a:'\\frac{4}{5}\\left(1+\\sqrt{x}\\right)^{5/2}-\\frac{4}{3}\\left(1+\\sqrt{x}\\right)^{3/2}+C',
 h:'Nested roots: let $u=1+\\sqrt x$ and solve for $x$.',
 s:['$u=1+\\sqrt x$, $\\sqrt x=u-1$, $x=(u-1)^2$, $dx=2(u-1)du$','$\\int\\sqrt u\\cdot2(u-1)du=2\\int(u^{3/2}-u^{1/2})du$','$=\\frac45u^{5/2}-\\frac43u^{3/2}$']},

{tech:'usub',d:3,t:'\\int \\frac{dx}{\\sin x\\cos x}',a:'\\ln|\\tan x|+C',
 h:'Divide top and bottom by $\\cos^2x$.',
 s:['$\\frac{1}{\\sin x\\cos x}=\\frac{\\sec^2x}{\\tan x}$','$u=\\tan x$','$=\\ln|\\tan x|+C$']},

{tech:'usub',d:3,t:'\\int \\frac{dx}{x^{3}+x}',also:'partial',a:'\\ln|x|-\\frac{1}{2}\\ln(x^{2}+1)+C',
 h:'Factor, or add and subtract $x^2$ on top.',
 s:['$\\frac{1}{x(x^2+1)}=\\frac1x-\\frac{x}{x^2+1}$','$\\ln|x|-\\frac12\\ln(x^2+1)+C$']},

{tech:'usub',d:3,t:'\\int \\frac{e^{x}(1+x)}{\\left(xe^{x}\\right)^{2}+1}\\,dx',a:'\\arctan\\left(xe^{x}\\right)+C',
 h:'What is the derivative of $xe^x$?',
 s:['$\\frac{d}{dx}(xe^x)=e^x(1+x)$','$u=xe^x$','$\\int\\frac{du}{u^2+1}=\\arctan u$'],
 w:'The whole problem is recognising one product rule. Scan a messy numerator for the derivative of a chunk of the denominator before trying anything else.'},

{tech:'usub',d:3,t:'\\int \\frac{\\left(1+\\ln x\\right)}{\\left(x\\ln x\\right)^{2}+1}\\,dx',a:'\\arctan\\left(x\\ln x\\right)+C',
 h:'Same shape, different product.',
 s:['$\\frac{d}{dx}(x\\ln x)=1+\\ln x$','$u=x\\ln x$','$=\\arctan(x\\ln x)+C$']},

{tech:'usub',d:3,t:'\\int \\frac{dx}{\\left(x+1\\right)\\sqrt{x}}',a:'2\\arctan\\left(\\sqrt{x}\\right)+C',
 h:'$u=\\sqrt x$.',
 s:['$dx=2u\\,du$','$2\\int\\frac{du}{u^2+1}=2\\arctan u$']},

{tech:'usub',d:3,t:'\\int \\frac{\\sec^{2}x}{\\sqrt{4-\\tan^{2}x}}\\,dx',also:'trigsub',a:'\\arcsin\\left(\\frac{\\tan x}{2}\\right)+C',
 h:'$u=\\tan x$ turns it into an arcsine.',
 s:['$u=\\tan x$, $du=\\sec^2x\\,dx$','$\\int\\frac{du}{\\sqrt{4-u^2}}=\\arcsin\\frac u2$']},

{tech:'usub',d:3,t:'\\int \\frac{dx}{x\\left(1+x^{2}\\right)}',also:'partial',a:'\\ln|x|-\\frac{1}{2}\\ln\\left(1+x^{2}\\right)+C',
 h:'Add and subtract $x^2$ in the numerator.',
 s:['$\\frac{1}{x(1+x^2)}=\\frac{1+x^2-x^2}{x(1+x^2)}=\\frac1x-\\frac{x}{1+x^2}$','$\\ln|x|-\\frac12\\ln(1+x^2)+C$']},

];
