const paternoster = document.getElementById("paternoster");
const ctx = paternoster.getContext("2d");

const scalefactor = 0.5;
const canvas = {
    xpos: 100,
    ypos: 100,
    height: 500,
    width: 400,
    pot: {
        height: 40,
        width: {
            top: 45,
            bottom: 30
        }
    }
}

const scale = (obj) => {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === "object") {
                scale(obj[key]);
            } else if (typeof obj[key] === "number") {
                obj[key] = obj[key] * scalefactor;
            }
        }
    }
}

scale(canvas);

const length = {
    vertical: canvas.height,
    horizontal: canvas.width * Math.PI,
    total: undefined
}

length.total = 2 * length.horizontal + 2 * length.vertical;

const img = new Image();
img.src = "https://image.flaticon.com/icons/svg/1087/1087420.svg";

const fps = 60;
let absPos = 0;

let currentPot;
const pots = {
    1: {
        name: "Schnittlauch",
        humidity: 50
    },
    2: {
        name: "Schnittlauch",
        humidity: 70
    },
    3: {
        name: "Petersilie",
        humidity: 60
    },
    4: {
        name: "Petersilie",
        humidity: 45
    },
    5: {
        name: "Libstoeckel",
        humidity: 35
    },
    6: {
        name: "Thymian",
        humidity: 50
    },
    7: {
        name: "Rosmarin",
        humidity: 15
    },
    8: {
        name: "Cannabis",
        humidity: 10
    },
    9: {
        name: "Wermuth",
        humidity: 40
    },
    10: {
        name: "Franz",
        humidity: 20
    }
}

const animate = () => {

    // set the animation position (0-100)
    if (absPos > length.total) {
        absPos = 0;
    }
    absPos++;

    drawBackground();
    for (let key in pots) {
        if (pots.hasOwnProperty(key)) {
            const potPos = (length.total / Object.keys(pots).length) * key;
            if (!potPos.isNaN) {
                let absPosOnPath;
                if (potPos + absPos > length.total) {
                    absPosOnPath = potPos + absPos - length.total;
                } else {
                    absPosOnPath = potPos + absPos;
                }
                currentPot = key;
                draw(absPosOnPath);
                //console.log(animPos);
            }
        }
    }
    // request another frame
    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 1000 / fps);
}

// draw the current frame based on pos

const drawBackground = () => {

    const arcx = canvas.xpos + canvas.width / 2;

    ctx.fillStyle = "#666";
    ctx.rect(0, 0, paternoster.width, paternoster.height);
    ctx.fill();

    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(canvas.xpos, canvas.ypos + canvas.height);
    ctx.lineTo(canvas.xpos, canvas.ypos);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.arc(arcx, canvas.ypos, canvas.width / 2, 1 * Math.PI, 0 * Math.PI, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(canvas.xpos + canvas.width, canvas.ypos);
    ctx.lineTo(canvas.xpos + canvas.width, canvas.ypos + canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.arc(arcx, canvas.ypos + canvas.height, canvas.width / 2, 0 * Math.PI, 1 * Math.PI, false);
    ctx.stroke();
}

const draw = (pos) => {

    // draw the tracking rectangle
    let xy, relPos;

    if (pos < length.vertical) {
        relPos = pos / length.vertical;
        xy = getLineXY({
            x: canvas.xpos,
            y: canvas.ypos + canvas.height
        }, {
            x: canvas.xpos,
            y: canvas.ypos
        }, relPos);
    } else if (pos < length.vertical + length.horizontal) {
        relPos = (pos - length.vertical) / length.horizontal
        xy = getSemicircleXY({
            x: canvas.xpos,
            y: canvas.ypos
        }, {
            x: canvas.xpos + canvas.width,
            y: canvas.ypos
        }, relPos);
    } else if (pos < length.vertical + length.horizontal + length.vertical) {
        relPos = (pos - length.vertical - length.horizontal) / length.vertical
        xy = getLineXY({
            x: canvas.xpos + canvas.width,
            y: canvas.ypos
        }, {
            x: canvas.xpos + canvas.width,
            y: canvas.ypos + canvas.height
        }, relPos);
    } else {
        relPos = (pos - length.vertical - length.horizontal - length.vertical) / length.horizontal
        xy = getSemicircleXY({
            x: canvas.xpos + canvas.width,
            y: canvas.ypos + canvas.height
        }, {
            x: canvas.xpos,
            y: canvas.ypos + canvas.height
        }, relPos);
    }
    drawPot(xy);

}


// draw tracking rect at xy
const drawPot = (point) => {
    const pot = canvas.pot;

    ctx.fillStyle = "brown";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(point.x - pot.width.top, point.y - pot.height);
    ctx.lineTo(point.x + pot.width.top, point.y - pot.height);
    ctx.lineTo(point.x + pot.width.bottom, point.y + pot.height);
    ctx.lineTo(point.x - pot.width.bottom, point.y + pot.height);
    ctx.lineTo(point.x - pot.width.top, point.y - pot.height);
    ctx.fill();

    const size = pot.width.top * 1.6;
    const imgy = point.y - pot.height - size;
    ctx.drawImage(img, point.x - size / 2 + 1, imgy, size, size);

    const font = {
        text: pots[currentPot].humidity,
        color: "white",
        family: "Courier New",
        size: pot.height * 1,
        x: point.x - pot.width.bottom * 0.85,
        y: point.y + pot.height * 0.2
    }
    ctx.fillStyle = font.color;
    ctx.font = font.size + "px " + font.family;
    ctx.fillText(font.text, font.x, font.y);

    ctx.stroke();
}

const getLineXY = (startPt, endPt, permille) => {
    const dx = endPt.x - startPt.x;
    const dy = endPt.y - startPt.y;
    const X = startPt.x + dx * permille;
    const Y = startPt.y + dy * permille;
    return ({
        x: Math.floor(X),
        y: Math.floor(Y)
    });
}

const getSemicircleXY = (startPt, endPt, permille) => {
    let r = (startPt.x - endPt.x) / 2;
    let angle, dx, dy, X, Y;
    if (r < 0) {
        r = Math.abs(r);
        angle = Math.PI * permille + Math.PI;
        dx = Math.cos(angle) * r;
        dy = Math.sin(angle) * r;
        X = startPt.x + r + dx;
        Y = startPt.y + dy;
    } else {
        angle = Math.PI * permille;
        dx = Math.cos(angle) * r;
        dy = Math.sin(angle) * r;
        X = startPt.x - r + dx;
        Y = startPt.y + dy;
    }
    return ({
        x: Math.floor(X),
        y: Math.floor(Y)
    });
}

const checkMouse = (mouse) => {
    if(mouse.x < 20 && mouse.y < 20) {
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.font = "15 px Arial";
        ctx.fillText("Schnittlauch", mouse.x, mouse.y + 15);
        ctx.stroke();
    }
}

paternoster.addEventListener('mousemove', (evt) => {
    checkMouse({
        x: evt.offsetX,
        y: evt.offsetY
    })    
}, false);

// start the animation
animate();