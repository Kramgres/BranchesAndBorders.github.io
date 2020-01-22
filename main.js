const canvas = document.getElementById("canvas");
const data = document.getElementById("data");
const distributeBtn = document.getElementById("distribute-btn");
const ctx = canvas.getContext("2d");

const canvas2 = document.getElementById("canvas2");
const ctx2 = canvas2.getContext("2d");

const background = new Image();

// let box = 100;
let nets = [];
let e = []; //список элементов печатной платы

function createSquareMatrix(size) {

  let matrix = new Array(size);

  for (let i = 0; i < size; i++) {
    matrix[i] = new Array(size);
  }

  for (let i = 0; i < size; i++){
    for (j = 0; j < size; j++){
      matrix[i][j] = 0;
    }
  }
  return matrix;
}

function unique2Array(arr) {
  let result = [];

  for (let a of arr) {
    for (let b of a) {
      if (!result.includes(b)) {
        result.push(b);
      }
    }
  }

  return result;
}

function uniqueArray(arr) {
  let result = [];

  for (let a of arr) {
    if (!result.includes(a)) {
      result.push(a);
    }
  }
  return result;
}

//считывание данных с файла
function readFile(input) {
  let file = input.files[0];

  let reader = new FileReader();

  reader.readAsText(file, "ISO-8859-4");

  //выводим построчно данные, убирая точку с запятой и значения в скбках 
  // TO DO сделать 2 метода
  reader.onload = function() {
    let originalStrArr = reader.result.split(";"); //получаем узлы, убрав ;
    for (let i = 0; i < originalStrArr.length; i++) {
      let strArrWitoutParentheses = originalStrArr[i].replace(/ *\([^)]*\) */g, " "); //убираем скобки (ножки)
      data.innerHTML += '<p>'+strArrWitoutParentheses+'</p>'; //выводим на экран
      let strArr = strArrWitoutParentheses.split(" "); // разбиваем на элементы
      strArr.splice(0,1); //убираем номер узла
      for(let j =0; j< strArr.length; j++) { // убираем переносы строки, запятые и пустые значения
        if (strArr[j] == "" || strArr[j].includes("\n")) {
          strArr.splice(j, 1);
          j--;
        }
      }
        nets.push(strArr);
    }

    e = unique2Array(nets); //список элементов печатной платы
  };

  reader.onerror = function() {
    console.log(reader.error);
  };
}

//получаем уникальные значения в узлах и удаляем узлы с 1 элементом
function getUniqueInNets (nets) {
  let uniqueNets = [];
  let tempUniqueNets = [];

  for (let i = 0; i < nets.length; i++) {
    tempUniqueNets.push(uniqueArray(nets[i]));
  }

  for (let i = 0; i < tempUniqueNets.length; i++) {
    if(tempUniqueNets[i].length > 1) {
      uniqueNets.push(tempUniqueNets[i]);
    }
}
  return uniqueNets;
}

//заполняем матрицу значениями
function fillR(matrix, nets) {
  let row, column;

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix.length; j++) {
      if (i == 0 && j > 0) {
        matrix[i][j] =  e[j-1];
      } else if (j == 0 && i > 0) {
        matrix[i][j] =  e[i-1];
      }
    }
  }

  for (let i = 0; i < nets.length; i++) {
    for (let j = 0; j < nets[i].length-1; j++) {
      row = matrix[0].indexOf(nets[i][j]);
      for (let k = j + 1; k < nets[i].length; k++) {
        column = matrix[0].indexOf(nets[i][k]);
        matrix[row][column]++;
      }
    }
  }

  for (let i = 1; i < matrix.length; i++) {
    for (let j = 1; j < matrix.length; j++) {
      if (j > i) {
        matrix[i][j] += matrix[j][i];
        matrix[j][i] = 0;
      }
    }
  }
}

function drawLine(startX, startY, finishX, finishY) {
  
  ctx.beginPath();
  ctx.moveTo(startX, startY); //начальная точка линии
  ctx.arc(startX, startY, 4, 0, 2*Math.PI, false); // рисуем кружок
  ctx.lineTo(finishX, finishY); //рисуем линию до конечной точки
  ctx.arc(finishX, finishY, 4, 0, 2*Math.PI, false); // рисуем кружок
  ctx.closePath();
  ctx.stroke();
}

function drawPositions(positions, ctx) {
  let marginRect = 25;
  let sizeRect = 50;
  // ctx.drawImage(background, 0, 0);
  ctx.fillStyle = "#20252a";
  ctx.fillRect(0, 0, 775, 775);

  ctx.fillStyle = "white";
  ctx.strokeStyle = "white";
  ctx.font = "20px Georgia";

  for (let i = 0; i < positions.length; i++) {
    for (let j = 0; j < positions.length; j++) {
      if (positions[i][j] != 0) {
        ctx.strokeRect(marginRect*(j+1) + sizeRect*j, marginRect*(i+1) + sizeRect*i, sizeRect, sizeRect);
        ctx.fillText (positions[i][j], 5 + marginRect*(j+1) + sizeRect*j, marginRect*(i+1) + sizeRect*i + sizeRect/1.5);
      }
    }
  }
}

function printMatrix(matrix) {

   let table = document.createDocumentFragment();
    
   let arr = [];
   for (let i = 0; i < matrix.length; i++) {
      /*на каждой интерации первого цикла создаем строку tr */
       let tr = document.createElement('tr');

       arr[i] = [];
       for(let j = 0; j < matrix.length; j++) {
      /*на каждой интерации второго цикла создаем ячейку td */
           let td = document.createElement('td');

      /* вносим данные в ячейку */
           td.innerHTML = arr[i][j] = matrix[i][j];

      /* готовую ячейку с данными добавляем в строку */
           tr.appendChild(td);
       }

      /* когда строка заполнена, добавляем ее в созданный нами фрагмент */
       table.appendChild(tr);
   }
/* когда все данные заполнены, ищем на странице элемент с id=matrix
в нашем случае это таблица
и записываем в нее наш фрагмент */
   document.getElementById('matrix').innerHTML = " ";
   document.getElementById('matrix').appendChild(table);
}

function fillPositions(matrix, e) {
  let k = 0;
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix.length; j++) {
        if (k == e.length) {
          return(matrix);
        } else {
            matrix[i][j] = e[k];  
            k++;
      }
    }
  }
}

function drawConnections(positions, R) {
  let startX, startY, finishX, finishY;
  for (let i = 1; i < R.length; i++) {
    for (let j = 1; j < R.length; j++) {
      if (R[i][j] != 0) {
        for (let k = 0; k < positions.length; k++) {
          for (let l = 0; l < positions.length; l++) {
            if (positions[k][l] == R[0][j]) {
              startX = l;
              startY = k;
            }
            if (positions[k][l] == R[i][0]) {
              finishX = l;
              finishY = k;
              drawLine(50 + startX*75, 50 + startY*75, 50 + finishX*75, 50 + finishY*75); //можно сделать не из центра
            }
          }
        }
      }
    }
  }

}

function fillD(positions, D) {
  let i=0,j=0;

  while(i<D.length){
      for(let k = 0; k < positions.length; k++) {
        for(let l = 0; l < positions.length; l++) {
          if(positions[k][l]!=0){
            D:for(let m = 0; m < positions.length;m++) {
              for(let n = 0; n < positions.length;n++) {
                D[i][j] = Math.abs(m-k)+Math.abs(n-l);
                j++;
                if(j==D.length){
                  j=j-D.length;
                  i++;
                  break D;
                }
              }
            }
          }
        }
      }
    }
  
  for(let i=0; i<D.length;i++){
    for(let j=0; j<D.length;j++){
      if(D[i][j]<0){
        D[i][j]=D[i][j]*-1;
      }
    }
  }
}

function getSumRows(matrix) {
  let sumArr = [];
  let res = 0;

  if(isNaN(matrix[0][1])) {
    let newMatrix = createSquareMatrix(matrix.length-1);
    for(let i = 0; i < newMatrix.length; i++) {
      for(let j = 0; j < newMatrix.length; j++) {
        newMatrix[i][j] = matrix[i+1][j+1];
      }
    }
    for(let i = 0; i < newMatrix.length; i++) {
      for(let j = 0; j < newMatrix.length; j++) {
        res = res + newMatrix[i][j];
      }
      sumArr[i] = res;
      res=0;
    }
  }else{
    for(let i = 0; i < matrix.length; i++) {
      for(let j = 0; j < matrix.length; j++) {
        res = res + matrix[i][j];
      }
      sumArr[i] = res;
      res=0;
    }
  }
  return sumArr;
}

function BubbleSort2(A)       // A - массив, который нужно
{                            // отсортировать по возрастанию.
    var n = A[0].length;
    for (var i = 0; i < n-1; i++)
     { for (var j = 0; j < n-1-i; j++)
        { if (A[0][j+1] < A[0][j])
           { var t = A[0][j+1]; A[0][j+1] = A[0][j]; A[0][j] = t; 
             var k = A[1][j+1]; A[1][j+1] = A[1][j]; A[1][j] = k;}
        }
     }                     
    return A;    // На выходе сортированный по возрастанию массив A.
}

function BubbleSort3(A)       // A - массив, который нужно
{                            // отсортировать по возрастанию.
    var n = A[0].length;
    for (var i = 0; i < n-1; i++)
     { for (var j = 0; j < n-1-i; j++)
        { if (A[0][j+1] > A[0][j])
           { var t = A[0][j+1]; A[0][j+1] = A[0][j]; A[0][j] = t; 
             var k = A[1][j+1]; A[1][j+1] = A[1][j]; A[1][j] = k;
             var l = A[2][j+1]; A[2][j+1] = A[2][j]; A[2][j] = l;}
        }
     }                     
    return A;    // На выходе сортированный по убыванию массив A.
}

function sortSumR(sumR, e) {
  let matrixSumR = new Array(2);

  for (let i = 0; i < 2; i++) {
    matrixSumR[i] = new Array(sumR.length);
  }

  for(let i = 0; i < sumR.length; i++) {
    matrixSumR[0][i] = sumR[i];
    matrixSumR[1][i] = e[i];
  }
  matrixSumR = BubbleSort2(matrixSumR);
  return matrixSumR;
}

function sortSumD(sumD, positions) {
  let matrixSumD = new Array(2);

  for (let i = 0; i < 3; i++) {
    matrixSumD[i] = new Array(sumD.length);
  }

  let k = 0;
  while(k<sumD.length){
    for(let i = 0; i < positions.length; i++) {
      for(let j = 0; j < positions.length; j++) {
        if(positions[i][j]!=0) {
          matrixSumD[0][k] = sumD[k];
          matrixSumD[1][k] = i;
          matrixSumD[2][k] = j;
          k++;
        }
      }
    }
  }
  BubbleSort3(matrixSumD);
  return matrixSumD;
}

function fillPositionsNew(positions, sortedR, sortedD, e) {
  for(let i = 0; i < e.length; i++) {
    positions[sortedD[1][i]][sortedD[2][i]] = sortedR[1][i];
  }
  return positions;
}

distributeBtn.addEventListener('click', function() {
  let uNets = getUniqueInNets(nets);
  let R = createSquareMatrix(e.length + 1);
  fillR(R, uNets);
  printMatrix(R);

  let positions = createSquareMatrix(10); // создали пустой позиций для размещения эл-тов на лате
  positions = fillPositions(positions, e); //заполнили его эл-тами
  // console.log(positions);
  drawPositions(positions, ctx);
  //drawConnections(positions,R);

  let D = createSquareMatrix(e.length);
  fillD(positions, D);
  let sumD = getSumRows(D);
  let sumR = getSumRows(R);
  // console.log(sumD);
  // console.log(sumR);
  sortedR = sortSumR(sumR,e);
  sortedD = sortSumD(sumD, positions);
  let newPositions = createSquareMatrix(10);
  newPositions = fillPositionsNew(newPositions, sortedR, sortedD,e);
  drawPositions(newPositions, ctx2);
  //drawConnections(newPositions, R);
  console.log(newPositions);

});

