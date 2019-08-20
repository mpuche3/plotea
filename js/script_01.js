document.body.style.margin = 0;

defaultSettings = {
    minX: -10,
    maxX: 10,
    minY: -10,
    maxY: 10,
    minXinPx: 50,
    maxXinPx: window.innerWidth - 50,
    minYinPx: 50,
    maxYinPx: window.innerHeight - 50,
    incX: 0.1,
    maxMs: 1000,
    smoothing: 0.3,
    axisXCenter: 0,
    axisYCenter: 0
}

function convertRealToPx(arr, settings={}) {
    const X = arr[0];
    const Y = arr[1];
    const minX = settings.minX || defaultSettings.minX;
    const maxX = settings.maxX || defaultSettings.maxX;
    const minY = settings.mixY || defaultSettings.minY;
    const maxY = settings.maxY || defaultSettings.maxY;
    const minXinPx = settings.minXinPx || defaultSettings.minXinPx;
    const maxXinPx = settings.maxXinPx || defaultSettings.maxXinPx;
    const minYinPx = settings.minYinPx || defaultSettings.minYinPx;
    const maxYinPx = settings.maxYinPx || defaultSettings.maxYinPx;
    const XinPx = minXinPx + (X - minX) * (maxXinPx - minXinPx) / (maxX - minX);
    const YinPx = minYinPx + (Y - minY) * (maxYinPx - minYinPx) / (maxY - minY);
    const YinPxInverted = maxYinPx + minYinPx - YinPx;
    return [Math.round(XinPx), Math.round(YinPxInverted)];
}

function convertPxToReal(arr, settings={}) {
    const XinPx = arr[0];
    const YinPx = arr[1];
    const minX = settings.minX || defaultSettings.minX;
    const maxX = settings.maxX || defaultSettings.maxX;
    const minY = settings.mixY || defaultSettings.minY;
    const maxY = settings.maxY || defaultSettings.maxY;
    const minXinPx = settings.minXinPx || defaultSettings.minXinPx;
    const maxXinPx = settings.maxXinPx || defaultSettings.maxXinPx;
    const minYinPx = settings.minYinPx || defaultSettings.minYinPx;
    const maxYinPx = settings.maxYinPx || defaultSettings.maxYinPx;
    const X = (XinPx) * (maxX - minX) / (maxXinPx - minXinPx);
    const Y = (YinPx) * (maxY - minY) / (maxYinPx - minYinPx);
    return [X, Y];
}

function createCircle(arr, settings={}) {
    const svg = getOrCreateSvg(settings);
    arrInPx = convertRealToPx(arr);
    const svgNS = svg.namespaceURI;
    const circle = document.createElementNS(svgNS, 'circle');
    circle.setAttribute('cx', arrInPx[0]);
    circle.setAttribute('cy', arrInPx[1]);
    circle.setAttribute('r', 5);
    circle.setAttribute('fill', "red");
    svg.appendChild(circle);
    document.body.appendChild(svg);
    return circle;
}

Object.prototype.updateSvg = function(obj) {
    if (obj.cx)
        this.setAttribute("cx", obj.cx);
    if (obj.cy)
        this.setAttribute("cy", obj.cy);
}

function createCircles(arr) {
    const points = [];
    for (let pos of arr) {
        const point = createCircle(pos);
        points.push(point);
    }
}

function getOrCreateSvg(settings) {
    settings = settings || {};
    if (settings.svg) {
        const svg = defaultSettings.svg;
        return svg;
    } else if (document.querySelector("svg") !== null) {
        const svg = document.querySelector("svg");
        return svg;
    } else {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const width = window.innerWidth;
        const height = window.innerHeight;
        svg.setAttribute("width", `${width}px`);
        svg.setAttribute("height", `${height}px`);
        document.body.appendChild(svg);
        defaultSettings.svg = svg;
        return svg;
    }
}

function plotFunction(funcs, settings={}) {
    if (typeof funcs === "function")
        funcs = [funcs];
    const minX = settings.minX || defaultSettings.minX;
    const maxX = settings.maxX || defaultSettings.maxX;
    const incX = settings.incX || defaultSettings.incX;
    for (let func of funcs) {
        const points = [];
        for (let x = minX; x <= maxX; x += incX) {
            const y = func(x);
            //createCircleDinamically([x, y]);
            createCircle([x, y]);
            points.push([x, y]);
        }
        createSmoothLine(points, 0.2);
    }

}

function createCircleDinamically(point) {
    const maxMs = defaultSettings.maxMs;
    for (let ms = 0; ms < maxMs; ms += 0.1) {
        setTimeout(function() {
            const x = point[0];
            const y = point[1] * ms / maxMs;
            createCircle([x, y]);
        }, ms + 50)
    }
}

function createLine(start, end, settings) {
    const svg = getOrCreateSvg(settings);
    const startInPx = convertRealToPx(start);
    const endInPx = convertRealToPx(end);
    const svgNS = svg.namespaceURI;
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', Math.round(startInPx[0]));
    line.setAttribute('y1', Math.round(startInPx[1]));
    line.setAttribute('x2', Math.round(endInPx[0]));
    line.setAttribute('y2', Math.round(endInPx[1]));
    line.setAttribute('stroke', 'rgb(150,150,150)');
    line.setAttribute('stroke-width', '2');
    svg.appendChild(line);
    return line;
}

function createPolyline(points, settings) {
    const svg = getOrCreateSvg(settings);
    const pointsInPx = points.map(point=>convertRealToPx(point));
    const pointsInPxStr = pointsInPx.map(point=>`${point[0]},${point[1]}`).join(' ');
    const svgNS = svg.namespaceURI;
    const polyline = document.createElementNS(svgNS, 'polyline');
    polyline.setAttribute('points', pointsInPxStr);
    polyline.setAttribute('stroke', 'rgb(255,0,0)');
    polyline.setAttribute('stroke-width', '2');
    polyline.setAttribute('fill', 'none');
    svg.appendChild(polyline);
    document.body.appendChild(svg);
    return polyline;
}

function createPath(path, settings) {
    const svg = getOrCreateSvg(settings);
    const svgNS = svg.namespaceURI;
    const polyline = document.createElementNS(svgNS, 'path');
    polyline.setAttribute('d', getPathInPxStr(path));
    polyline.setAttribute('stroke', 'rgb(255,0,0)');
    polyline.setAttribute('stroke-width', '2');
    polyline.setAttribute('fill', 'none');
    svg.appendChild(polyline);
    document.body.appendChild(svg);
    return polyline;
}

function getPathInPxStr(path) {
    pathInPxStr = "";
    for (let x of path) {
        if (x.type.toUpperCase() === "M" || x.type.toUpperCase() === "L") {
            const pointInPx = convertRealToPx(x.point);
            pathInPxStr += `${x.type} ${pointInPx[0]} ${pointInPx[1]} `;
        } else if (x.type.toUpperCase() === "H" || x.type.toUpperCase() === "V") {
            const valueInPx = convertRealToPx([x.value, 0])[0];
            pathInPxStr += `${x.type} ${x.valueInPx} `;
        } else if (x.type.toUpperCase() === "C") {
            const ref1InPx = convertRealToPx(x.ref1);
            const ref2InPx = convertRealToPx(x.ref2);
            const pointInPx = convertRealToPx(x.point);
            pathInPxStr += `${x.type} ${ref1InPx} ${ref2InPx} ${pointInPx} `
        }
    }
    return pathInPxStr;
}

function createSmoothLine(points, settings) {
    function line(pointA, pointB) {
        const lengthX = pointB[0] - pointA[0]
        const lengthY = pointB[1] - pointA[1]
        return {
            length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
            angle: Math.atan2(lengthY, lengthX)
        }
    }
    function controlPoint(current, previous, next, reverse) {
        const p = previous || current
        const n = next || current
        const o = line(p, n)
        const angle = o.angle + (reverse ? Math.PI : 0)
        const length = o.length * smoothing
        const x = current[0] + Math.cos(angle) * length
        const y = current[1] + Math.sin(angle) * length
        return [x, y]
    }
    function bezierCommand(point, i, a) {
        const cps = controlPoint(a[i - 1], a[i - 2], point)
        const cpe = controlPoint(point, a[i - 1], a[i + 1], true)
        return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}`
    }
    function svgPath(points, command) {
        const d = points.reduce((acc,point,i,a)=>i === 0 ? `M ${point[0]},${point[1]}` : `${acc} ${command(point, i, a)}`, '')
        return `<path d="${d}" fill="none" stroke="grey" />`
    }

    settings = settings || {};
    const smoothing = settings.smoothing || defaultSettings.smoothing;
    const svg = getOrCreateSvg(settings);
    const pointsInPx = points.map(point=>convertRealToPx(point));
    svg.innerHTML += svgPath(pointsInPx, bezierCommand);
    document.body.appendChild(svg);
    return svg;
}

function createAxisX(round) {
    function createAxisXTick(x, round) {
        const tickHeightinPx = 10;
        const tickHeightinReal = convertPxToReal([0, tickHeightinPx])[1];
        const x1 = x;
        const x2 = x1;
        const y1 = defaultSettings.axisYCenter - tickHeightinReal / 2;
        const y2 = defaultSettings.axisYCenter + tickHeightinReal / 2;
        createLine([x1, y1], [x2, y2]);

        const xRounded = Math.round(x * round) / round;
        const text = xRounded.toString();
        const xText = x1 - convertPxToReal([0, 0])[0];
        const yText = y1 - convertPxToReal([0, 20])[1];
        if (!sameNumber(x, defaultSettings.axisXCenter)) {
            const textSvg = createText(text, [xText, yText]);
            textSvg.setAttribute("text-anchor", "middle");
        }

    }
    function createAxisXTicks() {
        const rangeX = defaultSettings.maxX - defaultSettings.minX;
        const rangeX_numberOfDigits = Math.log10(rangeX);
        const rangeX_numberOfDigitsRounded = Math.floor(rangeX_numberOfDigits - 0.35);
        const tickAxisXTickInc = Math.round(Math.pow(10, rangeX_numberOfDigitsRounded));
        let round = 1;
        if (tickAxisXTickInc === 0.1)
            round = Math.round(1 / tickAxisXTickInc);
        for (let Xtick = defaultSettings.axisXCenter; Xtick <= defaultSettings.maxX; Xtick += tickAxisXTickInc) {
            createAxisXTick(Xtick, round);
        }
        for (let Xtick = defaultSettings.axisXCenter; Xtick >= defaultSettings.minX; Xtick -= tickAxisXTickInc) {
            createAxisXTick(Xtick, round);
        }
    }
    createLine([defaultSettings.minX, defaultSettings.axisYCenter], [defaultSettings.maxX, defaultSettings.axisYCenter]);
    createAxisXTicks();
}

function createAxisY() {
    function createAxisYTick(y, round) {
        const tickWidthinPx = 10;
        const tickWidthinReal = convertPxToReal([tickWidthinPx, 0])[0];
        const y1 = y;
        const y2 = y1;
        const x1 = defaultSettings.axisXCenter - tickWidthinReal / 2;
        const x2 = defaultSettings.axisXCenter + tickWidthinReal / 2;
        createLine([x1, y1], [x2, y2]);

        const xRounded = Math.round(y * round) / round;
        const text = xRounded.toString();
        const xText = x1 - convertPxToReal([5, 0])[0];
        const yText = y1 - convertPxToReal([0, 5])[1];
        if (!sameNumber(y, defaultSettings.axisXCenter)) {
            const textSvg = createText(text, [xText, yText]);
            textSvg.setAttribute("text-anchor", "end");
        }

    }
    function createAxisYTicks() {
        const rangeY = defaultSettings.maxY - defaultSettings.minY;
        const rangeY_numberOfDigits = Math.log10(rangeY);
        const rangeY_numberOfDigitsRounded = Math.floor(rangeY_numberOfDigits - 0.35);
        const tickAxisYTickInc = Math.pow(10, rangeY_numberOfDigitsRounded);
        let round = 1;
        if (tickAxisYTickInc === 0.1)
            round = Math.round(1 / tickAxisYTickInc);
        for (let Ytick = defaultSettings.axisYCenter; Ytick <= defaultSettings.maxY; Ytick += tickAxisYTickInc) {
            createAxisYTick(Ytick, round);
        }
        for (let Ytick = defaultSettings.axisYCenter; Ytick >= defaultSettings.minY; Ytick -= tickAxisYTickInc) {
            createAxisYTick(Ytick, round);
        }
    }
    createLine([defaultSettings.axisXCenter, defaultSettings.minY], [defaultSettings.axisXCenter, defaultSettings.maxY]);
    createAxisYTicks();
}

function createText(str, pos, settings) {
    settings = settings || defaultSettings;
    const posInPx = convertRealToPx(pos);
    const svg = getOrCreateSvg(settings);
    const svgNS = svg.namespaceURI;
    const text = document.createElementNS(svgNS, 'text');
    text.setAttribute('x', posInPx[0]);
    text.setAttribute('y', posInPx[1]);
    text.innerHTML = str;

    svg.appendChild(text);
    return text;
}

function sameNumber(a, b) {
    return (Math.abs(a - b)) < 0.00001;
}

function D(func, epsilon=0.01) {
    function derivative(x) {
        const ans1 = func(x);
        const ans2 = func(x + epsilon);
        const ans3 = ans2 - ans1;
        const ans4 = ans3 / (epsilon);
        return ans4;
    }
    const simplifiedDerivative = simplifyFunction (derivative);
    smoothData(simplifiedDerivative.points);
    return simplifiedDerivative;
}

function I_between(func, a, b) {
    if (a === undefined || b === undefined)
        return;
    const epsilon = 0.01;
    let acc = 0;
    let count = 0;
    if (b < a) {
        [a,b] = [b, a];
    }
    for (let x = a; x < b; x += epsilon) {
        acc += func(x);
        count += 1;
    }
    if (count === 0)
        count = 1;
    const ans1 = acc / count;
    const ans2 = ans1 * (b - a);
    //console.log(ans2);
    if (-0.001 < ans2 && ans2 < 0.001)
        return 0;
    if (ans2 === NaN) {
        debugger ;
    }
    return ans2;
}

function I(func, a=0) {
    function Integral (x) {
        return I_between(func, a, x);
    }
    simpleIntegralFunction = simplifyFunction(Integral)
    return simpleIntegralFunction;
}

function repeat(fun, x, n) {
    let acc;
    if (n === 0) {
        acc = x;
    } else {
        acc = fun(x);
    }
    for (let i = 0; i < n-1; i += 1) {
        acc = fun(acc);
    }
    return acc;
}

function simplifyFunction(func) {
    points = [];
    x_min = defaultSettings.minX;
    x_max = defaultSettings.maxX;
    x_inc = defaultSettings.incX;
    for (let x = x_min; x <= x_max; x += x_inc) {
        points.push([x, func(x)])
    }

    function simpleFunction (t) {
        // Prove of concept. This is better than outer scope.
        // console.log(simpleFunction.greetings);

        const points = simpleFunction.points;
        for(let i = 0; i < points.length; i+=1){
            if (Math.abs(t-points[i][0]) < 0.0000000001){
                return points[i][1]
            }
        }
        if (t < points[0][0]) {
            return points[0][1] + (t - points[0][0]) * (points[1][1] - points[0][1]) / (points[1][0] - points[0][0]);
        }
        for(let i = 1; i < points.length; i+=1){
            if (t < points[i][0]){
                return points[i - 1][1] + (t - points[i-1][0]) * (points[i - 1][1] - points[i][1]) / (points[i - 1][0] - points[i][0]);
            }
        }
        const i = points.length
        return points[i-1][1] + (t - points[i-1][0]) * (points[i-1][1] - points[i-2][1]) / (points[i-1][0] - points[i-2][0]);
    }

    simpleFunction.points = points;
    // Prove of concept. This is better than outer scope.

    return simpleFunction;
}

function smoothData (data, a=0.2, b=0.6, c=0.2) {
    for (i = 1; i<data.length - 1; i+=1){
        data[i][1] = a * data[i-1][1] + b*data[i][1] + c*data[i+1][1];
    }
    return data;
}

function range(start, end) {
    var ans = [];
    for (let i = start; i <= end; i++) {
        ans.push(i);
    }
    return ans;
}

function zip(a, b) {
  var arr = [];
  for (var key in a) arr.push([a[key], b[key]]);
  return arr;
}


// Example:
createAxisX();
createAxisY();
plotFunction(Math.sin);
