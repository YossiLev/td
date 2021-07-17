class tdPos {
    constructor(x, y, r, t) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.t = t;
    }
    static PosXY(x, y) {
        return new tdPos(x, y, 0, 0);
    }
    static PosXYRT(x, y, r, t) {
        return new tdPos(x, y, r, t);
    }
    get pos() {
        return [this.x + this.r * Math.cos(this.t), this.y + this.r * Math.sin(this.t)];
    }
    getShifted(oPos) {
        const v = this.pos;
        const vs = oPos.pos;
        return [v[0] + vs[0], v[1] + vs[1]];
    }
    shift(x, y) {
        this.x += x;
        this.y += y;
    }
    static rad(t) {
        return t / 180.0 & Math.PI;
    }
}

const tdObjLine = 1;
const tdObjArc = 2;
const tdObjEllipse = 3;
const tdObjRect = 4;

class tdObj {
    constructor(typ, params, pos) {
        this.typ = typ;
        this.params = params;
        this.pos = pos;
    }
    deepCopy() {
        return JSON.parse(JSON.stringify(this));
    }
    draw(ctx) {
        switch (this.typ) {
            case tdObjLine:
                ctx.beginPath();
                ctx.moveTo(...this.pos.pos);
                ctx.lineTo(...this.pos.getShifted(this.params));
                ctx.stroke();
                break;
            case tdObjArc:
                ctx.beginPath();
                ctx.arc(...this.pos.pos, ...this.params);
                ctx.stroke();
                break;
            case tdObjEllipse:
                ctx.beginPath();
                ctx.ellipse(...this.pos.pos, ...this.params);
                ctx.stroke();
                break;

        }
    }
    shift(x, y) {
        this.pos.shift(x, y);
    }
    static buildLine(x1, y1, x2, y2) {
        return new tdObj(tdObjLine, tdPos.PosXY(x2 - x1, y2 - y1), tdPos.PosXY(x1, y1));
    }
    static buildLineRT(x1, y1, r, t) {
        return new tdObj(tdObjLine, tdPos.PosXYRT(0, 0, r, t), tdPos.PosXY(x1, y1));
    }
    static buildArc(x, y, r, t1, t2) {
        return new tdObj(tdObjArc, [r, t1, t2], tdPos.PosXY(x, y));
    }
    static buildEllipse(x, y, rx, ry, rot, t1 = 0, t2 = Math.PI * 2) {
        return new tdObj(tdObjEllipse, [rx, ry, rot, t1, t2], tdPos.PosXY(x, y));
    }
}

const tdAnimShift = 1;

class tdAnimation {
    constructor(name, typ, params) {
        this.name = name;
        this.typ = typ;
        this.params = params;
    }
}

class tdWorld {
    constructor() {
        this.clear();
    }
    clear() {
        this.objects = [];
        this.animations = [];
    }
    clone(n, nn) {
        const oc = this.objects.find(o => o.name === n);
        if (oc) {
            const ocClone = JSON.parse(JSON.stringify(oc));
            ocClone.name = nn;
            this.objects.push(ocClone);
        }
    }
    static setStyle(ctx, style) {
        ctx.strokeStyle = style.color ? style.color : "black";
        ctx.lineWidth = style.width ? style.width : 1;
    }
    static drawObject(o, ctx) {
        tdWorld.setStyle(ctx, o.style);
        o.obj.draw(ctx);
    }
    draw(ctx) {
        this.objects.forEach(o => tdWorld.drawObject(o, ctx));
    }
    drawC(ctx) {
        const can = ctx.canvas;
        ctx.clearRect(0, 0, can.width, can.height);
        this.draw(ctx);
    }
    push(o, style = {}, name = '', parent = null) {
        this.objects.push({obj: o, style: style, name: name, parent: parent});
    }
    shift(x, y) {
        this.objects.forEach(o => o.obj.shift(x, y));
    }
}
