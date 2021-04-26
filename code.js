const MAX_HEIGHT = 6;
const MAX_WIDTH = 7;

var sdPlayer = 0; // 0 - yellow 1 - red

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

var changeSide = () => { sdPlayer ^= 1; };

var drop = (id, color) => {
    let column = parseInt(id.substr(5, 2)) % 10;
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
    return true;
}

Array.from(document.getElementsByTagName("td")).forEach(item => {
    item.onclick = () => {
        if (drop(item.getAttribute("id"), sdPlayer ? "Red" : "Yellow")) {
            changeSide();
        } else {
            alert("full");
        }
        // if (sdPlayer & 1) return; // sdPlayer & 1 => ai is thinking
    }
});