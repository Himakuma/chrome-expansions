const prefixName = "bear-notion-extensions-";

function svgScale(wheelEvent, svgElement) {
    let scale = 1.02;
    if (wheelEvent.deltaY < 0) {
        scale = Math.pow(scale, -1);
    }

    const [currentX, currentY, currentW, currentH] = svgElement.getAttribute("viewBox").split(' ').map(s => parseFloat(s));

    const x = currentX + currentW * (wheelEvent.offsetX / svgElement.clientWidth);
    const y = currentY + currentH * (wheelEvent.offsetY / svgElement.clientHeight);
    const scaleX = x + scale * (currentX - x);
    const scaleY = y + scale * (currentY - y);

    const scaleW = currentW * scale;
    const scaleH = currentH * scale;

    const scaleViewBox = [scaleX, scaleY, scaleW, scaleH].map(s => s.toFixed(2)).join(' ');

    svgElement.setAttribute("viewBox", scaleViewBox);
}

function svgMove(svgElement) {
    const parent = svgElement.parent;
    const selectedAttreName = prefixName + "svgmove";
    let prevX = 0;
    let prevY = 0;
    svgElement.addEventListener("mousedown", ev => {

        ev.preventDefault();
        prevX = ev.clientX;
        prevY = ev.clientY;
        svgElement.setAttribute(selectedAttreName, "true");
    });

    svgElement.addEventListener("mousemove", ev => {
        ev.preventDefault();

        if (svgElement.getAttribute(selectedAttreName) == null) {
            return;
        }

        const [currentX, currentY, currentW, currentH] = svgElement.getAttribute("viewBox").split(' ').map(s => parseFloat(s));

        var x = currentX - (ev.clientX - prevX);
        var y = currentY - (ev.clientY - prevY);
        prevX = ev.clientX;
        prevY = ev.clientY;

        const viewBox = [x, y, currentW, currentH].map(s => s.toFixed(2)).join(' ');
        svgElement.setAttribute("viewBox", viewBox);

    });

    svgElement.addEventListener("mouseup", ev => {
        svgElement.removeAttribute(selectedAttreName);
    });
}

function onMutationObserverCallback(mutationsList, observer) {

    // 対象のSVGタグを取得
    const addEventSuccessName = prefixName + "addevent-success";
    const svgSelector = "svg[role='graphics-document document']:not([" + addEventSuccessName + "])";
    const svgTags = document.querySelectorAll(svgSelector);
    if (svgTags.length == 0) {
        return;
    }

    const backDivId = prefixName + "svg-modal-back-div";
    const backSvgDivId = prefixName + "svg-modal-contents-div";

    let modalDiv = document.getElementById(backDivId);
    let modalSvgDiv = document.getElementById(backSvgDivId);
    if (modalDiv == null) {

        function setModalDefaultStyle(element) {
            element.style.width = "100%";
            element.style.height = "100%";
            element.style.position = "absolute";
            element.style.zIndex = "10000";
            element.style.display = "none";
            element.style.top = "0";
            element.style.left = "0";
        }

        modalDiv = document.createElement("div");
        modalDiv.id = backDivId;
        setModalDefaultStyle(modalDiv);

        // 背景
        modalBackDiv = document.createElement("div");
        setModalDefaultStyle(modalBackDiv);
        modalBackDiv.style.backgroundColor = "#c0c0c0";
        modalBackDiv.style.opacity = "0.5";
        modalBackDiv.style.display = "block";
        modalBackDiv.style.zIndex = "11000";
        modalDiv.appendChild(modalBackDiv);

        // SVG表示領域
        modalSvgDiv = document.createElement("div");
        setModalDefaultStyle(modalSvgDiv);
        modalSvgDiv.id = backSvgDivId;
        modalSvgDiv.style.display = "block";
        modalSvgDiv.style.zIndex = "12000";
        modalSvgDiv.style.left = "10%";
        modalSvgDiv.style.top = "0";
        modalSvgDiv.style.width = "80%";
        modalDiv.appendChild(modalSvgDiv);

        modalBackDiv.addEventListener("click", ev => {
            modalDiv.style.display = "none";
            modalSvgDiv.children[0].remove();
        });

        document.body.appendChild(modalDiv);
    }

    for (const svgElement of svgTags) {
        const contenteditableElement = svgElement.closest("div[data-content-editable-void]");
        svgElement.setAttribute(addEventSuccessName, "true");
        svgElement.addEventListener("dblclick", ev => {

            const svgCloneElement = svgElement.cloneNode(true);
            svgCloneElement.style.width = "100%";
            svgCloneElement.style.height = "100%";
            svgCloneElement.style.maxWidth = "100%";
            svgCloneElement.style.maxHeight = "100%";
            svgCloneElement.addEventListener("wheel", ev => {
                ev.preventDefault();
                svgScale(ev, svgCloneElement);
            });

            svgMove(svgCloneElement);

            modalSvgDiv.style.backgroundColor = window.getComputedStyle(contenteditableElement).backgroundColor;
            modalSvgDiv.appendChild(svgCloneElement);
            modalDiv.style.display = "block";
        });
    }
};




const observer = new MutationObserver(onMutationObserverCallback);
const notionAppId = "notion-app";
function codeMermaidMain(e) {
    const delayMainInterval = setInterval(delayMain, 100);
    function delayMain() {
        const notionApp = document.getElementById(notionAppId);
        if (notionApp == null) {
            return;
        }

        clearInterval(delayMainInterval)
        const config = { attributes: true, childList: true, subtree: true };
        observer.observe(notionApp, config);
    }
}

window.addEventListener("load", codeMermaidMain, false);

