// Powers and products of trig functions. The whole category is three rules:
// odd power -> peel one off for du; all even -> power reduction; tan/sec ->
// save a sec^2 or a sec.tan.
export default [

/* ── d2: one odd power, or one identity ─────────────────── */
{tech:'trigint',d:2,t:'\\int \\sin^{2}x\\cos x\\,dx',a:'\\frac{\\sin^{3}x}{3}+C',
 h:'The lone cosine is $du$.',
 s:['$u=\\sin x$, $du=\\cos x\\,dx$','$\\frac{u^3}{3}$']},

{tech:'trigint',d:2,t:'\\int \\sin^{5}x\\,dx',a:'-\\cos x+\\frac{2\\cos^{3}x}{3}-\\frac{\\cos^{5}x}{5}+C',
 h:'Odd power: save one $\\sin x$, convert the rest with $\\sin^2=1-\\cos^2$.',
 s:['$\\sin^5x=(1-\\cos^2x)^2\\sin x$','$u=\\cos x$: $-\\int(1-u^2)^2du$','$=-\\int(1-2u^2+u^4)du=-u+\\frac{2u^3}{3}-\\frac{u^5}{5}$']},

{tech:'trigint',d:2,t:'\\int \\cos^{5}x\\,dx',a:'\\sin x-\\frac{2\\sin^{3}x}{3}+\\frac{\\sin^{5}x}{5}+C',
 h:'Odd cosine: save one, convert with $\\cos^2=1-\\sin^2$.',
 s:['$u=\\sin x$','$\\int(1-u^2)^2du=u-\\frac{2u^3}{3}+\\frac{u^5}{5}$']},

{tech:'trigint',d:2,t:'\\int \\sin^{3}x\\cos^{2}x\\,dx',a:'-\\frac{\\cos^{3}x}{3}+\\frac{\\cos^{5}x}{5}+C',
 h:'The sine power is odd — that is the one you peel.',
 s:['$\\sin^3\\cos^2=(1-\\cos^2)\\cos^2\\sin x$','$u=\\cos x$: $-\\int(1-u^2)u^2du$','$=-\\frac{u^3}{3}+\\frac{u^5}{5}$']},

{tech:'trigint',d:2,t:'\\int \\sin^{2}x\\cos^{3}x\\,dx',a:'\\frac{\\sin^{3}x}{3}-\\frac{\\sin^{5}x}{5}+C',
 h:'Odd cosine this time.',
 s:['$u=\\sin x$: $\\int u^2(1-u^2)du$','$=\\frac{u^3}{3}-\\frac{u^5}{5}$']},

{tech:'trigint',d:2,t:'\\int \\sin^{3}x\\cos^{3}x\\,dx',a:'\\frac{\\sin^{4}x}{4}-\\frac{\\sin^{6}x}{6}+C',
 h:'Both odd — take your pick.',
 s:['$u=\\sin x$: $\\int u^3(1-u^2)du$','$=\\frac{u^4}{4}-\\frac{u^6}{6}$']},

{tech:'trigint',d:2,t:'\\int \\cos^{4}x\\,dx',a:'\\frac{3x}{8}+\\frac{\\sin(2x)}{4}+\\frac{\\sin(4x)}{32}+C',
 h:'All even: power-reduce twice.',
 s:['$\\cos^4x=\\left(\\frac{1+\\cos2x}{2}\\right)^2=\\frac{1+2\\cos2x+\\cos^22x}{4}$','$\\cos^22x=\\frac{1+\\cos4x}{2}$','$=\\frac38+\\frac{\\cos2x}{2}+\\frac{\\cos4x}{8}$, then integrate']},

{tech:'trigint',d:2,t:'\\int \\sin^{4}x\\,dx',a:'\\frac{3x}{8}-\\frac{\\sin(2x)}{4}+\\frac{\\sin(4x)}{32}+C',
 h:'Same reduction, alternating signs.',
 s:['$\\sin^4x=\\frac{3}{8}-\\frac{\\cos2x}{2}+\\frac{\\cos4x}{8}$','Integrate term by term']},

{tech:'trigint',d:2,t:'\\int \\sin^{2}x\\cos^{2}x\\,dx',a:'\\frac{x}{8}-\\frac{\\sin(4x)}{32}+C',
 h:'$\\sin x\\cos x=\\frac{\\sin2x}{2}$ — square it.',
 s:['$\\sin^2\\cos^2=\\frac{\\sin^22x}{4}=\\frac{1-\\cos4x}{8}$','$=\\frac x8-\\frac{\\sin4x}{32}+C$'],
 w:'Collapsing a product to a single multiple angle first is almost always faster than power-reducing each factor.'},

{tech:'trigint',d:2,t:'\\int \\tan^{3}x\\,dx',a:'\\frac{\\tan^{2}x}{2}+\\ln|\\cos x|+C',
 h:'Peel off $\\tan^2=\\sec^2-1$.',
 s:['$\\tan^3x=\\tan x(\\sec^2x-1)$','$\\int\\tan x\\sec^2x\\,dx=\\frac{\\tan^2x}{2}$','$-\\int\\tan x\\,dx=\\ln|\\cos x|$']},

{tech:'trigint',d:2,t:'\\int \\tan^{4}x\\,dx',a:'\\frac{\\tan^{3}x}{3}-\\tan x+x+C',
 h:'Peel one $\\tan^2$ at a time.',
 s:['$\\tan^4=\\tan^2(\\sec^2-1)=\\tan^2\\sec^2-\\tan^2$','$\\int\\tan^2\\sec^2=\\frac{\\tan^3}{3}$','$-\\int\\tan^2=-(\\tan x-x)$']},

{tech:'trigint',d:2,t:'\\int \\tan^{2}x\\sec^{2}x\\,dx',a:'\\frac{\\tan^{3}x}{3}+C',
 h:'$u=\\tan x$.',
 s:['$du=\\sec^2x\\,dx$','$\\frac{u^3}{3}$']},

{tech:'trigint',d:2,t:'\\int \\sec^{4}x\\,dx',a:'\\tan x+\\frac{\\tan^{3}x}{3}+C',
 h:'Even power of secant: save a $\\sec^2$ for $du$.',
 s:['$\\sec^4=\\sec^2\\cdot\\sec^2=(1+\\tan^2)\\sec^2$','$u=\\tan x$: $\\int(1+u^2)du$','$=\\tan x+\\frac{\\tan^3x}{3}+C$']},

{tech:'trigint',d:2,t:'\\int \\sec^{6}x\\,dx',a:'\\tan x+\\frac{2\\tan^{3}x}{3}+\\frac{\\tan^{5}x}{5}+C',
 h:'Same move: $\\sec^4=(1+\\tan^2)^2$.',
 s:['$u=\\tan x$: $\\int(1+u^2)^2du$','$=u+\\frac{2u^3}{3}+\\frac{u^5}{5}$']},

{tech:'trigint',d:2,t:'\\int \\tan^{3}x\\sec^{3}x\\,dx',a:'\\frac{\\sec^{5}x}{5}-\\frac{\\sec^{3}x}{3}+C',
 h:'Odd tangent: save $\\sec x\\tan x$ for $du$.',
 s:['$\\tan^3\\sec^3=(\\sec^2-1)\\sec^2\\cdot\\sec x\\tan x$','$u=\\sec x$: $\\int(u^2-1)u^2du$','$=\\frac{u^5}{5}-\\frac{u^3}{3}$'],
 w:'With tan and sec there are only two routes: an even sec power saves $\\sec^2$, an odd tan power saves $\\sec x\\tan x$. If neither applies, convert everything to sines and cosines.'},

{tech:'trigint',d:2,t:'\\int \\tan^{5}x\\sec^{4}x\\,dx',a:'\\frac{\\tan^{6}x}{6}+\\frac{\\tan^{8}x}{8}+C',
 h:'Even secant power — save $\\sec^2$.',
 s:['$\\sec^2=1+\\tan^2$','$u=\\tan x$: $\\int u^5(1+u^2)du$','$=\\frac{u^6}{6}+\\frac{u^8}{8}$']},

{tech:'trigint',d:2,t:'\\int \\cot^{3}x\\,dx',a:'-\\frac{\\cot^{2}x}{2}-\\ln|\\sin x|+C',
 h:'$\\cot^2=\\csc^2-1$.',
 s:['$\\cot^3=\\cot(\\csc^2-1)$','$\\int\\cot\\csc^2=-\\frac{\\cot^2}{2}$','$-\\int\\cot=-\\ln|\\sin x|$']},

{tech:'trigint',d:2,t:'\\int \\cot^{4}x\\,dx',a:'-\\frac{\\cot^{3}x}{3}+\\cot x+x+C',
 h:'Peel one $\\csc^2$ at a time.',
 s:['$\\cot^4=\\cot^2(\\csc^2-1)$','$-\\frac{\\cot^3}{3}-\\int\\cot^2$','$\\int\\cot^2=-\\cot x-x$']},

{tech:'trigint',d:2,t:'\\int \\sin(3x)\\cos(5x)\\,dx',a:'\\frac{\\cos(2x)}{4}-\\frac{\\cos(8x)}{16}+C',
 h:'Product to sum: $\\sin A\\cos B=\\frac{\\sin(A-B)+\\sin(A+B)}{2}$.',
 s:['$=\\frac12\\left(\\sin(-2x)+\\sin8x\\right)=\\frac12(\\sin8x-\\sin2x)$','$=-\\frac{\\cos8x}{16}+\\frac{\\cos2x}{4}+C$']},

{tech:'trigint',d:2,t:'\\int \\sin(2x)\\sin(5x)\\,dx',a:'\\frac{\\sin(3x)}{6}-\\frac{\\sin(7x)}{14}+C',
 h:'$\\sin A\\sin B=\\frac{\\cos(A-B)-\\cos(A+B)}{2}$.',
 s:['$=\\frac12(\\cos3x-\\cos7x)$','$=\\frac{\\sin3x}{6}-\\frac{\\sin7x}{14}+C$']},

{tech:'trigint',d:2,t:'\\int \\cos(4x)\\cos(x)\\,dx',a:'\\frac{\\sin(3x)}{6}+\\frac{\\sin(5x)}{10}+C',
 h:'$\\cos A\\cos B=\\frac{\\cos(A-B)+\\cos(A+B)}{2}$.',
 s:['$=\\frac12(\\cos3x+\\cos5x)$','$=\\frac{\\sin3x}{6}+\\frac{\\sin5x}{10}+C$'],
 w:'The three product-to-sum identities turn every $\\int\\sin(ax)\\cos(bx)$ into two one-line integrals. Without them you are stuck.'},

{tech:'trigint',d:2,t:'\\int \\sin^{2}(3x)\\,dx',a:'\\frac{x}{2}-\\frac{\\sin(6x)}{12}+C',
 h:'Power reduction with the angle carried along.',
 s:['$\\sin^2 3x=\\frac{1-\\cos6x}{2}$','$=\\frac x2-\\frac{\\sin6x}{12}+C$']},

{tech:'trigint',d:2,t:'\\int \\frac{\\sin^{3}x}{\\cos^{2}x}\\,dx',a:'\\sec x+\\cos x+C',
 h:'Odd sine on top — $u=\\cos x$.',
 s:['$=\\int\\frac{(1-\\cos^2x)\\sin x}{\\cos^2x}dx$','$u=\\cos x$: $-\\int\\frac{1-u^2}{u^2}du=-\\int(u^{-2}-1)du$','$=u^{-1}+u=\\sec x+\\cos x+C$']},

{tech:'trigint',d:2,t:'\\int \\frac{dx}{\\sin^{2}x\\cos^{2}x}',a:'\\tan x-\\cot x+C',
 h:'Replace the $1$ on top with $\\sin^2+\\cos^2$.',
 s:['$\\frac{\\sin^2x+\\cos^2x}{\\sin^2x\\cos^2x}=\\sec^2x+\\csc^2x$','$=\\tan x-\\cot x+C$'],
 w:'Writing $1=\\sin^2+\\cos^2$ to split a denominator is the trig analogue of adding zero cleverly.'},

/* ── d3: both even, or mixed powers ──────────────────────── */
{tech:'trigint',d:3,t:'\\int \\sin^{4}x\\cos^{2}x\\,dx',a:'\\frac{x}{16}-\\frac{\\sin(4x)}{64}-\\frac{\\sin^{3}(2x)}{48}+C',
 h:'Collapse to $\\sin^2 2x$ first, then power-reduce what is left.',
 s:['$\\sin^4\\cos^2=(\\sin\\cos)^2\\sin^2=\\frac{\\sin^22x}{4}\\cdot\\frac{1-\\cos2x}{2}$','$=\\frac{\\sin^22x}{8}-\\frac{\\sin^22x\\cos2x}{8}$','$\\int\\frac{\\sin^22x}{8}dx=\\frac{x}{16}-\\frac{\\sin4x}{64}$','$\\int\\frac{\\sin^22x\\cos2x}{8}dx=\\frac{\\sin^32x}{48}$, and it is subtracted'],
 w:'Collapse the paired powers to $\\sin^2 2x$ before reducing anything. Expanding $\\sin^4$ and $\\cos^2$ separately gets the same answer after three times the work.'},

{tech:'trigint',d:3,t:'\\int \\sec^{5}x\\tan x\\,dx',a:'\\frac{\\sec^{5}x}{5}+C',
 h:'Group as $\\sec^4x\\cdot(\\sec x\\tan x)$.',
 s:['$u=\\sec x$','$\\int u^4du=\\frac{u^5}{5}$']},

{tech:'trigint',d:3,t:'\\int \\tan x\\sec^{3}x\\,dx',a:'\\frac{\\sec^{3}x}{3}+C',
 h:'Same grouping.',
 s:['$u=\\sec x$, $du=\\sec x\\tan x\\,dx$','$\\int u^2du$']},

{tech:'trigint',d:3,t:'\\int \\frac{\\cos^{3}x}{\\sin^{4}x}\\,dx',a:'-\\frac{1}{3\\sin^{3}x}+\\frac{1}{\\sin x}+C',
 h:'Odd cosine — $u=\\sin x$.',
 s:['$\\int\\frac{(1-\\sin^2x)\\cos x}{\\sin^4x}dx$','$u=\\sin x$: $\\int(u^{-4}-u^{-2})du$','$=-\\frac{1}{3u^3}+\\frac1u$']},

{tech:'trigint',d:3,t:'\\int \\frac{dx}{1+\\sin^{2}x}',also:'usub',a:'\\frac{\\arctan\\left(\\sqrt{2}\\tan x\\right)}{\\sqrt{2}}+C',
 h:'Divide top and bottom by $\\cos^2x$ and let $u=\\tan x$.',
 s:['$=\\int\\frac{\\sec^2x\\,dx}{\\sec^2x+\\tan^2x}=\\int\\frac{\\sec^2x\\,dx}{1+2\\tan^2x}$','$u=\\tan x$: $\\int\\frac{du}{1+2u^2}$','$=\\frac{1}{\\sqrt2}\\arctan\\left(\\sqrt2 u\\right)$'],
 w:'Dividing through by $\\cos^2x$ turns any $\\frac{1}{a+b\\sin^2+c\\cos^2}$ into an arctangent in $\\tan x$. It is the cheap alternative to Weierstrass.'},

{tech:'trigint',d:3,t:'\\int \\frac{dx}{4+5\\cos^{2}x}',also:'usub',a:'\\frac{\\arctan\\left(\\frac{2\\tan x}{3}\\right)}{6}+C',
 h:'Same move — divide by $\\cos^2x$.',
 s:['$=\\int\\frac{\\sec^2x\\,dx}{4\\sec^2x+5}=\\int\\frac{\\sec^2x\\,dx}{4\\tan^2x+9}$','$u=\\tan x$: $\\int\\frac{du}{4u^2+9}=\\frac16\\arctan\\frac{2u}{3}$']},

{tech:'trigint',d:3,t:'\\int \\frac{\\sin x}{\\sin x+\\cos x}\\,dx',a:'\\frac{x}{2}-\\frac{\\ln|\\sin x+\\cos x|}{2}+C',
 h:'Write the numerator as a combination of the denominator and its derivative.',
 s:['$\\sin x=\\frac12\\left[(\\sin x+\\cos x)-(\\cos x-\\sin x)\\right]$','$\\int\\frac{\\sin x+\\cos x}{\\sin x+\\cos x}dx=x$','$\\int\\frac{\\cos x-\\sin x}{\\sin x+\\cos x}dx=\\ln|\\sin x+\\cos x|$'],
 w:'For $\\frac{a\\sin+b\\cos}{c\\sin+d\\cos}$, always split the top into $\\lambda(\\text{bottom})+\\mu(\\text{bottom})\'$. Two one-line integrals fall out.'},

{tech:'trigint',d:3,t:'\\int \\frac{\\cos x}{\\sin x+\\cos x}\\,dx',a:'\\frac{x}{2}+\\frac{\\ln|\\sin x+\\cos x|}{2}+C',
 h:'Same split, other sign.',
 s:['$\\cos x=\\frac12\\left[(\\sin x+\\cos x)+(\\cos x-\\sin x)\\right]$','$=\\frac x2+\\frac{\\ln|\\sin x+\\cos x|}{2}+C$']},

{tech:'trigint',d:3,t:'\\int \\sin^{6}x\\,dx',a:'\\frac{5x}{16}-\\frac{\\sin(2x)}{4}+\\frac{3\\sin(4x)}{64}+\\frac{\\sin^{3}(2x)}{48}+C',
 h:'Power-reduce, then deal with the $\\cos^3 2x$ that appears.',
 s:['$\\sin^6x=\\left(\\frac{1-\\cos2x}{2}\\right)^3=\\frac{1-3\\cos2x+3\\cos^22x-\\cos^32x}{8}$','$\\cos^22x=\\frac{1+\\cos4x}{2}$; $\\int\\cos^32x\\,dx=\\frac{\\sin2x}{2}-\\frac{\\sin^32x}{6}$','Collect']},

{tech:'trigint',d:3,t:'\\int \\cos^{6}x\\,dx',a:'\\frac{5x}{16}+\\frac{\\sin(2x)}{4}+\\frac{3\\sin(4x)}{64}-\\frac{\\sin^{3}(2x)}{48}+C',
 h:'Same expansion with every sign positive at the start.',
 s:['$\\cos^6x=\\frac{1+3\\cos2x+3\\cos^22x+\\cos^32x}{8}$','Reduce and integrate']},

{tech:'trigint',d:3,t:'\\int \\frac{\\sin x}{\\sqrt{1-\\cos x}}\\,dx',a:'2\\sqrt{1-\\cos x}+C',
 h:'The numerator is exactly the derivative of what is under the root.',
 s:['$u=1-\\cos x$, $du=\\sin x\\,dx$','$\\int u^{-1/2}du=2\\sqrt u$','$=2\\sqrt{1-\\cos x}+C$'],
 w:'The half-angle form $\\sqrt{1-\\cos x}=\\sqrt2\\left|\\sin\\frac x2\\right|$ is tempting here and costs you an absolute value. The substitution avoids the branch entirely.'},

{tech:'trigint',d:3,t:'\\int \\frac{1-\\cos x}{1+\\cos x}\\,dx',a:'2\\tan\\left(\\frac{x}{2}\\right)-x+C',
 h:'Add and subtract: $\\frac{1-\\cos x}{1+\\cos x}=\\frac{2}{1+\\cos x}-1$.',
 s:['$1+\\cos x=2\\cos^2\\tfrac x2$, so $\\frac{2}{1+\\cos x}=\\sec^2\\tfrac x2$','$\\int\\sec^2\\tfrac x2\\,dx=2\\tan\\tfrac x2$','$=2\\tan\\tfrac x2-x+C$']},

{tech:'trigint',d:3,t:'\\int \\frac{\\sin(2x)}{\\sin^{4}x+\\cos^{4}x}\\,dx',also:'usub',a:'\\arctan\\left(\\sin^{2}x-\\cos^{2}x\\right)+C',
 h:'Write the bottom in terms of $u=\\sin^2x-\\cos^2x$.',
 s:['$\\sin^4+\\cos^4=\\frac{1+u^2}{2}$ with $u=\\sin^2x-\\cos^2x$','$du=2\\sin2x\\,dx$','$\\int\\frac{du/2}{(1+u^2)/2}=\\arctan u$']},

{tech:'trigint',d:3,t:'\\int \\tan^{6}x\\,dx',a:'\\frac{\\tan^{5}x}{5}-\\frac{\\tan^{3}x}{3}+\\tan x-x+C',
 h:'Peel $\\tan^2=\\sec^2-1$ repeatedly.',
 s:['$\\tan^6=\\tan^4\\sec^2-\\tan^4$','$\\tan^4=\\tan^2\\sec^2-\\tan^2$, $\\tan^2=\\sec^2-1$','Collect: $\\frac{\\tan^5}{5}-\\frac{\\tan^3}{3}+\\tan x-x+C$']},

{tech:'trigint',d:3,t:'\\int \\frac{dx}{\\sin x\\cos^{3}x}',also:'usub',a:'\\ln|\\tan x|+\\frac{\\tan^{2}x}{2}+C',
 h:'Divide top and bottom by $\\cos^4x$.',
 s:['$\\frac{1}{\\sin x\\cos^3x}=\\frac{\\sec^4x}{\\tan x}=\\frac{(1+\\tan^2x)\\sec^2x}{\\tan x}$','$u=\\tan x$: $\\int\\frac{1+u^2}{u}du$','$=\\ln|u|+\\frac{u^2}{2}$']},

{tech:'trigint',d:3,t:'\\int \\sin(3x)\\sin(5x)\\sin(x)\\,dx',a:'-\\frac{\\cos(3x)}{12}-\\frac{\\cos(7x)}{28}+\\frac{\\cos(x)}{4}+\\frac{\\cos(9x)}{36}+C',
 h:'Collapse two factors first, then apply product-to-sum again.',
 s:['$\\sin3x\\sin5x=\\frac{\\cos2x-\\cos8x}{2}$','Multiply by $\\sin x$ and reduce again','Integrate the four cosines']},

/* ── d4: the awkward ones ────────────────────────────────── */
{tech:'trigint',d:4,t:'\\int \\sqrt{\\tan x}\\,dx',also:'partial',a:'\\frac{\\arctan\\left(\\frac{\\tan x-1}{\\sqrt{2\\tan x}}\\right)}{\\sqrt{2}}+\\frac{\\ln\\left|\\frac{\\tan x-\\sqrt{2\\tan x}+1}{\\tan x+\\sqrt{2\\tan x}+1}\\right|}{2\\sqrt{2}}+C',
 h:'$u=\\sqrt{\\tan x}$ turns it into $\\int\\frac{2u^{2}}{1+u^{4}}du$.',
 s:['$u=\\sqrt{\\tan x}$, $\\tan x=u^2$, $dx=\\frac{2u\\,du}{1+u^4}$','$\\int\\frac{2u^2}{1+u^4}du$','Split as $\\int\\frac{u^2+1}{u^4+1}du+\\int\\frac{u^2-1}{u^4+1}du$','Divide each by $u^2$ and substitute $u\\mp\\frac1u$ — one gives the arctangent, the other the log'],
 w:'The $\\frac{u^2\\pm1}{u^4+1}$ split is the whole trick. Divide top and bottom by $u^2$ and the substitution $t=u\\mp\\frac1u$ appears, because $\\left(u\\mp\\frac1u\\right)^2=u^2+\\frac{1}{u^2}\\mp2$.'},

{tech:'trigint',d:4,t:'\\int \\frac{dx}{\\sin x+\\cos x}',a:'\\frac{\\ln\\left|\\tan\\left(\\frac{x}{2}+\\frac{\\pi}{8}\\right)\\right|}{\\sqrt{2}}+C',
 h:'Write $\\sin x+\\cos x=\\sqrt2\\sin\\left(x+\\frac\\pi4\\right)$, then it is $\\int\\csc$.',
 s:['$\\sin x+\\cos x=\\sqrt2\\sin\\left(x+\\tfrac\\pi4\\right)$','$\\frac{1}{\\sqrt2}\\int\\csc\\left(x+\\tfrac\\pi4\\right)dx$','$\\int\\csc\\theta\\,d\\theta=\\ln\\left|\\tan\\frac\\theta2\\right|$'],
 w:'$a\\sin x+b\\cos x=R\\sin(x+\\varphi)$ with $R=\\sqrt{a^2+b^2}$ collapses any such denominator to a single sine. It is worth more than Weierstrass here.'},

{tech:'trigint',d:4,t:'\\int \\frac{dx}{1+\\tan x}',a:'\\frac{x}{2}+\\frac{\\ln|\\sin x+\\cos x|}{2}+C',
 h:'Multiply by $\\frac{\\cos x}{\\cos x}$ and you are back to the $\\frac{\\cos}{\\sin+\\cos}$ split.',
 s:['$\\frac{1}{1+\\tan x}=\\frac{\\cos x}{\\sin x+\\cos x}$','$=\\frac x2+\\frac{\\ln|\\sin x+\\cos x|}{2}+C$']},

{tech:'trigint',d:4,t:'\\int \\frac{\\sin x\\,dx}{\\sin x-\\cos x}',a:'\\frac{x}{2}+\\frac{\\ln|\\sin x-\\cos x|}{2}+C',
 h:'Split the numerator into the denominator and its derivative.',
 s:['$\\sin x=\\frac12\\left[(\\sin x-\\cos x)+(\\sin x+\\cos x)\\right]$','$(\\sin x-\\cos x)\'=\\cos x+\\sin x$','$=\\frac x2+\\frac{\\ln|\\sin x-\\cos x|}{2}+C$']},

{tech:'trigint',d:4,t:'\\int \\sec^{5}x\\,dx',also:'parts',a:'\\frac{\\sec^{3}x\\tan x}{4}+\\frac{3\\sec x\\tan x}{8}+\\frac{3\\ln|\\sec x+\\tan x|}{8}+C',
 h:'Reduction formula: $\\int\\sec^n=\\frac{\\sec^{n-2}\\tan}{n-1}+\\frac{n-2}{n-1}\\int\\sec^{n-2}$.',
 s:['$n=5$: $\\frac{\\sec^3\\tan}{4}+\\frac34\\int\\sec^3$','$\\int\\sec^3=\\frac{\\sec\\tan}{2}+\\frac{\\ln|\\sec+\\tan|}{2}$','Combine']},

{tech:'trigint',d:4,t:'\\int \\frac{dx}{\\cos^{4}x}\\sin^{2}x',a:'\\frac{\\tan^{3}x}{3}+C',
 h:'It is $\\tan^2x\\sec^2x$ in disguise.',
 s:['$\\frac{\\sin^2x}{\\cos^4x}=\\tan^2x\\sec^2x$','$u=\\tan x$: $\\frac{u^3}{3}$']},

{tech:'trigint',d:4,t:'\\int \\frac{\\cos x\\,dx}{\\sin^{2}x-5\\sin x+6}',also:'partial',a:'\\ln\\left|\\frac{\\sin x-3}{\\sin x-2}\\right|+C',
 h:'$u=\\sin x$ turns it into a partial-fractions problem.',
 s:['$u=\\sin x$: $\\int\\frac{du}{u^2-5u+6}=\\int\\frac{du}{(u-2)(u-3)}$','$=\\frac{1}{u-3}-\\frac{1}{u-2}$ in partial fractions','$=\\ln|u-3|-\\ln|u-2|$']},

{tech:'trigint',d:4,t:'\\int \\frac{dx}{\\sin^{4}x}',a:'-\\cot x-\\frac{\\cot^{3}x}{3}+C',
 h:'$\\csc^4=\\csc^2\\cdot\\csc^2=(1+\\cot^2)\\csc^2$.',
 s:['$u=\\cot x$, $du=-\\csc^2x\\,dx$','$-\\int(1+u^2)du=-u-\\frac{u^3}{3}$']},

{tech:'trigint',d:4,t:'\\int \\tan^{3}x\\sec^{5}x\\,dx',a:'\\frac{\\sec^{7}x}{7}-\\frac{\\sec^{5}x}{5}+C',
 h:'Odd tangent: save $\\sec x\\tan x$.',
 s:['$\\tan^2=\\sec^2-1$','$u=\\sec x$: $\\int(u^2-1)u^4du$','$=\\frac{u^7}{7}-\\frac{u^5}{5}$']},

{tech:'trigint',d:4,t:'\\int \\frac{\\sin^{2}x}{1+\\cos^{2}x}\\,dx',a:'-x+\\sqrt{2}\\arctan\\left(\\frac{\\tan x}{\\sqrt{2}}\\right)+C',
 h:'$\\sin^2x=2-\\left(1+\\cos^2x\\right)$ splits it into a constant and a known form.',
 s:['$\\frac{\\sin^2x}{1+\\cos^2x}=\\frac{2}{1+\\cos^2x}-1$','Divide by $\\cos^2x$: $\\int\\frac{dx}{1+\\cos^2x}=\\int\\frac{\\sec^2x\\,dx}{\\tan^2x+2}=\\frac{1}{\\sqrt2}\\arctan\\frac{\\tan x}{\\sqrt2}$','$=\\sqrt2\\arctan\\frac{\\tan x}{\\sqrt2}-x+C$']},

];
