class Asteroid {
  float x,y,xs,ys;
  color c;
  int d;
  
  Asteroid(float Tx, float Ty, float Txs, float Tys, int Td, color Tc) {
    x = Tx;
    y = Ty;
    xs = Txs;
    ys = Tys;
    d = Td;
    c = Tc;
  }
  
  void move() {
    x += xs;
    y += ys;
  }
  
  void display() {
    fill(c);
    ellipse(x,y,d,d);
  }
  
  void reduce(int amount) {
    d -= amount;
    if (abs(xs) > 0.5) xs = xs/1.5;
    if (abs(ys) > 0.5) ys = ys/1.5;
  }
  
  boolean destroyed() {
    if (d <= 50) {
      return true;
    }
    else {
      return false;
    }
  }
  
  boolean collideP(Player p) {
    float dis = dist(x,y,p.x,p.y);
    if (d/2 + p.d/2 > dis) {
      return true;
    }
    else {
      return false;
    }
  }
  
  boolean collideB(Bullet b) {
    float dis = dist(x,y,b.x,b.y);
    if (d/2 + b.d/2 > dis) {
      return true;
    }
    else {
      return false;
    }
  }
}
Player p;
Badguy bg1;
ArrayList<Bullet> bullets;
ArrayList<Asteroid> asteroids;
ArrayList<Powerup> powerups;

PrintWriter output;

boolean press,game,dead,spawn;
int timeB,timeA,score,highscore;


void setupGame() {
  p = new Player(width/2,height/2,0,0,6,0.08,0.5,0.6,40,12,color(255,255,255));
  bg1 = new Badguy(-400,height/2,0,0,60,color(0,255,0),0.6,3);
  dead = false;
  game = true;
  score = 0;
  bg1.destroyed = false;
  bg1.addedPu = false;
  spawn = false;
  bullets = new ArrayList<Bullet>();
  asteroids = new ArrayList<Asteroid>();  
  powerups = new ArrayList<Powerup>(100);
}

void setup() {
  size(1000,1000);
  textAlign(CENTER);
  // Load highscore
  int[] highscores = { 0 };
}

boolean checkCollide(float x1, float y1, int d1, float x2, float y2, int d2) {
  float DIST = dist(x1,y1,x2,y2);
  if (float(d1)/2 + float(d2)/2 >= DIST) return true;
  else return false;
}

void draw() {
  background(0);
  noCursor();   
  if (game == true) {
    bg1.checkDestroyed();
    for (int i = bullets.size()-1; i >= 0; i--) {
      Bullet b = bullets.get(i);
      if (checkCollide(b.x,b.y,b.d,bg1.x,bg1.y,bg1.d)) {
        bg1.reduce(4);
        bullets.remove(b);
      }
      for (int j = asteroids.size()-1; j >= 0; j--) {
        Asteroid a = asteroids.get(j);
        if (checkCollide(b.x,b.y,b.d,a.x,a.y,a.d)) {
          a.reduce(30);
          bullets.remove(b);
        }
      }
    }
    for (int k = powerups.size()-1; k >= 0; k--) {
      Powerup pu = powerups.get(k);
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
    for (int j = asteroids.size()-1; j >= 0; j--) {
      Asteroid a = asteroids.get(j);
      a.move();
      a.display();
      if (a.collideP(p)) {
        dead = true;
      }
      if (a.destroyed()) {
        asteroids.remove(a);
        int r = (int)random(0,10);
        if (r >= 0 && r <= 4) {
          powerups.add(new Powerup(a.x,a.y,30,color(255,0,0),1,color(255)));
        } else if (r >= 9 && r <= 10) {
          powerups.add(new Powerup(a.x,a.y,20,color(255,255,0),5,color(255)));
        }
      }
    }
    for (int i = bullets.size()-1; i >= 0; i--) {
      Bullet b = bullets.get(i);    
      b.move();
      b.display();
      if (b.outside()) {
        bullets.remove(b);
      }
    }

    if (dead == false) {
      p.move();
      p.display();
      if (score >= 10) {
        if (bg1.destroyed == false) {       
          bg1.follow();   
          bg1.move();
          bg1.display();
          if (bg1.collideP(p)) dead = true;
        }
        if (bg1.destroyed == true && bg1.addedPu == false) {
          powerups.add(new Powerup(bg1.x,bg1.y,20,color(0,255,0),10,color(255)));  
          bg1.addedPu = true;
        }
      }
      if (press == true) {
        if (millis() > timeB) {
          timeB = millis()+200;
          float xpos = p.x+cos(p.angle+PI/2)*p.d;
          float ypos = p.y+sin(p.angle+PI/2)*p.d;
          bullets.add(new Bullet(xpos,ypos,12,12,7,color(255,255,255)));
        }
      }
      if (millis() > timeA) {
        timeA = millis()+200;
        float angle = random(0,2*PI);
        float xpos = width/2+cos(angle)*sqrt(sq(height)+sq(width))/2+random(50,150);
        float ypos = height/2+sin(angle)*sqrt(sq(height)+sq(width))/2+random(50,150);
        float randomS = random(1,4);
        float randomA = random(-90,90);
        asteroids.add(new Asteroid(xpos,ypos,(-1)*randomS*cos(angle+randomA),random(-3,3)+(-1)*randomS*sin(angle+randomA),(int)random(70,200),color(180)));
      }  
    }
    if (dead == true) {
      textSize(60);
      stroke(255);
      fill(255);
      text("Press [SPACE] to Restart",width/2,height/2);
    }
  }
  if (game == false && dead == false) {
    textSize(60);
    stroke(255);
    text("Press [SPACE] to Begin",width/2,height/2);
    textSize(40);
    text("HINT: use WASD to move your player, \n                   and use the mouse to shoot asteroids",width/2,height/2+200);
  }
  if (highscore <= score) highscore = score;
  fill(255);
  strokeWeight(2);
  textSize(40);
  text(score,60,80);
  text(highscore,width-80,80);
  textSize(25);
  text("Score:",60,40);
  text("HighScore:",width-80,40);
}

void mousePressed() {
  if (dead == false && game == true && mouseButton == LEFT) {
    press = true;
  }
}

void mouseReleased() {
  if (mouseButton == LEFT) press = false;
}

void keyPressed() {
  if (keyCode == 'W') {
    p.up = true;
  }
  if (keyCode == 'A') {
    p.left = true;
  }
  if (keyCode == 'S') {
    p.down = true;
  }
  if (keyCode == 'D') {
    p.right = true;
  }
}

void keyReleased() {
  if (keyCode == 'W') {
    p.up = false;
  }
  if (keyCode == 'A') {
    p.left = false;
  }
  if (keyCode == 'S') {
    p.down = false;
  }
  if (keyCode == 'D') {
    p.right = false;
  }
  if (key == ' ') {
    if ((game == false && dead == false) || (game == false && dead == true)) {
      setupGame();
    }
  }
}

void exit() {
  String[] hs = {str(highscore)};
  saveStrings("highscore.txt",hs);
  super.exit();
}

  
class Badguy {
  float x,y,xs,ys,bounce,maxs;
  int d;
  color c;
  boolean destroyed;
  boolean addedPu;
  
  Badguy(float Tx,float Ty, float Txs, float Tys, int Td, color Tc, float Tbounce, float Tmaxs) {
    x = Tx;
    y = Ty;
    xs = Txs;
    ys = Tys;
    d = Td;
    c = Tc;
    bounce = Tbounce;
    maxs = Tmaxs;
  }
  
  void move() {
    x += xs;
    y += ys;
    
    if (xs >= maxs) xs = maxs;
    if (xs <= -maxs) xs = -maxs;
    if (ys >= maxs) ys = maxs;
    if (ys <= -maxs) ys = -maxs;
    
    if (x-d/2 <= 0) {
      x = d/2;
      xs = xs*-bounce;
    }
    if (x+d/2 >= width) {
      x = width-d/2;
      xs = xs*-bounce;
    }
    if (y-d/2 <= 0) {
      y = d/2;
      ys = ys*-bounce;
    }
    if (y+d/2 >= height) {
      y = height-d/2;
      ys = ys*-bounce;
    }
  }
  
  void checkDestroyed() {    
    if (d <= 16) {
      destroyed = true;
    }
  }
  
    
  void reduce(int r) {
    d -= r;
  }
  
  void follow() {
    if (x < p.x) xs += 0.1;
    if (x > p.x) xs += -0.1;
    if (y < p.y) ys += 0.1;
    if (y > p.y) ys += -0.1;
  }
  
  void display() {
    fill(c);
    ellipse(x,y,d,d);
  }
  
  boolean collideP(Player p) {
    float dis = dist(x,y,p.x,p.y);
    if (d/2 + p.d/2 > dis) {
      return true;
    }
    else {
      return false;
    }
  }
}
  
class Bullet {
  float x,y,xs,ys;
  int d;
  color c;
  
  Bullet(float Tx,float Ty, float Txs, float Tys, int Td, color Tc) {
    x = Tx;
    y = Ty;
    xs = Txs*cos(p.angle+PI/2);
    ys = Tys*sin(p.angle+PI/2);
    d = Td;
    c = Tc;
  }
  
  void move() {
    x += xs;
    y += ys;
  }

  void display() {
    fill(c);
    ellipse(x,y,d,d);
  }
  
  boolean outside() {
    if (x-d/2 > width || x+d/2 < 0 || y-d/2 > height || y+d/2 < 0) {
      return true;
    }
    else {
      return false;
    }
  }
}
class Player {
  boolean up,down,left,right,faster;
  float x,y,xs,ys,maxs,slow,fast,bounce,angle;
  int d,cd;
  color c;
  
  Player(float Tx, float Ty, float Txs, float Tys, float Tmaxs, 
  float Tslow, float Tfast, float Tbounce, int Td, int Tcd, color Tc) {
    x = Tx;
    y = Ty;
    xs = Txs;
    ys = Tys;
    d = Td;
    cd = Tcd;
    maxs = Tmaxs;
    slow = Tslow;
    fast = Tfast;
    bounce = Tbounce;
    c = Tc;
  }
  
  boolean collideP(Powerup pu) {
    float dis = dist(x,y,pu.x,pu.y);
    if (d/2 + pu.d/2 > dis) {
      return true;
    }
    else {
      return false;
    }
  }
  
  void display() {
    //body
    strokeWeight(1.5);
    stroke(c);
    fill(0);
    ellipse(x,y,d,d);
    strokeWeight(1);
    //gun
    angle = atan2(mouseY-y,mouseX-x)-PI/2;
    pushMatrix();
    translate(x,y);
    rotate(angle);   
    rectMode(CENTER);
    fill(255);
    rect(0,d/2,d/7,d/3);
    popMatrix();
    //cursor
    noFill();
    ellipse(mouseX,mouseY,cd,cd);
    line(mouseX-cd/2,mouseY,mouseX+cd/2,mouseY);
    line(mouseX,mouseY-cd/2,mouseX,mouseY+cd/2);
  }
  
  void bounceOffBoundary() {
    if (x-d/2 <= 0) {
      x = d/2;
      xs = xs*-bounce;
    }
    if (x+d/2 >= width) {
      x = width-d/2;
      xs = xs*-bounce;
    }
    if (y-d/2 <= 0) {
      y = d/2;
      ys = ys*-bounce;
    }
    if (y+d/2 >= height) {
      y = height-d/2;
      ys = ys*-bounce;
    }
  }
  
  void maxSpeed() {
    if (xs >= maxs) {
      xs = maxs;
    }
    if (ys >= maxs) {
      ys = maxs;
    }
    if (xs <= -maxs) {
      xs = -maxs;
    } 
    if (ys <= -maxs) {
      ys = -maxs;
    } 
  }
  
  void keyMove() {
    if (up) {
      faster = true;
      ys -= fast;
    } else {
      faster = false;
    }

    if (left) {
      xs -= fast;
      faster = true;
    } else {
      faster = false;
    }

    if (down) {
      ys += fast;
      faster = true;
    } else {
      faster = false;
    }
  
    if (right) {
      xs += fast;
      faster = true;
    } else {
      faster = false;
    }
  }
  
  void move() {
    keyMove();
    bounceOffBoundary();
    maxSpeed();
    
    if (faster == false) {
      if (xs < 0) {
        xs += slow;
      }
      if (xs > 0) {
        xs -= slow;
      }
      if (ys < 0) {
        ys += slow;
      }
      if (ys > 0) {
        ys -= slow;
      }
      if (xs < slow && xs > -slow) {
        xs = 0;
      }
      if (ys < slow && ys > -slow) {
        ys = 0;
      }
    }
    
    x = x+xs;
    y = y+ys;
    
  }
}
class Powerup {
  float x,y;
  int d,points,f=255;
  color cs,cf;
  boolean puAdded=false;
  
  Powerup(float Tx,float Ty, int Td, color Tcf, int Tpoints, int Tcs) {
    x = Tx;
    y = Ty;
    d = Td;
    cs = Tcs;
    points = Tpoints;
    cf = Tcf;
  }
  
  void fade() {
    f--;
  }
  
  void display() {
    fill(cf,f);
    stroke(cs,f);
    ellipse(x,y,d,d);
  }
  
  boolean faded() {
    if (f <= 10) return true;
    else return false;
  }
}
