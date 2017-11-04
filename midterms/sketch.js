var flowerArray = [];
var microphone;
var beeGraphics =[];
var blueGraphics = []
var birdGraphics = [];
var butterGraphics = [];
var flowerPic
var pinkFlower;
var rose;
var bgm;
var animalArray = [];
var petal;
var rabbit;
var rabbitArray = [];
var randomdestination;
var typeArray = [];


function preload(){
  flowerPic=loadImage("flower.png");
  pinkFlower=loadImage("camomile.png");
  rose=loadImage("rose.png");
  birdPic=loadImage("birds.png");
  backgroundGraphic=loadImage("garden.jpg");
  petal = loadImage("petal.png");
  bgm=loadSound("forest.mp3");
  rabbit=loadImage("rabbit.png");
  for (var i = 0; i <= 2; i++) {
    var filename = "bee" + i + ".gif";

    // load the image into our list
    beeGraphics.push( loadImage("bee/" + filename));
  }
  for (var i = 1; i <= 5; i++) {
    var filename = "bird" + i + ".png";

    // load the image into our list
    birdGraphics.push( loadImage("bird/" + filename));
  }
  for (var i = 1; i <= 5; i++) {
    var filename = "blue" + i + ".png";

    // load the image into our list
    blueGraphics.push( loadImage("birdblue/" + filename));
  }
  for (var i = 1; i <= 6; i++) {
    var filename = "butterfly" + i + ".png";

    // load the image into our list
    butterGraphics.push( loadImage("butterfly/" + filename));
  }
}

function setup() {
  // set the background size of our canvas
  createCanvas(800,600);
  bgm.loop();

  microphone = new p5.AudioIn();
  imageMode(CENTER);

  const flowerPics = [flowerPic, pinkFlower, rose];

  for (let i = 0; i < 20; i++) {
    const x = random(100, 700);
    const y = random(500, 650);
    flowerArray.push( new Flower(x, y, flowerPics[floor(random(0,3))]));
  }

  // start the microphone (will request access to the mic from the user)
  microphone.start();
  noiseDetail(24);

  animalArray.push(new Animal(random(200,600), random(100,500), "bee"));
  animalArray.push(new Animal(random(200,600), random(100,500), "red"));
  animalArray.push(new Animal(random(200,600), random(100,500), "blue"));
  animalArray.push(new Animal(random(200,600), random(100,500), "butter"));

  typeArray = ["bee", "red", "blue", "butter"];
}


function draw() {
  background(0);
  image(backgroundGraphic,400,300,800,600);
  for (let i = 0; i < 20; i++) {
    flowerArray[i].rotate();
  }

  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < animalArray.length; j++) {
      if (!flowerArray[i].explode && dist(animalArray[j].x, animalArray[j].y, flowerArray[i].x, flowerArray[i].y-150) <= 50) {
        flowerArray[i].explode = true;
        for (let k = 0; k < 20; k++) {
          flowerArray[i].petalArray.push( new Petal(flowerArray[i].x, flowerArray[i].y-150, petal));
        }
      }
    }

    if (flowerArray[i].explode == true) {

      for (let j = 0; j < flowerArray[i].petalArray.length; j++) {
        flowerArray[i].petalArray[j].display();
        flowerArray[i].petalArray[j].move();

        if (flowerArray[i].petalArray[j].y > height) {
          flowerArray[i].petalArray.splice(j,1);
          j--;
        }
      }

      if (flowerArray[i].petalArray.length === 0) {
        flowerArray[i].explode = false;
      }
    }
  }

  for (let i = 0; i < animalArray.length; i++) {
    if (animalArray[i].type == "bee") {
      animalArray[i].display(beeGraphics[animalArray[i].current]);
    }

    else if (animalArray[i].type == "red") {
      animalArray[i].display(birdGraphics[animalArray[i].current]);
    }

    else if (animalArray[i].type == "blue") {
      animalArray[i].display(blueGraphics[animalArray[i].current]);
    }

    else if (animalArray[i].type == "butter") {
      animalArray[i].display(butterGraphics[animalArray[i].current]);
    }
    animalArray[i].move();
  }
}

function mouseClicked() {
  animalArray.push(new Animal(mouseX, mouseY, typeArray[floor(random(0,4))]));
}


function Flower(x, y, ourImage){
  this.x=x;
  this.y=y;
  this.angle = 0;
  this.change = random(1);
  this.reverse = false;
  this.angleNoise = random(1000,10000);

  this.explode = false;
  this.petalArray = [];

  this.rotate = function() {
    push();

      // use perlin noise to turn our noise location into an angle change
      var angleChange = noise(this.angleNoise);
      this.angle += map(angleChange, 0, 1, -0.5, 0.5) ;
      this.angle = constrain(this.angle, -20, 20);
      this.angleNoise += 0.01;

      translate(this.x, this.y);
      rotate(radians(this.angle));

      image(ourImage, 0, -100, 141, 200);


    pop();

    this.change = random(1);

  }
}

function Animal(x,y,type){
  this.x = x;
  this.y = y;
  this.type = type;
  this.current = 0;
  this.scared = false;
  this.returning = false;
  this.returned = false;
  this.noiseLocationX=random(0,1000);
  this.noiseLocationY=random(10000,20000);
  this.randomDestination;

  this.display = function(ourImage){
    image(ourImage,this.x,this.y,50,50);
    this.current++;

    if (this.type == "bee" && this.current == 3) {
      this.current = 0;
    }

    else if (this.type == "red" && this.current == 5) {
      this.current = 0;
    }

    else if (this.type == "blue" && this.current == 5) {
      this.current = 0;
    }

    else if (this.type == "butter" && this.current == 6) {
      this.current = 0;
    }
  }

  this.move = function() {
    var volume = microphone.getLevel();

    if (volume >= 0.3 && !this.returning) {
      this.scared = true;
      this.returned = false;
    }

    if (this.scared) {
      this.scare();
    }
    else {
      this.flutter();
    }
  }

  this.flutter = function(){
    var noiseNumberX = noise(this.noiseLocationX);
    var noiseNumberY = noise(this.noiseLocationY);

    var moveAmountX = map (noiseNumberX, 0, 1, -2, 2);
    var moveAmountY = map (noiseNumberY,0,1,-2,2);

    this.x += moveAmountX;
    this.y += moveAmountY;

    this.noiseLocationX+=0.01;
    this.noiseLocationY+=0.01;

    this.x = constrain(this.x,50,width-50);
    this.y = constrain(this.y,50,height-100);
  }

  this.scare = function() {
    if (this.returning) {
      this.return();
    }
    else if (this.x < -600) {
      this.randomDestination=random(200,600);
      this.returning = true;
    }
    else if (this.x > width + 600) {
      this.randomDestination=random(200,600);
      this.returning = true;
    }
    else if (this.x > width/2) {
      this.x += 5;
    }
    else {
      this.x -= 5;
    }
  }

  this.return = function() {

    if (this.x<this.randomDestination){
      this.x+=3;
      if (this.x>=this.randomDestination) {
        this.returned = true;
      }
    }
    else if (this.x>this.randomDestination){
      this.x-=3;
      if (this.x<=this.randomDestination) {
        this.returned = true;
      }
    }

    if (this.returned){
      this.returning = false;
      this.scared = false;
    }

  }
}

function Petal(x, y, ourImage) {
  this.x = x;
  this.y = y;

  this.fall = false;

  this.speedX = random(-3,3);
  this.speedY = random(-3,3);

  this.display = function() {
    image(ourImage, this.x, this.y, 10, 10);
  }

  this.move = function() {


    this.x += this.speedX;
    this.y += this.speedY;

    if (!this.fall && this.speedX > 0 && this.speedY > 0) {
      this.speedX -= .05;

      if (this.speedX <= 0) {
        this.fall = true;
        this.speedX = 0;
        this.speedY = .5;
      }
    }

    else if (!this.fall && this.speedX < 0 && this.speedY > 0) {
      this.speedX += .05;

      if (this.speedX >= 0) {
        this.fall = true;
        this.speedX = 0;
        this.speedY = .5;
      }
    }

    else if (!this.fall && this.speedX > 0 && this.speedY < 0) {
      this.speedX -= .05;
      this.speedY += .1;

      if (this.speedX <= 0) {
        this.fall = true;
        this.speedX = 0;
        this.speedY = .5;
      }
    }

    else if (!this.fall && this.speedX < 0 && this.speedY < 0) {
      this.speedX += .05;
      this.speedY += .1;

      if (this.speedX >= 0) {
        this.fall = true;
        this.speedX = 0;
        this.speedY = .5;
      }
    }
  }
}
