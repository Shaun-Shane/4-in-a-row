const MAX_HEIGHT = 6;
const MAX_WIDTH = 7;
const EMPTY = 2;
const INF = 100000;

var sdPlayer = 0; // 0 - yellow 1 - red

var disPlay = false; // 是否演示搜索过程
var gameOver = false;

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

// 交换走子方
var changeSide = () => { sdPlayer ^= 1; };

// 通过 td-id 获得所在列
var getColumn = (id) => {
    return parseInt(id.substr(5, 2)) % 10;
}

// 判断一个位置是否在能构成连线
var canLink = (row, column) => {
    return 1 <= row && row <= MAX_HEIGHT && 1 <= column && column <= MAX_WIDTH
        && table[row][column] != EMPTY && table[row][column] != sdPlayer;
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

            if (currentHeight > height[column]) {
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

var undoDrop = async (column) => { // 在第 column 取消落子 并演示动画
    setTimeout(() => {
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
    }, 600);
}

var evaluate = () => {
    return 0;
}

Array.from(document.getElementsByTagName("td")).forEach(item => {
    item.onclick = async () => {
        if (gameOver) return;
        // if(sdPlayer) return;
        drop(getColumn(item.getAttribute("id"))).then((res) => {
            if (!res) alert("Full");
        }).then(() => {
            gameOver = check(); // 判断是否连成 4 子
            setTimeout(() => {
                if (gameOver) {
                    if (sdPlayer == 1) alert("Yellow win");
                    else alert("Red win")
                }
            }, 200);
        })
    }
});

document.getElementById("restart").addEventListener('click', () => {
    gameOver = false, disPlay = false;
    for (let row = 1; row <= MAX_HEIGHT; row++) 
        for (let column = 1; column <= MAX_WIDTH; column++) {
            height[column] = 0;
            table[row][column] = EMPTY;
            document.getElementById("color" + (row * 10 + column)).setAttribute("class", "");
        }
    console.log(table);
})