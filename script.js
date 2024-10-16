let currentQuestion = 1;
let correctAnswers = 0;
let correctEffect;

document.getElementById('close-btn').onclick = () => location.reload();

// Utility to initialize WebGL for effects on canvases
function initWebGL(canvas, vertexShaderSource, fragmentShaderSource) {
	const gl = canvas.getContext('webgl');
	if (!gl) {
		alert("WebGL not supported on your browser");
		return;
	}

	// Create shaders
	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderSource);
	gl.compileShader(vertexShader);

	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentShaderSource);
	gl.compileShader(fragmentShader);

	// Link shaders to create program
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.useProgram(program);

	// Set up positions and attributes
	const positionLocation = gl.getAttribLocation(program, 'a_position');
	const timeLocation = gl.getUniformLocation(program, 'u_time');
	const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
	const positionBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		-1, -1, 1, -1, -1, 1, 
		-1, 1, 1, -1, 1, 1
	]), gl.STATIC_DRAW);

	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	// Render loop
	function render() {
		const startTime = performance.now();
		const loop = () => {
			const currentTime = (performance.now() - startTime) * 0.001;
			gl.uniform1f(timeLocation, currentTime);
			gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
			gl.drawArrays(gl.TRIANGLES, 0, 6);
			requestAnimationFrame(loop);
		};
		loop();
	}

	return render;
}

// Setup question flow
function nextQuestion() {
	currentQuestion++;
	if (currentQuestion <= 3) {
		setupQuestion();
	} else {
		completeCaptcha();  // Complete the CAPTCHA if all questions are answered
	}
}

function setupQuestion() {
	switch (currentQuestion) {
		case 1:
			setupEffectQuestion();
			break;
		case 2:
			setupImageQuestion();
			break;
		case 3:
			setupButtonTextQuestion();
			break;
	}
}

// Select correct demoscene effect
function setupEffectQuestion() {
	const effects = ['Plasma', 'Moiré', 'Tunnel', 'Metaballs'];
	correctEffect = Math.floor(Math.random() * effects.length);
	document.getElementById('captcha-question').textContent = `Choose the correct Demoscene effect: ${effects[correctEffect]}`;
	setupCanvases();
	addGridClickEvents('.grid-box', handleEffectSelection);
}

function handleEffectSelection(selectedIndex) {
	if (selectedIndex === correctEffect) {
		correctAnswers++;
		clearCanvases();
		nextQuestion();
	} else {
		showWrongScreen();
	}
}

// Select correct image
function setupImageQuestion() {
	const pictures = ['01.jpg', '02.jpg', '03.jpg', '04.jpg'];
	const correctPicture = '04.jpg';
	document.getElementById('captcha-question').textContent = 'The best girl in Steins;Gate is:';
	fillGridWithImages(pictures, correctPicture, handleImageSelection);
}

function handleImageSelection(selectedPicture, correctPicture) {
	if (selectedPicture === correctPicture) {
		correctAnswers++;
		showCredentialsMessage();
		nextQuestion();
	} else {
		showWrongScreen();
	}
}

// Select correct text
function setupButtonTextQuestion() {
	const correctText = 'El Psy Kongroo';
	const texts = [
		'You are not alone',
		'The end is never the end is never...',
		'El Psy Kongroo',
		'I thought what I\'d do was, I\'d pretend I was one of those deaf-mutes'
	];
	document.getElementById('captcha-question').textContent = 'Select the correct phrase:';
	fillGridWithTextOptions(texts, correctText, handleTextSelection);
}

function handleTextSelection(selectedText, correctText) {
	if (selectedText.trim().toLowerCase() === correctText.trim().toLowerCase()) {
		correctAnswers++;
		nextQuestion();
	} else {
		showWrongScreen();
	}
}

// Utility functions
function setupCanvases() {
	const canvases = [
		{ id: 'canvas1', shader: plasmaFragmentShader },
		{ id: 'canvas2', shader: moireFragmentShader },
		{ id: 'canvas3', shader: tunnelFragmentShader },
		{ id: 'canvas4', shader: metaballsFragmentShader }
	];
	canvases.forEach(({ id, shader }) => {
		const canvas = document.getElementById(id);
		const render = initWebGL(canvas, vertexShaderSource, shader);
		render();
	});
}

function clearCanvases() {
	document.querySelectorAll('canvas').forEach(canvas => canvas.remove());
}

function fillGridWithImages(images, correctImage, onClickHandler) {
	const gridContainer = document.getElementById('box-grid');
	gridContainer.innerHTML = ''; // Clear the grid
	const shuffledImages = images.sort(() => Math.random() - 0.5);
	shuffledImages.forEach(image => {
		const gridBox = document.createElement('div');
		const img = document.createElement('img');
		img.src = image;
		img.alt = 'Captcha image';
		gridBox.classList.add('grid-box');
		gridBox.appendChild(img);
		gridContainer.appendChild(gridBox);
		img.onclick = () => onClickHandler(image, correctImage);
	});
}

function fillGridWithTextOptions(texts, correctText, onClickHandler) {
    const gridContainer = document.getElementById('box-grid');
    gridContainer.innerHTML = '';

    const shuffledTexts = texts.sort(() => Math.random() - 0.5);
    
    shuffledTexts.forEach((text, index) => {
        const gridBox = document.createElement('div');
        gridBox.classList.add('grid-box');
        gridBox.innerText = text;
        gridBox.onclick = () => onClickHandler(text, correctText);
        
        gridContainer.appendChild(gridBox);
    });

    setTimeout(() => {
        const gridBoxes = document.querySelectorAll('.grid-box');
        gridBoxes.forEach((box, index) => {
            box.classList.add('animate-wave');
            box.style.animationDelay = `${index * 0.1}s`;
        });
    }, 100);
}



function addGridClickEvents(selector, onClickHandler) {
	document.querySelectorAll(selector).forEach((box, index) => {
		box.onclick = () => onClickHandler(index);
	});
}

function showWrongScreen() {
	document.body.innerHTML = '';
	document.body.style.backgroundColor = 'red';
	document.body.style.overflow = 'hidden'; // Disable scrolling
	startCreatingDivs();
}

function showCredentialsMessage() {
	// Logic to show credentials message
}

// Div creation and removal for the wrong screen effect
let lockedCount = 0;
let intervalId;
let removalIntervalId;

function createDiv() {
	if (lockedCount < 50) {
		const div = document.createElement('div');
		div.textContent = 'LOCKED!';
		div.style = `
			position: absolute; 
			color: white; 
			font-size: ${Math.random() * 90 + 20}px; 
			top: ${Math.random() * 100}vh; 
			left: ${Math.random() * 100}vw; 
			transform: rotate(${Math.random() * 360 - 180}deg);
		`;
		document.body.appendChild(div);
		lockedCount++;
	} else {
		clearInterval(intervalId);
		setTimeout(startRemovingDivs, 3000);
	}
}

function removeDiv() {
	const divs = document.querySelectorAll('div');
	if (divs.length > 0) {
		divs[0].remove();
	} else {
		clearInterval(removalIntervalId);
		lockedCount = 0;
		startCreatingDivs();
	}
}

function startCreatingDivs() {
	intervalId = setInterval(createDiv, 100);
}

function startRemovingDivs() {
	removalIntervalId = setInterval(removeDiv, 100);
}

// Complete CAPTCHA logic
function completeCaptcha() {
	document.getElementById('myModal').style.display = 'none';
	document.getElementById('captcha-container').innerHTML = 'Captcha completed'; 
	document.getElementById('proceed-btn').disabled = false; 
}

// Modal and button logic
document.getElementById('captcha-btn').onclick = () => {
	document.getElementById('myModal').style.display = 'flex';
	setupQuestion();
};

document.getElementById('proceed-btn').onclick = () => {
	window.location.href = 'greetings.html';
};
