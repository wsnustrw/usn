importScripts(
    '../../libs/three/build/three.min.js',
    '../../libs/three/custom/wrk.ExtrudeGeometryNoCaps.js',
    '../../libs/three/custom/wrk.BufferGeometryUtils.js'
);

function xRand(min, max, round) {
    if (round === true) {
        return Math.round(Math.random() * (max - min) + min);
    } else {
        return (Math.random()) * (max - min) + min;
    }
}

function RenderLights(app, positions, src, pos) {
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    app.scene.add(geometry, 'lights', src, pos);
}

function GenerateBuildings(app, json, fn) {

    let baseHeight = 0.002;
    let windowHeight = 0.0025;
    let roofHeight = 0.0003;

    let light_positions = [
        [],
        [],
        [],
        []
    ];

    let center = new THREE.Vector3();

    let base_geometries = [];
    let window_geometries = [];
    let rooftop_geometries = [];
    let shape, baseGeo, windowGeo, rooftopFloor, roofShape, roofGeo, xpos;
    let needle = true;

    for (let i = 0; i < json.length; i++) {

        if (app.quality <= 2) {
            needle = i % 4 >= 2;
        } else {
            needle = i % 4 > 1;
        }

        if (needle && json[i].c.length > 2) {

            shape = new THREE.Shape(json[i].c);

            baseGeo = new ExtrudeBufferGeometryNoCaps(shape, {
                depth: baseHeight,
                steps: 1,
                bevelEnabled: false,
                lid: 'none'
            });
            baseGeo.rotateX(Math.PI / -2);
            baseGeo.computeBoundingBox();
            baseGeo.boundingBox.getCenter(center);
            base_geometries.push(baseGeo);

            windowGeo = new ExtrudeBufferGeometryNoCaps(shape, {
                depth: windowHeight * json[i].s,
                steps: 1,
                bevelEnabled: false,
                lid: 'none'
            });
            windowGeo.rotateX(Math.PI / -2);
            windowGeo.translate(0, baseHeight, 0);
            window_geometries.push(windowGeo);

            rooftopFloor = new ExtrudeBufferGeometryNoCaps(shape, {
                depth: 0,
                steps: 0,
                bevelEnabled: false,
                lid: 'top'
            });
            rooftopFloor.rotateX(Math.PI / -2);
            rooftopFloor.translate(0, baseHeight + (json[i].s * windowHeight), 0);
            rooftop_geometries.push(rooftopFloor);

            if (json[i].r.length > 2) {

                roofShape = new THREE.Shape(json[i].c);
                roofShape.holes.push(new THREE.Shape(json[i].r));

                roofGeo = new ExtrudeBufferGeometryNoCaps(roofShape, {
                    depth: roofHeight,
                    steps: 1,
                    bevelEnabled: false,
                    lid: 'top'
                });
                roofGeo.rotateX(Math.PI / -2);
                roofGeo.translate(0, baseHeight + (json[i].s * windowHeight) + 0, 0);
                rooftop_geometries.push(roofGeo);

            }

            if (json[i].s > 3 && i % 2) {
                xpos = xRand(0, 3, true);
                light_positions[xpos].push(center.x);
                light_positions[xpos].push(baseHeight + (json[i].s * windowHeight) + (windowHeight / 2));
                light_positions[xpos].push(center.z);
            }

        }
    }

    if (base_geometries.length > 0) {
        app.scene.add(BufferGeometryUtils.mergeBufferGeometries(base_geometries, true), 'base_block', 'buildings');
    }
    if (window_geometries.length > 0) {
        app.scene.add(BufferGeometryUtils.mergeBufferGeometries(window_geometries, true), 'window_block', 'buildings');
    }
    if (rooftop_geometries.length > 0) {
        app.scene.add(BufferGeometryUtils.mergeBufferGeometries(rooftop_geometries, true), 'rooftop_block', 'buildings');
    }

    RenderLights(app, light_positions[0], 'buildings', 0);
    RenderLights(app, light_positions[1], 'buildings', 1);
    RenderLights(app, light_positions[2], 'buildings', 2);
    RenderLights(app, light_positions[3], 'buildings', 3);

    fn();
}

function BuildingsGen(app, json, fn) {
    function checkLoaded(count) {
        if (json.length * json.length === count) {
            fn();
        }
    }
    let loadedCount = 0;
    for (var x = 0; x < json.length; x++) {
        for (var y = 0; y < json[x].length; y++) {
            GenerateBuildings(app, json[x][y], function() {
                loadedCount++;
                checkLoaded(loadedCount);
            });
        }
    }
}


function GenerateBlocks(app, blocks, fn) {

    let light_positions = [
        [],
        [],
        [],
        []
    ];

    let buildingsGeos = [];
    let blocksGeos = [];
    let roofGeos = [];

    let center = new THREE.Vector3();

    let matIds = 0;
    let baseGeo, roofGeo, shape;
    let needle = true;

    for (var i = 0; i < blocks.length; i++) {
        if (blocks[i].c.length > 0) {

            shape = new THREE.Shape(blocks[i].c);

            if (app.quality <= 2) {
                needle = i % 4 >= 2;
            } else {
                needle = i % 4 > 1;
            }

            if (needle && blocks[i].h > 0.006 && blocks[i].c.length < 32) {

                matIds++;

                baseGeo = new ExtrudeBufferGeometryNoCaps(shape, {
                    depth: blocks[i].h,
                    steps: 1,
                    bevelEnabled: false,
                    material: 0,
                    extrudeMaterial: 0,
                    lid: 'none'
                });
                baseGeo.rotateX(Math.PI / -2);
                baseGeo.computeBoundingBox();
                buildingsGeos.push(baseGeo);

                roofGeo = new ExtrudeBufferGeometryNoCaps(shape, {
                    depth: 0,
                    steps: 0,
                    bevelEnabled: false,
                    material: 0,
                    extrudeMaterial: 0,
                    lid: 'top'
                });
                roofGeo.rotateX(Math.PI / -2);
                roofGeo.translate(0, blocks[i].h, 0);
                roofGeo.computeBoundingBox();
                roofGeos.push(roofGeo);

                baseGeo.boundingBox.getCenter(center);
                if (blocks[i].l && i % 4) {
                    let xpos = xRand(0, 3, true);
                    light_positions[xpos].push(center.x);
                    light_positions[xpos].push(blocks[i].h + 0.0005);
                    light_positions[xpos].push(center.z);
                }

            } else if (blocks[i].c.length > 2) {
                baseGeo = new ExtrudeBufferGeometryNoCaps(shape, {
                    depth: 0,
                    steps: 1,
                    bevelEnabled: false,
                    material: 0,
                    extrudeMaterial: 1,
                    lid: 'top'
                });
                baseGeo.rotateX(Math.PI / -2);
                blocksGeos.push(baseGeo);
            }

        }
    }

    if (blocksGeos.length > 0) {
        app.scene.add(BufferGeometryUtils.mergeBufferGeometries(blocksGeos, true), 'block', 'blocks');
    }
    if (roofGeos.length > 0) {
        app.scene.add(BufferGeometryUtils.mergeBufferGeometries(roofGeos, true), 'block_roof', 'blocks');
    }
    if (buildingsGeos.length > 0) {
        app.scene.add(BufferGeometryUtils.mergeBufferGeometries(buildingsGeos, true), 'block_building', 'blocks');
    }

    RenderLights(app, light_positions[0], 'blocks', 0);
    RenderLights(app, light_positions[1], 'blocks', 1);
    RenderLights(app, light_positions[2], 'blocks', 2);
    RenderLights(app, light_positions[3], 'blocks', 3);

    fn();
}

function BlocksGen(app, json, fn) {

    let checkLoaded = (count) => {
        if (json.length * json.length === count) {
            fn();
        }
    }

    let loadedCount = 0;
    for (var x = 0; x < json.length; x++) {
        for (var y = 0; y < json[x].length; y++) {
            GenerateBlocks(app, json[x][y], function() {
                loadedCount++;
                checkLoaded(loadedCount);
            });
        }
    }
}

function addListeners(xhr, params) {
    if (typeof params.loadstart !== 'undefined') {
        xhr.addEventListener('loadstart', function(e) {
            params.loadstart(e);
        });
    }
    xhr.addEventListener('loadend', function(e) {
        params.done(JSON.parse(xhr.responseText), params);
    });
    if (typeof params.progress !== 'undefined') {
        xhr.addEventListener('progress', function(e) {
            params.progress(e);
        });
    }
    if (typeof params.error !== 'undefined') {
        xhr.addEventListener('error', function(e, c) {
            params.error(xhr);
        });
    }
}

function runXHR(params) {
    const xhr = new XMLHttpRequest();
    if (params.responseType) {
        xhr.responseType = params.responseType;
    }
    addListeners(xhr, params);
    if (params.path) {
        xhr.open("GET", params.path, true);
        if (params.data) {
            xhr.send(params.data);
        } else {
            xhr.send();
        }
        return xhr;
    } else {
        console.warn('### XHR ERROR - PATH REQUIRED');
    }
}

const sendToApp = function() {

    const _t = this;

    _t.objects = [];

    _t.scene = {
        add: function(obj, type, src, target) {
            postMessage({
                position: obj.getAttribute('position').array.buffer,
                groups: obj.groups,
                type: type,
                target: target,
                src: src
            });
        }
    }

    return _t;
}

self.onmessage = function(msg) {

    const glApp = new sendToApp();

    glApp.quality = msg.data.quality;

    if (msg.data.quality && msg.data.quality >= 3) {
        runXHR({
            path: msg.data.base + '/objects/coded.json.gz',
            error: function(e) {
                console.warn('### XHR ERROR', e);
            },
            done: function(json) {
                BlocksGen(glApp, json.blocks, function() {
                    BuildingsGen(glApp, json.buildings, function() {
                        setTimeout(() => {
                            self.close();
                        }, 15000);
                    });
                });
            }
        });
    } else {
        runXHR({
            path: msg.data.base + '/objects/coded_low.json.gz',
            error: function(e) {
                console.warn('### XHR ERROR', e);
            },
            done: function(json) {
                BlocksGen(glApp, json.blocks, function() {
                    BuildingsGen(glApp, json.buildings, function() {
                        setTimeout(() => {
                            self.close();
                        }, 15000);
                    });
                });
            }
        });
    }
}