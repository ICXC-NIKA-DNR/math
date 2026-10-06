// Partial fractions. Four denominator shapes, four templates:
//   distinct linear       A/(x-a) + B/(x-b)
//   repeated linear       A/(x-a) + B/(x-a)^2
//   irreducible quadratic (Ax+B)/(x^2+px+q)
//   repeated quadratic    adds (Cx+D)/(x^2+px+q)^2
// Degree of the top must be less than the bottom first, or nothing works.
export default [

/* ── d2: distinct and repeated linear factors ────────────── */
{tech:'partial',d:2,t:'\\int \\frac{dx}{(x-1)(x+2)}',a:'\\frac{\\ln|x-1|}{3}-\\frac{\\ln|x+2|}{3}+C',
 h:'Two distinct linear factors: $\\frac{A}{x-1}+\\frac{B}{x+2}$.',
 s:['$1=A(x+2)+B(x-1)$','$x=1$: $A=\\frac13$. $x=-2$: $B=-\\frac13$','$\\frac13\\ln|x-1|-\\frac13\\ln|x+2|+C$'],
 w:'Plugging in the roots is the fast way to find $A$ and $B$ — each choice kills the other term outright.'},

{tech:'partial',d:2,t:'\\int \\frac{dx}{x^{2}-9}',a:'\\frac{\\ln|x-3|}{6}-\\frac{\\ln|x+3|}{6}+C',
 h:'Factor first: $(x-3)(x+3)$.',
 s:['$\\frac{1}{x^2-9}=\\frac{1/6}{x-3}-\\frac{1/6}{x+3}$','$=\\frac16\\ln\\left|\\frac{x-3}{x+3}\\right|+C$']},

{tech:'partial',d:2,t:'\\int \\frac{x+7}{x^{2}+x-6}\\,dx',a:'\\frac{9\\ln|x-2|}{5}-\\frac{4\\ln|x+3|}{5}+C',
 h:'$x^2+x-6=(x-2)(x+3)$. Cover up and evaluate at each root.',
 s:['$\\frac{x+7}{(x-2)(x+3)}=\\frac{A}{x-2}+\\frac{B}{x+3}$','$x=2$: $A=\\frac{2+7}{2+3}=\\frac95$','$x=-3$: $B=\\frac{-3+7}{-3-2}=-\\frac45$'],
 w:'The constants are rarely whole numbers. Recombine $\\frac{9/5}{x-2}-\\frac{4/5}{x+3}$ and check you get the original before integrating.'},

{tech:'partial',d:2,t:'\\int \\frac{3x+1}{(x-1)(x+3)}\\,dx',a:'\\ln|x-1|+2\\ln|x+3|+C',
 h:'Cover-up: evaluate the numerator at each root.',
 s:['$A=\\frac{3(1)+1}{1+3}=1$','$B=\\frac{3(-3)+1}{-3-1}=\\frac{-8}{-4}=2$','$\\ln|x-1|+2\\ln|x+3|+C$']},

{tech:'partial',d:2,t:'\\int \\frac{dx}{x(x+1)}',a:'\\ln|x|-\\ln|x+1|+C',
 h:'The simplest case of all.',
 s:['$\\frac{1}{x(x+1)}=\\frac1x-\\frac{1}{x+1}$']},

{tech:'partial',d:2,t:'\\int \\frac{dx}{x^{2}-5x+6}',a:'\\ln|x-3|-\\ln|x-2|+C',
 h:'$(x-2)(x-3)$.',
 s:['$\\frac{1}{(x-2)(x-3)}=\\frac{1}{x-3}-\\frac{1}{x-2}$']},

{tech:'partial',d:2,t:'\\int \\frac{5x-4}{2x^{2}+x-1}\\,dx',a:'-\\frac{\\ln|2x-1|}{2}+3\\ln|x+1|+C',
 h:'$2x^2+x-1=(2x-1)(x+1)$.',
 s:['$5x-4=A(x+1)+B(2x-1)$','$x=-1$: $-9=-3B$, so $B=3$','$x=\\frac12$: $-\\frac32=\\frac32A$, so $A=-1$','$\\int\\frac{-1}{2x-1}dx=-\\frac12\\ln|2x-1|$'],
 w:'With a leading coefficient the $\\frac{1}{2x-1}$ piece integrates to $\\frac12\\ln|2x-1|$. Forgetting that factor is the usual slip.'},

{tech:'partial',d:2,t:'\\int \\frac{dx}{(x+1)^{2}}',a:'-\\frac{1}{x+1}+C',
 h:'A repeated factor with nothing to split.',
 s:['$u=x+1$: $\\int u^{-2}du=-u^{-1}$']},

{tech:'partial',d:2,t:'\\int \\frac{x}{(x+1)^{2}}\\,dx',a:'\\ln|x+1|+\\frac{1}{x+1}+C',
 h:'Repeated linear: $\\frac{A}{x+1}+\\frac{B}{(x+1)^{2}}$.',
 s:['$x=(x+1)-1$, so $\\frac{x}{(x+1)^2}=\\frac{1}{x+1}-\\frac{1}{(x+1)^2}$','$=\\ln|x+1|+\\frac{1}{x+1}+C$'],
 w:'Writing the numerator in terms of the repeated factor beats solving for $A$ and $B$ every time.'},

{tech:'partial',d:2,t:'\\int \\frac{2x+3}{(x-1)^{2}}\\,dx',a:'2\\ln|x-1|-\\frac{5}{x-1}+C',
 h:'$2x+3=2(x-1)+5$.',
 s:['$\\frac{2(x-1)+5}{(x-1)^2}=\\frac{2}{x-1}+\\frac{5}{(x-1)^2}$','$=2\\ln|x-1|-\\frac{5}{x-1}+C$']},

{tech:'partial',d:2,t:'\\int \\frac{x^{2}+1}{x^{2}-1}\\,dx',a:'x+\\ln|x-1|-\\ln|x+1|+C',
 h:'Equal degrees — divide before you split.',
 s:['$\\frac{x^2+1}{x^2-1}=1+\\frac{2}{x^2-1}$','$\\frac{2}{x^2-1}=\\frac{1}{x-1}-\\frac{1}{x+1}$']},

{tech:'partial',d:2,t:'\\int \\frac{x^{3}}{x^{2}-4}\\,dx',a:'\\frac{x^{2}}{2}+2\\ln|x-2|+2\\ln|x+2|+C',
 h:'Top-heavy: long-divide first.',
 s:['$\\frac{x^3}{x^2-4}=x+\\frac{4x}{x^2-4}$','$\\int\\frac{4x}{x^2-4}dx=2\\ln|x^2-4|$']},

/* ── d3: irreducible quadratics ──────────────────────────── */
{tech:'partial',d:3,t:'\\int \\frac{dx}{x\\left(x^{2}+1\\right)}',a:'\\ln|x|-\\frac{\\ln\\left(x^{2}+1\\right)}{2}+C',
 h:'$\\frac{A}{x}+\\frac{Bx+C}{x^{2}+1}$ — the quadratic gets a linear numerator.',
 s:['$1=A(x^2+1)+(Bx+C)x$','$A=1$, $B=-1$, $C=0$','$\\int\\frac{dx}{x}-\\int\\frac{x\\,dx}{x^2+1}$'],
 w:'An irreducible quadratic always takes $Bx+C$ on top, never just a constant. Count unknowns: the degree of the denominator is the number you need.'},

{tech:'partial',d:3,t:'\\int \\frac{x^{2}+2}{x\\left(x^{2}+4\\right)}\\,dx',a:'\\frac{\\ln|x|}{2}+\\frac{\\ln\\left(x^{2}+4\\right)}{4}+C',
 h:'Same template; solve for three constants.',
 s:['$x^2+2=A(x^2+4)+(Bx+C)x$','$A=\\frac12$, $B=\\frac12$, $C=0$','$\\frac12\\ln|x|+\\frac12\\cdot\\frac12\\ln(x^2+4)$']},

{tech:'partial',d:3,t:'\\int \\frac{4}{x^{3}+4x}\\,dx',a:'\\ln|x|-\\frac{\\ln\\left(x^{2}+4\\right)}{2}+C',
 h:'Factor out the $x$: $x\\left(x^{2}+4\\right)$.',
 s:['$\\frac{4}{x(x^2+4)}=\\frac1x-\\frac{x}{x^2+4}$','$=\\ln|x|-\\frac12\\ln(x^2+4)+C$']},

{tech:'partial',d:3,t:'\\int \\frac{dx}{x^{3}+x^{2}+x+1}',a:'\\frac{\\ln|x+1|}{2}-\\frac{\\ln\\left(x^{2}+1\\right)}{4}+\\frac{\\arctan x}{2}+C',
 h:'Factor by grouping: $(x+1)\\left(x^{2}+1\\right)$.',
 s:['$\\frac{1}{(x+1)(x^2+1)}=\\frac{1/2}{x+1}+\\frac{-\\frac12x+\\frac12}{x^2+1}$','$\\int\\frac{-x/2}{x^2+1}dx=-\\frac14\\ln(x^2+1)$','$\\int\\frac{1/2}{x^2+1}dx=\\frac{\\arctan x}{2}$']},

{tech:'partial',d:3,t:'\\int \\frac{2x^{2}-x+1}{x^{3}+x}\\,dx',a:'\\ln|x|+\\frac{\\ln\\left(x^{2}+1\\right)}{2}-\\arctan x+C',
 h:'$x\\left(x^{2}+1\\right)$ again.',
 s:['$\\frac{2x^2-x+1}{x(x^2+1)}=\\frac1x+\\frac{x-1}{x^2+1}$','$\\int\\frac{x}{x^2+1}=\\frac12\\ln(x^2+1)$, $\\int\\frac{-1}{x^2+1}=-\\arctan x$']},

{tech:'partial',d:3,t:'\\int \\frac{x+1}{x^{2}+2x+5}\\,dx',a:'\\frac{\\ln\\left(x^{2}+2x+5\\right)}{2}+C',
 h:'Irreducible, and the numerator is already half the derivative.',
 s:['$\\frac{d}{dx}(x^2+2x+5)=2x+2$','$=\\frac12\\ln(x^2+2x+5)+C$']},

{tech:'partial',d:3,t:'\\int \\frac{3x-2}{x^{2}+4x+13}\\,dx',a:'\\frac{3\\ln\\left(x^{2}+4x+13\\right)}{2}-\\frac{8\\arctan\\left(\\frac{x+2}{3}\\right)}{3}+C',
 h:'Force the derivative into the numerator, then complete the square on what is left.',
 s:['$3x-2=\\frac32(2x+4)-8$','$\\frac32\\ln(x^2+4x+13)$','$-8\\int\\frac{dx}{(x+2)^2+9}=-\\frac83\\arctan\\frac{x+2}{3}$']},

{tech:'partial',d:3,t:'\\int \\frac{dx}{x^{3}-1}',a:'\\frac{\\ln|x-1|}{3}-\\frac{\\ln\\left(x^{2}+x+1\\right)}{6}-\\frac{\\arctan\\left(\\frac{2x+1}{\\sqrt{3}}\\right)}{\\sqrt{3}}+C',
 h:'$x^{3}-1=(x-1)\\left(x^{2}+x+1\\right)$, and the quadratic is irreducible.',
 s:['$\\frac{1}{x^3-1}=\\frac{1/3}{x-1}-\\frac{\\frac13x+\\frac23}{x^2+x+1}$','$x^2+x+1=\\left(x+\\frac12\\right)^2+\\frac34$','Split the top into the derivative part and a constant'],
 w:'Cyclotomic denominators like $x^3\\pm1$ and $x^4+1$ always leave an irreducible quadratic. Completing the square inside it is not optional.'},

{tech:'partial',d:3,t:'\\int \\frac{dx}{x^{3}+1}',a:'\\frac{\\ln|x+1|}{3}-\\frac{\\ln\\left(x^{2}-x+1\\right)}{6}+\\frac{\\arctan\\left(\\frac{2x-1}{\\sqrt{3}}\\right)}{\\sqrt{3}}+C',
 h:'$(x+1)\\left(x^{2}-x+1\\right)$.',
 s:['$\\frac{1}{x^3+1}=\\frac{1/3}{x+1}+\\frac{-\\frac13x+\\frac23}{x^2-x+1}$','$x^2-x+1=\\left(x-\\frac12\\right)^2+\\frac34$']},

{tech:'partial',d:3,t:'\\int \\frac{x^{2}}{x^{3}-1}\\,dx',also:'usub',a:'\\frac{\\ln\\left|x^{3}-1\\right|}{3}+C',
 h:'Look before you split — the top is a third of the derivative.',
 s:['$\\frac{d}{dx}(x^3-1)=3x^2$','$=\\frac13\\ln|x^3-1|+C$'],
 w:'Always test $\\frac{f\'}{f}$ before setting up partial fractions. This one is a one-liner that looks like a ten-liner.'},

{tech:'partial',d:3,t:'\\int \\frac{dx}{x^{2}(x+1)}',a:'-\\frac{1}{x}-\\ln|x|+\\ln|x+1|+C',
 h:'$\\frac{A}{x}+\\frac{B}{x^{2}}+\\frac{C}{x+1}$ — a repeated factor needs both powers.',
 s:['$1=Ax(x+1)+B(x+1)+Cx^2$','$B=1$, $C=1$, $A=-1$','$-\\ln|x|-\\frac1x+\\ln|x+1|+C$']},

{tech:'partial',d:3,t:'\\int \\frac{x^{2}+1}{x(x-1)^{2}}\\,dx',a:'\\ln|x|-\\frac{2}{x-1}+C',
 h:'Repeated linear plus a simple one.',
 s:['$\\frac{x^2+1}{x(x-1)^2}=\\frac1x+\\frac{2}{(x-1)^2}$','$=\\ln|x|-\\frac{2}{x-1}+C$']},

{tech:'partial',d:3,t:'\\int \\frac{dx}{(x+1)\\left(x^{2}+1\\right)}',a:'\\frac{\\ln|x+1|}{2}-\\frac{\\ln\\left(x^{2}+1\\right)}{4}+\\frac{\\arctan x}{2}+C',
 h:'Three constants for a cubic denominator.',
 s:['$\\frac{1}{(x+1)(x^2+1)}=\\frac{1/2}{x+1}+\\frac{-\\frac12x+\\frac12}{x^2+1}$']},

{tech:'partial',d:3,t:'\\int \\frac{x^{4}}{x^{2}-1}\\,dx',a:'\\frac{x^{3}}{3}+x+\\frac{\\ln|x-1|}{2}-\\frac{\\ln|x+1|}{2}+C',
 h:'Divide first: the top is two degrees higher.',
 s:['$\\frac{x^4}{x^2-1}=x^2+1+\\frac{1}{x^2-1}$','$\\frac{1}{x^2-1}=\\frac{1/2}{x-1}-\\frac{1/2}{x+1}$']},

/* ── d4: repeated quadratics and awkward splits ──────────── */
{tech:'partial',d:4,t:'\\int \\frac{dx}{\\left(x^{2}+1\\right)^{2}}',also:'trigsub',a:'\\frac{\\arctan x}{2}+\\frac{x}{2\\left(x^{2}+1\\right)}+C',
 h:'A repeated irreducible quadratic — the reduction formula, or $x=\\tan t$.',
 s:['$x=\\tan t$: $\\int\\cos^2t\\,dt=\\frac t2+\\frac{\\sin t\\cos t}{2}$','$=\\frac{\\arctan x}{2}+\\frac{x}{2(1+x^2)}+C$']},

{tech:'partial',d:4,t:'\\int \\frac{x^{2}}{\\left(x^{2}+1\\right)^{2}}\\,dx',also:'trigsub',a:'\\frac{\\arctan x}{2}-\\frac{x}{2\\left(x^{2}+1\\right)}+C',
 h:'Write $x^{2}=\\left(x^{2}+1\\right)-1$ and split.',
 s:['$\\frac{x^2}{(x^2+1)^2}=\\frac{1}{x^2+1}-\\frac{1}{(x^2+1)^2}$','$=\\arctan x-\\left(\\frac{\\arctan x}{2}+\\frac{x}{2(x^2+1)}\\right)$'],
 w:'Adding and subtracting the denominator turns a repeated quadratic into two known pieces. It is faster than the full partial-fraction setup.'},

{tech:'partial',d:4,t:'\\int \\frac{dx}{x\\left(x^{2}+1\\right)^{2}}',also:'usub',a:'\\ln|x|-\\frac{\\ln\\left(x^{2}+1\\right)}{2}+\\frac{1}{2\\left(x^{2}+1\\right)}+C',
 h:'$u=x^{2}$ after multiplying top and bottom by $x$.',
 s:['$=\\int\\frac{x\\,dx}{x^2(x^2+1)^2}$, $u=x^2$','$\\frac12\\int\\frac{du}{u(u+1)^2}=\\frac12\\left[\\ln\\left|\\frac{u}{u+1}\\right|+\\frac{1}{u+1}\\right]$','Substitute $u=x^2$']},

{tech:'partial',d:4,t:'\\int \\frac{3x+5}{\\left(x^{2}+2x+5\\right)^{2}}\\,dx',also:'trigsub',a:'-\\frac{3}{2\\left(x^{2}+2x+5\\right)}+\\frac{x+1}{4\\left(x^{2}+2x+5\\right)}+\\frac{\\arctan\\left(\\frac{x+1}{2}\\right)}{8}+C',
 h:'Split into the derivative piece and a constant, then complete the square.',
 s:['$3x+5=\\frac32(2x+2)+2$','$\\frac32\\int\\frac{(2x+2)dx}{(x^2+2x+5)^2}=-\\frac{3}{2(x^2+2x+5)}$','$2\\int\\frac{du}{(u^2+4)^2}$ with $u=x+1$ gives $\\frac{u}{4(u^2+4)}+\\frac{\\arctan(u/2)}{8}$']},

{tech:'partial',d:4,t:'\\int \\frac{dx}{x^{4}-1}',a:'\\frac{\\ln|x-1|}{4}-\\frac{\\ln|x+1|}{4}-\\frac{\\arctan x}{2}+C',
 h:'$x^{4}-1=(x-1)(x+1)\\left(x^{2}+1\\right)$.',
 s:['$\\frac{1}{x^4-1}=\\frac{1/4}{x-1}-\\frac{1/4}{x+1}-\\frac{1/2}{x^2+1}$','Integrate each']},

{tech:'partial',d:4,t:'\\int \\frac{x^{2}+1}{x^{4}-1}\\,dx',a:'\\frac{\\ln|x-1|}{2}-\\frac{\\ln|x+1|}{2}+C',
 h:'Cancel before you split: $x^{4}-1=\\left(x^{2}-1\\right)\\left(x^{2}+1\\right)$.',
 s:['$\\frac{x^2+1}{x^4-1}=\\frac{1}{x^2-1}$','$=\\frac12\\ln\\left|\\frac{x-1}{x+1}\\right|+C$'],
 w:'Cancelling a common factor is not a shortcut, it is the first step. Setting up four unknowns here would be four unknowns of wasted work.'},

{tech:'partial',d:4,t:'\\int \\frac{dx}{x^{4}+x^{2}}',a:'-\\frac{1}{x}-\\arctan x+C',
 h:'$x^{2}\\left(x^{2}+1\\right)$ — a repeated linear and an irreducible quadratic.',
 s:['$\\frac{1}{x^2(x^2+1)}=\\frac{1}{x^2}-\\frac{1}{x^2+1}$','$=-\\frac1x-\\arctan x+C$']},

{tech:'partial',d:4,t:'\\int \\frac{2x^{3}+x+3}{\\left(x^{2}+1\\right)^{2}}\\,dx',a:'\\ln\\left(x^{2}+1\\right)+\\frac{3\\arctan x}{2}+\\frac{3x+1}{2\\left(x^{2}+1\\right)}+C',
 h:'Write the numerator in terms of $x^{2}+1$.',
 s:['$2x^3+x=2x(x^2+1)-x$','$\\int\\frac{2x}{x^2+1}dx=\\ln(x^2+1)$','What is left is $\\int\\frac{3-x}{(x^2+1)^2}dx$']},

{tech:'partial',d:4,t:'\\int \\frac{dx}{\\left(x^{2}-1\\right)^{2}}',a:'\\frac{\\ln|x+1|}{4}-\\frac{\\ln|x-1|}{4}-\\frac{x}{2\\left(x^{2}-1\\right)}+C',
 h:'$\\frac{1}{(x-1)^{2}(x+1)^{2}}$ — four constants.',
 s:['$\\frac{1}{(x^2-1)^2}=-\\frac{1/4}{x-1}+\\frac{1/4}{(x-1)^2}+\\frac{1/4}{x+1}+\\frac{1/4}{(x+1)^2}$','$-\\frac14\\ln|x-1|+\\frac14\\ln|x+1|-\\frac{1}{4(x-1)}-\\frac{1}{4(x+1)}$','$\\frac{1}{4(x-1)}+\\frac{1}{4(x+1)}=\\frac{x}{2(x^2-1)}$']},

{tech:'partial',d:4,t:'\\int \\frac{x\\,dx}{x^{4}+4}',also:'usub',a:'\\frac{\\arctan\\left(\\frac{x^{2}}{2}\\right)}{4}+C',
 h:'$u=x^{2}$ before anything else.',
 s:['$u=x^2$, $x\\,dx=\\frac{du}{2}$','$\\frac12\\int\\frac{du}{u^2+4}=\\frac14\\arctan\\frac u2$']},

{tech:'partial',d:4,t:'\\int \\frac{x^{3}+x+1}{x\\left(x^{2}+1\\right)}\\,dx',a:'x+\\ln|x|-\\frac{\\ln\\left(x^{2}+1\\right)}{2}+C',
 h:'Divide first — the degrees are equal.',
 s:['$\\frac{x^3+x+1}{x^3+x}=1+\\frac{1}{x(x^2+1)}$','$\\int\\frac{dx}{x(x^2+1)}=\\ln|x|-\\frac12\\ln(x^2+1)$','$=x+\\ln|x|-\\frac12\\ln(x^2+1)+C$']},

];
