const paternoster = document.getElementById("paternoster");
const info = document.getElementById("selected");
const ctx = paternoster.getContext("2d");

let scalefactor = 0;

if (window.innerHeight * 0.8 < window.innerWidth) {
    scalefactor = 600 / window.innerHeight;
} else {
    scalefactor = window.innerWidth / 825;
}

scalefactor = 0.75;

const canvas = {
    xpos: 45,
    ypos: 256,
    height: 800,
    width: 400,
    pot: {
        height: 40,
        width: {
            top: 45,
            bottom: 30
        },
        imgSrc: "plant.svg",
        imgSize: 60
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

paternoster.height = canvas.height;
paternoster.width = canvas.width;

const length = {
    vertical: canvas.height - canvas.width - 2 * canvas.pot.height,
    horizontal: (canvas.width - canvas.pot.width.top) * Math.PI * 0.5,
    total: undefined
}

length.total = 2 * length.horizontal + 2 * length.vertical;

const img = new Image();
img.src = canvas.pot.imgSrc;

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
        name: "Libstöckel",
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

    const arcr = canvas.width * 0.5 - canvas.pot.width.top;

    ctx.fillStyle = "#666";
    ctx.rect(0, 0, paternoster.width, paternoster.height);
    ctx.fill();

    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(canvas.xpos, canvas.ypos + length.vertical);
    ctx.lineTo(canvas.xpos, canvas.ypos);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.arc(canvas.width * 0.5, canvas.ypos, arcr, 1 * Math.PI, 0 * Math.PI, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.moveTo(canvas.xpos + 2 * arcr, canvas.ypos);
    ctx.lineTo(canvas.xpos + 2 * arcr, canvas.ypos + length.vertical);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.arc(canvas.width * 0.5, canvas.ypos + length.vertical, arcr, 0 * Math.PI, 1 * Math.PI, false);
    ctx.stroke();
}

const draw = (pos) => {

    // draw the tracking rectangle
    let xy, relPos;

    if (pos < length.vertical) {
        relPos = pos / length.vertical;
        xy = getLineXY({
            x: canvas.xpos,
            y: canvas.ypos + length.vertical
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
                x: canvas.xpos + canvas.width - 2 * canvas.pot.width.top,
                y: canvas.ypos
            }, relPos);
    } else if (pos < length.vertical + length.horizontal + length.vertical) {
        relPos = (pos - length.vertical - length.horizontal) / length.vertical
        xy = getLineXY({
            x: canvas.xpos + canvas.width - 2 * canvas.pot.width.top,
            y: canvas.ypos
        }, {
                x: canvas.xpos + canvas.width - 2 * canvas.pot.width.top,
                y: canvas.ypos + length.vertical
            }, relPos);
    } else {
        relPos = (pos - length.vertical - length.horizontal - length.vertical) / length.horizontal
        xy = getSemicircleXY({
            x: canvas.xpos + canvas.width - 2 * canvas.pot.width.top,
            y: canvas.ypos + length.vertical
        }, {
                x: canvas.xpos,
                y: canvas.ypos + length.vertical
            }, relPos);
    }
    drawPot(xy);

}

const storeLastPos = (pot, pos) => {
    if (pots.hasOwnProperty(pot)) {
        pots[pot].lastPos = pos;
    }
}

// draw pot at xy
const drawPot = (point) => {
    const pot = canvas.pot;

    if (pots[currentPot].selected === true) {
        ctx.strokeStyle = "red";
    } else {
        ctx.strokeStyle = "black";
    }

    ctx.lineWidth = 3;
    ctx.lineJoin = "round";

    const points = {
        topleft: {
            x: point.x - pot.width.top + ctx.lineWidth / 2,
            y: point.y - pot.height + ctx.lineWidth / 2
        },
        topright: {
            x: point.x + pot.width.top - ctx.lineWidth / 2,
            y: point.y - pot.height + ctx.lineWidth / 2
        },
        bottomleft: {
            x: point.x - pot.width.bottom + ctx.lineWidth / 2,
            y: point.y + pot.height - ctx.lineWidth / 2
        },
        bottomright: {
            x: point.x + pot.width.bottom - ctx.lineWidth / 2,
            y: point.y + pot.height - ctx.lineWidth / 2
        }
    }

    ctx.fillStyle = "brown";
    ctx.beginPath();
    ctx.moveTo(points.topleft.x, points.topleft.y);
    ctx.lineTo(points.topright.x, points.topright.y);
    ctx.lineTo(points.bottomright.x, points.bottomright.y);
    ctx.lineTo(points.bottomleft.x, points.bottomleft.y);
    ctx.lineTo(points.topleft.x, points.topleft.y);
    ctx.lineTo(points.topright.x, points.topright.y);
    ctx.fill();

    const imgy = point.y - pot.height - pot.imgSize;
    ctx.drawImage(img, point.x - pot.imgSize / 2 + 2, imgy, pot.imgSize, pot.imgSize);

    const font = {
        text: pots[currentPot].humidity,
        color: "white",
        family: "Verdana",
        size: pot.height,
        x: point.x - pot.width.bottom * 0.85,
        y: point.y + pot.height * 0.2
    }
    ctx.fillStyle = font.color;
    ctx.font = font.size + "px " + font.family;
    ctx.fillText(font.text, font.x, font.y);

    ctx.stroke();

    storeLastPos(currentPot, {
        xmin: point.x - pot.width.top,
        ymin: point.y - pot.height,
        xmax: point.x + pot.width.top,
        ymax: point.y + pot.height
    })
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
    for (let key in pots) {
        const pos = pots[key].lastPos;
        if (mouse.x < pos.xmax && mouse.x > pos.xmin && mouse.y < pos.ymax && mouse.y > pos.ymin) {
            info.innerText = pots[key].name;
            pots[key].selected = true;
        } else {
            pots[key].selected = false;
        }
    }
}

paternoster.addEventListener('click', (evt) => {
    checkMouse({
        x: evt.offsetX,
        y: evt.offsetY
    })
});

// start the animation
animate();