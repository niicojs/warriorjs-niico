class Player {
    constructor() {
        this.previousHealth = 20;
        this.minHealth = 20;
        this.fleeHealth = 10;
        this.direction = 'forward';
        this.state = 'walk';
    }

    turn() {
        this.direction = {
            'forward': 'left',
            'left': 'backward',
            'backward': 'right',
            'right': 'forward',
        }[this.direction];
        return this;
    }

    isHit() {
        return this.warrior.health() < this.previousHealth;
    }

    walk() {
        const space = this.warrior.feel(this.direction);
        if (space.isWall()) {
            // this.turn();
            // this.walk();
            this.warrior.pivot();
        } else {
            this.warrior.walk(this.direction);
        }
    }

    battle() {
        this.state = 'battle';
        const space = this.warrior.feel(this.direction);
        // todo: flee is not much health left
        if (space.isUnit() && space.getUnit().isEnemy()) {
            // battle is still ongoing, let's fight
            this.warrior.attack(this.direction);
        } else {
            // battle has ended, rest a bit and walk
            // todo: is it possible to know if an archer is hitting us?
            this.state = 'walk';
            if (this.warrior.health() < 20) {
                this.warrior.rest();
            } else {
                this.walk();
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

    playTurn(warrior) {
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
        } else {        
            if (this.isHit()) {
                // we are beeing hit, but not in a battle
                // it has to be an archer
                if (this.warrior.health() < this.fleeHealth) {
                    // not enough health, go back to rest
                    this.flee();
                } else {
                    // enough health, let's fight him
                    this.walk();
                }
            } else {
                // nothing happening, walk
                this.walk();
            }
        }
        this.previousHealth = warrior.health();
    }
}
