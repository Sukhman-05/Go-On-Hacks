import * as THREE from 'three'

export default class CombatSystem {
  constructor(scene) {
    this.scene = scene
    this.units = []
    this.towers = scene.towers
  }

  addUnit(unit) {
    unit.lastAttackTime = 0
    unit.isMoving = true
    unit.isAttacking = false
    this.units.push(unit)
  }

  removeUnit(unitId) {
    const index = this.units.findIndex(u => u.id === unitId)
    if (index !== -1) {
      const unit = this.units[index]
      this.scene.removeUnit(unitId)
      this.units.splice(index, 1)
    }
  }

  update(deltaTime) {
    this.units.forEach(unit => {
      if (!unit.model || unit.hp <= 0) {
        this.removeUnit(unit.id)
        return
      }

      // Find target
      if (!unit.target || unit.target.hp <= 0) {
        unit.target = this.findNearestTarget(unit)
      }

      if (unit.target) {
        const distance = this.getDistance(unit.model.position, unit.target.position)

        // Check if in attack range
        if (distance <= unit.range) {
          unit.isMoving = false
          unit.isAttacking = true
          this.attack(unit, deltaTime)
        } else {
          // Move towards target
          unit.isMoving = true
          unit.isAttacking = false
          this.moveTowards(unit, unit.target.position, deltaTime)
        }
      } else {
        // No target, move forward
        const forwardPosition = new THREE.Vector3(
          unit.model.position.x,
          unit.model.position.y,
          unit.side === 'player' ? unit.model.position.z + 5 : unit.model.position.z - 5
        )
        this.moveTowards(unit, forwardPosition, deltaTime)
      }
    })
  }

  findNearestTarget(unit) {
    let nearestTarget = null
    let nearestDistance = Infinity

    // Check enemy units
    const enemyUnits = this.units.filter(u => u.side !== unit.side && u.hp > 0)
    enemyUnits.forEach(enemy => {
      const distance = this.getDistance(unit.model.position, enemy.model.position)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestTarget = {
          type: 'unit',
          object: enemy,
          position: enemy.model.position,
          hp: enemy.hp,
          takeDamage: (damage) => {
            enemy.hp -= damage
            if (enemy.hp <= 0) {
              this.removeUnit(enemy.id)
            }
          }
        }
      }
    })

    // Check enemy towers
    const enemySide = unit.side === 'player' ? 'opponent' : 'player'
    const enemyTowers = this.towers[enemySide]
    
    Object.entries(enemyTowers).forEach(([towerName, tower]) => {
      if (tower && tower.userData.health > 0) {
        const distance = this.getDistance(unit.model.position, tower.position)
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestTarget = {
            type: 'tower',
            name: towerName,
            object: tower,
            position: tower.position,
            hp: tower.userData.health,
            takeDamage: (damage) => {
              tower.userData.health -= damage
              this.scene.updateTowerHealth(
                enemySide,
                towerName,
                tower.userData.health,
                tower.userData.maxHealth
              )
              // Emit tower damage to server
              if (typeof window !== 'undefined' && window.socketService) {
                window.socketService.emit('battle:tower_damage', {
                  tower: towerName,
                  damage: damage
                })
              }
            }
          }
        }
      }
    })

    return nearestTarget
  }

  moveTowards(unit, targetPosition, deltaTime) {
    const direction = new THREE.Vector3()
    direction.subVectors(targetPosition, unit.model.position)
    direction.y = 0 // Keep on ground
    
    const distance = direction.length()
    
    if (distance > 0.1) {
      direction.normalize()
      
      // Move unit
      const moveSpeed = unit.speed || 1.0
      const moveDistance = moveSpeed * deltaTime
      unit.model.position.add(direction.multiplyScalar(moveDistance))
      
      // Rotate to face movement direction
      const angle = Math.atan2(direction.x, direction.z)
      unit.model.rotation.y = angle
    }
  }

  attack(unit, deltaTime) {
    const currentTime = Date.now() / 1000
    const timeSinceLastAttack = currentTime - unit.lastAttackTime
    const attackCooldown = 1 / (unit.attackSpeed || 1)

    if (timeSinceLastAttack >= attackCooldown) {
      unit.lastAttackTime = currentTime

      // Deal damage
      if (unit.target && unit.target.takeDamage) {
        unit.target.takeDamage(unit.damage || 100)

        // Visual attack effect
        this.showAttackEffect(unit, unit.target)

        // Check if target is destroyed
        if (unit.target.hp <= 0) {
          unit.target = null
        }
      }
    }
  }

  showAttackEffect(attacker, target) {
    // Create a simple projectile or line effect
    const start = attacker.model.position.clone()
    start.y += 0.5

    const end = target.position.clone()
    end.y += 0.5

    // Create line geometry
    const points = [start, end]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({ 
      color: attacker.side === 'player' ? 0x4169E1 : 0xDC143C,
      linewidth: 2
    })
    const line = new THREE.Line(geometry, material)
    
    this.scene.scene.add(line)

    // Remove after short duration
    setTimeout(() => {
      this.scene.scene.remove(line)
      geometry.dispose()
      material.dispose()
    }, 100)
  }

  getDistance(pos1, pos2) {
    return pos1.distanceTo(pos2)
  }

  clear() {
    this.units = []
  }
}

