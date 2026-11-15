// Original articulated exercise artwork. Joint-local geometry; no traced paths.
// Each transform has a single operation so SVG animateTransform can target it.
(function () {
  'use strict'
  const NS = 'http://www.w3.org/2000/svg'
  const n = value => Number(value).toFixed(3)
  const pt = (x, y) => `${n(x)} ${n(y)}`

  function create(parent, options = {}) {
    const ink = options.ink || 'var(--ink, #ece8df)'
    const paper = options.paper || 'var(--paper, #151515)'
    const make = (tag, attrs, node = parent) => {
      const element = document.createElementNS(NS, tag)
      for (const [key, value] of Object.entries(attrs || {})) element.setAttribute(key, value)
      node.appendChild(element)
      return element
    }
    const group = (name, node = parent) => make('g', { 'data-part': name }, node)
    const outline = (node, width = 1.05) => make('path', {
      fill: paper, stroke: ink, 'stroke-width': width,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    }, node)
    const detail = (node, opacity = .65, width = .65) => make('path', {
      fill: 'none', stroke: ink, 'stroke-width': width, opacity,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    }, node)
    function frame(name, node) {
      const translation = group(name, node)
      const rotation = make('g', { 'data-frame': 'rotation' }, translation)
      return { translation, rotation, set(a, b) {
        translation.setAttribute('transform', `translate(${pt(a[0], a[1])})`)
        rotation.setAttribute('transform', `rotate(${n(Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI)})`)
        return Math.max(.001, Math.hypot(b[0] - a[0], b[1] - a[1]))
      } }
    }
    // Tapered muscle belly rather than a stroked bone. Start/end overlap hides
    // joint seams; the landmark centers still remain exactly at the solved joint.
    function segment(name, node, radius, endRadius, belly, anatomy) {
      const F = frame(name, node), skin = outline(F.rotation)
      const line = detail(F.rotation, .54), crease = detail(F.rotation, .45)
      return { draw(a, b) {
        const l = F.set(a, b), r = radius, e = endRadius
        skin.setAttribute('d', `M${pt(-.8, -r * .65)} C${pt(l * .12, -r * 1.16)} ${pt(l * .36, -belly)} ${pt(l * .64, -e * 1.25)} C${pt(l * .82, -e)} ${pt(l - .5, -e)} ${pt(l + .55, -e * .55)} Q${pt(l + 1.1, 0)} ${pt(l + .35, e * .65)} C${pt(l * .79, e * 1.03)} ${pt(l * .65, e)} ${pt(l * .43, belly * .86)} C${pt(l * .2, r * 1.13)} ${pt(-.8, r * .94)} ${pt(-1.05, r * .25)} Q${pt(-1.65, 0)} ${pt(-.8, -r * .65)} Z`)
        const sign = anatomy === 'calf' || anatomy === 'forearm' ? -1 : 1
        line.setAttribute('d', `M${pt(l * .12, sign * r * .48)} C${pt(l * .3, sign * belly * .6)} ${pt(l * .52, sign * e * .6)} ${pt(l * .68, sign * e * .32)}`)
        crease.setAttribute('d', `M${pt(l * .76, -e * .45)} Q${pt(l * .88, -e * .15)} ${pt(l * .93, e * .38)}`)
      } }
    }
    function leg(name, node, far) {
      const layer = group(name, node)
      if (far) layer.setAttribute('opacity', '.62')
      const thigh = segment(`${name}-thigh`, layer, far ? 3.65 : 4.05, 2.15, 4.1, 'thigh')
      const shin = segment(`${name}-shin`, layer, 2.25, 1.25, 3.15, 'calf')
      const foot = frame(`${name}-shoe`, layer), shoe = outline(foot.rotation, .95)
      const sole = detail(foot.rotation, .62)
      shoe.setAttribute('d', 'M-1.7 -1.5 Q0 -2.1 2.2 -1.2 L3.1 -.45 L6.2 .05 Q7.3 .55 6.5 1.65 Q2.6 2.1 -1.7 1.5 Q-2.7 .5 -1.7 -1.5 Z')
      sole.setAttribute('d', 'M-1.65 .65 Q2.1 1.3 6.5 .8 M1.3 -1.1 L2.8 .2')
      return { layer, draw(hip, knee, ankle, toe) {
        thigh.draw(hip, knee); shin.draw(knee, ankle)
        foot.translation.setAttribute('transform', `translate(${pt(ankle[0], ankle[1])})`)
        foot.rotation.setAttribute('transform', `rotate(${n(toe || 0)})`)
      } }
    }
    function arm(name, node, far) {
      const layer = group(name, node)
      if (far) layer.setAttribute('opacity', '.6')
      const upper = segment(`${name}-upper`, layer, 2.45, 1.5, 2.55, 'upper')
      const lower = segment(`${name}-forearm`, layer, 1.62, 1.12, 2.15, 'forearm')
      const hand = frame(`${name}-hand`, layer), fist = outline(hand.rotation, .8)
      const grip = detail(hand.rotation, .6, .5)
      fist.setAttribute('d', 'M-1.2 -1.15 Q.1 -1.65 1.2 -.85 L2 .1 Q2.1 1.1 1.1 1.5 L-.7 1.55 Q-1.8 1 -1.2 -1.15 Z')
      grip.setAttribute('d', 'M.1 -.6 L.8 .4 L.2 1')
      return { layer, draw(shoulder, elbow, wrist) {
        upper.draw(shoulder, elbow); lower.draw(elbow, wrist)
        hand.set(wrist, [wrist[0] + wrist[0] - elbow[0], wrist[1] + wrist[1] - elbow[1]])
      } }
    }

    const farLayer = group('far-limbs')
    const farLeg = leg('far-leg', farLayer, true), farArm = arm('far-arm', farLayer, true)
    const torsoLayer = group('torso-layer'), torso = frame('torso', torsoLayer)
    const trunk = outline(torso.rotation, 1.12)
    const backLine = detail(torso.rotation, .52), chest = detail(torso.rotation, .82, .8)
    const ribs = detail(torso.rotation, .46), waist = detail(torso.rotation, .64)
    const nearLayer = group('near-leg-layer'), nearLeg = leg('near-leg', nearLayer, false)
    const pelvis = frame('pelvis', nearLayer), shorts = outline(pelvis.rotation, 1.02)
    const hem = detail(pelvis.rotation, .8, .7), seam = detail(pelvis.rotation, .45)
    const armLayer = group('near-arm-layer'), nearArm = arm('near-arm', armLayer, false)
    const headLayer = group('head-layer'), neck = frame('neck', headLayer)
    const neckShape = outline(neck.rotation, 1.0)
    const head = frame('head', headLayer), skull = outline(head.rotation, 1.05)
    const hair = detail(head.rotation, .8, .8), ear = detail(head.rotation, .6, .6)
    const eye = detail(head.rotation, .8, .55)

    function draw(j) {
      // Input is the complete solver result; render without mutating its joints.
      farLeg.draw(j.hipF || j.hip, j.kneeF, j.ankleF, j.toeF)
      farArm.draw(j.shoulderF, j.elbowF, j.handF)
      const l = torso.set(j.hip, j.shoulder)
      // In hip→shoulder local coordinates +y is the front of the torso for
      // upright, hinged AND supine poses. It rotates upward on the bench.
      const y = v => v
      // Optional torsoMid supplies a restrained arch while endpoint contacts stay.
      let arch = 0
      if (j.torsoMid) {
        const ux = (j.shoulder[0] - j.hip[0]) / l, uy = (j.shoulder[1] - j.hip[1]) / l
        arch = Math.max(-2.4, Math.min(2.4, -(j.torsoMid[0] - (j.hip[0] + j.shoulder[0]) / 2) * uy + (j.torsoMid[1] - (j.hip[1] + j.shoulder[1]) / 2) * ux))
      }
      trunk.setAttribute('d', `M${pt(-2, y(-4.6))} C${pt(l * .2, y(-5))} ${pt(l * .4, y(-3.55) + arch)} ${pt(l * .57, y(-4.5))} C${pt(l * .77, y(-5.3))} ${pt(l - 1.8, y(-6.5))} ${pt(l + 1.5, y(-3.2))} Q${pt(l + 2.9, 0)} ${pt(l + 1, y(4.2))} C${pt(l * .85, y(7.25))} ${pt(l * .68, y(5.6))} ${pt(l * .55, y(4.05) + arch)} C${pt(l * .33, y(3.25) + arch)} ${pt(l * .18, y(4.65))} ${pt(-1.5, y(5.35))} Q${pt(-5.2, y(2.1))} ${pt(-2, y(-4.6))} Z`)
      backLine.setAttribute('d', `M${pt(l * .22, y(-2.8))} C${pt(l * .46, y(-1.9) + arch)} ${pt(l * .71, y(-4))} ${pt(l * .85, y(-3.2))}`)
      chest.setAttribute('d', `M${pt(l * .91, y(1.5))} Q${pt(l * .8, y(5.9))} ${pt(l * .67, y(3.15))}`)
      ribs.setAttribute('d', `M${pt(l * .59, y(2.8))} Q${pt(l * .49, y(.8) + arch)} ${pt(l * .33, y(2.25))}`)
      waist.setAttribute('d', `M${pt(l * .13, y(-3.8))} Q${pt(l * .18, 0)} ${pt(l * .13, y(4.15))}`)
      nearLeg.draw(j.hip, j.kneeN, j.ankleN, j.toeN)
      const thighLength = pelvis.set(j.hip, j.kneeN)
      const hemX = Math.min(10, thighLength * .36)
      shorts.setAttribute('d', `M${pt(-2, -4.4)} Q${pt(2.5, -5.1)} ${pt(hemX, -3.55)} L${pt(hemX + .5, 3.15)} Q${pt(3, 5.4)} ${pt(-2.1, 4.2)} Q${pt(-4.4, .1)} ${pt(-2, -4.4)} Z`)
      hem.setAttribute('d', `M${pt(hemX - 1.1, -3.45)} L${pt(hemX - .65, 3.3)}`)
      seam.setAttribute('d', `M${pt(.3, -2.7)} Q${pt(3.5, -.85)} ${pt(hemX - 1.3, -.15)}`)
      nearArm.draw(j.shoulder, j.elbowN, j.handN)
      const h = j.head || [j.shoulder[0] + (j.shoulder[0] - j.hip[0]) / l * 10.2, j.shoulder[1] + (j.shoulder[1] - j.hip[1]) / l * 10.2]
      const headLength = neck.set(j.shoulder, h)
      neckShape.setAttribute('d', `M${pt(0, y(-2.3))} L${pt(headLength - 3.5, y(-2.25))} L${pt(headLength - 3.5, y(2.1))} L${pt(1, y(3.1))} Z`)
      head.set(h, [h[0] + h[0] - j.shoulder[0], h[1] + h[1] - j.shoulder[1]])
      skull.setAttribute('d', `M${pt(-4.15, y(-2.3))} C${pt(-2.7, y(-5.05))} ${pt(2.75, y(-5))} ${pt(5, y(-2.9))} Q${pt(6.25, y(-.65))} ${pt(4.9, y(2.35))} L${pt(2.9, y(3.1))} L${pt(1.4, y(4.65))} Q${pt(.75, y(5))} ${pt(.3, y(3.8))} L${pt(-1.65, y(3.65))} Q${pt(-3.6, y(3.1))} ${pt(-3.7, y(.6))} Z`)
      hair.setAttribute('d', `M${pt(-2.75, y(-3.3))} Q${pt(1.5, y(-3.9))} ${pt(4.35, y(-2.35))} L${pt(3.7, y(.8))}`)
      ear.setAttribute('d', `M${pt(-.7, y(-.6))} Q${pt(1.15, y(-1.7))} ${pt(1.3, y(.05))} Q${pt(.75, y(.95))} ${pt(-.15, y(.6))}`)
      eye.setAttribute('d', `M${pt(2.55, y(2.3))} L${pt(2.4, y(2.95))}`)
    }
    return { draw, layers: { far: farLayer, torso: torsoLayer, near: nearLayer, arm: armLayer }, head: headLayer }
  }

  window.ArticulatedFigure = { create }
})()
