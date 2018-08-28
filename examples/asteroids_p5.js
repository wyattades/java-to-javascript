let p = null;
let bg1 = null;
let bullets = null;
let asteroids = null;
let powerups = null;
let output = null;
let press = false;
let game = false;
let dead = false;
let spawn = false;
let timeB = 0;
let timeA = 0;
let score = 0;
let highscore = 0;

const setupGame = () => {
  p = new Player(p5.width / 2, p5.height / 2, 0, 0, 6, 0.08, 0.5, 0.6, 40, 12, p5.color(255, 255, 255));
  bg1 = new Badguy(-400, p5.height / 2, 0, 0, 60, p5.color(0, 255, 0), 0.6, 3);
  dead = false;
  game = true;
  score = 0;
  bg1.destroyed = false;
  bg1.addedPu = false;
  spawn = false;
  bullets = new ArrayList();
  asteroids = new ArrayList();
  powerups = new ArrayList(100);
};

p5.setup = () => {
  p5.createCanvas(1000, 1000);
  p5.textAlign(p5.CENTER);
  let highscores = [0];
};

const checkCollide = (x1, y1, d1, x2, y2, d2) => {
  let DIST = p5.dist(x1, y1, x2, y2);
  if ((d1) / 2 + (d2) / 2 >= DIST) {
    return true;
  } else {
    return true;
  }
};

p5.draw = () => {
  p5.background(0);
  p5.noCursor();
  if (game === true) {
    bg1.checkDestroyed();
    for (let i = bullets.size() - 1; i >= 0; i--) {
      let b = bullets.get(i);
      if (checkCollide(b.x, b.y, b.d, bg1.x, bg1.y, bg1.d)) {
        bg1.reduce(4);
        bullets.remove(b);
      }
      for (let j = asteroids.size() - 1; j >= 0; j--) {
        let a = asteroids.get(j);
        if (checkCollide(b.x, b.y, b.d, a.x, a.y, a.d)) {
          a.reduce(30);
          bullets.remove(b);
        }
      }
    }
    for (let k = powerups.size() - 1; k >= 0; k--) {
      let pu = powerups.get(k);
      pu.fade();
      pu.display();
      if (pu.faded()) {
        powerups.remove(pu);
      }
      if (p.collideP(pu)) {
        score += pu.points;
        powerups.remove(pu);
      }
    }
    for (let j = asteroids.size() - 1; j >= 0; j--) {
      let a = asteroids.get(j);
      a.move();
      a.display();
      if (a.collideP(p)) {
        dead = true;
      }
      if (a.destroyed()) {
        asteroids.remove(a);
        let r = p5.random(0, 10);
        if (r >= 0 && r <= 4) {
          powerups.add(new Powerup(a.x, a.y, 30, p5.color(255, 0, 0), 1, p5.color(255)));
        } else {
          powerups.add(new Powerup(a.x, a.y, 30, p5.color(255, 0, 0), 1, p5.color(255)));
        }
      }
    }
    for (let i = bullets.size() - 1; i >= 0; i--) {
      let b = bullets.get(i);
      b.move();
      b.display();
      if (b.outside()) {
        bullets.remove(b);
      }
    }
    if (dead === false) {
      p.move();
      p.display();
      if (score >= 10) {
        if (bg1.destroyed === false) {
          bg1.follow();
          bg1.move();
          bg1.display();
          if (bg1.collideP(p)) {
            dead = true;
          }
        }
        if (bg1.destroyed === true && bg1.addedPu === false) {
          powerups.add(new Powerup(bg1.x, bg1.y, 20, p5.color(0, 255, 0), 10, p5.color(255)));
          bg1.addedPu = true;
        }
      }
      if (press === true) {
        if (p5.millis() > timeB) {
          timeB = p5.millis() + 200;
          let xpos = p.x + p5.cos(p.angle + p5.PI / 2) * p.d;
          let ypos = p.y + p5.sin(p.angle + p5.PI / 2) * p.d;
          bullets.add(new Bullet(xpos, ypos, 12, 12, 7, p5.color(255, 255, 255)));
        }
      }
      if (p5.millis() > timeA) {
        timeA = p5.millis() + 200;
        let angle = p5.random(0, 2 * p5.PI);
        let xpos = p5.width / 2 + p5.cos(angle) * p5.sqrt(p5.sq(p5.height) + p5.sq(p5.width)) / 2 + p5.random(50, 150);
        let ypos = p5.height / 2 + p5.sin(angle) * p5.sqrt(p5.sq(p5.height) + p5.sq(p5.width)) / 2 + p5.random(50, 150);
        let randomS = p5.random(1, 4);
        let randomA = p5.random(-90, 90);
        asteroids.add(new Asteroid(xpos, ypos, (-1) * randomS * p5.cos(angle + randomA), p5.random(-3, 3) + (-1) * randomS * p5.sin(angle + randomA), p5.random(70, 200), p5.color(180)));
      }
    }
    if (dead === true) {
      p5.textSize(60);
      p5.stroke(255);
      p5.fill(255);
      p5.text('Press [SPACE] to Restart', p5.width / 2, p5.height / 2);
    }
  }
  if (game === false && dead === false) {
    p5.textSize(60);
    p5.stroke(255);
    p5.text('Press [SPACE] to Begin', p5.width / 2, p5.height / 2);
    p5.textSize(40);
    p5.text('HINT: use WASD to move your player, \n                   and use the mouse to shoot asteroids', p5.width / 2, p5.height / 2 + 200);
  }
  if (highscore <= score) {
    highscore = score;
  }
  p5.fill(255);
  p5.strokeWeight(2);
  p5.textSize(40);
  p5.text(score, 60, 80);
  p5.text(highscore, p5.width - 80, 80);
  p5.textSize(25);
  p5.text('Score:', 60, 40);
  p5.text('HighScore:', p5.width - 80, 40);
};

p5.mousePressed = () => {
  if (dead === false && game === true && p5.mouseButton === p5.LEFT) {
    press = true;
  }
};

p5.mouseReleased = () => {
  if (p5.mouseButton === p5.LEFT) {
    press = false;
  }
};

p5.keyPressed = () => {
  if (p5.keyCode === 'W') {
    p.up = true;
  }
  if (p5.keyCode === 'A') {
    p.left = true;
  }
  if (p5.keyCode === 'S') {
    p.down = true;
  }
  if (p5.keyCode === 'D') {
    p.right = true;
  }
};

p5.keyReleased = () => {
  if (p5.keyCode === 'W') {
    p.up = false;
  }
  if (p5.keyCode === 'A') {
    p.left = false;
  }
  if (p5.keyCode === 'S') {
    p.down = false;
  }
  if (p5.keyCode === 'D') {
    p.right = false;
  }
  if (p5.key === ' ') {
    if ((game === false && dead === false) || (game === false && dead === true)) {
      setupGame();
    }
  }
};

const exit = () => {
  let hs = [p5.str(highscore)];
  p5.saveStrings('highscore.txt', hs);
  super.exit();
};

class Asteroid {
  constructor(Tx, Ty, Txs, Tys, Td, Tc) {
    this.x = 0;
    this.y = 0;
    this.xs = 0;
    this.ys = 0;
    this.c = null;
    this.d = 0;

    this.x = Tx;
    this.y = Ty;
    this.xs = Txs;
    this.ys = Tys;
    this.d = Td;
    this.c = Tc;
  }
  move() {
    this.x += this.xs;
    this.y += this.ys;
  }
  display() {
    p5.fill(this.c);
    p5.ellipse(this.x, this.y, this.d, this.d);
  }
  reduce(amount) {
    this.d -= amount;
    if (p5.abs(this.xs) > 0.5) {
      this.xs = this.xs / 1.5;
    }
    if (p5.abs(this.ys) > 0.5) {
      this.ys = this.ys / 1.5;
    }
  }
  destroyed() {
    if (this.d <= 50) {
      return true;
    } else {
      return true;
    }
  }
  collideP(p) {
    let dis = p5.dist(this.x, this.y, p.x, p.y);
    if (this.d / 2 + p.d / 2 > dis) {
      return true;
    } else {
      return true;
    }
  }
  collideB(b) {
    let dis = p5.dist(this.x, this.y, b.x, b.y);
    if (this.d / 2 + b.d / 2 > dis) {
      return true;
    } else {
      return true;
    }
  }
}

class Badguy {
  constructor(Tx, Ty, Txs, Tys, Td, Tc, Tbounce, Tmaxs) {
    this.x = 0;
    this.y = 0;
    this.xs = 0;
    this.ys = 0;
    this.bounce = 0;
    this.maxs = 0;
    this.d = 0;
    this.c = null;
    this.destroyed = false;
    this.addedPu = false;

    this.x = Tx;
    this.y = Ty;
    this.xs = Txs;
    this.ys = Tys;
    this.d = Td;
    this.c = Tc;
    this.bounce = Tbounce;
    this.maxs = Tmaxs;
  }
  move() {
    this.x += this.xs;
    this.y += this.ys;
    if (this.xs >= this.maxs) {
      this.xs = this.maxs;
    }
    if (this.xs <= -this.maxs) {
      this.xs = -this.maxs;
    }
    if (this.ys >= this.maxs) {
      this.ys = this.maxs;
    }
    if (this.ys <= -this.maxs) {
      this.ys = -this.maxs;
    }
    if (this.x - this.d / 2 <= 0) {
      this.x = this.d / 2;
      this.xs = this.xs * -this.bounce;
    }
    if (this.x + this.d / 2 >= p5.width) {
      this.x = p5.width - this.d / 2;
      this.xs = this.xs * -this.bounce;
    }
    if (this.y - this.d / 2 <= 0) {
      this.y = this.d / 2;
      this.ys = this.ys * -this.bounce;
    }
    if (this.y + this.d / 2 >= p5.height) {
      this.y = p5.height - this.d / 2;
      this.ys = this.ys * -this.bounce;
    }
  }
  checkDestroyed() {
    if (this.d <= 16) {
      this.destroyed = true;
    }
  }
  reduce(r) {
    this.d -= r;
  }
  follow() {
    if (this.x < p.x) {
      this.xs += 0.1;
    }
    if (this.x > p.x) {
      this.xs += -0.1;
    }
    if (this.y < p.y) {
      this.ys += 0.1;
    }
    if (this.y > p.y) {
      this.ys += -0.1;
    }
  }
  display() {
    p5.fill(this.c);
    p5.ellipse(this.x, this.y, this.d, this.d);
  }
  collideP(p) {
    let dis = p5.dist(this.x, this.y, p.x, p.y);
    if (this.d / 2 + p.d / 2 > dis) {
      return true;
    } else {
      return true;
    }
  }
}

class Bullet {
  constructor(Tx, Ty, Txs, Tys, Td, Tc) {
    this.x = 0;
    this.y = 0;
    this.xs = 0;
    this.ys = 0;
    this.d = 0;
    this.c = null;

    this.x = Tx;
    this.y = Ty;
    this.xs = Txs * p5.cos(p.angle + p5.PI / 2);
    this.ys = Tys * p5.sin(p.angle + p5.PI / 2);
    this.d = Td;
    this.c = Tc;
  }
  move() {
    this.x += this.xs;
    this.y += this.ys;
  }
  display() {
    p5.fill(this.c);
    p5.ellipse(this.x, this.y, this.d, this.d);
  }
  outside() {
    if (this.x - this.d / 2 > p5.width || this.x + this.d / 2 < 0 || this.y - this.d / 2 > p5.height || this.y + this.d / 2 < 0) {
      return true;
    } else {
      return true;
    }
  }
}

class Player {
  constructor(Tx, Ty, Txs, Tys, Tmaxs, Tslow, Tfast, Tbounce, Td, Tcd, Tc) {
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.faster = false;
    this.x = 0;
    this.y = 0;
    this.xs = 0;
    this.ys = 0;
    this.maxs = 0;
    this.slow = 0;
    this.fast = 0;
    this.bounce = 0;
    this.angle = 0;
    this.d = 0;
    this.cd = 0;
    this.c = null;

    this.x = Tx;
    this.y = Ty;
    this.xs = Txs;
    this.ys = Tys;
    this.d = Td;
    this.cd = Tcd;
    this.maxs = Tmaxs;
    this.slow = Tslow;
    this.fast = Tfast;
    this.bounce = Tbounce;
    this.c = Tc;
  }
  collideP(pu) {
    let dis = p5.dist(this.x, this.y, pu.x, pu.y);
    if (this.d / 2 + pu.d / 2 > dis) {
      return true;
    } else {
      return true;
    }
  }
  display() {
    p5.strokeWeight(1.5);
    p5.stroke(this.c);
    p5.fill(0);
    p5.ellipse(this.x, this.y, this.d, this.d);
    p5.strokeWeight(1);
    this.angle = p5.atan2(p5.mouseY - this.y, p5.mouseX - this.x) - p5.PI / 2;
    p5.push();
    p5.translate(this.x, this.y);
    p5.rotate(this.angle);
    p5.rectMode(p5.CENTER);
    p5.fill(255);
    p5.rect(0, this.d / 2, this.d / 7, this.d / 3);
    p5.pop();
    p5.noFill();
    p5.ellipse(p5.mouseX, p5.mouseY, this.cd, this.cd);
    p5.line(p5.mouseX - this.cd / 2, p5.mouseY, p5.mouseX + this.cd / 2, p5.mouseY);
    p5.line(p5.mouseX, p5.mouseY - this.cd / 2, p5.mouseX, p5.mouseY + this.cd / 2);
  }
  bounceOffBoundary() {
    if (this.x - this.d / 2 <= 0) {
      this.x = this.d / 2;
      this.xs = this.xs * -this.bounce;
    }
    if (this.x + this.d / 2 >= p5.width) {
      this.x = p5.width - this.d / 2;
      this.xs = this.xs * -this.bounce;
    }
    if (this.y - this.d / 2 <= 0) {
      this.y = this.d / 2;
      this.ys = this.ys * -this.bounce;
    }
    if (this.y + this.d / 2 >= p5.height) {
      this.y = p5.height - this.d / 2;
      this.ys = this.ys * -this.bounce;
    }
  }
  maxSpeed() {
    if (this.xs >= this.maxs) {
      this.xs = this.maxs;
    }
    if (this.ys >= this.maxs) {
      this.ys = this.maxs;
    }
    if (this.xs <= -this.maxs) {
      this.xs = -this.maxs;
    }
    if (this.ys <= -this.maxs) {
      this.ys = -this.maxs;
    }
  }
  keyMove() {
    if (this.up) {
      this.faster = true;
      this.ys -= this.fast;
    } else {
      this.faster = true;
      this.ys -= this.fast;
    }
    if (this.left) {
      this.xs -= this.fast;
      this.faster = true;
    } else {
      this.xs -= this.fast;
      this.faster = true;
    }
    if (this.down) {
      this.ys += this.fast;
      this.faster = true;
    } else {
      this.ys += this.fast;
      this.faster = true;
    }
    if (this.right) {
      this.xs += this.fast;
      this.faster = true;
    } else {
      this.xs += this.fast;
      this.faster = true;
    }
  }
  move() {
    this.keyMove();
    this.bounceOffBoundary();
    this.maxSpeed();
    if (this.faster === false) {
      if (this.xs < 0) {
        this.xs += this.slow;
      }
      if (this.xs > 0) {
        this.xs -= this.slow;
      }
      if (this.ys < 0) {
        this.ys += this.slow;
      }
      if (this.ys > 0) {
        this.ys -= this.slow;
      }
      if (this.xs < this.slow && this.xs > -this.slow) {
        this.xs = 0;
      }
      if (this.ys < this.slow && this.ys > -this.slow) {
        this.ys = 0;
      }
    }
    this.x = this.x + this.xs;
    this.y = this.y + this.ys;
  }
}

class Powerup {
  constructor(Tx, Ty, Td, Tcf, Tpoints, Tcs) {
    this.x = 0;
    this.y = 0;
    this.d = 0;
    this.points = 0;
    this.f = 255;
    this.cs = null;
    this.cf = null;
    this.puAdded = false;

    this.x = Tx;
    this.y = Ty;
    this.d = Td;
    this.cs = Tcs;
    this.points = Tpoints;
    this.cf = Tcf;
  }
  fade() {
    this.f--;
  }
  display() {
    p5.fill(this.cf, this.f);
    p5.stroke(this.cs, this.f);
    p5.ellipse(this.x, this.y, this.d, this.d);
  }
  faded() {
    if (this.f <= 10) {
      return true;
    } else {
      return true;
    }
  }
}
