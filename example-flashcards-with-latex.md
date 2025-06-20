# Obsidian Quizium - LaTeX Math Examples

This file demonstrates how LaTeX math formulas work in flashcards and quizzes. 

**To test:** Add one of your monitored hashtags (like `#math`, `#physics`, etc.) to this file and reload the plugin.

**Note:** The LaTeX rendering will now work properly without CSP (Content Security Policy) issues!

## Flashcard Examples

### Basic Math Flashcard
[Q]What is the quadratic formula?
[A]The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$

### Physics Flashcard with Display Math
[Q]What is Wien's displacement law?
[A]Wien's displacement law states that the wavelength of maximum emission is: $$\lambda_{\text{max}} = \frac{b}{T}$$ where $b$ is Wien's displacement constant and $T$ is temperature.
[H]Remember that $b \approx 2.898 \times 10^{-3}$ m⋅K

### Complex Math with Hint
[Q]What is Euler's identity?
[A]Euler's identity is $$e^{i\pi} + 1 = 0$$
[H]This connects five fundamental mathematical constants: $e$, $i$, $\pi$, $1$, and $0$

## Quiz Examples

### Calculus Quiz
[Q]What is the integral of $\sin(x)$?
[A]$-\cos(x) + C$
[B]$\cos(x) + C$
[B]$\tan(x) + C$
[B]$-\sin(x) + C$

### Physics Quiz with Complex Formulas
[Q]According to Wien's Law, if a star has a surface temperature of 5,000 Kelvin (K), what is the approximate wavelength ($\lambda_{\text{max}}$) at which it emits the greatest amount of radiation?
[A]$$\lambda_{\text{max}} = \frac{2.898 \times 10^{-3}}{5000} = 5.8 \times 10^{-7} \text{ m}$$
[B]$$\lambda_{\text{max}} = \frac{5000}{2.898 \times 10^{-3}} = 1.7 \times 10^{6} \text{ m}$$
[B]$$\lambda_{\text{max}} = 5000 \times 2.898 \times 10^{-3} = 14.5 \text{ m}$$
[B]$$\lambda_{\text{max}} = \frac{1}{5000 \times 2.898 \times 10^{-3}} = 69 \text{ m}$$

### Algebra Quiz
[Q]Solve for $x$: $x^2 - 5x + 6 = 0$
[A]$x = 2$ or $x = 3$
[B]$x = 1$ or $x = 6$
[B]$x = -2$ or $x = -3$
[B]$x = 5$ or $x = 1$

## Mathematical Symbols and Notation

The plugin supports standard LaTeX math notation:

- **Inline math**: Use single dollar signs like `$E = mc^2$` → $E = mc^2$
- **Display math**: Use double dollar signs like `$$\int_0^\infty e^{-x} dx = 1$$` → $$\int_0^\infty e^{-x} dx = 1$$
- **Greek letters**: `$\alpha, \beta, \gamma, \Delta, \Omega$` → $\alpha, \beta, \gamma, \Delta, \Omega$
- **Fractions**: `$\frac{a}{b}$` → $\frac{a}{b}$
- **Subscripts/Superscripts**: `$x_1^2 + x_2^2$` → $x_1^2 + x_2^2$
- **Square roots**: `$\sqrt{x}$ or $\sqrt[n]{x}$` → $\sqrt{x}$ or $\sqrt[n]{x}$
- **Integrals**: `$\int f(x) dx$` → $\int f(x) dx$
- **Summations**: `$\sum_{i=1}^n i$` → $\sum_{i=1}^n i$

## Common Mathematical Sets

The plugin includes common mathematical notation:
- Natural numbers: $\mathbb{N}$ or $\NN$
- Integers: $\mathbb{Z}$ or $\ZZ$
- Rational numbers: $\mathbb{Q}$ or $\QQ$
- Real numbers: $\mathbb{R}$ or $\RR$
- Complex numbers: $\mathbb{C}$ or $\CC$

#math 