# affine

An interactive visual guide to affine transformations, built with TypeScript, Vite, and the HTML Canvas API.

The project turns the equation

```text
x' = A x + b
```

into something you can manipulate. Change the matrix values and watch a shape, coordinate grid, and basis vectors respond in real time.

## Run it

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite. To create a production build:

```bash
npm run build
```

## What is an affine transformation?

An affine transformation combines two operations:

1. A **linear transformation**, represented by a 2 x 2 matrix `A`.
2. A **translation**, represented by a vector `b`.

For a point `(x, y)`, this project applies:

```text
x' = a*x + c*y + tx
y' = b*x + d*y + ty
```

In matrix form:

```text
[ x' ]   [ a  c ] [ x ]   [ tx ]
[ y' ] = [ b  d ] [ y ] + [ ty ]
```

The controls in the right panel edit `a`, `b`, `c`, `d`, `tx`, and `ty` directly.

## Linear vs. affine

Your understanding is correct:

- A **linear transformation always keeps the origin fixed**. If the input is `(0, 0)`, the output is also `(0, 0)`.
- An **affine transformation may move the origin**. When the translation vector `b` is nonzero, the origin is sent to `b`.
- Every linear transformation is also affine: it is simply the special case where `b = (0, 0)`.

The word "linear" is doing real work here. A transformation that only shifts everything by `(2, 1)` is affine, but it is not linear because it does not preserve the origin.

## What affine transformations preserve

Affine transformations preserve:

- Straight lines
- Collinearity: points that lie on one line remain on one line
- Parallel lines
- Ratios of distances along the same line

They do not generally preserve:

- Lengths
- Angles
- Areas
- Perpendicularity

A rotation preserves lengths and angles, while a shear visibly changes them. Both are affine transformations.

## Reading the visualizer

- The pale dashed polygon is the original shape.
- The red polygon is the transformed shape.
- The teal and gold arrows show where the basis vectors `e1 = (1, 0)` and `e2 = (0, 1)` end up.
- The grid makes the change in the coordinate plane visible.
- The presets give quick examples of shear, rotation, stretching, and translation.

The basis vectors are especially useful: the columns of `A` tell you where the original basis vectors go. Translation then shifts the entire result by the same vector.

## Composition and order

Affine transformations can be composed, but order matters. For example, rotating a shape and then translating it usually gives a different result from translating it and then rotating it. This is why transformation pipelines often specify their order explicitly.

## Project structure

- `src/main.ts` contains the affine model, canvas renderer, controls, and presets.
- `src/style.css` contains the responsive visual design.
- `index.html` provides the page shell and typography imports.
