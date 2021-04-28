const MAX_HEIGHT = 6;
const MAX_WIDTH = 7;
const EMPTY = 2;
const INF = 1000000;
const SEARCH_DEPTH = 2;

var sdPlayer = 0; // 0 - yellow 1 - red
var mode = 0; // 0 - alphaBeta，1 - minmax

var display = true; // 是否演示搜索过程
var gameOver = false;

var moveList = [];

var table = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
];

var height = [0, 0, 0, 0, 0, 0, 0, 0]; // hight of every column

function Move(type, depth, column, alpha, beta) {
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
var displayMove = async (mvBest) => {
    (function Loop(i) {
        setTimeout(() => {
            if (moveList[i].type == 0) {
                setTimeout(drop(moveList[i].column), 200);
            } else {
                setTimeout(undoDrop(moveList[i].column), 200);
            }
            if ((++i) < moveList.length) Loop(i);
            else {
                drop(mvBest).then(() => {
                    gameOver = check();
                    setTimeout(() => {
                        if (gameOver) {
                            if (sdPlayer == 1) alert("Yellow win");
                            else alert("Red win");
                        }
                    }, 200);
                });
            }
        }, 600);
    })(0);
}

// 交换走子方
var changeSide = () => { sdPlayer ^= 1; setPlayerMessage(); };

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

var drop = async (column) => { // 在第 column 落子 并演示动画
    let color = sdPlayer ? "Red" : "Yellow";
    if (height[column] == MAX_HEIGHT) return false;
    let currentHeight = MAX_HEIGHT;
    (function Loop() {
        setTimeout(() => {
            document.getElementById("color" + ((7 - currentHeight) * 10 + column)).setAttribute("class", color);
            
            if (currentHeight < MAX_HEIGHT) {
                document.getElementById("color" + ((6 - currentHeight) * 10 + column)).setAttribute("class", "");
            }

            if (currentHeight > height[column] + 1) {
                currentHeight--;
                Loop();
            } else {
                height[column]++;
                table[height[column]][column] = sdPlayer;
                changeSide(); // 交换走子方
            }
        }, 20);
    })();
    return true;
}

var undoDrop = async (column) => { // 在第 column 取消落子 并演示动画
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
            } else {
                table[height[column]][column] = EMPTY;
                height[column]--;
            }
        }, 20);
    })();
}

var makeMove = (column) => {
    height[column]++;
    table[height[column]][column] = sdPlayer;
    changeSide(); // 交换走子方
}

var undoMakeMove = (column) => {
    changeSide();
    table[height[column]][column] = EMPTY;
    height[column]--;
}

var delta = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
var evaluate = () => {
    let vlPlayer = 0, vlAI = 0;
    for (let column = 1; column <= MAX_WIDTH; column++)
        for (let row = 1; row <= height[column]; row++) {
            if (table[row][column] != 0) continue; // 对黄色进行判断
            for (let i = 0; i < 8; i++) {
                if (isYellow(row + delta[i][0], column + delta[i][1])
                    && isYellow(row + 2 * delta[i][0], column + 2 * delta[i][1])
                    && isEmpty(row + 3 * delta[i][0], column + 3 * delta[i][1]))
                        vlPlayer += 720;
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
            for (let i = 0; i < 8; i++) {
                if (isRed(row + delta[i][0], column + delta[i][1])
                    && isRed(row + 2 * delta[i][0], column + 2 * delta[i][1])
                    && isEmpty(row + 3 * delta[i][0], column + 3 * delta[i][1]))
                        vlAI += 720;
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

}

// αβ剪枝
var alphaBeta = (depth, alpha, beta) => {
    let vlBest = -INF, mvBest = 1, vl;

    if (check()) return -INF + SEARCH_DEPTH - depth; // 当前棋手失利
    if (depth <= 0) return evaluate();

    for (let column = 1; column <= MAX_WIDTH; column++) {
        if (height[column] == MAX_HEIGHT) continue;

        makeMove(column);
        recordMove(0, depth, column, alpha, beta);

        vl = -alphaBeta(depth - 1, -beta, -alpha);

        undoMakeMove(column);
        recordMove(1, depth, column, alpha, beta);

        if (vl > vlBest) {
            vlBest = vl, mvBest = column;
            if (vl >= beta) break;
            if (vl > alpha) alpha = vl;
        }

    }
    return vlBest;
}

var searchRoot = (depth) => {
    let vlBest = -INF, mvBest = 1, vl;
    for (let column = 1; column <= MAX_WIDTH; column++) {
        if (height[column] == MAX_HEIGHT) continue;

        makeMove(column);
        recordMove(0, depth, column, -INF, INF);

        vl = -alphaBeta(depth - 1, -INF, -vlBest);

        undoMakeMove(column);
        recordMove(1, depth, column, -INF, INF);

        if (vl > vlBest) {
            vlBest = vl, mvBest = column;
        }
    }
    return [vlBest, mvBest];
}

var searchMain = () => {
    moveList.length = 0; // 清空数组

    let vlBest, mvBest;
    if (mode == 0) [vlBest, mvBest] = searchRoot(SEARCH_DEPTH, -INF, INF);
    else minMax(SEARCH_DEPTH);

    console.log(vlBest);

    if (display) displayMove(mvBest);
    else {
        drop(mvBest).then(() => {
            gameOver = check();
            setTimeout(() => {
                if (gameOver) {
                    if (sdPlayer == 1) alert("Yellow win");
                    else alert("Red win");
                }
            }, 200);
        });
    }
}

Array.from(document.getElementsByTagName("td")).forEach(item => {
    item.onclick = async () => {
        if (gameOver) return;
        if(sdPlayer) return;
        drop(getColumn(item.getAttribute("id"))).then((res) => {
            if (!res) alert("Full");
        }).then(() => {
            gameOver = check(); // 判断是否连成 4 子
            setTimeout(() => {
                if (gameOver) {
                    if (sdPlayer == 1) alert("Yellow win");
                    else alert("Red win")
                } else {
                    searchMain();
                }
            }, 200);
        })
    }
});

document.getElementById("restart").addEventListener('click', () => {
    gameOver = false, display = false, mode = 0, sdPlayer = 0;
    setPlayerMessage();
    for (let row = 1; row <= MAX_HEIGHT; row++) 
        for (let column = 1; column <= MAX_WIDTH; column++) {
            height[column] = 0;
            table[row][column] = EMPTY;
            document.getElementById("color" + (row * 10 + column)).setAttribute("class", "");
        }
    console.log(table);
})

setPlayerMessage();