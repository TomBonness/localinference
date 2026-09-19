import { useEffect, useRef } from 'react'
import type { JSX, RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export type ModelSceneProps = {
  active: boolean
  compact: boolean
  pointer: RefObject<{ x: number; y: number }>
  onReady: () => void
  onUnavailable: () => void
}

function Scene({
  active,
  compact,
  pointer,
  onUnavailable,
}: ModelSceneProps) {
  const coreRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Group>(null)
  const tiltRef = useRef<THREE.Group>(null)
  const particleMeshRef = useRef<THREE.InstancedMesh>(null)
  const gl = useThree((state) => state.gl)
  const count = compact ? 48 : 96

  useEffect(() => {
    const element = gl.domElement
    const onContextLost = () => {
      onUnavailable()
    }
    element.addEventListener('webglcontextlost', onContextLost)
    return () => {
      element.removeEventListener('webglcontextlost', onContextLost)
    }
  }, [gl, onUnavailable])
  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      const message =
        reason instanceof Error ? reason.message : String(reason)
      if (message.includes('Error creating WebGL context')) {
        event.preventDefault()
        onUnavailable()
      }
    }
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [onUnavailable])

  useEffect(() => {
    const mesh = particleMeshRef.current
    if (!mesh) return
    const dummy = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      const angle = 2 * Math.PI * i / count
      const radius = 2.32 + 0.12 * Math.sin(i * 2.399)
      dummy.position.set(
        radius * Math.cos(angle),
        radius * Math.sin(angle),
        0.04 * Math.sin(3 * angle),
      )
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [count])

  useFrame((_state, delta) => {
    if (!active) return
    const clamped = Math.min(delta, 0.05)
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.12 * clamped
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.z -= 0.04 * clamped
    }
    const tilt = tiltRef.current
    if (tilt && !compact && pointer.current) {
      const targetX = -pointer.current.y * 0.12
      const targetY = pointer.current.x * 0.12
      tilt.rotation.x = THREE.MathUtils.damp(
        tilt.rotation.x,
        targetX,
        5,
        clamped,
      )
      tilt.rotation.y = THREE.MathUtils.damp(
        tilt.rotation.y,
        targetY,
        5,
        clamped,
      )
    }
  })

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 5]} intensity={4} />
      <directionalLight
        position={[-4, -1, 2]}
        intensity={2}
        color="#8FBF9A"
      />
      <pointLight
        position={[0, 2, -3]}
        intensity={6}
        distance={12}
        color="#C6F58B"
      />
      <group ref={tiltRef}>
        <group ref={coreRef} rotation={[0.35, 0, -0.3]}>
          <mesh>
            <torusKnotGeometry
              args={[1.15, 0.29, compact ? 96 : 192, compact ? 16 : 32, 2, 3]}
            />
            <meshStandardMaterial
              color="#74877A"
              metalness={0.55}
              roughness={0.3}
              emissive="#102014"
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>
        <group rotation={[1.1, 0, -0.38]}>
          <mesh>
            <torusGeometry args={[2.22, 0.014, 8, 160]} />
            <meshBasicMaterial color="#C6F58B" toneMapped={false} />
          </mesh>
        </group>
        <group ref={particlesRef} rotation={[1.1, 0, -0.38]}>
          <instancedMesh
            key={count}
            ref={particleMeshRef}
            args={[undefined, undefined, count]}
          >
            <sphereGeometry args={[0.017, 6, 6]} />
            <meshBasicMaterial color="#C6F58B" toneMapped={false} />
          </instancedMesh>
        </group>
      </group>
    </>
  )
}

export default function ModelScene(props: ModelSceneProps): JSX.Element {
  return (
    <Canvas
      camera={{ position: [0, 0, 8.2], fov: 35, near: 0.1, far: 30 }}
      dpr={props.compact ? 1 : [1, 1.5]}
      frameloop={props.active ? 'always' : 'demand'}
      gl={{ antialias: true, alpha: true }}
      onCreated={props.onReady}
      fallback={
        <img
          className="hero-svg"
          src="/core-fallback.svg"
          alt="Abstract illustration of three interlocking rings"
        />
      }
      className="stage-canvas"
      style={{
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <Scene {...props} />
    </Canvas>
  )
}
