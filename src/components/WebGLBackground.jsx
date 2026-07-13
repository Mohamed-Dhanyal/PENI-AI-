import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function WebGLBackground() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000)
    camera.position.z = 30

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Particle field
    const particleCount = 120
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = []

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30
      velocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      })
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xe2231a,
      size: 0.25,
      transparent: true,
      opacity: 0.75,
    })

    const particles = new THREE.Points(geometry, material)
    scene.add(particles)

    // Connecting lines between close particles
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xe2231a, transparent: true, opacity: 0.08 })
    const lineGeometry = new THREE.BufferGeometry()
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
    scene.add(lines)

    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      const pos = geometry.attributes.position.array
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3] += velocities[i].x
        pos[i * 3 + 1] += velocities[i].y
        pos[i * 3 + 2] += velocities[i].z

        if (Math.abs(pos[i * 3]) > 30) velocities[i].x *= -1
        if (Math.abs(pos[i * 3 + 1]) > 20) velocities[i].y *= -1
        if (Math.abs(pos[i * 3 + 2]) > 15) velocities[i].z *= -1
      }
      geometry.attributes.position.needsUpdate = true

      // Update connections
      const connections = []
      const threshold = 9
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = pos[i * 3] - pos[j * 3]
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2]
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (dist < threshold) {
            connections.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])
            connections.push(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2])
          }
        }
      }
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(connections, 3))

      particles.rotation.y += 0.0005
      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      lineGeometry.dispose()
      lineMaterial.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={containerRef} className="webgl-bg" aria-hidden="true" />
}
