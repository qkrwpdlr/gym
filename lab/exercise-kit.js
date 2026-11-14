// 공통 관절 해법과 기구. 운동별 메타·템포·강도는 ex/<id>.js에서 지정한다.
// 좌표는 SVG 단위, go()의 0°는 아래 방향이다. 바닥은 y=130.6.
(function () {
  const { go, lerp, L } = LineArtDemo
  const mix = (a, b, u) => a.map((n, i) => lerp(n, b[i], u))
  const path = (points) => 'M' + points.map(p => p.join(' ')).join(' L')
  function ik(a, b, l1, l2, bend = 1, axis = 0) {
    const dx = b[0] - a[0], dy = b[1] - a[1]
    const d = Math.max(0.001, Math.min(Math.hypot(dx, dy), l1 + l2 - 0.001))
    const th = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (l1*l1+d*d-l2*l2)/(2*l1*d))))
    const c = [th-al, th+al].map(t => [a[0]+l1*Math.cos(t), a[1]+l1*Math.sin(t)])
    return (c[0][axis]-c[1][axis])*bend >= 0 ? c[0] : c[1]
  }
  function stand(shin = 4, flex = 8, trunk = 178, x = 104, y = 128) {
    const ankleN = [x,y], kneeN = go(ankleN,L.shank,180-shin)
    const hip = go(kneeN,L.thigh,180-shin+flex), shoulder = go(hip,L.torso,trunk)
    return { ankleN,kneeN,hip,shoulder }
  }
  function arms(j, hand, bend = 1) {
    return { ...j, handN:hand, elbowN:ik(j.shoulder,hand,L.upper,L.fore,bend) }
  }
  function hangingArms(j, bend = 1) { return arms(j,[j.shoulder[0]+2,j.shoulder[1]+28],bend) }
  function seat() {
    const hip = [88,100], shoulder = [83,71], kneeN = [114,100], ankleN = [114,124]
    return { hip,shoulder,kneeN,ankleN }
  }
  function floorPose(u) {
    const shoulder = [60,123], hip = mix([89,123],[87,108],u), ankleN = [124,128]
    const kneeN = ik(hip,ankleN,26,24,-1,1)
    return { shoulder,hip,kneeN,ankleN,elbowN:[74.6,126],handN:[88.6,126],head:[50,123] }
  }
  const solvers = {
    squat(p) {
      const j = stand(lerp(4,30,p.u),lerp(8,116,p.u),lerp(172,145,p.u))
      return arms(j,[j.shoulder[0]-5,j.shoulder[1]+4],-1)
    },
    hinge(p,c) {
      const dead = c.kind === 'deadlift', single = c.kind === 'single-leg-rdl'
      const j = stand(lerp(4,dead?8:-3,p.u),lerp(8,dead?70:c.kind==='stiff-leg-deadlift'?12:24,p.u),lerp(178,dead?109:103,p.u))
      let r = hangingArms(j)
      // 바는 발 중앙 위를 따라 움직이고, 시작 원판의 아래쪽은 바닥에 닿는다.
      if (dead) r = arms(j,[j.shoulder[0]+2-6*p.u,j.shoulder[1]+28])
      if (c.kind === 'hip-hinge-drill') r = arms(j,[j.hip[0]+7,j.hip[1]-3],1)
      if (single) {
        r.kneeF=go(j.hip,26,lerp(0,-77,p.u));r.ankleF=go(r.kneeF,24,lerp(15,-70,p.u));r.toeF=60*p.u
      }
      return r
    },
    row(p,c) {
      const supported = c.kind === 'chest-supported-row'
      const j = stand(12,c.kind==='pendlay-row'?72:45,supported?133:c.kind==='pendlay-row'?94:116)
      const hang=[j.shoulder[0]+1,j.shoulder[1]+28]
      const chest=supported?[j.shoulder[0]-3,j.shoulder[1]+21]:[j.shoulder[0]-6,j.shoulder[1]+11]
      return arms(j,mix(hang,chest,p.u),-1)
    },
    bench(p,c) {
      const incline = c.kind==='incline-bench'
      const hip=[99,incline?101:89], shoulder=incline?[79,80]:[71,91]
      const ankleN=[124,128],kneeN=ik(hip,ankleN,26,24,1)
      const j={hip,shoulder,kneeN,ankleN,head:incline?[72,73]:[61,91],torsoMid:incline?undefined:[85,86]}
      return arms(j,mix(incline?[81,52]:[78,63],incline?[90,74]:[89,c.kind==='close-grip-bench'?81:83],p.u),1)
    },
    ohp(p) {
      const j=stand()
      return arms(j,[j.shoulder[0]+lerp(11,0,p.u)+Math.sin(p.u*Math.PI)*5,lerp(j.shoulder[1]-6,j.shoulder[1]-28,p.u)],1)
    },
    triceps(p) {
      const j=stand(), elbowN=go(j.shoulder,15,-165)
      const handN=go(elbowN,14,lerp(-20,-165,p.u))
      return {...j,elbowN,handN}
    },
    curl(p,c) {
      const j=c.kind==='incline-dumbbell-curl'?{...seat(),hip:[91,101],shoulder:[80,74]}:stand()
      const elbowN=go(j.shoulder,15,c.kind==='incline-dumbbell-curl'?-8:5)
      return {...j,elbowN,handN:go(elbowN,14,lerp(8,145,p.u))}
    },
    shoulder(p,c) {
      const rear=c.kind==='rear-delt-machine',j=rear?seat():stand()
      // 옆모습 투영: 몸의 좌우로 벌리는 방향은 먼 팔도 분리해 나타낸다.
      const elbowN=go(j.shoulder,15,rear?lerp(85,-85,p.u):lerp(8,85,p.u))
      const handN=go(elbowN,14,rear?lerp(90,-90,p.u):lerp(12,78,p.u))
      return {...j,elbowN,handN,elbowF:[elbowN[0]-5*p.u,elbowN[1]-2],handF:[handN[0]-10*p.u,handN[1]-2]}
    },
    seatedLeg(p,c) {
      const j=seat()
      if(c.kind==='leg-extension') j.ankleN=go(j.kneeN,24,lerp(0,86,p.u))
      else j.ankleN=go(j.kneeN,24,lerp(83,-12,p.u))
      return arms(j,[j.hip[0]+6,j.hip[1]-4],-1)
    },
    legPress(p) {
      const hip=[82,109],shoulder=[61,89],ankleN=mix([122,80],[108,96],p.u)
      return arms({hip,shoulder,ankleN,kneeN:ik(hip,ankleN,26,24,-1,1),toeN:-45,toeF:-45},[85,102],1)
    },
    calf(p) {
      const angle=42*p.u*Math.PI/180
      const j=stand(3,6,178,104,128-(5.6*Math.sin(angle)+1.6*Math.cos(angle)-1.6))
      return {...hangingArms(j),toeN:lerp(0,42,p.u),toeF:lerp(0,42,p.u)}
    },
    split(p,c) {
      const bulgarian=c.kind==='bulgarian-split-squat'
      const hip=mix([99,84],[97,99],p.u),shoulder=go(hip,29,165)
      const swap=p.swap||0, lift=Math.sin(swap*Math.PI)*11
      const ankleN=bulgarian?[123,128]:[lerp(123,75,swap),128-(p.back?lift:0)]
      const kneeN=ik(hip,ankleN,26,24,1)
      const ankleF=bulgarian?[65,109]:[lerp(75,123,swap),128-(p.back?0:lift)]
      const kneeF=ik(hip,ankleF,26,24,1)
      return {...hangingArms({hip,shoulder,kneeN,ankleN,kneeF,ankleF}),toeF:0}
    },
    hanging(p) {
      const handN=[103,18],shoulder=[102,46],hip=[102,75],kneeN=go(hip,26,lerp(0,90,p.u))
      return {...arms({handN,shoulder,hip,kneeN,ankleN:go(kneeN,24,lerp(0,83,p.u))},handN,1),toeN:70*p.u,toeF:70*p.u}
    },
    bridge(p) { return floorPose(p.u) },
    heel(p) {
      const j=floorPose(0)
      j.ankleN=[89+Math.sqrt(26*26+24*24+2*26*24*Math.cos(p.angle*Math.PI/180)-25),128]
      j.kneeN=ik(j.hip,j.ankleN,26,24,-1,1)
      return j
    },
    extender(p) {
      const hip=[92,123],shoulder=[63,123],kneeN=[92,97],ankleN=go(kneeN,24,lerp(90,172,p.u))
      const handN=[87,111]
      return {hip,shoulder,kneeN,ankleN,kneeF:[117,123],ankleF:[141,128],head:[53,123],elbowN:ik(shoulder,handN,15,14,-1,1),handN,elbowF:ik([61.4,122.3],[85.4,111],15,14,-1,1),handF:[85.4,111],toeN:-90*p.u}
    },
    slider(p) {
      const hip=mix([87,108],[88,116],p.u),shoulder=[60,123],ankleN=[lerp(121,137,p.u),128]
      const j={hip,shoulder,ankleN,kneeN:ik(hip,ankleN,26,25,-1,1),head:[50,123],elbowN:[74.6,126],handN:[88.6,126]}
      if(p.single) {
        const hipF=j.hip,ankleF=[lerp(j.ankleN[0]-1.6,123,p.single),lerp(127.3,88,p.single)]
        j.kneeF=ik(hipF,ankleF,26,24,-1,1);j.ankleF=ankleF;j.toeF=-30*p.single
      }
      // 복귀는 양발: p.single=0인 별도 리셋 자세로 이행한다.
      return j
    },
    nordic(p) {
      const kneeN=[91,125],ankleN=[67,128],hip=go(kneeN,26,lerp(180,112,p.u)),shoulder=go(hip,29,lerp(180,112,p.u))
      return arms({hip,shoulder,kneeN,ankleN,toeN:-90,toeF:-90},[shoulder[0]+lerp(8,10,p.u),shoulder[1]+lerp(13,24,p.u)],1)
    },
    glider(p) {
      const ankleN=[126,128],hip=mix([117,79],[101,89],p.u),kneeN=ik(hip,ankleN,26,24,1)
      const shoulder=go(hip,29,lerp(176,139,p.u)),ankleF=[lerp(111,65,p.u),128],kneeF=ik(hip,ankleF,26,24,1)
      return {...arms({hip,shoulder,kneeN,ankleN,kneeF,ankleF},[131,73],1),handF:[129,73],elbowF:ik([shoulder[0]-1.6,shoulder[1]-.7],[129,73],15,14,1)}
    },
  }
  function equipment(c) {
    return ({back,front,el,pen}) => {
      const fixed=pen(back,1.6), moving=pen(c.kind==='rear-delt-machine'?back:front,1.8),weight=pen(back,2.5),pad=pen(back,4)
      const plateRadius=c.kind==='deadlift'?130.6-solvers.hinge({u:1},c).handN[1]:c.kind==='pendlay-row'?130.6-solvers.row({u:0},c).handN[1]:13
      let d='',pd=''
      switch(c.family) {
        case 'bench':
          d='M62 100 L62 130 M105 101 L105 130 M57 130 L69 130 M99 130 L112 130'
          pd=c.kind==='incline-bench'?'M66 74 L101 108 L114 108':'M55 98 L110 98'
          if(c.kind==='incline-bench')d='M84 94 L74 130 M105 108 L114 130 M69 130 L119 130'
          break
        case 'row': if(c.kind==='chest-supported-row') {pd='M101 84 L121 65';d='M111 75 L100 130 M100 130 L121 130'}break
        case 'curl':if(c.kind==='incline-dumbbell-curl'){pd='M73 73 L87 107 L105 107';d='M84 108 L78 130 M102 108 L109 130'}break
        case 'shoulder':if(c.kind==='rear-delt-machine'){pd='M78 106 L101 106 M92 95 L94 79';d='M88 106 L88 130 M145 130 L145 56 L128 56'}else d='M57 129 L57 54 M52 129 L66 129';break
        case 'seatedLeg':pd='M77 75 L82 106 L113 106';d='M84 107 L84 130 M100 107 L100 130 M94 95 L109 95';break
        case 'legPress':pd='M53 86 L77 116 L92 116';d='M77 117 L77 130 M90 130 L155 65 M98 130 L159 69';break
        case 'calf':pd='M105 130.6 L117 130.6';d='M104 131 L104 138 L120 138 L120 131';break
        case 'split':if(c.kind==='bulgarian-split-squat'){pd='M54 112 L74 112';d='M55 114 L55 130 M72 114 L72 130'}break
        case 'hanging':d='M65 18 L146 18';break
        case 'nordic':pd='M83 130 L101 130';d='M60 122 L73 122 M60 121 L60 130 M73 122 L73 130';break
        case 'glider':d='M132 73 L145 73 M138 73 L138 130';break
        case 'hinge':if(c.kind==='hip-hinge-drill') d='M85 126 L85 42';break
      }
      fixed.setAttribute('d',d);pad.setAttribute('d',pd)
      const dumbbell=(h)=>`M${h[0]-5} ${h[1]} h10 M${h[0]-4} ${h[1]-4} v8 M${h[0]+4} ${h[1]-4} v8`
      const barbell=(h,r=9)=>`M${h[0]-7} ${h[1]} h14 M${h[0]+4} ${h[1]-r} v${r*2} M${h[0]+7} ${h[1]-r+2} v${r*2-4}`
      return {update(j,p) {
        let m='',w=''
        if(['bench','ohp','row','curl'].includes(c.family)) {
          const db=['incline-dumbbell-curl','chest-supported-row'].includes(c.kind)
          w=db?dumbbell(j.handN):barbell(j.handN,c.family==='row'?plateRadius:9)
        }
        if(c.family==='hinge'&&c.kind!=='hip-hinge-drill') w=c.kind.includes('dumbbell')||c.kind==='single-leg-rdl'?dumbbell(j.handN):barbell(j.handN,c.kind==='deadlift'?plateRadius:12)
        if(c.family==='squat')w=barbell([j.shoulder[0]-4,j.shoulder[1]+3],10)
        if(c.family==='triceps')m=path([j.handN,[64,20]])+' M61 20 h6'
        if(c.family==='shoulder') {
          if(c.kind==='rear-delt-machine')m=path([[139,56],j.handN])
          else m=path([[57,125],j.handN])+' M54 125 h6'
        }
        if(c.family==='seatedLeg')m=path([[j.ankleN[0]-3,j.ankleN[1]-4],[j.ankleN[0]+4,j.ankleN[1]-4]])
        if(c.family==='legPress')m=path([[j.ankleN[0]-4,j.ankleN[1]-11],[j.ankleN[0]+11,j.ankleN[1]+4]])
        if(c.family==='slider')m=`M${j.ankleN[0]-4} 131 h12`
        if(c.family==='heel')m=`M${j.ankleN[0]} 133 v4 m-2 -2 l2 2 l2 -2`
        if(c.family==='glider')m=path([[j.ankleF[0]-3,131],[j.ankleF[0]+8,131]])
        if(c.family==='nordic')m='M66 122 L66 129'
        moving.setAttribute('d',m);weight.setAttribute('d',w)
      }}
    }
  }
  const bands=[
    ['near','ham','kneeN','hip',2.1],['near','quad','kneeN','hip',-2.1],['near','calf','ankleN','kneeN',1.6],
    ['torso','erect','hip','shoulder',3.6,.1,.43],['torso','lats','hip','shoulder',3.5,.45,.8],['torso','traps','hip','shoulder',4,.83,1],
    ['torso','abs','hip','shoulder',-4,.15,.5],['torso','chest','hip','shoulder',-4,.65,.92],
    ['arm','delt','elbowN','shoulder',-1,.75,1],['arm','sdelt','elbowN','shoulder',0,.7,1],['arm','rdelt','elbowN','shoulder',1.1,.75,1],
    ['arm','biceps','elbowN','shoulder',-1,.15,.65],['arm','triceps','elbowN','shoulder',1,.15,.65],['arm','forearm','handN','elbowN',0,.2,.8],
  ].map(([layer,key,from,to,off,k0,k1])=>({layer,key:'B:'+key,from,to,off,k0:k0??.15,k1:k1??.85,w:2.5}))
  bands.push({layer:'near',key:'B:glute',type:'glute',w:3.4})
  window.ExerciseKit={mount(c) {
    const q=new URLSearchParams(location.search),variant=q.get('variant')||''
    if(c.variants?.[variant])c={...c,...c.variants[variant],meta:{...c.meta,...c.variants[variant].meta}}
    const config={
      viewBox:c.viewBox||'42 8 126 134',ground:c.family==='hanging'?false:c.family==='calf'?'M44 138 L165 138':'M44 130.6 L165 130.6',farOffset:[-1.6,-.7],
      poses:{start:{u:0},end:{u:1}},...c,summary:c.meta.summary,
      solve:p=>solvers[c.family](p,c),props:equipment(c),bands,
    }
    // 회복 편측 동작은 지도에도 다친 쪽/반대쪽을 구분한다.
    if(c.sided)config.bands=bands.map(b=>({...b,key:['ham','quad','calf','glute'].some(k=>b.key==='B:'+k)?b.key.replace('B:','S:'):b.key}))
    window.__demoConfig=config // 재현 가능한 ?t= 검증용, 렌더러와 같은 설정을 공개한다.
    LineArtDemo.mount(config)
  }}
})()
