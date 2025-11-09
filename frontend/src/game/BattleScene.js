import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import assetLoader from './AssetLoader'
import CombatSystem from './CombatSystem'

export default class BattleScene {
  constructor(canvas) {
    this.canvas = canvas
    this.units = []
    this.towers = {
      player: { left: null, right: null, king: null },
      opponent: { left: null, right: null, king: null }
    }
    this.clock = new THREE.Clock()
    
    this.init()
  }

  init() {
    // Create scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x1a1a2e)
    this.scene.fog = new THREE.Fog(0x1a1a2e, 20, 50)

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.camera.position.set(0, 12, 10)
    this.camera.lookAt(0, 0, 0)

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ 
      canvas: this.canvas,
      antialias: true 
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Add controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.maxPolarAngle = Math.PI / 2.2
    this.controls.minDistance = 8
    this.controls.maxDistance = 20

    // Create arena
    this.createArena()
    
    // Add lighting
    this.addLights()

    // Initialize combat system
    this.combatSystem = new CombatSystem(this)

    // Handle resize
    window.addEventListener('resize', () => this.onResize())

    // Start animation loop
    this.animate()
  }

  createArena() {
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(16, 24)
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2d4a3e,
      roughness: 0.8 
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)

    // Create river divider in the middle
    const riverGeometry = new THREE.PlaneGeometry(16, 2)
    const riverMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x3366cc,
      roughness: 0.3,
      metalness: 0.5
    })
    const river = new THREE.Mesh(riverGeometry, riverMaterial)
    river.rotation.x = -Math.PI / 2
    river.position.y = 0.01
    this.scene.add(river)

    // Create bridges
    const bridgeGeometry = new THREE.BoxGeometry(3, 0.2, 2)
    const bridgeMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 })
    
    const leftBridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial)
    leftBridge.position.set(-4, 0.1, 0)
    leftBridge.castShadow = true
    this.scene.add(leftBridge)

    const rightBridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial)
    rightBridge.position.set(4, 0.1, 0)
    rightBridge.castShadow = true
    this.scene.add(rightBridge)

    // Create towers
    this.createTowers()

    // Add arena borders
    this.createBorders()
  }

  createTowers() {
    const towerGeometry = new THREE.CylinderGeometry(0.8, 1, 2.5, 8)
    const playerTowerMaterial = new THREE.MeshStandardMaterial({ color: 0x4169E1 })
    const opponentTowerMaterial = new THREE.MeshStandardMaterial({ color: 0xDC143C })

    // Player towers (bottom)
    this.towers.player.left = this.createTower(towerGeometry, playerTowerMaterial, -4, -9)
    this.towers.player.right = this.createTower(towerGeometry, playerTowerMaterial, 4, -9)
    this.towers.player.king = this.createTower(towerGeometry, playerTowerMaterial, 0, -11, 1.3)

    // Opponent towers (top)
    this.towers.opponent.left = this.createTower(towerGeometry, opponentTowerMaterial, -4, 9)
    this.towers.opponent.right = this.createTower(towerGeometry, opponentTowerMaterial, 4, 9)
    this.towers.opponent.king = this.createTower(towerGeometry, opponentTowerMaterial, 0, 11, 1.3)
  }

  createTower(geometry, material, x, z, scale = 1) {
    const tower = new THREE.Mesh(geometry, material)
    tower.position.set(x, 1.25 * scale, z)
    tower.scale.set(scale, scale, scale)
    tower.castShadow = true
    tower.receiveShadow = true
    this.scene.add(tower)

    // Add health bar above tower
    const healthBarGeometry = new THREE.PlaneGeometry(1.5, 0.2)
    const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial)
    healthBar.position.set(x, 3 * scale, z)
    healthBar.lookAt(this.camera.position)
    this.scene.add(healthBar)

    tower.userData.healthBar = healthBar
    tower.userData.maxHealth = 1000
    tower.userData.health = 1000

    return tower
  }

  createBorders() {
    const borderMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a4a4a,
      transparent: true,
      opacity: 0.5
    })

    const sideWallGeometry = new THREE.BoxGeometry(0.5, 3, 24)
    const leftWall = new THREE.Mesh(sideWallGeometry, borderMaterial)
    leftWall.position.set(-8, 1.5, 0)
    this.scene.add(leftWall)

    const rightWall = new THREE.Mesh(sideWallGeometry, borderMaterial)
    rightWall.position.set(8, 1.5, 0)
    this.scene.add(rightWall)
  }

  addLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(ambientLight)

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    directionalLight.shadow.camera.near = 0.5
    directionalLight.shadow.camera.far = 50
    directionalLight.shadow.camera.left = -15
    directionalLight.shadow.camera.right = 15
    directionalLight.shadow.camera.top = 15
    directionalLight.shadow.camera.bottom = -15
    this.scene.add(directionalLight)

    // Hemisphere light for better color
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x2d4a3e, 0.6)
    this.scene.add(hemisphereLight)
  }

  spawnUnit(cardName, position, side, stats = {}) {
    const model = assetLoader.cloneModel(cardName)
    if (!model) {
      console.warn(`Failed to load model for ${cardName}`)
      return null
    }

    model.position.set(position.x, 0, position.z)
    model.castShadow = true
    model.receiveShadow = true

    // Add to scene
    this.scene.add(model)

    const unit = {
      id: stats.id || `unit_${Date.now()}`,
      model,
      side,
      position: position,
      targetPosition: null,
      target: null,
      cardName,
      hp: stats.hp || 1000,
      maxHp: stats.maxHp || 1000,
      damage: stats.damage || 100,
      speed: stats.speed || 1.0,
      range: stats.range || 1.5,
      attackSpeed: stats.attackSpeed || 1.0
    }

    this.units.push(unit)
    
    // Add to combat system
    if (this.combatSystem) {
      this.combatSystem.addUnit(unit)
    }
    
    return unit
  }

  updateTowerHealth(side, tower, health, maxHealth) {
    const towerObj = this.towers[side][tower]
    if (!towerObj) return

    towerObj.userData.health = health
    
    // Update health bar
    const healthBar = towerObj.userData.healthBar
    if (healthBar) {
      const healthPercent = health / maxHealth
      healthBar.scale.x = healthPercent
      
      // Change color based on health
      if (healthPercent > 0.6) {
        healthBar.material.color.setHex(0x00ff00)
      } else if (healthPercent > 0.3) {
        healthBar.material.color.setHex(0xffff00)
      } else {
        healthBar.material.color.setHex(0xff0000)
      }
    }

    // If destroyed, remove tower
    if (health <= 0) {
      this.scene.remove(towerObj)
      if (towerObj.userData.healthBar) {
        this.scene.remove(towerObj.userData.healthBar)
      }
    }
  }

  removeUnit(unitId) {
    const index = this.units.findIndex(u => u.id === unitId)
    if (index !== -1) {
      const unit = this.units[index]
      this.scene.remove(unit.model)
      this.units.splice(index, 1)
    }
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate() {
    requestAnimationFrame(() => this.animate())

    const deltaTime = this.clock.getDelta()

    // Update controls
    this.controls.update()

    // Update combat system
    if (this.combatSystem) {
      this.combatSystem.update(deltaTime)
    }

    // Make health bars face camera
    Object.values(this.towers).forEach(side => {
      Object.values(side).forEach(tower => {
        if (tower && tower.userData.healthBar) {
          tower.userData.healthBar.lookAt(this.camera.position)
        }
      })
    })

    // Render
    this.renderer.render(this.scene, this.camera)
  }

  // Combat system now handles unit updates

  dispose() {
    window.removeEventListener('resize', () => this.onResize())
    this.renderer.dispose()
    this.controls.dispose()
  }
}

