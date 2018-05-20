class Player {
    constructor() {
        this.previousHealth = 20;
        this.minHealth = 20;
        this.fleeHealth = 10;
        this.direction = 'forward';
        this.state = 'walk';
        this.directions = ['forward', 'backward', 'left', 'right'];
    }

    isHit() {
        return this.warrior.health() < this.previousHealth;
    }

    walk(direction = this.direction) {
        const space = this.warrior.feel(direction);
        if (space.isWall()) {
            this.warrior.pivot();
        } else {
            this.warrior.walk(direction);
        }
    }

    battle(direction = this.direction) {
        this.state = 'battle';
        const space = this.warrior.feel(direction);
        // todo: flee is not much health left
        if (space.isUnit() && space.getUnit().isEnemy()) {
            // battle is still ongoing, let's fight
            this.warrior.attack(direction);
        } else {
            // battle has ended, rest a bit and walk
            // todo: is it possible to know if an archer is hitting us?
            this.state = 'walk';
            if (!this.tryToShoot()) {
                if (this.warrior.health() < 20) {
                    this.warrior.rest();
                } else {
                    this.walk();
                }
            }
        }
    }

    flee() {
        if (this.state !== 'flee') {
            this.state = 'flee';
            // turn around and walk away      
            this.warrior.walk('backward');
        } else if (this.isHit()) {
            // still beeing hit, walk away
            this.warrior.walk('backward');
        } else {
            // not beeing hit anymore
            if (this.warrior.health() < this.minHealth) {
                // rest till minHealth is reached
                this.warrior.rest();
            } else {
                // we're good, walk back in
                this.state = 'walk';
                this.walk();
            }
        }
    }

    distance(location) {
        return Math.sqrt(location[0] * location[0] + location[1] * location[1]);
    }

    getDirection(location) {
        if (location[0] > 0) {
            return 'forward'
        } else if (location[0] < 0) {
            return 'backward';
        } else if (location[1] >= 0) {
            return 'right';
        } else {
            return 'left';
        }
    }

    tryToShoot() {
        const enemies = [];
        for (const direction of this.directions) {
            const spaces = this.warrior.look(direction);
            const interesting = [];
            for (const space of spaces) {
                if (space.isUnit()) {
                    interesting.push({
                        distance: this.distance(space.getLocation()),
                        space,
                    });
                }
            }
            if (interesting.length > 0) {
                const close = interesting.sort((a, b) => a.distance - b.distance)[0];
                if (close.space.getUnit().isEnemy()) {
                    enemies.push(close);
                }
            }
        }
        if (enemies.length === 0) return false;
        const closer = enemies.sort((a, b) => a.distance - b.distance)[0];
        if (closer.distance === 1) {
            this.log('Try to shoot with distance === 1, should not happend.');
        }
        const direction = this.getDirection(closer.space.getLocation());
        this.warrior.shoot(direction);
        return true;
    }

    playTurn(warrior) {
        warrior.think(`current state = ${this.state}`);
        this.warrior = warrior;
        const space = warrior.feel(this.direction);
        if (this.state === 'battle') {
            this.battle();
        } else if (this.state === 'flee') {
            this.flee();
        } else if (space.isUnit()) {
            if (space.getUnit().isEnemy()) {
                this.battle();
            } else {
                warrior.rescue(this.direction);
            }
        } else if (this.isHit()) {
            // we are beeing hit, but not in a battle
            // it has to be an archer
            if (this.warrior.health() < this.fleeHealth) {
                // not enough health, go back to rest
                this.flee();
            } else {
                // enough health, let's fight him
                this.walk();
            }
        } else if (warrior.health() < this.minHealth) {
            warrior.rest();
        } else {
            // nothing happening, look around
            if (!this.tryToShoot()) {
                this.walk();
            }
        }
        this.previousHealth = warrior.health();
    }

    log(stuff) {
        if (typeof stuff !== 'string') {
            stuff = JSON.stringify(stuff);
        }
        this.warrior.think(stuff);
    }
}
