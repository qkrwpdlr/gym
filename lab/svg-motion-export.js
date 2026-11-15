// Bake the production rig into a script-free SVG with native SMIL tracks.
// Geometry remains editable by semantic data-part; no image crossfading.
(function () {
  const NS = 'http://www.w3.org/2000/svg'
  const channels = ['d', 'transform', 'cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height']
  const numbers = /[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/gi
  const signature = (value) => value.replace(numbers, '#').replace(/[\s,]+/g, '')
  const fmt = (n) => Number(n.toFixed(5)).toString()

  function exportSvg(timeline, scene, options = {}) {
    const fps = options.fps ?? 20
    if (!Number.isFinite(fps) || fps < 2 || fps > 60) throw new RangeError('Export fps must be in [2, 60]')
    const wasPlaying = timeline.playing, previousTime = timeline.currentTime
    timeline.pause()
    try {
      const duration = timeline.duration, count = Math.ceil(duration * fps)
      const times = new Set(Array.from({ length: count + 1 }, (_, i) => duration * i / count))
      let boundary = 0
      for (const phase of window.__demoConfig.phases) { boundary += phase.dur; times.add(Math.min(duration, boundary)) }
      const samples = [...times].sort((a, b) => a - b)
      // Nodes persist across poses. A node count/topology change is an export error.
      timeline.seek(0)
      const nodes = [scene, ...scene.querySelectorAll('*')]
      const states = nodes.map(() => ({}))
      for (const time of samples) {
        timeline.seek(time)
        if (scene.querySelectorAll('*').length + 1 !== nodes.length) throw new Error('SVG nodes changed while sampling')
        nodes.forEach((node, index) => {
          for (const channel of channels) {
            const value = node.getAttribute(channel)
            if (value !== null) (states[index][channel] ||= []).push(value)
          }
        })
      }
      timeline.seek(0)
      const copy = scene.cloneNode(true), copies = [copy, ...copy.querySelectorAll('*')]
      copies.forEach((node, index) => {
        const original = nodes[index], computed = getComputedStyle(original)
        // Resolve app-only styles so the file needs no stylesheet or web font.
        if (['path', 'circle', 'rect', 'ellipse', 'line', 'polyline', 'polygon'].includes(node.localName)) {
          node.setAttribute('fill', computed.fill)
          node.setAttribute('stroke', computed.stroke)
        }
        node.removeAttribute('class')
        node.removeAttribute('style')
        for (const [channel, raw] of Object.entries(states[index])) {
          if (raw.length !== samples.length) throw new Error(`Missing ${channel} at sample on node ${index}`)
          if (raw.every((value) => value === raw[0])) continue
          let values = raw.slice(), tag = 'animate', type
          if (channel === 'd' && values.some((value) => signature(value) !== signature(values[0]))) {
            throw new Error(`Incompatible SVG path topology on node ${index} (${original.getAttribute('data-part') || original.localName})`)
          }
          if (channel === 'transform') {
            const parsed = values.map((value) => value.match(/^\s*(translate|rotate|scale|skewX|skewY)\(([^)]+)\)\s*$/))
            if (parsed.some((value) => !value || value[1] !== parsed[0][1])) throw new Error(`Use one transform function per group (node ${index})`)
            tag = 'animateTransform'; type = parsed[0][1]
            values = parsed.map((value) => value[2])
            if (type === 'rotate') {
              let previousAngle
              values = values.map((value) => {
                const parts = value.match(numbers).map(Number)
                if (previousAngle !== undefined) {
                  while (parts[0] - previousAngle > 180) parts[0] -= 360
                  while (parts[0] - previousAngle < -180) parts[0] += 360
                }
                previousAngle = parts[0]
                return parts.map(fmt).join(' ')
              })
            }
          }
          const animation = document.createElementNS(NS, tag)
          // Keep both edges of a hold; omit redundant interior samples. This
          // makes a 30-second isometric hold as small as its entry/exit motion.
          const indices = values.map((_, i) => i).filter((i) => i === 0 || i === values.length - 1 || values[i] !== values[i - 1] || values[i] !== values[i + 1])
          const attrs = {
            attributeName: channel, values: indices.map((i) => values[i]).join(';'),
            keyTimes: indices.map((i) => fmt(samples[i] / duration)).join(';'),
            dur: `${fmt(duration)}s`, repeatCount: 'indefinite', calcMode: 'linear',
          }
          if (type) attrs.type = type
          for (const [key, value] of Object.entries(attrs)) animation.setAttribute(key, value)
          node.appendChild(animation)
        }
      })
      copy.setAttribute('xmlns', NS)
      copy.setAttribute('width', '512')
      copy.setAttribute('height', '512')
      copy.setAttribute('color', getComputedStyle(scene).color)
      copy.setAttribute('role', 'img')
      copy.setAttribute('data-duration', fmt(duration))
      copy.setAttribute('data-sample-fps', String(fps))
      copy.removeAttribute('id')
      const title = document.createElementNS(NS, 'title')
      title.textContent = options.title || window.__demoConfig.meta.title
      const desc = document.createElementNS(NS, 'desc')
      desc.textContent = `GYM articulated exercise illustration. Original parametric geometry; visual reference: Workout Guide by Bryl Lim / Everkinetic (https://bryllim.github.io/workout-guide/exercises/). ${fps} samples/second plus phase boundaries; native SVG interpolates between solver samples. Approximate exercise demonstration.`
      copy.prepend(title, desc)
      return new XMLSerializer().serializeToString(copy)
    } finally {
      timeline.seek(previousTime)
      if (wasPlaying) timeline.play()
    }
  }
  window.SvgMotion = { exportSvg }
})()
