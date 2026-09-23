import './style.css'

type Point = { x: number; y: number }
type Matrix = { a: number; b: number; c: number; d: number; tx: number; ty: number }

const presets: Record<string, Matrix> = {
  shear: { a: 1, b: 0, c: 0.55, d: 1, tx: 0, ty: 0 },
  rotate: { a: 0.71, b: 0.71, c: -0.71, d: 0.71, tx: 0, ty: 0 },
  stretch: { a: 1.35, b: 0, c: 0, d: 0.72, tx: 0, ty: 0 },
  translate: { a: 1, b: 0, c: 0, d: 1, tx: 1.25, ty: -0.75 },
}

const initial: Matrix = { ...presets.shear }
let matrix = { ...initial }
let showOriginal = true
let showGrid = true

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="topbar">
    <a class="wordmark" href="/" aria-label="Affine home"><span>affine</span><i>↗</i></a>
    <p class="eyebrow">A visual field guide to transformations</p>
    <span class="status"><b></b> interactive canvas</span>
  </header>

  <main>
    <section class="intro">
      <div>
        <p class="kicker">Linear algebra / 01</p>
        <h1>Move the plane.<br><em>See the rule.</em></h1>
      </div>
      <p class="lede">An affine transformation preserves straight lines and parallel relationships. Drag the controls to turn the abstract rule <strong>x' = Ax + b</strong> into something you can see.</p>
    </section>

    <section class="lab">
      <div class="canvas-wrap">
        <canvas id="canvas" aria-label="Interactive affine transformation plane"></canvas>
        <div class="canvas-caption"><span><i class="dot original"></i> original shape</span><span><i class="dot transformed"></i> transformed shape</span></div>
      </div>
      <aside class="controls">
        <div class="control-heading"><span>Transformation</span><button id="reset" type="button">Reset ↺</button></div>
        <div class="preset-row" role="group" aria-label="Presets">
          <button data-preset="shear" class="preset active">Shear</button>
          <button data-preset="rotate" class="preset">Rotate</button>
          <button data-preset="stretch" class="preset">Stretch</button>
          <button data-preset="translate" class="preset">Translate</button>
        </div>
        <div class="sliders">
          ${slider('a', 'a', -2, 2, 0.01)}${slider('b', 'b', -2, 2, 0.01)}${slider('c', 'c', -2, 2, 0.01)}${slider('d', 'd', -2, 2, 0.01)}
          <div class="divider"></div>
          ${slider('tx', 'x offset', -2, 2, 0.01)}${slider('ty', 'y offset', -2, 2, 0.01)}
        </div>
        <div class="toggles"><label><input id="show-original" type="checkbox" checked> Show original</label><label><input id="show-grid" type="checkbox" checked> Show grid</label></div>
        <div class="matrix-card"><div class="matrix-title">Your affine rule <span>2 × 3 matrix</span></div><div class="matrix"><span>[</span><output id="matrix-output"></output><span>]</span></div></div>
      </aside>
    </section>

    <section class="notes">
      <article><span class="note-number">01</span><h2>Linear part <b>A</b></h2><p>The 2 × 2 matrix controls rotation, scale, reflection, and shear. The origin stays fixed when <strong>b = 0</strong>.</p></article>
      <article><span class="note-number">02</span><h2>Translation <b>b</b></h2><p>The final column shifts every point by the same amount. Lines remain lines; parallel lines remain parallel.</p></article>
      <article><span class="note-number">03</span><h2>Composition</h2><p>Try a preset, then change it. Transformations compose right-to-left, so order changes the result.</p></article>
    </section>
  </main>
  <footer><span>affine / an explorable explanation</span><span>Built with TypeScript + Canvas</span></footer>
`

function slider(id: keyof Matrix, label: string, min: number, max: number, step: number) {
  return `<label class="slider"><span><b>${label}</b><output id="${id}-value"></output></span><input id="${id}" type="range" min="${min}" max="${max}" step="${step}"></label>`
}

const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!
const context = canvas.getContext('2d')!
const output = document.querySelector<HTMLOutputElement>('#matrix-output')!
const keys = Object.keys(matrix) as (keyof Matrix)[]

function apply(point: Point, current: Matrix): Point {
  return { x: current.a * point.x + current.c * point.y + current.tx, y: current.b * point.x + current.d * point.y + current.ty }
}

function format(value: number) { return `${value >= 0 ? ' ' : ''}${value.toFixed(2)}` }

function render() {
  const ratio = window.devicePixelRatio || 1
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  canvas.width = width * ratio
  canvas.height = height * ratio
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, width, height)
  const scale = Math.min(width, height) / 6.2
  const origin = { x: width / 2, y: height / 2 }
  const screen = (point: Point) => ({ x: origin.x + point.x * scale, y: origin.y - point.y * scale })

  context.fillStyle = '#fbfaf6'
  context.fillRect(0, 0, width, height)
  if (showGrid) {
    context.strokeStyle = '#e5e0d5'
    context.lineWidth = 1
    for (let i = -3; i <= 3; i += 1) { line(screen({ x: i, y: -3 }), screen({ x: i, y: 3 })); line(screen({ x: -3, y: i }), screen({ x: 3, y: i })) }
  }
  context.strokeStyle = '#a9a297'
  context.lineWidth = 1.5
  line(screen({ x: -3.1, y: 0 }), screen({ x: 3.1, y: 0 }))
  line(screen({ x: 0, y: -3.1 }), screen({ x: 0, y: 3.1 }))
  context.fillStyle = '#777065'
  context.font = '11px DM Mono, monospace'
  context.fillText('x', width - 19, origin.y - 8)
  context.fillText('y', origin.x + 8, 18)

  const shape: Point[] = [{ x: -1.25, y: -0.75 }, { x: 0.4, y: -0.75 }, { x: 0.85, y: 0.75 }, { x: -0.9, y: 1.05 }]
  if (showOriginal) drawShape(shape, screen, '#b8c0bc', [7, 6])
  drawShape(shape.map(point => apply(point, matrix)), screen, '#d6593d')
  drawVector({ x: 1, y: 0 }, apply({ x: 1, y: 0 }, matrix), screen, '#1f7772', 'e₁')
  drawVector({ x: 0, y: 1 }, apply({ x: 0, y: 1 }, matrix), screen, '#d28a28', 'e₂')
}

function line(start: Point, end: Point) { context.beginPath(); context.moveTo(start.x, start.y); context.lineTo(end.x, end.y); context.stroke() }
function drawShape(points: Point[], screen: (point: Point) => Point, color: string, dash: number[] = []) { context.strokeStyle = color; context.fillStyle = `${color}18`; context.lineWidth = 2.5; context.setLineDash(dash); context.beginPath(); points.forEach((point, index) => { const position = screen(point); index ? context.lineTo(position.x, position.y) : context.moveTo(position.x, position.y) }); context.closePath(); context.fill(); context.stroke(); context.setLineDash([]) }
function drawVector(start: Point, end: Point, screen: (point: Point) => Point, color: string, label: string) { const from = screen(start); const to = screen(end); context.strokeStyle = color; context.fillStyle = color; context.lineWidth = 3; line(from, to); const angle = Math.atan2(to.y - from.y, to.x - from.x); context.beginPath(); context.moveTo(to.x, to.y); context.lineTo(to.x - 9 * Math.cos(angle - 0.45), to.y - 9 * Math.sin(angle - 0.45)); context.lineTo(to.x - 9 * Math.cos(angle + 0.45), to.y - 9 * Math.sin(angle + 0.45)); context.fill(); context.font = '600 12px DM Mono, monospace'; context.fillText(label, to.x + 8, to.y - 8) }

function syncControls() { keys.forEach(key => { const control = document.querySelector<HTMLInputElement>(`#${key}`)!; const value = document.querySelector<HTMLOutputElement>(`#${key}-value`)!; control.value = String(matrix[key]); value.value = format(matrix[key]) }); output.innerHTML = `<span>${format(matrix.a)} ${format(matrix.c)} ${format(matrix.tx)}</span><span>${format(matrix.b)} ${format(matrix.d)} ${format(matrix.ty)}</span>`; render() }

keys.forEach(key => document.querySelector<HTMLInputElement>(`#${key}`)!.addEventListener('input', event => { matrix[key] = Number((event.target as HTMLInputElement).value); document.querySelectorAll('.preset').forEach(button => button.classList.remove('active')); syncControls() }))
document.querySelector('#reset')!.addEventListener('click', () => { matrix = { ...initial }; document.querySelector('[data-preset="shear"]')!.classList.add('active'); syncControls() })
document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(button => button.addEventListener('click', () => { matrix = { ...presets[button.dataset.preset!] }; document.querySelectorAll('.preset').forEach(item => item.classList.remove('active')); button.classList.add('active'); syncControls() }))
document.querySelector<HTMLInputElement>('#show-original')!.addEventListener('change', event => { showOriginal = (event.target as HTMLInputElement).checked; render() })
document.querySelector<HTMLInputElement>('#show-grid')!.addEventListener('change', event => { showGrid = (event.target as HTMLInputElement).checked; render() })
window.addEventListener('resize', render)
syncControls()
