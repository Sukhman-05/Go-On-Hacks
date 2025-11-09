import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { TextureLoader } from 'three'
import * as THREE from 'three'

class AssetLoader {
  constructor() {
    this.gltfLoader = new GLTFLoader()
    this.textureLoader = new TextureLoader()
    this.models = new Map()
    this.textures = new Map()
    this.animations = new Map()
  }

  async loadCharacter(name, path) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        path,
        (gltf) => {
          const model = gltf.scene
          model.name = name
          
          // Store animations if available
          if (gltf.animations && gltf.animations.length > 0) {
            this.animations.set(name, gltf.animations)
          }
          
          // Scale model appropriately
          model.scale.set(0.5, 0.5, 0.5)
          
          // Store model
          this.models.set(name, model)
          
          console.log(`Loaded character: ${name}`)
          resolve(model)
        },
        (progress) => {
          console.log(`Loading ${name}: ${(progress.loaded / progress.total * 100).toFixed(2)}%`)
        },
        (error) => {
          console.error(`Error loading ${name}:`, error)
          reject(error)
        }
      )
    })
  }

  async loadAllCharacters() {
    const characters = [
      { name: 'Knight', path: '/models/characters/Knight.glb' },
      { name: 'Barbarian', path: '/models/characters/Barbarian.glb' },
      { name: 'Mage', path: '/models/characters/Mage.glb' },
      { name: 'Ranger', path: '/models/characters/Ranger.glb' },
      { name: 'Rogue', path: '/models/characters/Rogue.glb' },
    ]

    try {
      await Promise.all(
        characters.map(char => this.loadCharacter(char.name, char.path))
      )
      console.log('All characters loaded successfully')
      return true
    } catch (error) {
      console.error('Failed to load some characters:', error)
      return false
    }
  }

  getModel(name) {
    return this.models.get(name)
  }

  cloneModel(name) {
    const original = this.models.get(name)
    if (!original) {
      console.warn(`Model ${name} not found, creating placeholder`)
      return this.createPlaceholder()
    }
    return original.clone()
  }

  createPlaceholder() {
    // Create a simple colored box as placeholder
    const geometry = new THREE.BoxGeometry(0.5, 1, 0.5)
    const material = new THREE.MeshStandardMaterial({ color: 0x8B5CF6 })
    return new THREE.Mesh(geometry, material)
  }

  getAnimations(name) {
    return this.animations.get(name)
  }

  async loadTexture(name, path) {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        path,
        (texture) => {
          this.textures.set(name, texture)
          resolve(texture)
        },
        undefined,
        reject
      )
    })
  }

  getTexture(name) {
    return this.textures.get(name)
  }
}

const assetLoader = new AssetLoader()
export default assetLoader

