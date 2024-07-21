
//Test
alert("working");
import * as THREE from 'https://unpkg.com/three@0.142.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/exporters/GLTFExporter.js';
import { RGBELoader } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/loaders/RGBELoader.js';
import { DragControls } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/controls/DragControls.js';
import { TransformControls } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/controls/TransformControls.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/shaders/RGBShiftShader.js';
import { GammaCorrectionShader } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/shaders/GammaCorrectionShader.js';
import { HorizontalTiltShiftShader } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/shaders/HorizontalTiltShiftShader.js';
import { VerticalTiltShiftShader } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/shaders/VerticalTiltShiftShader.js';
import { SMAAPass } from 'https://cdn.jsdelivr.net/npm/three@0.150.0/examples/jsm/postprocessing/SMAAPass.js';


var version = 150;
var container, stats;
var composer;
var dragControls, transformControls, orbitControls;
var transformControlsActive, changeTextureActive;
var camera, scene, sceneBG, renderer;
var raycaster, intersects, mouse, mouseDownX, mouseDownY, clickMode;
var startUVX,
  startUVY,
  finishUVX,
  finishUVY,
  differenceUVX,
  differenceUVY,
  startOffsetX,
  startOffsetY,
  startRepeatX,
  startRepeatY;

var objects = [];
var faces = [];
var exportObjects = [];
var objectsParent;
var textureMode = "albedo";

var dragGroup;
var gridHelper;

var gui, cubeFolder;

//var modelLoaded = false;

var selectedObject, selectedFace;

var canvas, canvasHeight, canvasWidth;
var cubeRenderTarget,
  cubeCamera,
  refractionCubeRenderTarget,
  refractionCubeCamera;

var HorizontalTiltShiftShaderPass,
  VerticalTiltShiftShaderPass,
  ColorifyPass,
  RGBShiftShaderPass,
  FilmEffect,
  VignettePass,
  fxaaPass,
  taaRenderPass,
  ssaaRenderPass,
  smaaPass,
  GammaCorrectionPass,
  HorizontalBlurShaderPass,
  VerticalBlurShaderPass,
  saoPass,
  lutPass,
  CustomShaderPass;
var lensBlur;
var lensFocus = 0.3;
var envURL;
var spotLight;
var studio;
var exposure;
var studioMaterial, shadowMaterial;
var studioGradientTex;
var accentColor = new THREE.Color(0xffffff);
var lightColor = new THREE.Color(0xffffff);
var shadowIntensity = 0.6;
var spotLightIntensity = 1.0;
var ambientLightIntensity = 0.1; //or 0.15
var environmentIntensity = 1.25; //or 0.1
var toneMappingAdjustment = 0.0;
var backgroundTexture;
var ambientLight, light, hemisphereLight, shadowPlane, groundPlane;
var lightIntensity, vignetteDarkness;
var boundingBox = new THREE.Box3();
const colorThief = new ColorThief();
var environmentMap = [];
var keyNumber;
var defaultPaletteImg =
  "https://cdn.shopify.com/s/files/1/0609/4261/4737/files/default-palette.png";
var cs = false;
var eX = 0;
var oX = 0;
var subscriptionNotice = "Please subscribe to Renda Pro for this feature.";
var updateFile = false;

if (window.c) {
  cs = true;
}

init();
//alert("r151 Preview");

function init() {
  //****************
  //
  // INITIALISE RENDERER & CAMERA
  //
  //****************

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    logarithmicDepthBuffer: true
  });

  var gl = renderer.getContext();
  var maxRenderBufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);
  var maxViewportDimensions = gl.getParameter(gl.MAX_VIEWPORT_DIMS);

  // Screen resolution
  //renderer.setPixelRatio(window.devicePixelRatio);
  //renderer.setPixelRatio(0.9);
  container = document.getElementById("canvasContainer");
  canvasWidth = container.offsetWidth;
  canvasHeight = container.offsetHeight;
  renderer.setSize(canvasWidth, canvasHeight);

  canvas = renderer.domElement;
  canvas.style.cssText =
    "background-image: url(https://cdn.shopify.com/s/files/1/0609/4261/4737/files/trans-bg-3.png?v=1641601267); background-size: 25px;";
  container = document.getElementById("canvasContainer");
  container.appendChild(renderer.domElement);

  //SetUI("scene-background");

  renderer.domElement.id = "RendaCanvas";

  camera = new THREE.PerspectiveCamera(
    10, //higher = more distortion
    canvasWidth / canvasHeight,
    0.75,
    50
  );

  camera.position.set(-4.5, 2.25, 6.75);

  scene = new THREE.Scene();

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
  cubeRenderTarget.texture.type = THREE.HalfFloatType;
  cubeCamera = new THREE.CubeCamera(1, 1000, cubeRenderTarget);
  cubeCamera.position.set(0, 0, 0); /* Actual solution */
  scene.add(cubeCamera);

  refractionCubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
  refractionCubeRenderTarget.texture.type = THREE.HalfFloatType;
  refractionCubeRenderTarget.mapping = THREE.CubeRefractionMapping;
  refractionCubeCamera = new THREE.CubeCamera(1, 1000, refractionCubeRenderTarget);
  refractionCubeCamera.position.set(0, 2, 0); /* Actual solution */
  scene.add(refractionCubeCamera);
  
  //ORBIT CONTROLS

  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.minDistance = 2;
  orbitControls.maxDistance = 25;
  orbitControls.minPolarAngle = 0.001;
  orbitControls.maxPolarAngle = Math.PI * 0.4999;
  orbitControls.enablePan = false;
  orbitControls.update();

  // Define the fog properties
  var fogColor = new THREE.Color(0x2e3134); // Red color

  var fogFar = 2000; // Ending distance of fog

  // Create and add the fog to the scene
  scene.fog = new THREE.Fog(fogColor, 1, fogFar);

  //****************
  //
  // INITIALISE POSTPROCESSING
  //
  //****************

  const parameters = {
    format: THREE.RGBAFormat,
    type: THREE.HalfFloatType, //THREE.HalfFloatType works on Safari
  };

  const renderTarget = new THREE.WebGLRenderTarget(
    canvasWidth,
    canvasHeight,
    parameters
  );

  composer = new EffectComposer(renderer, renderTarget);
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.outputEncoding = THREE.sRGBEncoding;
  composer.addPass(new RenderPass(scene, camera));

  RGBShiftShaderPass = new ShaderPass(RGBShiftShader);
  RGBShiftShaderPass.uniforms["amount"].value = 0.0003;
  //RGBShiftShaderPass.enabled = false;
  composer.addPass(RGBShiftShaderPass);

  HorizontalTiltShiftShaderPass = new ShaderPass(HorizontalTiltShiftShader);
  HorizontalTiltShiftShaderPass.uniforms["r"].value = lensFocus;
  composer.addPass(HorizontalTiltShiftShaderPass);

  VerticalTiltShiftShaderPass = new ShaderPass(VerticalTiltShiftShader);
  VerticalTiltShiftShaderPass.uniforms["r"].value = lensFocus;
  composer.addPass(VerticalTiltShiftShaderPass);

  GammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
  composer.addPass(GammaCorrectionPass);

  renderer.toneMapping = THREE.CustomToneMapping;

THREE.ShaderChunk.tonemapping_pars_fragment =
    THREE.ShaderChunk.tonemapping_pars_fragment.replace(
      "vec3 CustomToneMapping( vec3 color ) { return color; }",
      `#define Uncharted2Helper( x ) max( ( ( x * ( 0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02 ) / ( x * ( 0.15 * x + 0.50 ) + 0.20 * 0.30 ) ) - 0.02 / 0.30, vec3( 0.0 ) )
  float toneMappingWhitePoint = 1.5;
  vec3 CustomToneMapping( vec3 color ) {
    color *= toneMappingExposure;

    // Universal contrast adjustment
    float contrastAmount = 1.03; // Adjust this value to increase or decrease the contrast effect, 1.035 was highest
    color = (color - 0.5) * contrastAmount + 0.5;

    // Increase saturation by 10%
    float average = (color.r + color.g + color.b) / 3.0;
    float saturationBoost = 0.05;
    color += (color - vec3(average)) * saturationBoost;

    return saturate( Uncharted2Helper( color ) / Uncharted2Helper( vec3( toneMappingWhitePoint ) ) );
  }`
    );
  renderer.toneMappingExposure = 1 - toneMappingAdjustment;
  changeEffect("lensBlur", false);

  
  smaaPass = new SMAAPass( window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio() );
  composer.addPass( smaaPass );
  
  //****************
  //
  // SPOTLIGHT, STUDIO & SHADOWS
  //
  //****************

  spotLight = new THREE.DirectionalLight(0xffffff, spotLightIntensity);
  spotLight.position.set(2, 8, 2);
  scene.add(spotLight);
  renderer.shadowMap.enabled = true;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 512;
  spotLight.shadow.mapSize.height = 512;
  spotLight.shadow.camera.far = 25;
  spotLight.shadow.bias = -0.001; //-0.004
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.autoUpdate = false;

  let shader = THREE.ShaderChunk.shadowmap_pars_fragment;
  //
  shader = shader.replace(
    "#ifdef USE_SHADOWMAP",
    "#ifdef USE_SHADOWMAP" + document.getElementById("PCSS").textContent
  );
  //
  shader = shader.replace(
    "#if defined( SHADOWMAP_TYPE_PCF )",
    document.getElementById("PCSSGetShadow").textContent +
      "#if defined( SHADOWMAP_TYPE_PCF )"
  );

  THREE.ShaderChunk.shadowmap_pars_fragment = shader;

  ambientLight = new THREE.AmbientLight(0xffffff); // soft white light
  ambientLight.intensity = ambientLightIntensity;
  scene.add(ambientLight);

  shadowMaterial = new THREE.ShadowMaterial({
    transparent: true,
    //opacity: shadowIntensity
  });

  studioMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.0,
    side: THREE.BackSide,
    depthWrite: false,
    dithering: true,
  });

  const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

  // invert the sphere normals
  sphereGeometry.scale(12, 8, 12); //Should be 14

  // create a new mesh using the geometry and material
  const sphere = new THREE.Mesh(sphereGeometry, studioMaterial);
  sphere.castShadow = false;
  sphere.receiveShadow = false;
  sphere.frustumCulled = false;
  scene.add(sphere);

  //Load Shadow Plane
  const shadowPlaneGeometry = new THREE.PlaneGeometry(20, 20);

  // create a new mesh using the geometry and material
  shadowPlane = new THREE.Mesh(shadowPlaneGeometry, shadowMaterial);
  shadowPlane.receiveShadow = true;
  shadowPlane.castShadow = true;

  // set the position and rotation of the shadow plane
  shadowPlane.position.set(0, -0.005, 0);
  shadowPlane.rotation.x = -Math.PI / 2;

  // add the shadow plane to the scene
  scene.add(shadowPlane);

  //****************
  //
  // INITIALISE LISTENERS
  //
  //****************

  window.addEventListener("resize", onWindowResize, false);
  renderer.domElement.addEventListener("pointerdown", onMouseDown, false);
  renderer.domElement.addEventListener("pointerup", onMouseUp, false);
  renderer.domElement.addEventListener("pointermove", onMouseMove, false);

  //****************
  //
  // INITIALISE TRANSFORM CONTROLS
  //
  //****************

  transformControls = new TransformControls(camera, renderer.domElement);
  transformControls.setRotationSnap(Math.PI / 24);
  transformControls.setScaleSnap(0.001);
  transformControls.setTranslationSnap(0.1);

  // Listen for the 'change' event of the transformControls
  transformControls.addEventListener("change", function () {
    renderer.shadowMap.needsUpdate = true;

    // check if the transformControls are no longer being used
    if (!transformControls.object) {
      clampObjectPosition();
    } else {
      // clamp the scale of the object to the minimum value
      transformControls.object.scale.x = Math.max(
        transformControls.object.scale.x,
        0.1
      );
      transformControls.object.scale.y = Math.max(
        transformControls.object.scale.y,
        0.1
      );
      transformControls.object.scale.z = Math.max(
        transformControls.object.scale.z,
        0.1
      );

      // limit the scale of the object to double
      var maxScale = 2.0;
      transformControls.object.scale.x = Math.min(
        transformControls.object.scale.x,
        maxScale
      );
      transformControls.object.scale.y = Math.min(
        transformControls.object.scale.y,
        maxScale
      );
      transformControls.object.scale.z = Math.min(
        transformControls.object.scale.z,
        maxScale
      );
    }
  });

  //Object Scale snapping
  transformControls.addEventListener("objectChange", function () {
    transformControlsActive = true;

    var snapScales = [1.414, 2.121, 1.0, 0.4714, 0.70707];

    // Get the object being transformed
    var object = transformControls.object;

    // Get the current scale of the object
    var currentScale = object.scale.clone();

    // Find the nearest snap scale value for each axis if the current scale is close to one of the defined scales
    var nearestSnapScales = currentScale.clone();
    var minDistances = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE];
    var snapThreshold = 0.1; // Adjust this threshold as needed

    for (var i = 0; i < snapScales.length; i++) {
      for (var j = 0; j < 3; j++) {
        var distance = Math.abs(currentScale.getComponent(j) - snapScales[i]);
        if (distance < minDistances[j] && distance < snapThreshold) {
          minDistances[j] = distance;
          nearestSnapScales.setComponent(j, snapScales[i]);
        }
      }
    }

    // Set the scale of the object to the nearest snap scale values for each axis
    object.scale.copy(nearestSnapScales);
  });

  transformControls.detach();
  scene.add(transformControls);

  dragControls = new DragControls(objects, camera, renderer.domElement);
  dragControls.enabled = false;
  dragControls.addEventListener("dragstart", function (event) {
    orbitControls.enabled = false;
  });
  dragControls.addEventListener("dragend", function (event) {
    orbitControls.enabled = false;
  });
  dragControls.addEventListener("drag", function (event) {
    //Restrict dragging
    boundingBox.setFromObject(selectedObject);
    //clamp drag controls
    selectedObject.position.clamp(
      new THREE.Vector3(-10, 0, -10),
      new THREE.Vector3(10, 10, 10)
    );
  });

  const size = 10;
  const divisions = 10;
  gridHelper = new THREE.GridHelper(size, divisions, 0xffffff, 0x9e9e9e);

  scene.add(gridHelper);
  //onWindowResize();
}

//****************
//
// INITIALISE PALETTE
//
//****************

var paletteLoader = new THREE.TextureLoader();

paletteLoader.load(defaultPaletteImg, function (texture) {
  registerPaletteButtons();
  //  generatePalette(texture.image);
});

//Set initial Background Colour
changeBackground("color", "FFFFFF");

//****************
//
// INITIALISE / IMPORT MODEL
//
//****************

var manager = new THREE.LoadingManager();

document.addEventListener('DOMContentLoaded', function() {
manager.onStart = function (url, itemsLoaded, itemsTotal) {
  toggleLoadingSpinner(1.0);
};
});

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
};

manager.onLoad = function() {
    toggleLoadingSpinner(0.0);
    setTimeout(autoCamera, 50); // Delay for 3 seconds (3000 milliseconds)
};

manager.onError = function () {
  alert("Error Loading File");
};


//****************
//
// INITIALISE SCENE
//
//****************
initModel("scene", true, window.productTitle);

function initModel(initMode, fileHosted, fileReference) {
  
  var lighting = false;
  var fileURL;

  //Load objects from Shopify if exists
  if (window.shopifyFileURL) {
    fileURL = window.shopifyFileURL;
  } else {
    if (fileHosted == true) {
      fileURL =
        "https://s3.ca-central-1.amazonaws.com/renda.warehouse.ca/scenes/r1/renda/" +
        fileReference +
        ".renda";
    } else {
      fileURL = URL.createObjectURL(fileReference[0]);
    }
  }

  var loader = new GLTFLoader(manager).load(fileURL, function (glb) {
    scene.add(glb.scene);

    //Fix if imported from elsewhere
    glb.scene.traverse(function (child) {
      if (
        child.isMesh &&
        child.name.includes("Face") == false &&
        child.name.includes("Controller") == false
      ) {
        child.name = "Face";
        child.parent.name = "Object";
      }
    });

    glb.scene.traverse(function (child) {
      if (child.name.includes("Object") == true) {
        objects.push(child);
        exportObjects.push(child);
      }

      if (child.name.includes("Face") == true) {
        //Unmess it
        if (child.userData.vz) {
          var positionAttribute = child.geometry.attributes.position;
          for (var i = 0; i < positionAttribute.count; i++) {
            var x = positionAttribute.getX(i);
            var y = positionAttribute.getY(i);
            var z = positionAttribute.getZ(i);
            z += i * child.userData.vz;
            positionAttribute.setXYZ(i, x, y, z);
            positionAttribute.needsUpdate = true;
          }
        }

        child.geometry.computeBoundingBox();
        
        if (child.material) {
          child.material = child.material.clone();

          if (
            child.material.emissive &&
            child.material.emissive.getHex() === 0x000000
          ) {
            child.material.emissiveIntensity = 0.0;
          }

          //Load AlphaMap from EmissiveMap (GLB limitation workaround)
          if (
            child.material.emissiveMap &&
            child.userData.hasAlphaMap == true
          ) {
            child.material.alphaMap = child.material.emissiveMap;
          }

          //Load BumpMap from NormalMap (GLB limitation workaround)
          if (child.material.normalMap && child.userData.hasBumpMap == true) {
            child.material.bumpMap = child.material.normalMap;
            child.material.bumpScale = 0.01;
            child.material.normalMap = null;
          }

          child.material.emissiveMap = null;
          child.material.depthWrite = false;
          child.material.depthTest = true;

          if (child.material.map) {
            if (child.material.map.image.width > 10) {
            var img = child.material.map.image;
            generatePalette(img);
            }
            child.material.map.encoding = THREE.sRGBEncoding;
            child.material.map.anisotropy =
              renderer.capabilities.getMaxAnisotropy();
            child.material.map.wrapS = THREE.RepeatWrapping;
            child.material.map.wrapT = THREE.RepeatWrapping;
            child.material.emissiveMap = child.material.map;
            child.material.emissiveMap.anisotropy =
              renderer.capabilities.getMaxAnisotropy();
            child.material.emissiveMap.wrapS = THREE.RepeatWrapping;
            child.material.emissiveMap.wrapT = THREE.RepeatWrapping;
          }

          child.material.transparent = true;
          child.material.alphaTest = 0.25;
          child.material.depthWrite = true;
          child.material.needsUpdate = true;

          //Copy UV1 to UV2
          child.geometry.setAttribute("uv2", child.geometry.attributes.uv);
        }

        //   if (initMode == "objects") {
        child.material.envMap = cubeRenderTarget.texture;
        //  }

        child.castShadow = true;
        child.receiveShadow = true;
        child.layers.enable(1);
        child.name = "Face";

        faces.push(child);
      }

      if (child.name.includes("Controller") == true) {
        if (initMode == "scene") {
          camera.position.copy(child.position);
          camera.rotation.copy(child.rotation);

          if (child.userData.cameraPosition) {
            camera.position.set(
              child.userData.cameraPosition.x,
              child.userData.cameraPosition.y,
              child.userData.cameraPosition.z
            );
          }

          if (child.userData.cameraRotation) {
            camera.rotation.set(
              child.userData.cameraRotation.x,
              child.userData.cameraRotation.y,
              child.userData.cameraRotation.z
            );
          }

          if (child.userData.lightPosition) {
            spotLight.position.set(
              child.userData.lightPosition.x,
              child.userData.lightPosition.y,
              child.userData.lightPosition.z
            );
          }

          if (child.userData.lensBlur) {
            changeEffect("lensBlur", child.userData.lensBlur);
            lensBlurCheck.checked = true;
          }
          if (child.userData.chromaticAberration) {
           // changeEffect(
             // "chromaticAberration",
            //  child.userData.chromaticAberration
           // );
          }
          if (child.userData.envURL) {
            loadEnvironment(child.userData.envURL, true);
            lighting = true;
          }

          if (child.userData.lensFocus) {
            changeEffect("lensFocus", child.userData.lensFocus);
          }
          if (child.userData.accentColor) {
            changeBackground("color", child.userData.accentColor);
          }
          if (child.userData.exposure) {
            changeLighting("exposure", child.userData.exposure);
          }
        }

        child.name = "Deleted";
        child.scale.set(0, 0, 0);
      }

      moveObjectsToCenter(glb.scene);
      renderer.shadowMap.needsUpdate = true;
      animateIntro();
    });

    if (lighting == false && initMode != "objects") {
      loadEnvironment("paul_lobe_haus_1k.hdr", true);
      changeEffect("chromaticAberration", false);
    }
  });

  updateUI();
}

//****************
//
// ADD KEYBOARD CONTROLS
//
//****************

document.addEventListener("keydown", function (e) {

  if (e.key === "Escape") {
    resetScene();
  }
  
  // Check if the Shift key is pressed
  if (!e.shiftKey) {
    return; // Exit the function if Shift key is not held down
  }

  //PRIVATE HOTKEYS
  if (e.key === "D") {
    downloadScene(true, ".renda");
    //console.log("Draw calls: " + renderer.info.render.calls);
    //console.log("Geometry Memory: " + renderer.info.memory.geometries);
    //console.log("Textures Memory: " + renderer.info.memory.textures);
  }
  if (e.key === "S") {
    takeScreenshot("download", 1600, 1203);
  }
  if (e.key === "G") {
    downloadScene(false, ".glb");
  }
  if (e.key === "A") {
    textureMode = "albedo";
  }
  if (e.key === "N") {
    textureMode = "normal";
  }
  if (e.key === "O") {
    textureMode = "occlusion";
  }
  if (e.key === "M") {
    moveObjectsToCenter(scene);
  }
  if (e.key === ",") {
    messUpGeometry("false");
  }
  if (e.key === "K") {
     camera.position.set(-5.5,15.8,9.2);
     spotLight.position.set(1,11,2);
     loadEnvironment("marry_hall_1k.hdr", true);
  }
  if (e.key === "Y") {
    //setSceneStyle("white-clay");
    console.log(camera.position);
    console.log(spotLight.position);
  }
  if (e.key === "U") {
    updateFile = true;
  }
//  Bake Scene
  if (e.key === "B") {
    bakeScene();
  }
  if (e.key === "!") {
     selectedObject.userData.objectType = "Prop";
  }
    if (e.key === "@") {
      toggleDrawer("open");
   SetUI("import-digital-objects");
  }
    if (e.key === "#") {
      toggleDrawer("open");
   SetUI("import-packaging-objects");
  }
    if (e.key === "$") {
      toggleDrawer("open");
   SetUI("import-advertising-objects");
  }
  
  if (e.key === "?"){
     scene.traverse(function (child) {
      if (child.name.includes("Face") == true) {
        if (child.material.normalMap){
          child.material.normalMap = null;
          child.material.needsUpdate = true;
        }
      }
    });
  }

  //Initialise Master objects
  if (e.key === "Z") {
    scene.traverse(function (child) {
      if (child.name.includes("Face") == true) {
        child.material.metalness = 0;
        child.material.roughness = 0.5;
      }
    });
  }

  ///PUBLIC HOTKEYS

  //Delete object
  if (e.key === "X") {
    deleteObject(selectedObject);
    resetScene();
    toggleDrawer("close");
  }

  if (e.key === "L") {
    randomiseLighting("camera");
  }

  if (e.key === "C") {
      cloneObject();
  }

  if (e.key === "R") {
    setObjectProperty("rotation", 0, 0, 0);
  }
  if (e.key === "P") {
    setObjectProperty("position", 0, 1, 0);
    setObjectProperty("rotation", 0, 0, 0);
  }

  //Master scale
  if (e.key === "}") {
    scene.traverse(function (child) {
      if (child.name.includes("Face") == true) {
        child.geometry.scale(
          child.scale.x + 0.1,
          child.scale.y + 0.1,
          child.scale.z + 0.1
        );
      }
    });
    clampObjectPosition();
  }
  if (e.key === "{") {
    scene.traverse(function (child) {
      if (child.name.includes("Face") == true) {
        child.geometry.scale(
          child.scale.x - 0.1,
          child.scale.y - 0.1,
          child.scale.z - 0.1
        );
      }
    });
    clampObjectPosition();
  }
  //Object scale
  if (e.key === "+") {
    selectedObject.traverse(function (child) {
      if (child.name.includes("Face") == true) {
        child.geometry.scale(
          child.scale.x + 0.1,
          child.scale.y + 0.1,
          child.scale.z + 0.1
        );
      }
    });
    clampObjectPosition();
  }
  if (e.key === "_") {
    selectedObject.traverse(function (child) {
      if (child.name.includes("Face") == true) {
        child.geometry.scale(
          child.scale.x - 0.1,
          child.scale.y - 0.1,
          child.scale.z - 0.1
        );
      }
    });
    clampObjectPosition();
  }
});

/////////////////
//
// ADD MOUSE CONTROLS
//
//////////////////

function onMouseDown() {

  toggleHint(null,0.0);
  
  //Check if mouse moves
  mouseDownX = event.clientX;
  mouseDownY = event.clientY;

  transformControlsActive = false;

  doRaycast();

  //If raycast hits object
  if (intersects.length > 0) {
    if ((selectedObject = !intersects[0].object.parent)) {
      clickMode = null;
    }

    selectedFace = intersects[0];
    selectedObject = intersects[0].object.parent;

    //Create Bounding Box
    boundingBox.setFromObject(selectedObject);

    //Create dragging group
    const draggableObjects = dragControls.getObjects();
    draggableObjects.length = 0;
    selectedObject.traverse(function (child) {
      draggableObjects.push(child);
    });

    dragControls.transformGroup = true;


    //Record UV & Texture Coordinates
    startUVX = selectedFace.uv.x;
    startUVY = selectedFace.uv.y;
    if (selectedFace.object.material.map) {
      startOffsetX = selectedFace.object.material.map.offset.x;
      startOffsetY = selectedFace.object.material.map.offset.y;
      startRepeatX = selectedFace.object.material.map.repeat.x;
      startRepeatY = selectedFace.object.material.map.repeat.y;
    }

    //Pevent dragging of obejcts
    if (clickMode == "moveTexturePending") {
      dragControls.enabled = false;
      orbitControls.enabled = false;
      clickMode = "moveTexture";
    }
    if (clickMode == "scaleTexturePending") {
      dragControls.enabled = false;
      orbitControls.enabled = false;
      clickMode = "scaleTexture";
    }
  } else {
    clickMode = null;
  }

}

function onMouseUp() {
  var mouseUpX = event.clientX;
  var mouseUpY = event.clientY;
  
  if (transformControlsActive == false && changeTextureActive == false) {
    //If raycast hits object
    if (intersects.length > 0) {
      //Show DOM Controls
      if (
        clickMode == null &&
        mouseUpX == mouseDownX &&
        mouseUpY == mouseDownY
      ) {
        applyHighlighting("face");

        //Open sidebar
        toggleDrawer("open");
        SetUI("face");
        updateUI();
      }
    } else {
      resetScene();
    }
  }

  if (intersects[0] && intersects[0].object.material.fog == false) {

    if (clickMode == "moveTexture") {
      clickMode = "moveTexturePending";
    }
    if (clickMode == "scaleTexture") {
      clickMode = "scaleTexturePending";
    }
  }  

    //If transform controls active and other object is picked, reset scene
  if (intersects[0].object.material.fog == true){
      resetScene();
   }
  
  changeTextureActive = false;
  autoCamera();
}

function onMouseMove() {
  //If raycast hits object
  if (selectedFace != null && intersects[0] != null) {
    finishUVX = intersects[0].uv.x;
    finishUVY = intersects[0].uv.y;

    differenceUVX = startUVX - finishUVX;
    differenceUVY = startUVY - finishUVY;

    var rotationOffsetX;
    var rotationOffsetY;
    var UVX;
    var UVY;

    if (selectedFace && selectedFace.object.material.map) {
      var degrees =
        THREE.MathUtils.radToDeg(selectedFace.object.material.map.rotation) %
        360;
    }

    if (degrees == 0) {
      rotationOffsetX = 1;
      rotationOffsetY = 1;
      UVX = differenceUVX;
      UVY = differenceUVY;
    }
    if (degrees == 90) {
      rotationOffsetX = 1;
      rotationOffsetY = -1;
      UVX = differenceUVY;
      UVY = differenceUVX;
    }
    if (degrees == 180) {
      rotationOffsetX = -1;
      rotationOffsetY = -1;
      UVX = differenceUVX;
      UVY = differenceUVY;
    }
    if (degrees == 270) {
      rotationOffsetX = -1;
      rotationOffsetY = 1;
      UVX = differenceUVY;
      UVY = differenceUVX;
    }

    ////////////////
    //
    // TEXTURE MOVEMENT
    //
    //////////////////
    if (
      (clickMode == "moveTexture" || clickMode == "scaleTexture") &&
      intersects[0].object.material.fog == false
    ) {
      doRaycast();

      var offsetX = startOffsetX + rotationOffsetX * UVX * startRepeatX;
      var offsetY = startOffsetY + rotationOffsetY * UVY * startRepeatY;

      var targetValues = [1.0, 0.5, 0.0, -0.5, -1.0];
      var threshold = 0.03; // Adjust this value to set the snapping threshold

      // Function to snap value to the nearest target value
      function snapToTarget(value, targets) {
        var closestDistance = Infinity;
        var closestTarget = value;
        for (var i = 0; i < targets.length; i++) {
          var distance = Math.abs(value - targets[i]);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestTarget = targets[i];
          }
        }
        return closestTarget;
      }

      // Check if offsetX is close to any target value
      var offsetXDistance = Math.min.apply(
        null,
        targetValues.map(function (target) {
          return Math.abs(offsetX - target);
        })
      );
      var shouldSnapOffsetX = offsetXDistance < threshold;

      // Check if offsetY is close to any target value
      var offsetYDistance = Math.min.apply(
        null,
        targetValues.map(function (target) {
          return Math.abs(offsetY - target);
        })
      );
      var shouldSnapOffsetY = offsetYDistance < threshold;

      // Snap offsetX if it's close to any target value
      if (shouldSnapOffsetX) {
        offsetX = snapToTarget(offsetX, targetValues);
      } else {
        // Limit offsetX to the highest and lowest snap values
        offsetX = Math.max(
          Math.min(offsetX, Math.max(...targetValues)),
          Math.min(...targetValues)
        );
      }

      // Snap offsetY if it's close to any target value
      if (shouldSnapOffsetY) {
        offsetY = snapToTarget(offsetY, targetValues);
      } else {
        // Limit offsetY to the highest and lowest snap values
        offsetY = Math.max(
          Math.min(offsetY, Math.max(...targetValues)),
          Math.min(...targetValues)
        );
      }

      if (selectedFace.object.material.map) {
        if (clickMode == "moveTexture") {
          
          selectedFace.object.material.map.offset.set(offsetX, offsetY);
          changeTextureActive = true;
          
        } else if (clickMode == "scaleTexture") {
          var newRepeatX = startRepeatX + UVX;
          var newRepeatY = startRepeatY + UVY;

          // Snap repeat values if they are close to any target value
          var snapRepeatX = snapToTarget(newRepeatX, targetValues);
          var snapRepeatY = snapToTarget(newRepeatY, targetValues);

          if (Math.abs(newRepeatX - snapRepeatX) < threshold) {
            newRepeatX = snapRepeatX;
          } else {
            newRepeatX = Math.max(Math.min(newRepeatX, 2), 0.25);
          }

          if (Math.abs(newRepeatY - snapRepeatY) < threshold) {
            newRepeatY = snapRepeatY;
          } else {
            newRepeatY = Math.max(Math.min(newRepeatY, 2), 0.25);
          }
          selectedFace.object.material.map.repeat.set(newRepeatX, newRepeatY);
          changeTextureActive = true;
        }
      }
    }
  }
}

//OTHER FUNCTIONS
function doRaycast() {
  const x = event.clientX;
  const y = event.clientY;

  mouse.x = (x / canvas.clientWidth) * 2 - 1;
  mouse.y = (y / canvas.clientHeight) * -2 + 1;

  //Send out raycast
  raycaster.setFromCamera(mouse, camera);
  raycaster.layers.set(1);
  intersects = raycaster.intersectObjects(scene.children, true);
}

function resetScene() {
  renderer.shadowMap.needsUpdate = true;
  transformControls.detach();
  clickMode = null;
  orbitControls.enabled = true;
  applyHighlighting("none");
  SetUI("scene-background");
}

//////////////////
//
// FACE TEXTURE CONTROLS
//
//////////////////

function addTexture(fileType, files) {
  var url;

  if (fileType == "input") {
    url = URL.createObjectURL(files[0]);
  }

  if (fileType == "blob") {
    url = files;
  }

  const loader = new THREE.TextureLoader();

  loader.load(url, (texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.flipY = false;
    texture.flipX = false;

    //Colour Palettes
    const img = new Image();
    img.src = url;
    img.addEventListener("load", function () {
      if (textureMode == "albedo") {
        generatePalette(img);
      }
    });

    //Carry Rotation across
    if (selectedFace.object.material.map) {
      var faceRotation = selectedFace.object.material.map.rotation;
    }

    if (textureMode == "albedo") {
      if (selectedFace.object.material.metalnessMap) {
        selectedFace.object.material.metalness = 0;
      }

      selectedFace.object.material.bumpMap = null;
      selectedFace.object.material.metalnessMap = null;
      selectedFace.object.material.roughnessMap = null;

      selectedFace.object.material.emissiveMap = texture;
      selectedFace.object.material.map = texture;
      selectedFace.object.material.emissiveMap.encoding = THREE.sRGBEncoding;
      selectedFace.object.material.map.encoding = THREE.sRGBEncoding;
    }
    if (textureMode == "occlusion") {
      selectedFace.object.material.aoMap = texture;
    }
    if (textureMode == "bump") {
      selectedFace.object.material.bumpMap = texture;
      selectedFace.object.material.bumpScale = 0.01;
    }
    if (textureMode == "normal") {
// Set texture encoding to sRGBEncoding
                // Set texture filtering and mipmapping for normal map
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        selectedFace.object.material.normalMap = texture; 
        selectedFace.object.material.normalScale.set( 0.5, 0.5 );
    }
    if (textureMode == "metallic") {
      selectedFace.object.material.metalnessMap = texture;
      selectedFace.object.material.metalness = 1;
    }

    if (textureMode == "glossiness") {
      selectedFace.object.material.roughnessMap = texture;
      selectedFace.object.material.roughness = 1;
    }

    if (faceRotation) {
      selectedFace.object.material.map.rotation = faceRotation;
      selectedFace.object.material.emissiveMap.rotation = faceRotation;
    }

    selectedFace.object.material.needsUpdate = true;
  });
}

function rotateTexture() {
  var radians = Math.PI / 4;
  if (selectedFace.object.material.map) {
    selectedFace.object.material.map.rotation += radians;
  }
  if (selectedFace.object.material.emissiveMap) {
    selectedFace.object.material.emissiveMap.rotation += radians;
  }
  if (selectedFace.object.material.bumpMap) {
    selectedFace.object.material.bumpMap.rotation += radians;
  }
  if (selectedFace.object.material.metalnessMap) {
    selectedFace.object.material.metalnessMap.rotation += radians;
  }
  if (selectedFace.object.material.roughnessMap) {
    selectedFace.object.material.roughnessMap.rotation += radians;
  }
}

function fitTexture() {
  selectedFace.uv.set(0, 0);
  selectedFace.object.material.map.offset.set(0, 0);
  selectedFace.object.material.emissiveMap.offset.set(0, 0);
  selectedFace.object.material.map.repeat.set(1, 1);
  toggleDrawer("close");
}

function deleteTexture() {
  if (selectedFace.object.material.metalnessMap) {
    selectedFace.object.material.metalness = 0;
  }

  selectedFace.object.material.map = null;
  selectedFace.object.material.emissiveMap = null;
  selectedFace.object.material.metalnessMap = null;
  selectedFace.object.material.alphaMap = null;
  selectedFace.object.material.roughnessMap = null;
  selectedFace.object.material.bumpMap = null;
  selectedFace.object.material.needsUpdate = true;
  toggleDrawer("close");
}

function addEmbellishmentTexture(files) {
  var img = new Image();

  img.onload = function () {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");

    canvas.width = this.width;
    canvas.height = this.height;

    var embellishmentTexture = new THREE.Texture(canvas);
    embellishmentTexture.wrapS = THREE.RepeatWrapping;
    embellishmentTexture.wrapT = THREE.RepeatWrapping;
    embellishmentTexture.flipY = false;
    embellishmentTexture.flipX = false;

    if (textureMode == "embossing") {
      ctx.filter = "blur(1px)";
      ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 0.6; //Higher = below more visible
      ctx.filter = "blur(7px)";
      ctx.drawImage(this, 0, 0, canvas.width, canvas.height);

      if (selectedFace.object.material.normalMap) {
        selectedFace.object.material.normalMap = null;
      }
      selectedFace.object.material.bumpMap = embellishmentTexture.clone();
      selectedFace.object.material.bumpScale = 0.005;
    }

    if (textureMode == "debossing") {
      ctx.filter = "blur(1px)";
      ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 0.7; //Higher = below more visible
      ctx.filter = "blur(7px)";
      ctx.drawImage(this, 0, 0, canvas.width, canvas.height);

      if (selectedFace.object.material.normalMap) {
        selectedFace.object.material.normalMap = null;
      }
      selectedFace.object.material.bumpMap = embellishmentTexture.clone();
      selectedFace.object.material.bumpScale = -0.0075;
    }

    if (textureMode == "metallic-foil") {
      //          ctx.globalAlpha = 0.7;
      //      ctx.filter = 'invert(1)';
      ctx.drawImage(this, 0, 0, canvas.width, canvas.height);

      selectedFace.object.material.metalnessMap = embellishmentTexture.clone();
      selectedFace.object.material.metalness = 1;
    }

    if (textureMode == "spot-gloss") {
      ctx.filter = "blur(1px)";
      ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(225,225,225,0.5)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "blur(2px)";

      selectedFace.object.material.roughnessMap = embellishmentTexture.clone();
      selectedFace.object.material.roughness = 0.5;
    }

    if (textureMode == "diecut") {
      //     ctx.filter = 'invert(1)';
      ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
      selectedFace.object.material.alphaMap = embellishmentTexture.clone();
    }

    //Carry Rotation across
    if (selectedFace.object.material.map) {
      var faceRotation = selectedFace.object.material.map.rotation;
    } else {
      //Load a blank texture map to copy scale/position from
      selectedFace.object.material.map = new THREE.TextureLoader().load(
        "https://cdn.shopify.com/s/files/1/0609/4261/4737/files/4x4.jpg"
      );
    }

    selectedFace.object.material.needsUpdate = true;

    if (faceRotation) {
      if (selectedFace.object.material.metalnessMap) {
        selectedFace.object.material.metalnessMap.rotation = faceRotation;
      }
      if (selectedFace.object.material.roughnessMap) {
        selectedFace.object.material.roughnessMap.rotation = faceRotation;
      }
      if (selectedFace.object.material.bumpMap) {
        selectedFace.object.material.bumpMap.rotation = faceRotation;
      }
      if (selectedFace.object.material.alphaMap) {
        selectedFace.object.material.alphaMap.rotation = faceRotation;
      }
    }

    URL.revokeObjectURL(this.src);
    textureMode = "albedo";
  };
  img.src = URL.createObjectURL(files[0]);
}

//////////////////
//
// FACE CHANGE MATERIAL
//
//////////////////

function changeMaterial(property, value) {
  if (property == "glossiness") {
    selectedFace.object.material.roughness = 1 - value;
  }
  if (property == "metallic") {
    selectedFace.object.material.metalness = value;
  }
  if (property == "color") {
    selectedFace.object.visible = true;
    selectedFace.object.material.color.setHex("0x" + value);
    selectedFace.object.material.color.convertSRGBToLinear();
    selectedFace.object.material.emissive.setHex(
      selectedFace.object.material.color.getHex()
    );
  }
  if (property == "transparent") {
    selectedFace.object.visible = false;
  }
  if (property == "bumpmap") {
    //		selectedFace.object.material.bumpScale = value / 1000;
  }
  if (property == "emissive") {
    selectedFace.object.material.emissive.setHex(
      selectedFace.object.material.color.getHex()
    );
    selectedFace.object.material.emissiveIntensity = value;
  }
}


//////////////////
//
//
// CONVERT TO REFRACTION MATERIAL (GLASS)
//
//
////////////////////

function convertToRefractionMapping(mesh) {

  
}

//////////////////
//
// ADD IMAGE PLANE
//
//////////////////

function createRoundedPlane(files, radius, width, height) {
    // Load the texture

    var url = URL.createObjectURL(files[0]);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(url, function (texture) {

        texture.flipY = false;
        texture.flipX = false;

            // Compute aspect ratio of the image
        const aspectRatio = texture.image.width / texture.image.height;

        // Ensure minimum dimensions of 1 for the shorter side
        let planeWidth, planeHeight;
        if (width && height) {
            planeWidth = width;
            planeHeight = height;
        } else if (width) {
            planeWidth = width;
            planeHeight = width / aspectRatio;
        } else if (height) {
            planeHeight = height;
            planeWidth = height * aspectRatio;
        } else {
            planeWidth = aspectRatio >= 1 ? aspectRatio : 1;
            planeHeight = aspectRatio >= 1 ? 1 : 1 / aspectRatio;
        }

        // Ensure that neither width nor height is less than 1
        planeWidth = Math.max(planeWidth, 1);
        planeHeight = Math.max(planeHeight, 1);
      
        // Adjust plane dimensions based on aspect ratio
    //    const planeWidth = width || aspectRatio; // Default to aspect ratio if width is not provided
    //    const planeHeight = height || 1; // Default to 1 if height is not provided

        // Create a shape with rounded corners
        const shape = new THREE.Shape();
        shape.moveTo(-planeWidth / 2, radius - planeHeight / 2);
        shape.lineTo(-planeWidth / 2, planeHeight / 2 - radius);
        shape.quadraticCurveTo(-planeWidth / 2, planeHeight / 2, -planeWidth / 2 + radius, planeHeight / 2);
        shape.lineTo(planeWidth / 2 - radius, planeHeight / 2);
        shape.quadraticCurveTo(planeWidth / 2, planeHeight / 2, planeWidth / 2, planeHeight / 2 - radius);
        shape.lineTo(planeWidth / 2, radius - planeHeight / 2);
        shape.quadraticCurveTo(planeWidth / 2, -planeHeight / 2, planeWidth / 2 - radius, -planeHeight / 2);
        shape.lineTo(-planeWidth / 2 + radius, -planeHeight / 2);
        shape.quadraticCurveTo(-planeWidth / 2, -planeHeight / 2, -planeWidth / 2, radius - planeHeight / 2);

        // Create geometry from shape
        const geometry = new THREE.ShapeBufferGeometry(shape);

        // Calculate UVs for the texture mapping
        const uvs = [];
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            uvs.push((vertices[i] + planeWidth / 2) / planeWidth, (vertices[i + 1] + planeHeight / 2) / planeHeight);
        }
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

        // Create a standard material with specified properties
        const planeMaterial = new THREE.MeshStandardMaterial({
            emissiveIntensity: 0,
            map: texture,
            emissiveMap: texture,
            roughness: 1.0, // Control glossiness (1 - roughness)
            side: THREE.DoubleSide,
            shadowSide: THREE.DoubleSide
        });

      // Create a mesh with the geometry and the material
        const mesh = new THREE.Mesh(geometry, planeMaterial);
        mesh.material.envMap = cubeRenderTarget.texture;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.layers.enable(1);
        mesh.material.map.encoding = THREE.sRGBEncoding;
        //mesh.material.emissiveMap.encoding = THREE.sRGBEncoding;
        mesh.material.transparent = true;
        mesh.material.needsUpdate = true;
        mesh.material.alphaTest = 0.5;
        mesh.name = "Face";
        mesh.rotation.x = Math.PI / 2; // 90 degrees in radians
        faces.push(mesh);

        // Create another parent object named "Object"
        const parentObject = new THREE.Object3D();
        parentObject.name = "Object";

      // Rotate the object by 90 degrees around the Y-axis
//parentObject.rotation.x = Math.PI / 2; // 90 degrees in radians

// Set the position of the object
parentObject.position.set(0, 1, 0);

        // Make the "Face" object a child of the "Object"
        parentObject.add(mesh);
      
        objects.push(parentObject);
        exportObjects.push(parentObject);

        // Add the "Object" to the scene
        scene.add(parentObject);

        //Create colour palette
        generatePalette(img);

    });
} 

//////////////////
//
// CHANGE STYLE
//
//////////////////

function setSceneStyle(style) {
  scene.traverse(function (child) {
    if (child.name.includes("Face") == true) {
      if (style == "graphite") {
        child.material.color.set(0x101010);
        changeBackground("color", "101010");
      }
      if (style == "black-clay") {
        child.material.color.set(0x101010);
        child.material.roughness = 0.8;
        child.material.metalness = 0.0;
        changeBackground("color", "000000");
      }
      if (style == "white-clay") {
        child.material.color.set(0xffffff);
        child.material.roughness = 0.8;
        child.material.metalness = 0.0;
        changeBackground("color", "FFFFFF");
      }
    }
  });
}

//////////////////
//
// OBJECT CLONE
//
//////////////////

function cloneObject() {

  //Free Version
//  if (cs == false) { 
//  alert(subscriptionNotice);
//  } else {
  //Pro Version
  var clone = selectedObject.clone();
  clone.traverse(function (child) {
    if (child.name.includes("Object") == true) {
      objects.push(child);
      exportObjects.push(child);
    }
    if (child.name.includes("Face") == true) {
      child.material = child.material.clone();
      const newGeometry = child.geometry.clone();
      child.geometry = newGeometry;

      if (child.material.map) {
        child.material.map = child.material.map.clone();
        child.material.map.needsUpdate = true;
      }
      faces.push(child);
    }
  });

  clone.scale.set(0, 0, 0);
  clone.position.set(
    selectedObject.position.x,
    selectedObject.position.y + 0.5,
    selectedObject.position.z + 0.5
  );
  scene.add(clone);
  autoCamera();
  new TWEEN.Tween(clone.scale)
    .to(
      new THREE.Vector3(
        selectedObject.scale.x,
        selectedObject.scale.y,
        selectedObject.scale.z
      ),
      500
    )
    .easing(TWEEN.Easing.Circular.InOut)
    .start(resetScene())
    .onComplete(function () {
      autoCamera();
    });
    //Pro Version End
  //}
}

//////////////////
//
// SET OBJECT PROPERTIES
//
//////////////////

function setObjectProperty(mode, x, y, z) {
  if (mode == "rotation") {
    selectedObject.rotation.x = THREE.MathUtils.degToRad(x);
    selectedObject.rotation.y = THREE.MathUtils.degToRad(y);
    selectedObject.rotation.z = THREE.MathUtils.degToRad(z);
  }
  if (mode == "position") {
    selectedObject.position.set(x, y, z);
  }
}

//function scaleObject(scaleX, scaleY, scaleZ) {
//selectedObject.scale.set(
//  selectedObject.scale.x + scaleX,
//  selectedObject.scale.y + scaleY,
//  selectedObject.scale.z + scaleZ
//);
//}

//////////////////
//
// OBJECT DELETE
//
//////////////////

function deleteObject(object) {

//  if (cs == false) { 
  //Free Version
//  alert(subscriptionNotice);
//  } else {
  //Pro Version
  new TWEEN.Tween(object.scale)
    .to(new THREE.Vector3(0, 0, 0), 400)
    .easing(TWEEN.Easing.Back.In)
    .start(resetScene())
    .onComplete(function () {
      object.traverse(function (child) {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
          object.remove(child);
        }
      });

      object.name = "Deleted";

      //Regenerate Faces & Objects arrays
      faces = [];
      objects = [];
      scene.traverse(function (child) {
        if (child.name.includes("Face") == true) {
          faces.push(child);
        }

        if (child.name.includes("Object") == true) {
          objects.push(child);
        }
      });
      autoCamera();
    });
  //Pro Version End
//  }
}

function deleteAllObjects() {
  scene.traverse(function (child) {
    if (child.name.includes("Object") == true) {
      deleteObject(child);
    }
  });
}

//Move Object above ground
function clampObjectPosition() {
  var minY = 0;

  selectedObject.traverse(function (child) {
    if (child.name.includes("Face") == true) {
      const geometry = child.geometry;
      const positionAttribute = geometry.getAttribute("position");

      var vertices = child.geometry.attributes.position.array;
      for (let i = 0; i < vertices.length; i = i + 3) {
        //Get Vertex world coordinates
        const vertex = new THREE.Vector3();
        vertex.fromBufferAttribute(positionAttribute, i);
        child.localToWorld(vertex);

        //Find the minimum
        if (vertex.y < minY) {
          minY = vertex.y;
        }
      }
    }
  });

  //Move object
  selectedObject.position.y -= minY;
}

//////////////////
//
// SCENE ENVIRONMENT
//
//////////////////

function loadEnvironment(HDR, initialise) {
  var pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  new RGBELoader()
    .setPath("https://cdn.shopify.com/s/files/1/0609/4261/4737/files/")
    .load(HDR, function (texture) {
      texture.mapping = THREE.EquirectangularRefractionMapping;
      backgroundTexture = texture;

      scene.traverse(function (child) {
        if (child.name.includes("Face") == true) {
          child.material.envMap = cubeRenderTarget.texture;
        }
      });

      studioMaterial.envMap = cubeRenderTarget.texture;

      if (initialise == true) {
        envURL = HDR;
        animate();
        toggleLoadingScreen(false);
        autoCamera("initialise");
      } else {
      }

      updateLightProbe();
    });
  envURL = HDR;
}

//////////////////
//
// SCENE BACKGROUND
//
//////////////////

function changeBackground(property, value) {
  if (property == "color") {
    if (value == "none") {
      studioMaterial.color.setHex("0xFFFFFF");
      studioMaterial.visible = false;
    } else {
      studioMaterial.visible = true;

      var luminance = 0.5 - tinycolor("#" + value).getLuminance();
      var adjustedColor = tinycolor("#" + value)
        .lighten(luminance * 100 + 0.25)
        .toString();
      var darkenedColor = tinycolor("#" + value)
        .darken(90)
        .toString();

      studioMaterial.color.setHex("0x" + value);
      studioMaterial.color.convertSRGBToLinear();
      accentColor = value;
      shadowMaterial.color.set(darkenedColor);
    }
  }

  updateLightProbe();
}

//////////////////
//
// SCENE LIGHTING
//
//////////////////

function changeLighting(property, value) {
  if (property == "exposure") {
    renderer.toneMappingExposure = value - toneMappingAdjustment;
  }

  if (property == "shadowsActive") {
    if (value == true) {
      spotLight.castShadow = true;
    } else {
      spotLight.castShadow = false;
    }
  }

  if (property == "groundShadowsActive") {
    if (value == true) {
      shadowPlane.visible = true;
    } else {
      shadowPlane.visible = false;
    }
  }
}

function randomiseLighting(property) {
  var targetPosition = orbitControls.target;

  if (property == "random") {
    spotLight.position.set(
      Math.floor(Math.random() * 11) - 6,
      Math.random() * 6 + 6,
      Math.floor(Math.random() * 11) - 6
    );
  }

  if (property == "camera") {
    var minDistance = 7; // Minimum distance between the spotlight and targetPosition
    var maxDistance = 12; // Maximum distance between the spotlight and targetPosition
    var distance = camera.position.distanceTo(targetPosition); // Calculate the distance between the camera and targetPosition

    if (distance > maxDistance) {
      var direction = new THREE.Vector3()
        .subVectors(targetPosition, camera.position)
        .normalize(); // Calculate the direction from camera to targetPosition
      var randomDistance =
        Math.random() * (maxDistance - minDistance) + minDistance; // Generate a random distance between minDistance and maxDistance
      var newPosition = new THREE.Vector3()
        .copy(targetPosition)
        .sub(direction.multiplyScalar(randomDistance)); // Calculate the new position for the spotlight

      spotLight.position.copy(newPosition);
    } else {
      spotLight.position.copy(camera.position);
    }
  }
  renderer.shadowMap.needsUpdate = true;
}

function setSpotlightPosition(mode) {
  var targetPosition = orbitControls.target;

  const minDistance = 4;
  const maxDistance = 8;

  if (mode === "random") {
    // Generate random positions on the x-axis and z-axis within the specified range
    const randomX = (Math.random() * 2 - 1) * maxDistance;
    const randomZ = (Math.random() * 2 - 1) * maxDistance;

    // Generate a random position on the y-axis within the specified range
    const randomY =
      Math.random() * (maxDistance + 2 - minDistance) + minDistance;

    // Set the light position relative to the target position
    spotLight.position.set(
      targetPosition.x + randomX,
      targetPosition.y + randomY,
      targetPosition.z + randomZ
    );

    //    console.log(spotLight.position);
  } else {
    // Default behavior or handling any other mode
    // Set the light position without changing its direction
    const direction = new THREE.Vector3().subVectors(
      targetPosition,
      spotLight.position
    );
    spotLight.position.copy(camera.position).add(direction);
  }

  // Update the target position of the spotLight
  spotLight.target.position.copy(targetPosition);

  renderer.shadowMap.needsUpdate = true;
}

//////////////////
//
// SCENE CAMERA EFFECTS
//
//////////////////

function changeEffect(property, value) {
  if (property == "lensBlur") {
    VerticalTiltShiftShaderPass.enabled = value;
    HorizontalTiltShiftShaderPass.enabled = value;
    GammaCorrectionPass.enabled = true;
    lensBlur = value;
  }

  if (property == "lensFocus") {
    lensFocus = value;
    HorizontalTiltShiftShaderPass.uniforms["r"].value = value;
    VerticalTiltShiftShaderPass.uniforms["r"].value = value;
  }
  if (property == "chromaticAberration") {
    RGBShiftShaderPass.enabled = value;
  }
}

//////////////////
//
// LIGHT PROBE
//
//////////////////

function updateLightProbe() {
  scene.traverse(function (child) {
    if (child.name.includes("Face") == true) {
      child.material.opacity = 0;
    }
  });

  studioMaterial.visible == true;
  scene.background = backgroundTexture;
  studioMaterial.transparent = true;
  studioMaterial.opacity = 0.5;
  studioMaterial.envMap = null;
  shadowMaterial.opacity = 0;
  scene.remove(gridHelper);
  //UPDATE
  cubeCamera.update(renderer, scene);

  studioMaterial.envMap = cubeRenderTarget.texture;
  studioMaterial.transparent = false;

 // refractionCubeCamera.rotation.x = Math.PI;
 // refractionCubeCamera.rotation.z = Math.PI;
 // refractionCubeCamera.rotation.y = Math.PI;

 // refractionCubeCamera.update(renderer, scene);

//  if (selectedFace){
//    selectedFace.object.material.envMap = refractionCubeRenderTarget.texture;
//    selectedFace.object.material.transparent = false;
  //  selectedFace.object.material.opacity = 1.0;
//
  //  selectedFace.object.material.refractionRatio = 0.94;
//
//  }
  
  shadowMaterial.opacity = shadowIntensity;
  scene.add(gridHelper);
  scene.background = null;

  var brightness =
    tinycolor("#" + studioMaterial.color.getHexString()).getBrightness() / 255;

  studioMaterial.envMapIntensity = environmentIntensity - brightness / 2.3;

  scene.traverse(function (child) {
    if (child.name.includes("Face") == true) {
      child.material.opacity = 1;
      child.material.envMapIntensity = environmentIntensity - brightness / 2.3;
    }
  });
}

//////////////////
//
// AUTOCAMERA
//
//////////////////

function autoCamera(mode) {
  const box = new THREE.Box3();

  for (var i = 0; i < faces.length; i++) {
  if (faces[i].parent.userData.objectType !== "Prop") {
    box.expandByObject(faces[i]);
    }
  }
  var center = box.getCenter(new THREE.Vector3());

  if (mode == "initialise") {
    orbitControls.target = center;
  }

  new TWEEN.Tween(orbitControls.target)
    .to(center, 800)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onUpdate(function () {
      orbitControls.update();
    })
    .start()
    .onComplete(function () {});
}

//Set Transform type (position, scale, rotation)
function setTransformControls(mode) {

    if (cs == "X") { //change to false if required
  //Free Version
  alert(subscriptionNotice);
    } else {
  //Pro Version
  transformControls.mode = mode;

  transformControls.attach(selectedObject);

  clickMode = "transformObject";

  transformControls.space = "local";
  orbitControls.enabled = false;
  applyHighlighting("object");
  //Pro Version End
    }
}

function aspectRatio() {
  // Access the geometry of the mesh
  const geometry = selectedFace.object.geometry;

  // Retrieve the UV attribute from the geometry
  const uvAttribute = geometry.getAttribute("uv");

  // Find the minimum and maximum UV coordinates along both U and V axes
  let minU = Infinity,
    maxU = -Infinity;
  let minV = Infinity,
    maxV = -Infinity;

  for (let i = 0; i < uvAttribute.count; i++) {
    const u = uvAttribute.getX(i);
    const v = uvAttribute.getY(i);

    minU = Math.min(minU, u);
    maxU = Math.max(maxU, u);
    minV = Math.min(minV, v);
    maxV = Math.max(maxV, v);
  }

  // Get the positions of the mesh's vertices
  const positions = geometry.getAttribute("position").array;

  // Find the minimum and maximum vertex positions along both X and Y axes
  let minX = Infinity,
    maxX = -Infinity;
  let minY = Infinity,
    maxY = -Infinity;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  // Calculate the width and height in world space
  const worldWidth = maxX - minX;
  const worldHeight = maxY - minY;

  // Calculate the width and height of the UV space
  const uvWidth = maxU - minU;
  const uvHeight = maxV - minV;

  // Calculate the aspect ratio in world space
  const aspectRatio = worldWidth / worldHeight;

  // console.log('Aspect Ratio in World Space:', aspectRatio);
}

//////////////////
//
// MOVE OBJECTS TO CENTER
//
//////////////////

function moveObjectsToCenter(scene, includeY) {
  // Initialize variables to calculate the average position
  let count = 0;
  let averageX = 0;
  let averageZ = 0;

  // Iterate through the children of the scene
  scene.traverse((child) => {
    if (child.name.includes("Object") == true) {
      // Accumulate the position values
      averageX += child.position.x;
      averageZ += child.position.z;
      count++;
    }
  });

  // Calculate the average x and z positions
  averageX /= count;
  averageZ /= count;

  // Offset each object's x and z positions to center, while keeping Y unchanged
  scene.traverse((child) => {
    if (child.name.includes("Object") == true) {
      child.position.x -= averageX;
      child.position.z -= averageZ;
      if (includeY == true) {
        child.position.y = 0;
      }
    }
  });
  // renderer.shadowMap.needsUpdate = true;
}

//////////////////
//
// HIGHLIGHTING
//
//////////////////

function applyHighlighting(type) {
  for (var i = 0; i < faces.length; i++) {
    if (type == "face" && selectedFace != null) {
      scene.fog.far = 100;
      scene.fog.near = -100;
      faces[i].material.fog = true;
      faces[i].material.needsUpdate = true;
      selectedFace.object.material.fog = false;
      selectedFace.object.material.needsUpdate = true;
    }
    if (type == "object" && selectedFace != null) {
      scene.fog.far = 500;
      scene.fog.near = -500;
      faces[i].material.fog = true;
      faces[i].material.needsUpdate = true;
      selectedObject.traverse(function (child) {
        if (child.name.includes("Face") == true) {
          child.material.fog = false;
          child.material.needsUpdate = true;
        }
      });
    }
    if (type == "none") {
      scene.fog.far = 20000;
    }
  }
}

//////////////////
//
// SNAPSHOT CONTROLS
//
//////////////////

function takeScreenshot(mode, width, height) {
  var aspectRatio = document.querySelector("#screenshot-aspectRatio").value;
  var snapshotWidth =
    document.querySelector('input[name="snapshotResolution"]:checked').value /
    renderer.getPixelRatio();

  if (aspectRatio == "screen") {
    aspectRatio = camera.aspect;
  } else {
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();
  }

  if (width == null && height == null) {
    if (aspectRatio > 1) {
      renderer.setSize(snapshotWidth, snapshotWidth / aspectRatio);
      composer.setSize(snapshotWidth, snapshotWidth / aspectRatio);
    } else {
      renderer.setSize(snapshotWidth * aspectRatio, snapshotWidth);
      composer.setSize(snapshotWidth * aspectRatio, snapshotWidth);
    }
  } else {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer.setSize(width, height);
  }

  scene.remove(gridHelper);

  spotLight.shadow.mapSize.set(2048, 2048);
  spotLight.shadow.map.setSize(2048, 2048);
  renderer.shadowMap.needsUpdate = true;

  composer.render();

  spotLight.shadow.mapSize.set(512, 512);
  spotLight.shadow.map.setSize(512, 512);
  renderer.shadowMap.needsUpdate = true;

  if (mode == "open") {
    var w = window.open("", "");
    w.document.title = "Renda Snapshot";
    var img = new Image();

    img.src = renderer.domElement.toDataURL();
    img.style.cssText = "max-height: 100%;max-width: 100%;";
    w.document.body.appendChild(img);
  }

  if (mode == "download") {
    var a = document.createElement("a");
    a.href = renderer.domElement
      .toDataURL()
      .replace("image/png", "image/octet-stream");
    if (keyNumber) {
      a.download = keyNumber + ".png";
    } else {
      a.download = "Renda Snapshot.png";
    }
    a.click();
  }

  /*
        // Alternative version of file download using toBlob.
        //
        renderer.render(scene, camera);
        renderer.domElement.toBlob(function(blob){
        	var a = document.createElement('a');
          var url = URL.createObjectURL(blob);
          a.href = url;
          a.download = 'canvas.png';
          a.click();
        }, 'image/png', 1.0);
    */

  renderer.setSize(canvasWidth, canvasHeight);
  composer.setSize(canvasWidth, canvasHeight);

  scene.add(gridHelper);

  camera.aspect = canvasWidth / canvasHeight;
  camera.updateProjectionMatrix();
}

/////////////////
//
// REPLACE TEXTURES WITH NULL - PRIVATE
//
////////////////

//function findMeshLength() {
// Assuming you have a mesh object called 'mesh'
// const geometry = selectedFace.object.geometry;
// geometry.computeVertexNormals();

//  let totalLength = 0;

//  for (let i = 0; i < geometry.vertices.length - 1; i++) {
//   const vertex1 = geometry.vertices[i];
//  const vertex2 = geometry.vertices[i + 1];
// const normal1 = vertex1.clone().applyMatrix4(mesh.matrixWorld).normalize();
//const normal2 = vertex2.clone().applyMatrix4(mesh.matrixWorld).normalize();

//const distance = vertex2.distanceTo(vertex1) * normal1.dot(normal2);
//totalLength += distance;
//  }

//console.log('Length:', totalLength);
//}

//////BAKE SCALE INTO SCENE - PRIVATE//////
function bakeScene() {
  scene.traverse(function (object) {
    if (object.name.includes("Object")) {
      object.traverse(function (child) {
        if (child.name.includes("Face")) {
          child.scale.set(1, 1, 1);
        }
      });
    }
  });
}

//////////////////
//
// DOWNLOAD SCENE - PRIVATE
//
//////////////////

function downloadScene(privacy, fileType) {

    if (cs == false) {
  //Free Version
  alert(subscriptionNotice);
    } else {
  //Pro Version
  if (updateFile == false){
  var file_name = Math.floor(Math.random() * (9999999 - 1000000 + 1) + 1000000);
  } else {
  var file_name = window.productTitle;
  }

  keyNumber = file_name;

  //  takeScreenshot("download", 1600, 1203);

  const geometry = new THREE.BoxGeometry();

  var controllerObject = new THREE.Mesh(geometry);

  controllerObject.userData.version = version;
  controllerObject.userData.accentColor = accentColor;
  controllerObject.userData.cameraPosition = camera.position;
  controllerObject.userData.cameraRotation = camera.rotation;
  controllerObject.userData.lightPosition = spotLight.position;
  controllerObject.userData.envURL = envURL;
  controllerObject.userData.lensBlur = lensBlur;
  controllerObject.userData.lensFocus = lensFocus;
  controllerObject.userData.exposure = renderer.toneMappingExposure;
  controllerObject.userData.bias = spotLight.shadow.bias;
  controllerObject.userData.chromaticAberration = RGBShiftShaderPass.enabled;
  controllerObject.userData.ambientLightIntensity = ambientLightIntensity;
  controllerObject.userData.spotLightIntensity = spotLightIntensity;
  controllerObject.userData.environmentIntensity = environmentIntensity;
  controllerObject.userData.visibleBackground = studioMaterial.visible;

  controllerObject.name = "Controller";
  scene.add(controllerObject);
  controllerObject.position.copy(orbitControls.target);
  exportObjects.push(controllerObject);

  scene.traverse(function (child) {
    if (child.name.includes("Deleted") == true) {
      child.visible = false;
    }

    if (child.name.includes("Object") == true) {
      child.name = "Object";
    }

    if (child.name.includes("Face") == true) {
      //Save AlphaMap to EmissiveMap (GLB limitation workaround)
      if (child.material.alphaMap) {
        child.material.emissiveMap = child.material.alphaMap;
        child.userData.hasAlphaMap = true;
      }

      //Save BumpMap to NormalMap (GLB limitation workaround)
      if (child.material.bumpMap) {
        child.material.normalMap = child.material.bumpMap;
        child.userData.hasBumpMap = true;
      }

      const materialColor = child.material.color.getHexString();
      if (materialColor == "ff00ff") {
        child.material.color.setHex("0xFFFFFF");
      }

      if (privacy == false) {
        child.userData.vz = null;
      }
    }
  });

  if (privacy == true) {
    messUpGeometry("true");
  }

  // Instantiate a exporter
  const exporter = new GLTFExporter();

  exporter.parse(
    exportObjects,
    function (gltf) {
      if (fileType) {
        saveArrayBuffer(gltf, file_name + fileType);
      } else {
        saveArrayBuffer(gltf, file_name + ".glb");
      }
    },
    function (error) {
      //  console.log("An export error happened");
    },
    {
      onlyVisible: true,
      forceIndices: true,
      binary: true,
      maxTextureSize: 1500,
    }
  );

  scene.remove(controllerObject);

  if (privacy == true) {
    //Unmess it
    messUpGeometry("false");
  }
  //Pro Version End
  }
}

function messUpGeometry(value) {
  scene.traverse(function (child) {
    if (child.name.includes("Face") == true) {
      var vzValue;

      if (value == "true") {
        vzValue =
          (Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000) / 10000000;
        child.userData.vz = vzValue;
      }

      if (value == "false") {
        vzValue = child.userData.vz;
      }

      var positionAttribute = child.geometry.attributes.position;

      for (var i = 0; i < positionAttribute.count; i++) {
        var x = positionAttribute.getX(i);
        var y = positionAttribute.getY(i);
        var z = positionAttribute.getZ(i);
        if (value == "true") {
          z -= i * vzValue;
        }
        if (value == "false") {
          z += i * vzValue;
        }
        positionAttribute.setXYZ(i, x, y, z);
        positionAttribute.needsUpdate = true;
      }
      child.geometry.computeBoundingBox();
    }
  });

  // Make sure to render the scene to see the changes
  renderer.render(scene, camera);
}

function saveArrayBuffer(buffer, filename) {
  save(
    new Blob([buffer], {
      type: "application/octet-stream",
    }),
    filename
  );
}

const link = document.createElement("a");
link.style.display = "none";
document.body.appendChild(link);

function save(blob, filename) {
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

//////////////////
//
// AI IMAGE GENERATION
//
//////////////////

function generateAI(prompt) {
  var promptSuffix = "design layout, pdf";
  var promptPrefix = "beautiful, pdf layout,";

  const form = new FormData();
  form.append("prompt", promptPrefix + prompt + promptSuffix);

  fetch("https://clipdrop-api.co/text-to-image/v1", {
    method: "POST",
    headers: {
      "x-api-key":
        "XXXX",
    },
    body: form,
  })
    .then((response) => {
      // Log the Content-Type response header
      const contentType = response.headers.get("Content-Type");
    //  console.log("Content-Type:", contentType);
      return response.arrayBuffer();
    })
    .then((buffer) => {
    //  console.log(buffer);

      const blob = new Blob([buffer], { type: "image/png" }); // Specify the appropriate image type
      const objectURL = URL.createObjectURL(blob);
      addTexture("blob", objectURL);
    });
}

//////////////////
//
// INTRODCUTION ANIMATION
//
//////////////////

function animateIntro() {
    // Save the initial position of the camera
    var initialPosition = camera.position.clone();

    // Set the camera's initial position relative to its current orientation
    camera.translateOnAxis(new THREE.Vector3(0.1,0.1,0.1), -0.1);

    // Create a tween to move the camera to the original position with easing
    var targetPosition = initialPosition;
    var duration = 2500;

    var cameraPositionTween = new TWEEN.Tween(camera.position)
        .to(targetPosition, duration)
        .easing(TWEEN.Easing.Exponential.Out) // Use a quadratic easing function
        .onUpdate(() => {
            orbitControls.update();
        })
        .onComplete(() => {

        })
        .start();
}




//////////////////
//
// WINDOW RESIZE
//
//////////////////

function onWindowResize() {
  var container = document.getElementById("canvasContainer");
  canvasWidth = container.offsetWidth;
  canvasHeight = container.offsetHeight;
  camera.aspect = canvasWidth / canvasHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvasWidth, canvasHeight);
  composer.setSize(canvasWidth, canvasHeight);

  //Update Snapshot Labels
  updateSnapshotLabels();
}

//////////////////
//
// ANIMATE
//
//////////////////

function animate() {
  requestAnimationFrame(animate);
  TWEEN.update();
  composer.render();
}

/////////
//
//
//
//
//
//
//
//
//
//
//
//
// UI UI UI UI
//
//
//
//
//
//
//
//
//
//
//
////////

//Button Event Registery (use ID to set in DOM)
SnapshotButton.addEventListener("click", function () {
  toggleDrawer("open");
  SetUI("snapshot");
});
SceneBackgroundButton.addEventListener("click", function () {
  toggleDrawer("open");
  SetUI("scene-background");
});
SceneLightingButton.addEventListener("click", function () {
  toggleDrawer("open");
  SetUI("scene-lighting");
});
SceneEffectsButton.addEventListener("click", function () {
  toggleDrawer("open");
  SetUI("scene-effects");
});
ImportPlaneButton.addEventListener("click", function () {
  toggleDrawer("open");
  SetUI("import-plane");
});
//ImportDecorativeObjectsButton.addEventListener("click", function () {
//  toggleDrawer("open");
//  SetUI("import-decorative-objects");
//});
SaveFileButton.addEventListener("click", function () {
  toggleDrawer("open");
  SetUI("save-file");
});
ImportDigitalObjectsButton.addEventListener("click", function () {
   toggleDrawer("open");
   SetUI("import-digital-objects");
});
ImportPrintObjectsButton.addEventListener("click", function () {
   toggleDrawer("open");
   SetUI("import-print-objects");
});
ImportPackagingObjectsButton.addEventListener("click", function () {
   toggleDrawer("open");
   SetUI("import-packaging-objects");
});
ImportAdvertisingObjectsButton.addEventListener("click", function () {
   toggleDrawer("open");
   SetUI("import-advertising-objects");
});

imageFileInput.addEventListener("change", (event) => {
  addTexture("input", imageFileInput.files);
  imageFileInput.value = null;
  toggleDrawer("close");
});

imagePlaneFileInput.addEventListener("change", (event) => {
  var planeRadius = parseFloat(document.getElementById('planeRadiusRange').value);
  createRoundedPlane(imagePlaneFileInput.files, planeRadius);
  imagePlaneFileInput.value = null;
  toggleDrawer("close");
});

sceneFileInput.addEventListener("change", (event) => {

  //Free Version
    if (cs == false) {
  alert(subscriptionNotice);
    } else {
  //Pro Version
  deleteAllObjects();
  initModel("scene", false, sceneFileInput.files);
  //Pro Version End
  }

  sceneFileInput.value = null;
  toggleDrawer("close");
});

//const mockupMixerInput = document.getElementById("importSceneNumberField");

//mockupMixerInput.addEventListener("keyup", handleMixerInput);
//mockupMixerInput.addEventListener("focusout", handleMixerInput);

function handleMixerInput(event) {
  if (
    (event.key === "Enter" || event.type === "focusout") &&
    mockupMixerInput.value.trim() !== ""
  ) {
    const inputValue = parseInt(mockupMixerInput.value);

      if (cs == false) {
  //Free Version
  alert(subscriptionNotice);
      } else {
    //Pro Version
    initModel("objects", true, inputValue);
    //Pro Version End
      }
    
    toggleDrawer("close");
    mockupMixerInput.value = "";
  }
}

//const AIPromptInput = document.getElementById("AIPromptInput");

//AIPromptInput.addEventListener("keyup", handleAIInput);
//AIPromptInput.addEventListener("focusout", handleAIInput);

//function handleAIInput(event) {
//  if ((event.key === "Enter" || event.type === "focusout") && AIPromptInput.value.trim() !== "") {
//    generateAI(AIPromptInput.value);
//    toggleDrawer("close");
//    AIPromptInput.value = "";
//  }
//}

embellishmentFileInput.addEventListener("change", (event) => {
  addEmbellishmentTexture(embellishmentFileInput.files);
  embellishmentFileInput.value = null;
});

moveTextureButton.addEventListener("click", function () {
  clickMode = "moveTexturePending";
  toggleDrawer("close");
  //  showHelpScreen("move-texture");
});
scaleTextureButton.addEventListener("click", function () {
  clickMode = "scaleTexturePending";
  toggleDrawer("close");
  // showHelpScreen("scale-texture");
});
rotateTextureButton.addEventListener("click", function () {
  rotateTexture();
  toggleDrawer("close");
});
fitTextureButton.addEventListener("click", function () {
  fitTexture();
  toggleDrawer("close");
});
deleteTextureButton.addEventListener("click", function () {
  deleteTexture();
  toggleDrawer("close");
});
downloadSnapshotBtn.addEventListener("click", function () {
  toggleDrawer("close");
  takeScreenshot("download");
});
openSnapshotBtn.addEventListener("click", function () {
  toggleDrawer("close");
  takeScreenshot("open");
});

glossinessRange.addEventListener("input", function (e) {
  changeMaterial("glossiness", glossinessRange.value);
});

metallicRange.addEventListener("input", function (e) {
  changeMaterial("metallic", metallicRange.value);
});

emissiveRange.addEventListener("input", function (e) {
  changeMaterial("emissive", emissiveRange.value);
});

downloadSceneButton.addEventListener("click", function () {
  toggleDrawer("close");
  downloadScene(true, ".renda");
});

//Map File Upload Icons Functions
if (document.getElementById("fileInputButton")) {
  document
    .getElementById("fileInputButton")
    .addEventListener("click", function () {
      document.getElementById("imageFileInput").click();
    });
}

if (document.getElementById("imagePlaneButton")) {
  document
    .getElementById("imagePlaneButton")
    .addEventListener("click", function () {
      document.getElementById("imagePlaneFileInput").click();
    });
}


if (document.getElementById("digitalFoilButton")) {
  document
    .getElementById("digitalFoilButton")
    .addEventListener("click", function () {
      document.getElementById("embellishmentFileInput").click();
      textureMode = "metallic-foil";
    });
}

if (document.getElementById("embossingButton")) {
  document
    .getElementById("embossingButton")
    .addEventListener("click", function () {
      document.getElementById("embellishmentFileInput").click();
      textureMode = "embossing";
    });
}

if (document.getElementById("debossingButton")) {
  document
    .getElementById("debossingButton")
    .addEventListener("click", function () {
      document.getElementById("embellishmentFileInput").click();
      textureMode = "debossing";
    });
}

if (document.getElementById("spotUVButton")) {
  document
    .getElementById("spotUVButton")
    .addEventListener("click", function () {
      document.getElementById("embellishmentFileInput").click();
      textureMode = "spot-gloss";
    });
}

if (document.getElementById("diecutButton")) {
  document
    .getElementById("diecutButton")
    .addEventListener("click", function () {
      document.getElementById("embellishmentFileInput").click();
      textureMode = "diecut";
    });
}

if (document.getElementById("sceneInputButton")) {
  document
    .getElementById("sceneInputButton")
    .addEventListener("click", function () {
      document.getElementById("sceneFileInput").click();
    });
}

///////////
//
//Create suggested colours palette
//
//////////
//document.getElementById("material-palette").style.display = "none";
//document.getElementById("background-palette").style.display = "none";

var backgroundColorBtns = document.querySelectorAll(".change-background-color");
var materialColorBtns = document.querySelectorAll(".change-material-color");

function generatePalette(img) {
  
  var colorPalette = colorThief.getPalette(img, 22, 1);

  //document.getElementById("material-palette").style.display = "block";
  //document.getElementById("background-palette").style.display = "block";

  for (var c = 8; c < 24; c++) {
    var col = colorPalette[c - 8];
    var colorRGB = "rgb(" + col[0] + ", " + col[1] + ", " + col[2] + ")";
    materialColorBtns[c].style.backgroundColor = colorRGB;
    backgroundColorBtns[c].style.backgroundColor = colorRGB;
    if (c == 1) {
      updateTintPalette(backgroundColorBtns[c].style.backgroundColor, "accent");
      updateTintPalette(
        backgroundColorBtns[c].style.backgroundColor,
        "material"
      );
    }
  }
  registerPaletteButtons();
  var rgbColor = colorPalette[0];
  var tinyColor = tinycolor({
    r: rgbColor[0],
    g: rgbColor[1],
    b: rgbColor[2],
  });
  var hexCode = tinyColor.toHexString();
  updateTintPalette(hexCode, "accent");
  updateTintPalette(hexCode, "material");
}

function registerPaletteButtons() {
  for (var p = 0; p < backgroundColorBtns.length; p++) {
    backgroundColorBtns[p].addEventListener("click", (event) => {
      var clickedButton = event.target; // Get the clicked button element

      var btnColor = new THREE.Color(
        getComputedStyle(event.target).backgroundColor
      );
      var hexColor = btnColor.getHexString();
      changeBackground("color", hexColor);
      if (clickedButton.classList.contains("change-palette")) {
        updateTintPalette("#" + hexColor, "accent");
      }
      if (event.target.id == "transparentBackgroundButton") {
        changeBackground("color", "none");
      }
      updateUI();
    });
  }

  for (var m = 0; m < materialColorBtns.length; m++) {
    materialColorBtns[m].addEventListener("click", (event) => {
      var clickedButton = event.target; // Get the clicked button element

      var btnColor = new THREE.Color(
        getComputedStyle(event.target).backgroundColor
      );
      var hexColor = btnColor.getHexString();
      changeMaterial("color", hexColor);
      if (clickedButton.classList.contains("change-palette")) {
        updateTintPalette("#" + hexColor, "material");
      }
      updateUI();
    });
  }

  //  updateTintPalette("#888888", "material");
  //  updateTintPalette("#888888", "accent");
}

function updateTintPalette(hexColor, mode) {
  var backgroundTintBtns = document.querySelectorAll(
    ".tint.change-background-color"
  );
  var materialTintBtns = document.querySelectorAll(
    ".tint.change-material-color"
  );

  var backgroundShadeBtns = document.querySelectorAll(
    ".shade.change-background-color"
  );
  var materialShadeBtns = document.querySelectorAll(
    ".shade.change-material-color"
  );

  if (mode == "accent") {
    for (var c = 0; c < 8; c++) {
      backgroundTintBtns[c].style.backgroundColor = tinycolor(hexColor)
        .tint(c * 13 + 10)
        .toString();
      backgroundShadeBtns[c].style.backgroundColor = tinycolor(hexColor)
        .shade(c * 13 + 10)
        .toString();
    }
  }

  if (mode == "material") {
    for (var c = 0; c < 8; c++) {
      materialTintBtns[c].style.backgroundColor = tinycolor(hexColor)
        .tint(c * 13 + 10)
        .toString();
      materialShadeBtns[c].style.backgroundColor = tinycolor(hexColor)
        .shade(c * 13 + 10)
        .toString();
    }
  }
}

//transparentMaterialButton.addEventListener("click", function () {
//  changeMaterial("transparent", true);
//  updateTintPalette("#808080", "material");
//});

positionObjectButton.addEventListener("click", function () {
  setTransformControls("translate");
  toggleDrawer("close");
});
rotateObjectButton.addEventListener("click", function () {
  setTransformControls("rotate");
  toggleDrawer("close");
});
scaleObjectButton.addEventListener("click", function () {
  setTransformControls("scale");
  toggleDrawer("close");
});

deleteObjectButton.addEventListener("click", function () {
  deleteObject(selectedObject);
  toggleDrawer("close");
});
cloneObjectButton.addEventListener("click", function () {
  cloneObject();
  toggleDrawer("close");
});

groundShadowsActive.addEventListener("change", function (e) {
  if (groundShadowsActive.checked) {
    changeLighting("groundShadowsActive", true);
  } else {
    changeLighting("groundShadowsActive", false);
  }
});

exposureRange.addEventListener("input", function (e) {
  changeLighting("exposure", exposureRange.value);
});

moveSpotlightButton.addEventListener("click", function () {
  toggleDrawer("close");
  randomiseLighting("camera");
});

lensBlurCheck.addEventListener("change", function (e) {
  if (lensBlurCheck.checked) {
    changeEffect("lensBlur", true);
  } else {
    changeEffect("lensBlur", false);
  }
});

lensFocusRange.addEventListener("input", function (e) {
  changeEffect("lensFocus", lensFocusRange.value);
});

chromaticAberrationCheck.addEventListener("change", function (e) {
  if (chromaticAberrationCheck.checked) {
    changeEffect("chromaticAberration", true);
  } else {
    changeEffect("chromaticAberration", false);
  }
});

//Import Lighting and Objects

document.addEventListener("click", function (event) {
  const imgImportParent = event.target.closest(".import-lighting");
  const objImportParent = event.target.closest(".import-object");

  if (imgImportParent) {
    if (event.target.tagName === "IMG" && eX < 30) {
      const altReference = event.target.getAttribute("alt");
      loadEnvironment(altReference + ".hdr");
      toggleDrawer("close");
      eX += 1;
    }
  }

  if (objImportParent) {
    if (event.target.tagName === "IMG" && oX < 20) {
      const altReference = event.target.getAttribute("alt");
      if (altReference != "") {
      initModel("objects", true, altReference);
      toggleDrawer("close");
      oX += 1;
      }
    }
  }
});

//UPDATE SIDEBAR UI WHEN CALLED
function updateUI() {
  if (selectedFace) {
    glossinessRange.value = 1 - selectedFace.object.material.roughness;
    metallicRange.value = selectedFace.object.material.metalness;
    emissiveRange.value = selectedFace.object.material.emissiveIntensity;
  }
  lensFocusRange.value = 0.9;

  lensBlurCheck.checked = lensBlur;

  if (RGBShiftShaderPass.enabled == true) {
    chromaticAberrationCheck.checked = true;
  } else {
    chromaticAberrationCheck.checked = false;
  }
}

//Update Snapshot resolution labels
function updateSnapshotLabels() {
  var snapshotLabels = document.getElementsByClassName(
    "snapshot-resolution-text"
  );

  var aspectRatio = document.querySelector("#screenshot-aspectRatio").value;

  if (aspectRatio == "screen") {
    aspectRatio = camera.aspect;
  }

  for (var i = 0; i < snapshotLabels.length; i++) {
    var size = snapshotLabels[i].getAttribute("size");
    var value = snapshotLabels[i].getAttribute("value");

    if (aspectRatio > 1) {
      var newString =
        size + " " + value + " x " + Math.round(value / aspectRatio);
    } else {
      var newString =
        size + " " + Math.round(value * aspectRatio) + " x " + value;
    }

    snapshotLabels[i].innerHTML = newString;
  }
}

document
  .getElementById("screenshot-aspectRatio")
  .addEventListener("change", function () {
    updateSnapshotLabels();
  });

function SetUI(mode) {
  var cartHeader = document.getElementById("cartHeader");

  document.getElementById("face-container").style.display = "none";
  document.getElementById("scene-background-container").style.display = "none";
  document.getElementById("scene-lighting-container").style.display = "none";
  document.getElementById("scene-effects-container").style.display = "none";
  document.getElementById("import-plane-container").style.display = "none";
  document.getElementById("import-decorative-objects-container").style.display = "none";
  document.getElementById("save-file-container").style.display = "none";
  document.getElementById("snapshot-container").style.display = "none";
  document.getElementById("import-print-objects-container").style.display = "none";
  document.getElementById("import-digital-objects-container").style.display = "none";
  document.getElementById("import-packaging-objects-container").style.display = "none";
  document.getElementById("import-advertising-objects-container").style.display = "none";

  if (mode == "face") {
    document.getElementById("face-container").style.display = "block";
    cartHeader.innerHTML = "Edit Object";
  }
  if (mode == "scene-background") {
    document.getElementById("scene-background-container").style.display =
      "block";
    cartHeader.innerHTML = "Scene Background";
  }
  if (mode == "scene-lighting") {
    document.getElementById("scene-lighting-container").style.display = "block";
    cartHeader.innerHTML = "Scene Lighting";
  }
  if (mode == "scene-effects") {
    document.getElementById("scene-effects-container").style.display = "block";
    cartHeader.innerHTML = "Special Effects";
  }
  if (mode == "import-plane") {
    document.getElementById("import-plane-container").style.display = "block";
    cartHeader.innerHTML = "Add 3D Plane";
  }
  if (mode == "import-decorative-objects") {
    document.getElementById("import-decorative-objects-container").style.display = "block";
    cartHeader.innerHTML = "Add Decorations";
  }
  if (mode == "save-file") {
    document.getElementById("save-file-container").style.display = "block";
    cartHeader.innerHTML = "Saved Scenes";
  }
  if (mode == "snapshot") {
    document.getElementById("snapshot-container").style.display = "block";
    cartHeader.innerHTML = "Create Render";
  }
  if (mode == "import-print-objects") {
    document.getElementById("import-print-objects-container").style.display = "block";
    cartHeader.innerHTML = "Add Print Object";
  }
    if (mode == "import-digital-objects") {
    document.getElementById("import-digital-objects-container").style.display = "block";
    cartHeader.innerHTML = "Add Digital Object";
  }
    if (mode == "import-packaging-objects") {
    document.getElementById("import-packaging-objects-container").style.display = "block";
    cartHeader.innerHTML = "Add Packaging Object";
  }
  if (mode == "import-advertising-objects") {
    document.getElementById("import-advertising-objects-container").style.display = "block";
    cartHeader.innerHTML = "Add Advertising Object";
  }
}


//Camera Zoom buttons
document.getElementById("zoomIn").addEventListener("click", function () {
  var zoomDist = orbitControls.getDistance();
  if (zoomDist > orbitControls.minDistance) {
    camera.translateZ(-0.5);
  }
});

document.getElementById("zoomOut").addEventListener("click", function () {
  var zoomDist = orbitControls.getDistance();
  if (zoomDist < orbitControls.maxDistance) {
    camera.translateZ(0.5);
  }
});

//Close drawer sidebar
function toggleDrawer(mode) {
  if (mode == "open") {
    $(".ajax-cart__toggle").click();
  }
  if (mode == "close") {
    $(".cart-drawer__close-button").click();
  }
}

//Drawer Closing
window.drawerClose = function drawerClose() {
  if (transformControls.mode == null || clickMode == null) {
    applyHighlighting("none");
  }
};

//Drawer Closed
window.drawerCloseFinished = function drawerCloseFinished() {
  if (transformControls.mode == null || clickMode == null) {
    resetScene();
  }
};

//Pro Subscription functions
if (window.c) {
  const proElements = document.querySelectorAll(".free");
  proElements.forEach((element) => {
    element.remove();
  });
} else {
  const proElements = document.querySelectorAll(".pro");
  proElements.forEach((element) => {
    element.remove();
  });
}

function toggleLoadingScreen(visible) {
  if (visible == false){
  $("#loading-screen").fadeTo("slow", 0.0);
  $("#loading-spinner").fadeTo("slow", 0.0);
  } else {
  $("#loading-screen").fadeTo("slow", 1.0);
  $("#loading-spinner").fadeTo("slow", 1.0);
  }
  onWindowResize();
}

function toggleLoadingSpinner(opacity) {
   $("#loading-spinner").fadeTo("slow", opacity);
}

function toggleHint(text,opacity) {
    $("#hint-text").fadeTo("slow", opacity);
    if (text){
    $("#hint-text").html(text);
    }
}
