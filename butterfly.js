
var canvas;
var gl;

var numTimesToSubdivide = 5;
 
var index = 0;

var pointsArray = [];
var colorArray = [];


//类别
var wingColor = 1;
var bodyColor = 2;

//扇翅膀的幅度
var flap = 0;
var flap2 = 0;
var turn = false;
var startFlap = false;

var near = -10;
var far = 10;
var radius = 6.0;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var texCoord = [
    vec2(-1, 1),
    vec2(-1, -1),
    vec2(1, -1),
    vec2(1, 1)
];

var texCoordsArray = [];

var bgVertices = [
                vec4(-1,1,-1,1),
                vec4(-1,-1,-1,1),
                vec4(1,-1,-1,1),
                vec4(1,1,-1,1),
                ];


function triangle(a, b, c,type) {
    if(type == wingColor){
     pointsArray.push(a);
     colorArray.push(a); 
     pointsArray.push(b);
     colorArray.push(b);  
     pointsArray.push(c);
     colorArray.push(c);   
     }else if(type == bodyColor){
        var bodyC = vec4(1,197/255,83/255,1);

        pointsArray.push(a);
        colorArray.push(bodyC); 
        pointsArray.push(b);
        colorArray.push(bodyC);  
        pointsArray.push(c);
        colorArray.push(bodyC);   
     }   
     index += 3;
}


function divideTriangle(a, b, c, count,type) {
    if ( count > 0 ) {
                
        var ab = normalize(mix( a, b, 0.5), true);
        var ac = normalize(mix( a, c, 0.5), true);
        var bc = normalize(mix( b, c, 0.5), true);
                                
        divideTriangle( a, ab, ac, count - 1, type);
        divideTriangle( ab, b, bc, count - 1, type);
        divideTriangle( bc, c, ac, count - 1, type);
        divideTriangle( ab, bc, ac, count - 1, type);
    }
    else { // draw tetrahedron at end of recursion
        triangle( a, b, c, type);
    }
}

function tetrahedron(a, b, c, d, n,type) {
    divideTriangle(a, b, c, n, type);
    divideTriangle(d, c, b, n, type);
    divideTriangle(a, d, b, n, type);
    divideTriangle(a, c, d, n, type);
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
     gl.enable(gl.DEPTH_TEST);
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);
    
    //--------------wingRight1_1
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide,wingColor);
    //--------------wingRight1_2
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide,bodyColor);

    pointsArray.push(bgVertices[0]);
    texCoordsArray.push(bgVertices[0]);
    pointsArray.push(bgVertices[1]);
    texCoordsArray.push(bgVertices[1]);
    pointsArray.push(bgVertices[2]);
    texCoordsArray.push(bgVertices[2]);
    pointsArray.push(bgVertices[0]);
    texCoordsArray.push(bgVertices[0]);
    pointsArray.push(bgVertices[3]);
    texCoordsArray.push(bgVertices[3]);
    pointsArray.push(bgVertices[2]);
    texCoordsArray.push(bgVertices[2]);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
 
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(colorArray),gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program,"vColor");
    gl.vertexAttribPointer(vColor,4,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vColor);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(texCoordsArray),gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program,"vTexCoord");
    gl.vertexAttribPointer(vTexCoord,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vTexCoord);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    document.getElementById("Button0").onclick = function(){theta += dr;};
    document.getElementById("Button1").onclick = function(){theta -= dr;};
    document.getElementById("Button2").onclick = function(){phi += dr;};
    document.getElementById("Button3").onclick = function(){phi -= dr;};
    
    document.getElementById("Button4").onclick = function(){
        if(!startFlap){
            startFlap = true;
        }else{
            startFlap = false;
        }
    };

   
    render();
}

function wingsL1_1(){
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    if(startFlap){
    if(turn){
        flap += 1;
        if(flap >= 70){
            turn = false;
        }
    }else{
        flap -= 1;
        if(flap <= -50){
            turn = true;
        }
    }
}
    
    modelViewMatrix = mult(modelViewMatrix,rotateZ(-20));
    modelViewMatrix = mult(modelViewMatrix,rotateY(flap));
    modelViewMatrix = mult(modelViewMatrix,translate(1.0,-0.3,0.0));
    modelViewMatrix = mult(modelViewMatrix,scalem(1,0.3,0.01));

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

     for( var i=0; i<index/2; i+=3) 
       gl.drawArrays( gl.LINE_LOOP, i, 3 );
}
function wingsL1_2(){
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    if(startFlap){
    if(turn){
        flap += 1;
        if(flap >= 70){
            turn = false;
        }
    }else{
        flap -= 1;
        if(flap <= -50){
            turn = true;
        }
    }
}

    modelViewMatrix = mult(modelViewMatrix,rotateZ(20));
    modelViewMatrix = mult(modelViewMatrix,rotateY(flap));
    modelViewMatrix = mult(modelViewMatrix,translate(0.8,-0.4,0.0));
    
    modelViewMatrix = mult(modelViewMatrix,scalem(0.6,0.2,0.01));
   
    

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

     for( var i=0; i<index/2; i+=3) 
       gl.drawArrays( gl.LINE_LOOP, i, 3 );
}
function body(){
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    modelViewMatrix = mult(modelViewMatrix,translate(0,-0.3,0));
    modelViewMatrix = mult(modelViewMatrix,scalem(0.2,0.6,0.1));

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    for( var i=index/2; i<index; i+=3) 
       gl.drawArrays( gl.TRIANGLES, i, 3 );

}
function wingsR1_1(){
     eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

     if(startFlap){
    if(!turn){
        flap2 += 1;
        if(flap2 >= 50){
            turn = false;
        }
    }else{
        flap2 -= 1;
        if(flap2 <= -70){
            turn = true;
        }
    }
}
    
    modelViewMatrix = mult(modelViewMatrix,rotateZ(20));
    modelViewMatrix = mult(modelViewMatrix,rotateY(flap2));
    modelViewMatrix = mult(modelViewMatrix,translate(-1.0,-0.3,0.0));
    modelViewMatrix = mult(modelViewMatrix,scalem(-1,0.3,0.01));

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

     for( var i=0; i<index/2; i+=3) 
       gl.drawArrays( gl.LINE_LOOP, i, 3 );
}
function wingsR1_2(){
     eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));


    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

      if(startFlap){
    if(!turn){
        flap2 += 1;
        if(flap >= 50){
            turn = false;
        }
    }else{
        flap2 -= 1;
        if(flap2 <= -70){
            turn = true;
        }
    }
}

    modelViewMatrix = mult(modelViewMatrix,rotateZ(-20));
    modelViewMatrix = mult(modelViewMatrix,rotateY(180+flap2));
    modelViewMatrix = mult(modelViewMatrix,translate(0.8,-0.4,0.0));
    
    modelViewMatrix = mult(modelViewMatrix,scalem(0.6,0.2,0.01));
   
    

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

     for( var i=0; i<index/2; i+=3) 
       gl.drawArrays( gl.LINE_LOOP, i, 3 );
}
function antennaR1(){
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    modelViewMatrix = mult(modelViewMatrix,translate(0.08,0.45,0));
     modelViewMatrix = mult(modelViewMatrix,rotateZ(15));
    modelViewMatrix = mult(modelViewMatrix,scalem(0.01,0.2,0.01));

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

    for( var i=index/2; i<index; i+=3) 
       gl.drawArrays( gl.LINE_LOOP, i, 3 );
}
function antennaR2(){
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    modelViewMatrix = mult(modelViewMatrix,translate(0.21,0.75,0));
     modelViewMatrix = mult(modelViewMatrix,rotateZ(30));
    modelViewMatrix = mult(modelViewMatrix,scalem(0.01,0.2,0.01));

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

     for( var i=index/2; i<index; i+=3) 
       gl.drawArrays( gl.LINE_LOOP, i, 3 );
}
function antennaRC(){
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    modelViewMatrix = mult(modelViewMatrix,translate(0.33,0.94,0));
    modelViewMatrix = mult(modelViewMatrix,scalem(0.02,0.02,0.02));


    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

     for( var i=0; i<index/2; i+=3)  
       gl.drawArrays( gl.LINE_LOOP, i, 3 );
}
function antennaL1(){
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    modelViewMatrix = mult(modelViewMatrix,translate(-0.08,0.45,0));
     modelViewMatrix = mult(modelViewMatrix,rotateZ(-15));
    modelViewMatrix = mult(modelViewMatrix,scalem(0.01,0.2,0.01));

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

     for( var i=index/2; i<index; i+=3) 
       gl.drawArrays( gl.LINE_LOOP, i, 3 );
}
function antennaL2(){
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    modelViewMatrix = mult(modelViewMatrix,translate(-0.21,0.75,0));
    modelViewMatrix = mult(modelViewMatrix,rotateZ(-30));
    modelViewMatrix = mult(modelViewMatrix,scalem(0.01,0.2,0.01));

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

     for( var i=index/2; i<index; i+=3)  
       gl.drawArrays( gl.LINE_LOOP, i, 3 );
}
function antennaLC(){
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    modelViewMatrix = mult(modelViewMatrix,translate(-0.33,0.94,0));
    modelViewMatrix = mult(modelViewMatrix,scalem(0.02,0.02,0.02));


    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

      for( var i=0; i<index/2; i+=3) 
       gl.drawArrays( gl.LINE_LOOP, i, 3 );
}


function bg(){
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi), 
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    modelViewMatrix = mult(modelViewMatrix,translate(-0.33,0.94,0));
    modelViewMatrix = mult(modelViewMatrix,scalem(0.02,0.02,0.02));


    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );

     gl.drawArrays( gl.TRIANGLES, index, index+5);
}


function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    bg();

    body();
   
    wingsL1_1();
    wingsL1_2(); 
    wingsR1_1();
    wingsR1_2();
    antennaR1();
    antennaR2();
    antennaRC();
    antennaL1();
    antennaL2();
    antennaLC();
   
    

    window.requestAnimFrame(render);


}
