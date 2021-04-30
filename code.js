const MAX_HEIGHT = 6; // 最大行数
const MAX_WIDTH = 7; // 最大列数
const EMPTY = 2; // table 中 0 表示黄、1 表示红、2 表示空
const INF = 1000000; // 杀棋分值
var SEARCH_DEPTH = 4; // 搜索最大深度 演示时需设置较小深度

var sdPlayer = 0; // 0 - yellow 己方; 1 - red
var mode = 0; // 0 - alphaBeta; 1 - minmax

var gameOver = false; // 判断是否连成四子，并作相关处理
var stopDisplay = true; // 是否演示搜索过程
var reseting = false; // 用于判断是否还在重置

var moveList = []; // 记录搜索中的着法信息，以供搜索结束后演示

var table = [ // 棋盘
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
];

var height = [0, 0, 0, 0, 0, 0, 0, 0]; // 每一列的高度

function Move(type, depth, column, alpha, beta) { // 走法信息
    this.type = type;
    this.depth = depth;
    this.column = column;
    this.alpha = alpha;
    this.beta = beta;
}

// 记录走法
var recordMove = (type, depth, column, alpha, beta) => {
    moveList.push(new Move(type, depth, column, alpha, beta));
}

// 演示
var displayMove = (mvBest) => {
    console.log(moveList.length);
    (function Loop(i) { // 递归实现循环 否则演示会出现时序错误
        setTimeout(() => {
            // 1. 显示走法信息
            document.getElementById("info").innerHTML = `depth: ${moveList[i].depth} `
            + `column: ${moveList[i].column} alpha/vl: ${moveList[i].alpha} beta: ${moveList[i].beta}`; 

            // 2.根据走法类型判断是走子还是落子
            if (moveList[i].type == 0) {
                if (!stopDisplay) setTimeout(drop(moveList[i].column), 160);
            } else {
                if (!stopDisplay) setTimeout(undoDrop(moveList[i].column), 160);
            }
            if ((++i) >= moveList.length || stopDisplay) {
                document.getElementById("info").innerHTML = "";
                if (stopDisplay) { // 如果强制结束搜索，需要走完剩下走法，以回到最初状态
                    for (let j = i - 1; j < moveList.length; j++) {
                        let column = moveList[j].column;
                        if (moveList[j].type == 0) makeMove(column);
                        else {
                            document.getElementById("color" + ((7 - height[column]) * 10 + column)).setAttribute("class", "");
                            undoMakeMove(column);
                        }
                    }
                }
                // 在最佳落子位置处落子
                drop(mvBest);
                gameOver = check();
                setTimeout(() => {
                    if (gameOver) {
                        if (sdPlayer == 1) alert("Yellow win");
                        else alert("Red win");
                    }
                }, 200);
                return;
            } else Loop(i);
        }, 400);
    })(0);
}

// 交换走子方
var changeSide = () => { sdPlayer ^= 1; setPlayerMessage(); };

// 显示轮到谁行动
var setPlayerMessage = () => {
    document.getElementById("color").setAttribute("class", sdPlayer == 0 ? "Yellow" : "Red");
    document.getElementById("messages").innerHTML = sdPlayer == 0 ? "Yellow" : "Red";
}

// 通过 td-id 获得所在列
var getColumn = (id) => {
    return parseInt(id.substr(5, 2)) % 10;
}

// 判断一个位置是否在能构成连线
var canLink = (row, column) => {
    return 1 <= row && row <= MAX_HEIGHT && 1 <= column && column <= MAX_WIDTH
        && table[row][column] != EMPTY && table[row][column] != sdPlayer;
}

// 判断位置的颜色
var isYellow = (row, column) => {
    return 1 <= row && row <= MAX_HEIGHT && 1 <= column && column <= MAX_WIDTH
        && table[row][column] == 0;
}
var isRed = (row, column) => {
    return 1 <= row && row <= MAX_HEIGHT && 1 <= column && column <= MAX_WIDTH
        && table[row][column] == 1;
}
var isEmpty = (row, column) => {
    return 1 <= row && row <= MAX_HEIGHT && 1 <= column && column <= MAX_WIDTH
        && table[row][column] == EMPTY;
}

var check = () => { // 判断是否连成四子
    let cnt;

    // 通过已有棋子向四周寻找连线
    for (let column = 1; column <= 7; column++) {
        for (let row = 1; row <= height[column]; row++) {
            if (table[row][column] == EMPTY || table[row][column] == sdPlayer)
                continue;
            if (canLink(row + 1, column) && canLink(row + 2, column) && canLink(row + 3, column)) {
                return true;
            }

            if (canLink(row, column + 1) && canLink(row, column + 2) && canLink(row, column + 3)) {
                return true;
            }

            if (canLink(row + 1, column + 1) && canLink(row + 2, column + 2) && canLink(row + 3, column + 3)) {
                return true;
            }

            if (canLink(row + 1, column - 1) && canLink(row + 2, column - 2) && canLink(row + 3, column - 3)) {
                return true;
            }
        }
    }
    return false;
}

var drop = (column) => { // 在第 column 落子 并演示动画
    let color = sdPlayer ? "Red" : "Yellow";
    if (height[column] == MAX_HEIGHT) return false;
    let currentHeight = MAX_HEIGHT;
    (function Loop() {
        setTimeout(() => {
            document.getElementById("color" + ((7 - currentHeight) * 10 + column)).setAttribute("class", color);
            
            if (currentHeight < MAX_HEIGHT) {
                document.getElementById("color" + ((6 - currentHeight) * 10 + column)).setAttribute("class", "");
            }

            if (currentHeight > height[column]) { // height[column] 在这一步前已加 1
                currentHeight--;
                Loop();
            }
        }, 20);
    })();
    height[column]++;
    table[height[column]][column] = sdPlayer;
    changeSide(); // 交换走子方
    return true;
}

var undoDrop = (column) => { // 在第 column 取消落子 并演示动画
    changeSide(); // 交换走子方

    let color = sdPlayer ? "Red" : "Yellow";
    let currentHeight = height[column];

    (function Loop() {
        setTimeout(() => {
            document.getElementById("color" + ((7 - currentHeight) * 10 + column)).setAttribute("class", "");
            if (currentHeight < MAX_HEIGHT) {
                document.getElementById("color" + ((6 - currentHeight) * 10 + column)).setAttribute("class", color);
            }
    
            if (currentHeight < MAX_HEIGHT) {
                currentHeight++;
                Loop();
            }
        }, 20);
    })();
    table[height[column]][column] = EMPTY;
    height[column]--;
}

var makeMove = (column) => { // 落子 但不演示动画
    height[column]++;
    table[height[column]][column] = sdPlayer;
    changeSide(); // 交换走子方
}

var undoMakeMove = (column) => { // 取消落子 但不演示动画
    changeSide();
    table[height[column]][column] = EMPTY;
    height[column]--;
}

var delta = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]; // 方向数组
var evaluate = () => { // 局面评估
    let vlPlayer = 0, vlAI = 0;
    for (let column = 1; column <= MAX_WIDTH; column++)
        for (let row = 1; row <= height[column]; row++) {
            if (table[row][column] != 0) continue; // 对黄色进行判断
            for (let i = 0; i < 8; i++) { // 枚举 8 个方向
                if (isYellow(row + delta[i][0], column + delta[i][1])
                    && isYellow(row + 2 * delta[i][0], column + 2 * delta[i][1])
                    && isEmpty(row + 3 * delta[i][0], column + 3 * delta[i][1])) {
                        vlPlayer += 720;
                        if (isEmpty(row - delta[i][0], column - delta[i][1]))
                            vlPlayer += 10000;
                    }
                if (isYellow(row + delta[i][0], column + delta[i][1])
                    && isEmpty(row + 2 * delta[i][0], column + 2 * delta[i][1])
                    && isYellow(row + 3 * delta[i][0], column + 3 * delta[i][1]))
                        vlPlayer += 720;
                if (isYellow(row + delta[i][0], column + delta[i][1])
                    && isEmpty(row + 2 * delta[i][0], column + 2 * delta[i][1])
                    && isEmpty(row + 3 * delta[i][0], column + 3 * delta[i][1]))
                        vlPlayer += 120;
                if (isEmpty(row + delta[i][0], column + delta[i][1])
                    && isYellow(row + 2 * delta[i][0], column + 2 * delta[i][1])
                    && isEmpty(row + 3 * delta[i][0], column + 3 * delta[i][1]))
                        vlPlayer += 120;
                if (isEmpty(row + delta[i][0], column + delta[i][1])
                    && isEmpty(row + 2 * delta[i][0], column + 2 * delta[i][1])
                    && isYellow(row + 3 * delta[i][0], column + 3 * delta[i][1]))
                        vlPlayer += 120;
                if (isEmpty(row + delta[i][0], column + delta[i][1])
                    && isEmpty(row + 2 * delta[i][0], column + 2 * delta[i][1])
                    && isEmpty(row + 3 * delta[i][0], column + 3 * delta[i][1]))
                        vlPlayer += 20;
            }
        }
    for (let column = 1; column <= MAX_WIDTH; column++)
        for (let row = 1; row <= height[column]; row++) {
            if (table[row][column] != 1) continue; // 对红色进行判断
            for (let i = 0; i < 8; i++) { // 枚举 8 个方向
                if (isRed(row + delta[i][0], column + delta[i][1])
                    && isRed(row + 2 * delta[i][0], column + 2 * delta[i][1])
                    && isEmpty(row + 3 * delta[i][0], column + 3 * delta[i][1])) {
                        vlAI += 720;
                        if (isEmpty(row - delta[i][0], column - delta[i][1]))
                            vlAI += 10000;
                    }
                if (isRed(row + delta[i][0], column + delta[i][1])
                    && isEmpty(row + 2 * delta[i][0], column + 2 * delta[i][1])
                    && isRed(row + 3 * delta[i][0], column + 3 * delta[i][1]))
                        vlAI += 720;
                if (isRed(row + delta[i][0], column + delta[i][1])
                    && isEmpty(row + 2 * delta[i][0], column + 2 * delta[i][1])
                    && isEmpty(row + 3 * delta[i][0], column + 3 * delta[i][1]))
                        vlAI += 120;
                if (isEmpty(row + delta[i][0], column + delta[i][1])
                    && isRed(row + 2 * delta[i][0], column + 2 * delta[i][1])
                    && isEmpty(row + 3 * delta[i][0], column + 3 * delta[i][1]))
                        vlAI += 120;
                if (isEmpty(row + delta[i][0], column + delta[i][1])
                    && isEmpty(row + 2 * delta[i][0], column + 2 * delta[i][1])
                    && isRed(row + 3 * delta[i][0], column + 3 * delta[i][1]))
                        vlAI += 120;
                if (isEmpty(row + delta[i][0], column + delta[i][1])
                    && isEmpty(row + 2 * delta[i][0], column + 2 * delta[i][1])
                    && isEmpty(row + 3 * delta[i][0], column + 3 * delta[i][1]))
                        vlAI += 20;
            }
        }
    return sdPlayer == 0 ? vlPlayer - vlAI : vlAI - vlPlayer;
}

// 极大极小搜索
var minMax = (depth) => {
    let vlBest, mvBest = 1, vl, tmp;

    if (depth <= 0) {
        if (sdPlayer == 1) return [evaluate(), 1];
        else return [-evaluate(), 1];
    }

    if (sdPlayer == 1) { // ai 方 极大值
        if (check()) return [-INF + SEARCH_DEPTH - depth, 1];

        vlBest = -INF;

        for (let column = 1; column <= MAX_WIDTH; column++) {
            if (height[column] == MAX_HEIGHT) continue;

            makeMove(column);
            if (!stopDisplay) recordMove(0, depth, column, vlBest);

            [vl, tmp] = minMax(depth - 1);

            undoMakeMove(column);
            if (!stopDisplay) recordMove(1, depth, column, Math.max(vl, vlBest));

            if (vl > vlBest) vlBest = vl, mvBest = column;
        }
    } else {
        if (check()) return [INF - SEARCH_DEPTH - depth, 1];
        vlBest = INF;
        for (let column = 1; column <= MAX_WIDTH; column++) {
            if (height[column] == MAX_HEIGHT) continue;

            makeMove(column);
            if (!stopDisplay) recordMove(0, depth, column, vlBest);

            [vl, tmp] = minMax(depth - 1);

            undoMakeMove(column);
            if (!stopDisplay) recordMove(1, depth, column, Math.max(vl, vlBest));

            if (vl < vlBest) vlBest = vl, mvBest = column;
        }
    }
    return [vlBest, mvBest];
}

// αβ剪枝
var alphaBeta = (depth, alpha, beta) => {
    let vlBest = -INF, mvBest = 1, vl;

    if (check()) return -INF + SEARCH_DEPTH - depth; // 当前棋手失利
    if (depth <= 0) return evaluate();

    for (let column = 1; column <= MAX_WIDTH; column++) {
        if (height[column] == MAX_HEIGHT) continue;

        makeMove(column);
        if (!stopDisplay) recordMove(0, depth, column, alpha, beta);

        vl = -alphaBeta(depth - 1, -beta, -alpha);

        undoMakeMove(column);
        if (!stopDisplay) recordMove(1, depth, column, Math.max(alpha, vl), beta);

        if (vl > vlBest) {
            vlBest = vl, mvBest = column;
            if (vl >= beta) break;
            if (vl > alpha) alpha = vl;
        }

    }
    return vlBest;
}

// alpha-beta 搜索对根节点特判
var searchRoot = (depth) => {
    let vlBest = -INF, mvBest = 1, vl;
    for (let column = 1; column <= MAX_WIDTH; column++) {
        if (height[column] == MAX_HEIGHT) continue;

        makeMove(column);
        if (!stopDisplay) recordMove(0, depth, column, -INF, INF);

        vl = -alphaBeta(depth - 1, -INF, -vlBest);

        undoMakeMove(column);
        if (!stopDisplay) recordMove(1, depth, column, -INF, INF);

        if (vl > vlBest) {
            vlBest = vl, mvBest = column;
        }
    }
    return [vlBest, mvBest];
}

// 搜索主函数 根据搜索类型 mode 进行 min-max 搜索或 α-β剪枝
var searchMain = () => { 
    moveList.length = 0; // 清空数组

    let vlBest, mvBest;
    if (mode == 0) [vlBest, mvBest] = searchRoot(SEARCH_DEPTH, -INF, INF);
    else [vlBest, mvBest] = minMax(SEARCH_DEPTH);

    console.log(vlBest);

    if (!stopDisplay) displayMove(mvBest);
    else {
        drop(mvBest);
        gameOver = check();
        setTimeout(() => {
            if (gameOver) {
                if (sdPlayer == 1) alert("Yellow win");
                else alert("Red win");
            }
        }, 200);
    }
}

// 每个 td 元素添加点击事件，点击后在所属列落子
Array.from(document.getElementsByTagName("td")).forEach(item => {
    item.onclick = () => {
        if (gameOver || sdPlayer || reseting) return;
        let res = drop(getColumn(item.getAttribute("id")));
        if (!res) alert("Full");
        else {
            gameOver = check(); // 判断是否连成 4 子
            setTimeout(() => {
                if (gameOver) {
                    if (sdPlayer == 1) alert("Yellow win");
                    else alert("Red win")
                } else {
                    searchMain(); // 若游戏未结束，执行搜索
                }
            }, 200);
        }
    }
});

// 重置
document.getElementById("restart").addEventListener('click', () => {
    if (reseting) return; // 如果正在重置，return
    gameOver = false; // 游戏结束标时为 false
    
    mode = 0; // 模式设为 alpha-beta 剪枝模式
    document.getElementById("mode").innerHTML = "Choose minMax";

    if (stopDisplay) { // 没有演示 直接清零
        sdPlayer = 0
        for (let row = 1; row <= MAX_HEIGHT; row++) 
            for (let column = 1; column <= MAX_WIDTH; column++) {
                height[column] = 0;
                table[row][column] = EMPTY;
                document.getElementById("color" + (row * 10 + column)).setAttribute("class", "");
            }
    } else { // 否则延时清零
        reseting = true;
        document.getElementById("info").style.css = "display: none";
        setTimeout(() => {
            sdPlayer = 0;
            reseting = false;
            for (let row = 1; row <= MAX_HEIGHT; row++) 
            for (let column = 1; column <= MAX_WIDTH; column++) {
                height[column] = 0;
                table[row][column] = EMPTY;
                document.getElementById("color" + (row * 10 + column)).setAttribute("class", "");
            }
        }, 600);
    }
    
    stopDisplay = true; // 取消演示
    document.getElementById("stop-display").innerHTML = "Choose display search";
    
    setPlayerMessage();
    
    console.log(table);
});

// 选择是否演示搜索过程。选择后可不进行演示或停止演示过程
document.getElementById("stop-display").addEventListener('click', () => {
    stopDisplay ^= 1;
    if (stopDisplay) {
        document.getElementById("stop-display").innerHTML = "Choose display search";
        document.getElementById("info").innerHTML = "";
    }
    else {
        document.getElementById("stop-display").innerHTML = "Stop display search";
    }
});

document.getElementById("mode").addEventListener('click', () =>{
    mode ^= 1;
    if (mode == 0) document.getElementById("mode").innerHTML = "Choose minMax";
    else document.getElementById("mode").innerHTML = "Choose alphaBeta";
});

document.getElementById("sInput").addEventListener('change', () => {
    let vl = parseInt(document.getElementById("sInput").value);
    if (vl <= 0 || vl >= 20) alert("Search depth should be greater than 0 and less than 20");
    SEARCH_DEPTH = vl;
    console.log(SEARCH_DEPTH);
});

setPlayerMessage();