$().ready(
    () => {
        
        let clickDiv = -1;
        let autoIncrement = 1;
        const zero = {
            x: 227,
            y: 244
        };
        const resizers = document.getElementsByName("resizer");

        function getIndex(ele, arr) {
            for (let i = 0; i < arr.length; i++) {
                if (ele === arr[i])
                    return i;
            }
            return arr.length;
        }

        function resize(i) {
            let node = resizers[i];
            node.childNodes[0].style.width = node.style.width;
            node.childNodes[0].style.height = node.style.height;
            if (node.childNodes[0].childNodes[0] && node.childNodes[0].childNodes[0].name == "inputTextBox") {
                node.childNodes[0].childNodes[0].style.width = node.childNodes[0].style.width;
                node.childNodes[0].childNodes[0].style.height = node.childNodes[0].style.height;
            }
            console.log("resize : " + i);
        }

        function draggerSet(){
            let snapmode = document.getElementById("snap").checked;
            var clickHandle = -1;
            let temps = [];
            resizers.forEach(function(element, index) {
                if(snapmode){
                    let left = parseInt(element.style.left);
                    let top = parseInt(element.style.top);
                    let width = parseInt(element.style.width);
                    let height = parseInt(element.style.height);

                    element.style.left = zero.x + 73 - 300 + Math.floor(left / 100) * 100 + "px";
                    element.style.top = zero.y + 56 - 300 + Math.floor(top / 100) * 100 + "px";
                    element.style.width = Math.floor(width / 100) * 100 + "px";
                    element.style.height = Math.floor(height / 100) * 100 + "px";
                    resize(index);
                }
                temps.push({
                    l: parseInt(element.style.left),
                    t: parseInt(element.style.top)
                });
            });
            $("div[name='resizer']").resizable({
                containment: document.getElementById("main"),
                minHeight: 100,
                minWidth: 100,
                handles: "nw, n, ne, w, e, sw, s, se",
                grid: snapmode ? [100, 100] : [1, 1],
                resize: (event, ui) => {
                    let target = resizers[clickDiv];

                    if (snapmode) {
                        let width = parseInt(target.style.width);
                        let height = parseInt(target.style.height);
                        target.style.width = Math.floor(width / 100) * 100 + "px";
                        target.style.height = Math.floor(height / 100) * 100 + "px";
                    }
                    resize(clickDiv);
                }
            });

            $("div[name='resizer']").draggable({
                containment: document.getElementById("main"),
                grid: snapmode ? [100, 100] : [1, 1],
                cancel: "text",
                start: function() {
                    if(snapmode)
                        $(this).children('textarea').focus();
                },
                drag: function(event, ui) {
                    resize(clickDiv);
                },
                stop: function() {
                    if(snapmode)
                        $(this).children('textarea').focus();
                    temps[clickDiv] = {
                        l: parseInt(resizers[clickDiv].style.left),
                        t: parseInt(resizers[clickDiv].style.top)
                    };
                }
            });
            
            if(snapmode){
                resizers.forEach(function(element, index) {
                    resize(index);
                    let left = parseInt(element.style.left);
                    let top = parseInt(element.style.top);
                    let width = parseInt(element.style.width);
                    let height = parseInt(element.style.height);
                    temps.push({
                        l: left,
                        t: top,
                        w: width,
                        h: height
                    });
    
                });
            }
            hideBoxes();
        }

        let orderNum = 12;
        let currentPage = 0;

        function hideBoxes() {
            resizers.forEach(function(element, index) {
                let handles = element.querySelectorAll(".ui-resizable-handle");
                if (index != clickDiv) {
                    handles.forEach(function(ele) {
                        ele.style.visibility = "hidden";
                    });
                } else {
                    handles.forEach(function(ele) {
                        ele.style.visibility = "";
                    });
                }
            });
        }

        class Order {
            constructor(orderNum) {
                this.orderNum = orderNum;
                this.pages = [];
                for (let i = 0; i < 30; i++) {
                    this.pages.push(new Page(i));
                }
            }
            savePage(index) {
                this.pages[index].updateBlocks();
                this.pages[index].saveBlocks(this.orderNum);
                console.log("savePage : " + index);
            }
            cleanPage() {

                for (let i = resizers.length - 1; i >= 0; i--)
                    document.getElementById("myCanvas").removeChild(resizers[i]);

                console.log("cleanPage");
            }
            loadPage(index) {
                this.pages[index].loadBlocks(this.orderNum);
                this.pages[index].drawBlocks();
                currentPage = index;
                console.log("loadPage : " + index);
            }

            saveAllPages() {
                this.pages.forEach(function(element, index) {
                    this.savePage(index);
                }.bind(this));
                console.log("saveAllPages");
            }
            loadAllPages() {
                this.pages.forEach(function(element, index) {
                    this.loadPage(index);
                }.bind(this));
                this.cleanPage();
                this.loadPage(0);
                console.log("loadAllPages");
            }
            converter(pageNum) {
                $(".textBox").blur();

                resizers.forEach(function(element, index) {
                    let handles = element.querySelectorAll(".ui-resizable-handle");
                    handles.forEach(function(ele) {
                        ele.style.visibility = "hidden";
                    });
                });
                html2canvas($("#myCanvas"), {
                    width: 600,
                    height: 400,
                    x: 0,
                    y: 0,
                    onrendered: function(canvas) {
                        let dataURL = canvas.toDataURL('image/png', 1.0); // 크로스 도메인 문제 발생할 수 있음.
                        $.ajax({
                            type: "POST",
                            url: "./controller/converter.php",
                            async: false,
                            data: {
                                orderNum: orderNum,
                                pageNum: pageNum,
                                img: dataURL
                            }
                        }).done(function(o) {
                            console.log('saved');
                        });
                    }
                });
            }
            convertAll() {
                this.pages.forEach(function(element, index) {
                    this.cleanPage();
                    this.loadPage(index);
                    this.converter(index);
                }.bind(this));
            }
            createOrder() {
                $.ajax({
                    url: "./createOrder.php",
                    type: "post",
                    async: false,
                    data: {
                        orderNum: this.orderNum
                    }
                }).done(function(responseData) {
                    console.log("create order");
                });
            }
        }
        class Page {
            constructor(pageNum) {
                this.pageNum = pageNum;
                this.blocks = [];
                this.filter = "none";
            }
            saveBlocks(orderNum) {
                let data = [];
                this.blocks.forEach(function(element) {
                    data.push(element.getByJSON());
                });
                console.log("saveBlocks: " + JSON.stringify(data));
                $.ajax({
                    url: "./controller/saveSetting.php",
                    type: "post",
                    async: false,
                    data: {
                        orderNum: orderNum,
                        pageNum: this.pageNum,
                        data: JSON.stringify(data)
                    }
                }).done(function(responseData) {
                    console.log("saveBlocks done : " + responseData);
                });
            }
            loadBlocks(orderNum) {
                let arr = [];
                $.ajax({
                    url: `./order/${orderNum}/before/${this.pageNum}/setting.json`,
                    type: "post",
                    async: false,
                    contentType: "application/json; charset=utf-8",
                    context: this
                }).done(function(responseData) {
                    if (responseData != "")
                        arr = JSON.parse(JSON.stringify(responseData));
                    else
                        arr = [];
                }.bind(this));
                this.blocks = [];
                arr.forEach(function(element) {
                    let object;
                    if (element.type == "photo") {
                        object = new ImageBlock(element.object.src, element.left + zero.x, element.top + zero.y, element.width, element.height);
                    } else if (element.type == "textBox") {
                        object = new TextBlock(element.object.content, element.left + zero.x, element.top + zero.y, element.width, element.height, element.object.fontFamily, element.object.fontSize);
                    }
                    this.blocks.push(new Block(element.type, object, element.left + zero.x, element.top + zero.y, element.width, element.height));
                }.bind(this));

                let str = "[";

                this.blocks.forEach(function(element) {
                    str += JSON.stringify(element.getByJSON());
                    str += ", ";
                })
                str += "]";
                console.log(`loadBlocks : ${str}`);
            }

            drawBlocks() {
                this.blocks.forEach(function(element) {
                    if (typeof(element) == "object") {
                        element.draw();
                    }
                });
                draggerSet();
            }

            insertBlock(block) {
                this.blocks.push(block);
            }
            removeBlock(index) {
                this.blocks.splice(index, 1);
            }

            updateBlocks() {
                this.blocks = [];
                resizers.forEach(function(element) {
                    let object = {};
                    let left = parseInt(element.style.left) - zero.x;
                    let top = parseInt(element.style.top) - zero.y;
                    let width = parseInt(element.style.width) || 100;
                    let height = parseInt(element.style.height) || 100;
                    
                    let zIndex = element.style.zIndex;
                    if (element.childNodes[0].name == "photo") {
                        object = new ImageBlock(
                            element.childNodes[0].src, //`./order/${orderNum}/before/${currentPage}/${index}.png`,
                            left,
                            top,
                            width,
                            height,
                            zIndex
                        );
                    } else {
                        object = new TextBlock(
                            element.childNodes[0].innerHTML, //`./order/${orderNum}/before/${currentPage}/${index}.png`,
                            left,
                            top,
                            width,
                            height,
                            element.childNodes[0].style.fontFamily || "Nanum Gothic",
                            parseInt(element.childNodes[0].style.fontSize) || 64,
                            zIndex
                        );
                    }

                    this.blocks.push(new Block(
                        element.childNodes[0].name,
                        object,
                        left,
                        top,
                        width,
                        height,
                        zIndex
                    ));

                }.bind(this));
                console.log("updateBlocks : " + this.blocks);
            }
            setFilter(value) {
                this.filter = value;
            }
            applyFilter() {
                document.getElementsByName("photo").forEach(function(element) {
                    element.style.filter = this.filter;
                }.bind(this));
            }
        }

        class Block {
            constructor(type, object, left, top, width, height, zIndex = 0) {
                this.type = type;
                this.object = object;
                this.left = left;
                this.top = top;
                this.width = width;
                this.height = height;
                this.zIndex = zIndex;
            }
            draw() {
                let div = document.createElement("div");
                div.className = "drsElement drsMoveHandle";
                div.setAttribute("name", "resizer");
                div.style.display = "table";
                div.style.left = this.left + "px";
                div.style.top = this.top + "px";
                div.style.width = this.width + "px";
                div.style.height = this.height + "px";
                div.style.zIndex = 0; //this.zIndex;
                div.style.display = "table";


                div.onmousedown = () => {
                    clickDiv = getIndex(div, resizers);
                    this.upSort(clickDiv);
                    //div.style.zIndex = parseInt(div.style.zIndex)+1;
                    hideBoxes();
                    console.log("resizers[" + clickDiv + "].style.zIndex : " + div.style.zIndex);
                }
                div.appendChild(this.object.draw());
                document.getElementById("myCanvas").appendChild(div);

                console.log("draw : " + div.style);
            }
            update(object) {
                this.left = object.left; // + zero.x;
                this.top = object.top; // + zero.y;
                this.width = object.width;
                this.height = object.height;
                this.object.width = object.width;
                this.object.height = object.height;
            }
            upSort(clickDiv) {

                resizers[clickDiv].style.zIndex = autoIncrement++;
                console.log(`autoIncrement : ${autoIncrement}`);
            }
            getByJSON() {
                return {
                    type: this.type,
                    object: this.object.getByJSON(),
                    left: this.left,
                    top: this.top,
                    width: this.width,
                    height: this.height,
                    zIndex: this.zIndex
                };
            }
            setByJSON(set) {
                this.type = set.type;
                this.object = set.object.getByJSON();
                this.left = set.left;
                this.top = set.top;
                this.width = set.width;
                this.height = set.height;
                this.zIndex = set.zIndex;
            }
        }
        class ImageBlock {
            constructor(src, left, top, width, height, zIndex = 0) {
                this.src = src;
                this.left = left;
                this.top = top;
                this.width = width;
                this.height = height;
                this.zIndex = zIndex;
            }
            draw() {
                let img = document.createElement("img");
                img.src = this.src;
                img.name = "photo"
                img.className = "photo"
                img.style.left = this.left + "px";
                img.style.top = this.top + "px";
                img.style.width = this.width + "px";
                img.style.height = this.height + "px";

                return img;
            }
            update(object) {
                this.left = object.left + zero.x;
                this.top = object.top + zero.y;
                this.width = object.width;
                this.height = object.height;
            }
            getByJSON() {
                return {
                    src: this.src,
                    left: this.left,
                    top: this.top,
                    width: this.width,
                    height: this.height,
                    zIndex: this.zIndex
                };
            }
            setByJSON(set) {
                this.src = set.src;
                this.left = set.left;
                this.top = set.top;
                this.width = set.width;
                this.height = set.height;
                this.zIndex = set.zIndex;
            }
        }

        class TextBlock {
            constructor(content, left, top, width, height, fontFamily, fontSize, zIndex = 0) {
                this.content = content;
                this.left = left;
                this.top = top;
                this.width = width;
                this.height = height;
                this.fontFamily = fontFamily;
                this.fontSize = fontSize;
                this.zIndex = zIndex;
            }
            draw() {
                let Text = document.createElement("div");
                Text.name = "textBox";
                Text.className = "textBox";
                Text.innerHTML = this.content;
                Text.style.verticalAlign = "middle"
                Text.style.left = this.left + "px";
                Text.style.top = this.top + "px";
                Text.style.width = this.width + "px";
                Text.style.height = this.height + "px";
                Text.style.fontFamily = this.fontFamily;
                Text.style.fontSize = this.fontSize + "px";
                Text.style.display = "table-cell";
                Text.style.verticalAlign = "middle";
                Text.style.textAlign = "center";


                Text.ondblclick = (e) => {
                    if (!Text.childNodes[0].name) {
                        Text.innerHTML = "";
                        let inputText = document.createElement("input");
                        inputText.type = "text";
                        inputText.value = this.content;
                        inputText.name = "inputTextBox";
                        inputText.style.width = Text.style.width;
                        inputText.style.height = Text.style.height;
                        inputText.style.fontFamily = this.fontFamily;
                        inputText.style.fontSize = this.fontSize + "px";
                        inputText.style.textAlign = "center";

                        Text.appendChild(inputText);
                        inputText.focus();
                        inputText.onblur = (e) => {
                            let idx = getIndex(inputText, document.getElementsByName("inputTextBox"));
                            this.content = document.getElementsByName("inputTextBox")[idx].value;
                            this.fontFamily = document.getElementsByName("inputTextBox")[idx].style.fontFamily;
                            this.fontSize = parseInt(document.getElementsByName("inputTextBox")[idx].style.fontSize);

                            document.getElementsByName("inputTextBox")[idx].parentNode.innerHTML = this.content;
                            document.getElementsByName("inputTextBox")[idx].parentNode.style.fontFamily = this.fontFamily;
                            document.getElementsByName("inputTextBox")[idx].parentNode.style.fontSize = this.fontSize + "px";
                            inputText.parentNode.removeChild(inputText);
                        };

                    }
                }

                return Text;
            }
            changeFontFamily(index, value) {
                this.fontFamily = value;
                resizers[index].childNodes[0].style.fontFamily = this.fontFamily;
                console.log(resizers[index].childNodes[0].style.fontFamily);
            }
            changeFontSize(index, value) {
                this.fontSize = value;
                resizers[index].childNodes[0].style.fontSize = this.fontSize + "px";
                console.log(resizers[index].childNodes[0].style.fontSize);
            }
            update(object) {
                this.left = object.left + zero.x;
                this.top = object.top + zero.y;
                this.width = object.width;
                this.height = object.height;
            }
            getByJSON() {
                return {
                    content: this.content,
                    left: this.left,
                    top: this.top,
                    width: this.width,
                    height: this.height,
                    zIndex: this.zIndex,
                    fontFamily: this.fontFamily,
                    fontSize: this.fontSize
                };
            }
            setByJSON(set) {
                this.content = set.content;
                this.left = set.left;
                this.top = set.top;
                this.width = set.width;
                this.height = set.height;
                this.zIndex = set.zIndex;
                this.fontFamily = set.fontFamily;
                this.fontSize = set.fontSize;
            }
        }

        let order = new Order(orderNum);
        console.log("hello : " + order.pages[0].orderNum);
        //order.createOrder();
        order.loadAllPages(currentPage);

        document.getElementsByName("pageImg").forEach(function(element, index) {
            element.src = `order/${orderNum}/${index}.png`;
            element.onclick = () => {
                order.savePage(currentPage);
                order.cleanPage();
                order.loadPage(index);
                //location.href = `./index.html?currentPage=${index}`;
            }
            element.onerror = () => {
                element.src = `./alt.png`;
            }

        });

        document.addEventListener("keyup", function(e) {
            if (e.keyCode == 46) {
                document.getElementById("myCanvas").removeChild(resizers[clickDiv]);
                order.pages[currentPage].removeBlock(clickDiv);
            }
        }, false);

        document.getElementById("save").addEventListener("click", () => {
            order.savePage(currentPage);
        });
        document.getElementById("fileupload").addEventListener("change", upload);

        function upload() {
            let fileInput = document.getElementById("fileupload");
            let file = fileInput.files[0];

            let formData = new FormData();
            formData.enctype = "multipart/form-data";
            formData.append("orderNum", orderNum);
            formData.append("pageNum", currentPage);
            formData.append("fileupload[]", file);

            $.ajax({
                url: './controller/image.upload.php',
                data: formData,
                type: 'POST',
                async: false,
                contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
                processData: false, // NEEDED, DON'T OMIT THIS
                // ... Other options like success and etc
            }).done(function(responseData) {
                console.log("Image upload : " + responseData);
                let last = order.pages[currentPage].blocks.length;
                let imageBlock = new ImageBlock(`./order/${orderNum}/before/${currentPage}/${responseData}`, zero.x, zero.y, 100, 100);

                order.pages[currentPage].blocks.push(new Block("image", imageBlock, zero.x, zero.y, 100, 100));
                order.pages[currentPage].blocks[last].draw();
                console.log()
            });
            draggerSet();
        }

        document.getElementById("newText").addEventListener("click", newText);

        function newText() {
            let last = order.pages[currentPage].blocks.length;
            let textBlock = new TextBlock(`텍스트`, zero.x, zero.y, 100, 100, "Nanum Gothic", 64);

            order.pages[currentPage].blocks.push(new Block("textBox", textBlock, zero.x, zero.y, 100, 100));
            order.pages[currentPage].blocks[last].draw();
            console.log()

            draggerSet();
        }

        document.getElementById("converter").addEventListener("click", () => {
            order.savePage(currentPage);
            order.converter(currentPage);
        });
        document.getElementById("convertAll").addEventListener("click", () => {
            order.savePage(currentPage);
            order.convertAll();
        });
        document.getElementsByName("collage")[0].addEventListener("click", () => {
            let arranges = []
            for (let i = 0; i <= 400; i += 100) {
                for (let j = 0; j <= 600; j += 100) {
                    arranges.push({
                        left: j,
                        top: i,
                        width: 100,
                        height: 100
                    });
                }
            }
            arranges.forEach(function(element, index) {

                if (order.pages[currentPage].blocks[index]) {
                    let b = order.pages[currentPage].blocks;
                    b[index].prototype = Block.prototype;
                    order.pages[currentPage].blocks[index].update(element);
                }
            });
            order.cleanPage();
            order.pages[currentPage].drawBlocks();

        });
        document.getElementsByName("collage")[1].addEventListener("click", () => {
            let arranges = [{
                    left: 0,
                    top: 0,
                    width: 300,
                    height: 200
                },
                {
                    left: 300,
                    top: 0,
                    width: 300,
                    height: 200
                },
                {
                    left: 0,
                    top: 200,
                    width: 300,
                    height: 200
                },
                {
                    left: 300,
                    top: 200,
                    width: 300,
                    height: 200
                },
            ];
            arranges.forEach(function(element, index) {
                console.log(order.pages[currentPage].blocks[index]);
                if (order.pages[currentPage].blocks[index]) {
                    order.pages[currentPage].blocks[index].update(element);
                }
            });
            order.cleanPage();
            order.pages[currentPage].drawBlocks();

        });
        document.getElementById("snap").addEventListener("change", draggerSet);

        document.getElementById("filter").addEventListener("change", filtering);

        function filtering() {
            let val = document.getElementById("filter").value;
            order.pages[currentPage].setFilter(val);
            order.pages[currentPage].applyFilter();
            console.log("filtering : " + val);
        }

        document.getElementById("fontFamily").addEventListener("change", () => {
            if (clickDiv == -1)
                return;
            let val = document.getElementById("fontFamily").value;
            order.pages[currentPage].blocks[clickDiv].object.changeFontFamily(clickDiv, val);
        });
        document.getElementById("fontSize").addEventListener("change", () => {
            if (clickDiv == -1)
                return;
            let val = document.getElementById("fontSize").value;
            order.pages[currentPage].blocks[clickDiv].object.changeFontSize(clickDiv, val);
        });

    });