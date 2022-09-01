// 함수 바로 호출
(() => {
    // 전역 변수 사용을 피하기 위해 함수 안에서 진행

    // 각 씬 정보를 담고있는 배열, 객체 4개 생성(스크롤 섹션 4개라서)
    // 1. 스크롤 높이 정보
    // scrollHeight: 0 으로 하는 이유, 각 디바이스마다 다르기 때문에 높이를 고정값으로 받지 않음, 스크린의 높이에 대한 배수로 할 것임
    // 각 디바이스의 높이를 읽고 x 5배(HeightNum)
    // 애니메이션 효과 있는 부분은 sticky 보통 스크롤인 것은 normal로 type 적용
    // 2. 몇번째 섹션이 스크롤 중인지 판별

    let yOffset = 0; // window.pageYOffset 대신 쓸 변수
    let prevScrollHeight = 0; // 현재 스크롤 위치보다 이전에 위치한 스크롤 섹션들의 스크롤 높이값의 합
    let currentScene = 0; // 현재 눈 앞에 보고 있는 씬
    let enterNewScene = false; // 새로운 scene이 시작된 순간 true
    let acc = 0.1; // 애니메이션 가속도
    let delayedYOffset = 0; //
    let rafId; 
    let rafState; // 애니메이션 정지 관련

    const sceneInfo = [
        {
            // 0
            type: 'sticky',
            HeightNum: 5, // 브라우저 높이의 5배로 scrollHeight 세팅
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-0'),
                // 애니메이션에 조작할 오브젝트들 가져옴
                messageA: document.querySelector('#scroll-section-0 .main-message.a'),
                messageB: document.querySelector('#scroll-section-0 .main-message.b'),
                messageC: document.querySelector('#scroll-section-0 .main-message.c'),
                messageD: document.querySelector('#scroll-section-0 .main-message.d'),
                // 캔버스 가져오기
                canvas: document.querySelector('#video-canvas-0'),
                // 콘텍스트 가져오기
                context: document.querySelector('#video-canvas-0').getContext('2d'),
                videoImages: []
            },
            // 투명도 변화와 y값 변화
            values: {
                videoImageCount: 300, // 이미지 갯수
                imageSequence: [0,299], // 이미지 순서
                canvas_opacity: [1, 0, {start: 0.9, end: 1}],
                messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2}], // 0~1 투명도 변화, 변화 타이밍 0.1~0.2 
                messageB_opacity_in: [0, 1, { start: 0.3, end: 0.4}],
                messageC_opacity_in: [0, 1, { start: 0.5, end: 0.6 }],
				messageD_opacity_in: [0, 1, { start: 0.7, end: 0.8 }],
                messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2}], // 20~0, y값 20% 내렸다가 원래자리로 이동
                messageB_translateY_in: [20, 0, { start: 0.3, end: 0.4 }],
				messageC_translateY_in: [20, 0, { start: 0.5, end: 0.6 }],
				messageD_translateY_in: [20, 0, { start: 0.7, end: 0.8 }],
                messageA_opacity_out: [1, 0, { start: 0.25, end: 0.3}], // 투명도 1~0
                messageB_opacity_out: [1, 0, { start: 0.45, end: 0.5 }],
				messageC_opacity_out: [1, 0, { start: 0.65, end: 0.7 }],
				messageD_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
                messageA_translateY_out: [0, -20, { start: 0.25, end: 0.3}], // y값은 음수가 되어야 위로 올라감
                messageB_translateY_out: [0, -20, { start: 0.45, end: 0.5 }],
				messageC_translateY_out: [0, -20, { start: 0.65, end: 0.7 }],
				messageD_translateY_out: [0, -20, { start: 0.85, end: 0.9 }]
            }
        },
        {
            // 1
            type: 'normal', 
            // HeightNum: 5, // 노말엔 굳이 필요 없음
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-1')
            }
        },
        {
            // 2
            type: 'sticky',
            HeightNum: 5, // 브라우저 높이의 5배로 scrollHeight 세팅
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-2'),
				messageA: document.querySelector('#scroll-section-2 .a'),
				messageB: document.querySelector('#scroll-section-2 .b'),
				messageC: document.querySelector('#scroll-section-2 .c'),
                pinB: document.querySelector('#scroll-section-2 .b .pin'),
				pinC: document.querySelector('#scroll-section-2 .c .pin'),
                canvas: document.querySelector('#video-canvas-1'),
                context: document.querySelector('#video-canvas-1').getContext('2d'),
                videoImages: []
            },
            values: {
                videoImageCount: 960, // 이미지 갯수
                imageSequence: [0,959], // 이미지 순서
                canvas_opacity_in: [0, 1, {start: 0, end: 0.1}],
                canvas_opacity_out: [1, 0, {start: 0.95, end: 1}],
                messageA_translateY_in: [20, 0, { start: 0.15, end: 0.2 }],
				messageB_translateY_in: [30, 0, { start: 0.5, end: 0.55 }],
				messageC_translateY_in: [30, 0, { start: 0.72, end: 0.77 }],
				messageA_opacity_in: [0, 1, { start: 0.15, end: 0.2 }],
				messageB_opacity_in: [0, 1, { start: 0.5, end: 0.55 }],
				messageC_opacity_in: [0, 1, { start: 0.72, end: 0.77 }],
				messageA_translateY_out: [0, -20, { start: 0.3, end: 0.35 }],
				messageB_translateY_out: [0, -20, { start: 0.58, end: 0.63 }],
				messageC_translateY_out: [0, -20, { start: 0.85, end: 0.9 }],
				messageA_opacity_out: [1, 0, { start: 0.3, end: 0.35 }],
				messageB_opacity_out: [1, 0, { start: 0.58, end: 0.63 }],
				messageC_opacity_out: [1, 0, { start: 0.85, end: 0.9 }],
				pinB_scaleY: [0.5, 1, { start: 0.5, end: 0.55 }],
				pinC_scaleY: [0.5, 1, { start: 0.72, end: 0.77 }],
				pinB_opacity_in: [0, 1, { start: 0.5, end: 0.55 }],
				pinC_opacity_in: [0, 1, { start: 0.72, end: 0.77 }],
				pinB_opacity_out: [1, 0, { start: 0.58, end: 0.63 }],
				pinC_opacity_out: [1, 0, { start: 0.85, end: 0.9 }]
            }
        },
        {
            // 3
            type: 'sticky',
            HeightNum: 5, // 브라우저 높이의 5배로 scrollHeight 세팅
            scrollHeight: 0,
            objs: {
                container: document.querySelector('#scroll-section-3'),
                canvasCaption: document.querySelector('.canvas-caption'),
                canvas: document.querySelector('.image-blend-canvas'),
                context: document.querySelector('.image-blend-canvas').getContext('2d'),
                imagesPath: [
                    './images/blend-image-1.jpg',
                    './images/blend-image-2.jpg',
                ],
                images: [] // 이미지 객체들을 푸시해서 넣기
            },
            values: {
                rect1X: [ 0, 0, { start: 0, end: 0 }], // 왼쪽 사진 가리는 기둥, 화면 크기가 달라질 수 있어서 0으로 세팅
                rect2X: [ 0, 0, { start: 0, end: 0 }], // 오른쪽 사진 가리는 기둥
                blendHeight: [ 0, 0, { start: 0, end: 0 }],
                canvas_scale: [ 0, 0, { start: 0, end: 0 }],
                canvasCaption_opacity: [ 0, 1, { start: 0, end: 0 }],
                canvasCaption_translateY: [ 20, 0, { start: 0, end: 0 }],
                rectStartY: 0,
            }
        }
    ];
    // canvas에 그려서 처리할 이미지들 세팅
    function setCanvasImages() {
        let imgElem; // 이미지 객체
        for(let i=0;i<sceneInfo[0].values.videoImageCount;i++){
            imgElem = new Image(); // 이미지 객체 생성
            // imgElem = document.createElement('img') // 이미지 객체 생성

            // imgElem.src = `../apple-clone-v11/video/001/IMG_${6726 + i}.JPG`; // 이미지 주소
            imgElem.src = `./video/001/IMG_${6726 + i}.JPG`; // 이미지 주소
            
            sceneInfo[0].objs.videoImages.push(imgElem); // 배열에 넣기(그릴때 갖다 쓸려고 넣는것), 그리는 건 playAnimation 함수에서 함
        }
        // console.log(sceneInfo[0].objs.videoImages);
        let imgElem2; // 이미지 객체
        for(let i=0;i<sceneInfo[2].values.videoImageCount;i++){
            imgElem2 = new Image(); // 이미지 객체 생성
            imgElem2.src = `./video/002/IMG_${7027 + i}.JPG`; // 이미지 주소
            sceneInfo[2].objs.videoImages.push(imgElem2);
        }

        let imgElem3;
        for(let i=0;i<sceneInfo[3].objs.imagesPath.length; i++){
            imgElem3 = new Image(); // 이미지 객체 생성
            imgElem3.src = sceneInfo[3].objs.imagesPath[i]; // 이미지 주소
            sceneInfo[3].objs.images.push(imgElem3);
        }
        // console.log(sceneInfo[3].objs.images);

    }
    

    function checkMenu() {
        if (yOffset > 44) {
            document.body.classList.add('local-nav-sticky');
        } else {
            document.body.classList.remove('local-nav-sticky');
        }
    }

    function setLayout() {
        // 각 스크롤 섹션의 높이 세팅
        for (let i=0;i<sceneInfo.length;i++) {
            if(sceneInfo[i].type === 'sticky'){
                sceneInfo[i].scrollHeight = sceneInfo[i].HeightNum * window.innerHeight;
            } else if (sceneInfo[i].type === 'normal') {
                sceneInfo[i].scrollHeight = sceneInfo[i].objs.container.offsetHeight;
            }
            sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`; //${변수 사용가능} 

            
        }
        // console.log(sceneInfo); 

        yOffset = window.pageYOffset;
        // 새로고침 대처용
        let totalScrollHeight = 0;
        for (let i=0;i<sceneInfo.length;i++){
            totalScrollHeight += sceneInfo[i].scrollHeight;
            if(totalScrollHeight >= yOffset) {
                currentScene = i;
                break;
            }
        }
        document.body.setAttribute('id', `show-scene-${currentScene}`);

        const heightRatio = window.innerHeight / 1080; // 사진을 디바이스들의 높이에 딱 맞추기,  
        // 윈도우창 높이 / 캔버스 크기
        sceneInfo[0].objs.canvas.style.transform = `translate3d(-50%,-50%,0) scale(${heightRatio})`; // 1 => 100%, 원래크기
        sceneInfo[2].objs.canvas.style.transform = `translate3d(-50%,-50%,0) scale(${heightRatio})`; 
    }

    // 투명도 변화 계산, 현재 Y값(각 섹션마다 얼마만큼 비율이 스크롤 됐는지)
    // 1번 섹션일때, 1번 섹션만 애니메이션 활성화(시작 0, 끝 1)
    // 2번 섹션이면, 2번 섹션만 애니메이션 활성화
    // 비율에 따라 투명도, 애니메이션 -> css 적용
    function calcValues(values, currentYOffset) {
        let rv;
        // 현재 씬에서 스크롤된 범위를 비율로 구하기
        const scrollHeight = sceneInfo[currentScene].scrollHeight;
        const scrollRatio = currentYOffset / scrollHeight;

        if(values.length === 3) {
            // start ~ end 사이에 애니메이션 실행
            const partScrollStart = values[2].start * scrollHeight;
            const partScrollEnd = values[2].end * scrollHeight;
            const partScrollHeight = partScrollEnd - partScrollStart; 

            if(currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd) {
                rv = (currentYOffset - partScrollStart) / partScrollHeight * (values[1] - values[0]) + values[0]
            } else if (currentYOffset < partScrollStart) {
                rv = values[0];
            } else if (currentYOffset > partScrollStart) {
                rv = values[1];
            }   
        } 
        else {
            rv = scrollRatio * (values[1]-values[0]) + values[0];
        }

        return rv;
    }

    function playAnimation() {
        const objs = sceneInfo[currentScene].objs;
        const values = sceneInfo[currentScene].values;
        const currentYOffset = yOffset-prevScrollHeight;
        const scrollHeight = sceneInfo[currentScene].scrollHeight; 
        const scrollRatio = currentYOffset / scrollHeight; // ############################# 닷히 현재 씬의 비율 = 전체 y값 - 이전 씬 합값 

        // console.log(currentScene, currentYOffset);
        // console.log(currentScene,);

        switch (currentScene) {
            case 0:
                // console.log('0 play');
                
                // let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
                // console.log(sequence);
                // canvas 그리기 = context 이용
                // objs.context.drawImage(objs.videoImages[sequence], 0, 0); // 이미지 객체, x:0, y:0 ,width, height 에 그려라, 캔버스 크기 = 이미지 크기 따라서 생략함
                objs.canvas.style.opacity = calcValues(values.canvas_opacity, currentYOffset);

                if (scrollRatio <= 0.22) {
                    // in
                    objs.messageA.style.opacity = calcValues(values.messageA_opacity_in,currentYOffset);
                    objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
                } else {
                    // out
                    objs.messageA.style.opacity = calcValues(values.messageA_opacity_out,currentYOffset);
                    objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
                }

                if (scrollRatio <= 0.42) {
					// in
					objs.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
					objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
				} else {
					// out
					objs.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
					objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
				}

				if (scrollRatio <= 0.62) {
					// in
					objs.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
					objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
				} else {
					// out
					objs.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
					objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
				}

				if (scrollRatio <= 0.82) {
					// in
					objs.messageD.style.opacity = calcValues(values.messageD_opacity_in, currentYOffset);
					objs.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_in, currentYOffset)}%, 0)`;
				} else {
					// out
					objs.messageD.style.opacity = calcValues(values.messageD_opacity_out, currentYOffset);
					objs.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_out, currentYOffset)}%, 0)`;
				}

                
                // let messageA_opacity_1 = values.messageA_opacity[1];
                // console.log(messageA_opacity_0, messageA_opacity_1);
                // console.log(messageA_opacity_in, messageA_opacity_out);
                
                break;
            case 1:
                // console.log('1 play');
                break;
            case 2:
                // console.log('2 play');
                // let sequence2 = Math.round(calcValues(values.imageSequence, currentYOffset));
                // objs.context.drawImage(objs.videoImages[sequence2], 0, 0);  

                if (scrollRatio <= 0.5) {
                    // in
                    objs.canvas.style.opacity = calcValues(values.canvas_opacity_in, currentYOffset);
                } else {
                    // out
                    objs.canvas.style.opacity = calcValues(values.canvas_opacity_out, currentYOffset);
                }

				if (scrollRatio <= 0.25) {
					// in
					objs.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
					objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
				} else {
					// out
					objs.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
					objs.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
				}

				if (scrollRatio <= 0.57) {
					// in
					objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
					objs.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
					objs.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
				} else {
					// out
					objs.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
					objs.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
					objs.pinB.style.transform = `scaleY(${calcValues(values.pinB_scaleY, currentYOffset)})`;
				}

				if (scrollRatio <= 0.83) {
					// in
					objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
					objs.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
					objs.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
				} else {
					// out
					objs.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
					objs.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
					objs.pinC.style.transform = `scaleY(${calcValues(values.pinC_scaleY, currentYOffset)})`;
				}

                // currentScene 3 에서 쓰는 캔버스를 미리 그려주기 시작
                if (scrollRatio > 0.9) {
                    const widthRatio = window.innerWidth / objs.canvas.width;
                    const heightRatio = window.innerHeight / objs.canvas.height;
                    let canvasScaleRatio;

                    if ( widthRatio <= heightRatio) {
                        // 캔버스보다 브러우저 창이 홀쭉한 경우
                        canvasScaleRatio = heightRatio;
                    } else {
                        // 캔버스보다 브러우저 창이 납작한 경우
                        canvasScaleRatio = widthRatio;
                    }
                }

                break;
            case 3:
                // console.log('3 play');
                // 가로 세로 모두 꽉 차게 하기 위해 여기서 세팅(계산)
                let step = 0;
                const widthRatio = window.innerWidth / objs.canvas.width;
                const heightRatio = window.innerHeight / objs.canvas.height;
                let canvasScaleRatio;
  
                if (widthRatio <= heightRatio) {
                    // 컌버스보다 브라우저 창이 홀쭉한 경우
                    canvasScaleRatio = heightRatio;
                } else {
                    // 캔버스보다 브라우저 창이 납작한 경우
                    canvasScaleRatio = widthRatio;
                }

                objs.canvas.style.transform = `scale(${canvasScaleRatio})`;
                objs.context.fillStyle = 'white';
                objs.context.drawImage(objs.images[0], 0, 0);

                // 캔버스 사이즈에 맞춰 가정한 innerWidth와 innerHeight
                const recalculatedInnerWidth = document.body.offsetWidth / canvasScaleRatio;
                const recalculatedInnerHeight = window.innerHeight / canvasScaleRatio;
                // console.log(recalculatedInnerWidth, recalculatedInnerHeight);

                // 초기값만 들어가기
                if(!values.rectStartY) {
                    // values.rectStartY = objs.canvas.getBoundingClientRect().top;
                    values.rectStartY = objs.canvas.offsetTop + (objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2;
                    // console.log(values.rectStartY);

                    values.rect1X[2].start = (window.innerHeight / 2) / scrollHeight; // 
                    values.rect2X[2].start = (window.innerHeight / 2) / scrollHeight; // 
                    values.rect1X[2].end = values.rectStartY / scrollHeight; // 왼쪽 박스
                    values.rect2X[2].end = values.rectStartY / scrollHeight; // 오른쪽 박스
                    
                }
                



                const whiteRectWidth = recalculatedInnerWidth * 0.15;
                // 0: 출발값, 1: 최종값
                values.rect1X[0] = (objs.canvas.width - recalculatedInnerWidth) / 2;
                values.rect1X[1] = values.rect1X[0] - whiteRectWidth;
                values.rect2X[0] = values.rect1X[0] + recalculatedInnerWidth - whiteRectWidth;
                values.rect2X[1] = values.rect2X[0] + whiteRectWidth;



                
                // 좌우 흰색 박스 그리기(x, y, width, height)
                objs.context.fillRect(
                    parseInt(calcValues(values.rect1X, currentYOffset)),
                    0, 
                    parseInt(whiteRectWidth), 
                    objs.canvas.height
                );
                objs.context.fillRect(
                    parseInt(calcValues(values.rect2X, currentYOffset)),
                    0, 
                    parseInt(whiteRectWidth), 
                    objs.canvas.height
                );
                
                // objs.context.fillRect(values.rect1X[0], 0, parseInt(whiteRectWidth), recalculatedInnerHeight);
                // objs.context.fillRect(values.rect2X[0], 0, parseInt(whiteRectWidth), recalculatedInnerHeight);

                if (scrollRatio < values.rect1X[2].end) { // 캔버스가 브라우저 상단에 닿지 않았다면
                    step = 1;
                    // console.log('캔버스 닿기 전');
                    objs.canvas.classList.remove('sticky');
                } else {
                    step = 2;
                    // 이미지 블렌드
                    // console.log('캔버스 닿은 후');
                    // imageBlendY[0, 0, {start: 0, end: 0 } ]

                    values.blendHeight[0] = 0;
                    values.blendHeight[1] = objs.canvas.height;
                    values.blendHeight[2].start = values.rect1X[2].end;
                    values.blendHeight[2].end =  values.blendHeight[2].start + 0.2;
                    const blendHeight = calcValues(values.blendHeight, currentYOffset);

                    objs.context.drawImage(objs.images[1], 
                        0, objs.canvas.height - blendHeight, objs.canvas.width, blendHeight, // 소스 이미지
                        0, objs.canvas.height - blendHeight, objs.canvas.width, blendHeight //실제 캔버스
                    );

                    // objs.context.drawImage(objs.images[1], 0, 200, width, height);
                    // objs.context.drawImage(objs.images[1], 0, 200); // 임시 고정 이미지 위치 설정

                    objs.canvas.classList.add('sticky');
                    objs.canvas.style.top = `${-(objs.canvas.height - objs.canvas.height * canvasScaleRatio) / 2}px`;

                    if(scrollRatio > values.blendHeight[2].end){
                        values.canvas_scale[0] = canvasScaleRatio;
                        values.canvas_scale[1] = document.body.offsetWidth / (1.5 * objs.canvas.width);
                        // console.log(values.canvas_scale[0],values.canvas_scale[1]);
                        values.canvas_scale[2].start = values.blendHeight[2].end;
                        values.canvas_scale[2].end = values.canvas_scale[2].start + 0.2;

                        objs.canvas.style.transform = `scale(${calcValues(values.canvas_scale, currentYOffset)}`;
                        objs.canvas.style.marginTop = 0;
                    }

                    if(scrollRatio > values.canvas_scale[2].end && values.canvas_scale[2].end >0 ) {
                        // fixed 된 것을 static으로 변경
                        objs.canvas.classList.remove('sticky');
                        objs.canvas.style.marginTop = `${scrollHeight * 0.4}px`;

                        values.canvasCaption_opacity[2].start = values.canvas_scale[2].end;
                        values.canvasCaption_opacity[2].end = values.canvas_scale[2].end + 0.1;
                        values.canvasCaption_translateY[2].start = values.canvas_scale[2].end;
                        values.canvasCaption_translateY[2].end = values.canvas_scale[2].end + 0.1;


                        objs.canvasCaption.style.opacity = calcValues(values.canvasCaption_opacity,currentYOffset);
                        objs.canvasCaption.style.transform = `translate3d(0, ${calcValues(values.canvasCaption_translateY,currentYOffset)}%, 0)`;

                    }

                }

                break;
        }
    }
    

    function scrollLoop() {
        enterNewScene = false; // 기본은 false, 새로운 씬에 들어가면 true로 변경
        prevScrollHeight = 0;

        for (let i=0;i<currentScene;i++) {
            prevScrollHeight = prevScrollHeight + sceneInfo[i].scrollHeight;
        }
        // console.log(prevScrollHeight);

        if (delayedYOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
            enterNewScene = true;
            currentScene++;
            document.body.setAttribute('id', `show-scene-${currentScene}`);
        }
        if (delayedYOffset < prevScrollHeight ) {
            enterNewScene = true;
            if(currentScene === 0) return; // 브라우저 바운스 효과로 인해 마이너스가 되는 것 방지(모바일)
            currentScene--;
            document.body.setAttribute('id', `show-scene-${currentScene}`);
        }
        // console.log(yOffset);
        // console.log(currentScene);
        if(enterNewScene) return; // 씬이 바뀌는 순간, 이상한 값이 들어가면(음수) 함수 종료

        playAnimation();
    }

    function loop() {
        delayedYOffset = delayedYOffset + (yOffset - delayedYOffset) * acc;

        if(!enterNewScene){
            if(currentScene === 0 || currentScene === 2) {
                const currentYOffset = delayedYOffset-prevScrollHeight;
                const objs = sceneInfo[currentScene].objs;
                const values = sceneInfo[currentScene].values;
                // console.log('loop');
                let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
                if(objs.videoImages[sequence]) { // 사진이 존재하면 실행
                    objs.context.drawImage(objs.videoImages[sequence], 0, 0);
                }
            }
        }
        
        
        rafId = requestAnimationFrame(loop);
        

        if(Math.abs(yOffset - delayedYOffset) < 1) {
            cancelAnimationFrame(rafId);
            rafState = false;
        }

    }

    
    window.addEventListener('load', () => { // 로드가 된 후
        document.body.classList.remove('before-load');
        setLayout();
        sceneInfo[0].objs.context.drawImage(sceneInfo[0].objs.videoImages[0], 0, 0);

        window.addEventListener('scroll',() => {
            yOffset = window.pageYOffset; // 편하게 쓰기 위해 변수 선언
            scrollLoop();
            checkMenu();
    
            if(!rafState) {
                rafId = requestAnimationFrame(loop);
                rafState = true;
            }
        });

        window.addEventListener('resize', () => {
            if(window.innerWidth > 900) {
                setLayout();
            }
            sceneInfo[3].values.rectStartY = 0;
        });

        window.addEventListener('orientationchange', setLayout); // 모바일 회전할때 작동

        document.querySelector('.loading').addEventListener('transitionend', (e) => { // transition 이벤트가 끝날때 삭제
            document.body.removeChild(e.currentTarget);
        }); 
    }); 
    // load는 웹페이지 이미지, 리소스 등 다 업로드 된 후에 실행됨
    // DOMContentLoaded : html의 DOM 구조만 로드가 끝나면 바로 실행됨
    // 그래서 load 보다 DOMContentLoaded가 빠름
    // 하지만 지금 만드는 웹사이트는 이미지, 리소스가 있어야 의미있으므로 load 사용함
    
   
    


    setCanvasImages();
})();
// => 위랑 같음 (function() {})();