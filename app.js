// Initialize Fabric Canvas
const canvas = new fabric.Canvas('mainCanvas', {
  width: 1920,
  height: 1080,
  backgroundColor: 'transparent',
  preserveObjectStacking: true // Keep selected object on top without messing up z-index permanently
});

// Scale the visual container to fit in the panel while keeping internal resolution high
function resizeCanvasVisual() {
  const wrapper = document.querySelector('.canvas-wrapper');
  const container = document.querySelector('.canvas-container');
  
  if (!wrapper || !container) return;

  const wrapperWidth = wrapper.clientWidth - 40; // 40px padding
  const wrapperHeight = wrapper.clientHeight - 40;
  
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  
  const scaleX = wrapperWidth / canvasWidth;
  const scaleY = wrapperHeight / canvasHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 1
  
  container.style.transform = `scale(${scale})`;
  container.style.transformOrigin = 'center center';
}

window.addEventListener('resize', resizeCanvasVisual);
setTimeout(resizeCanvasVisual, 100);

// ==========================================
// Right Panel: Size Configuration
// ==========================================
const presetSizeSelect = document.getElementById('presetSize');
const widthInput = document.getElementById('canvasWidth');
const heightInput = document.getElementById('canvasHeight');
const applySizeBtn = document.getElementById('applySizeBtn');

presetSizeSelect.addEventListener('change', (e) => {
  const val = e.target.value;
  if (val !== 'custom') {
    const [w, h] = val.split('x');
    widthInput.value = w;
    heightInput.value = h;
  }
});

applySizeBtn.addEventListener('click', () => {
  const w = parseInt(widthInput.value, 10);
  const h = parseInt(heightInput.value, 10);
  
  if (w > 0 && h > 0) {
    canvas.setWidth(w);
    canvas.setHeight(h);
    canvas.renderAll();
    resizeCanvasVisual();
    presetSizeSelect.value = 'custom';
  } else {
    alert("올바른 사이즈를 입력해주세요.");
  }
});

// ==========================================
// Center Panel: Controls (Text, Clear)
// ==========================================
document.getElementById('addTextBtn').addEventListener('click', () => {
  const text = new fabric.IText('새로운 텍스트', {
    left: canvas.width / 2,
    top: canvas.height / 2,
    originX: 'center',
    originY: 'center',
    fontFamily: 'Inter',
    fontSize: 80,
    fill: '#ffffff',
    shadow: new fabric.Shadow({
      color: 'rgba(0,0,0,0.5)',
      blur: 10,
      offsetX: 2,
      offsetY: 2
    })
  });
  canvas.add(text);
  canvas.setActiveObject(text);
});

const deleteObjBtn = document.getElementById('deleteObjBtn');
if (deleteObjBtn) {
  deleteObjBtn.addEventListener('click', () => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      canvas.discardActiveObject();
      activeObjects.forEach(function(object) {
        canvas.remove(object);
      });
    }
  });
}

document.getElementById('clearCanvasBtn').addEventListener('click', () => {
  if(confirm("캔버스를 초기화하시겠습니까?")) {
    canvas.clear();
    canvas.setBackgroundColor('transparent', canvas.renderAll.bind(canvas));
  }
});

// Keyboard delete
window.addEventListener("keydown", (e) => {
  if (e.key === "Delete" || e.key === "Backspace") {
    // prevent deleting if user is typing in a textarea or input
    if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') return;
    
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      if (activeObj.isEditing) return; // Don't delete if typing text
      
      e.preventDefault();
      const activeObjects = canvas.getActiveObjects();
      canvas.discardActiveObject();
      activeObjects.forEach(function(object) {
        canvas.remove(object);
      });
    }
  }
});

// ==========================================
// Left Panel: Mock AI Generation
// ==========================================
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const designGallery = document.getElementById('designGallery');

generateBtn.addEventListener('click', () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert("원하는 느낌이나 테마를 입력해주세요!");
    return;
  }

  // Show loading
  designGallery.innerHTML = '';
  loadingIndicator.classList.remove('hidden');
  generateBtn.disabled = true;

  // Simulate API Delay
  setTimeout(() => {
    loadingIndicator.classList.add('hidden');
    generateBtn.disabled = false;
    
    // Generate 3 mock designs
    for (let i = 0; i < 3; i++) {
      const seed = Math.floor(Math.random() * 10000);
      const imageUrl = `https://picsum.photos/seed/${seed}/800/400`;
      
      const item = document.createElement('div');
      item.className = 'design-item';
      item.innerHTML = `<img src="${imageUrl}" alt="AI Design ${i+1}" crossorigin="anonymous">`;
      
      // Click event to add to canvas
      item.addEventListener('click', () => {
        fabric.Image.fromURL(imageUrl, (img) => {
          // Scale image to fit canvas width if it's too large
          let scale = 1;
          if (img.width > canvas.width) {
            scale = canvas.width / img.width;
          }
          
          img.set({
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale
          });
          
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        }, { crossOrigin: 'anonymous' });
      });

      designGallery.appendChild(item);
    }
  }, 2000);
});

// ==========================================
// Export
// ==========================================
document.getElementById('exportBtn').addEventListener('click', () => {
  // Deselect active object so controls (borders, handles) are not in the image
  canvas.discardActiveObject();
  canvas.renderAll();

  // Make canvas a bit larger for high-res export or just use current res
  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier: 1 // can be increased for higher res
  });

  const link = document.createElement('a');
  link.download = 'banner-design.png';
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Initial greeting text
const initText = new fabric.IText('여기에 디자인이 배치됩니다', {
  left: 1920 / 2,
  top: 1080 / 2,
  originX: 'center',
  originY: 'center',
  fontFamily: 'Inter',
  fontSize: 60,
  fill: 'rgba(255,255,255,0.3)'
});
canvas.add(initText);

// ==========================================
// Left Panel: Logo Upload (From Repository)
// ==========================================
const logoFiles = [
  "Emblem.jpg", "Emblem.png", "Emblem_White.png", 
  "Logo Type.jpg", "Logo Type_영어.jpg", "Logo Type_영어.png", "Logo Type_영어_White.png",
  "Logo Type_한글.jpg", "Logo Type_한글.png", "Logo Type_한글_White.png",
  "Logo Type_한자.jpg", "Logo Type_한자.png", "Logo Type_한자_White.png",
  "Signiture.jpg", "Signiture.png", "Signiture_Cyan Blue.jpg", "Signiture_Cyan Blue.png", "Signiture_White.png",
  "仁.jpg", "仁.png"
];

const logoSelect = document.getElementById("logoSelect");
const logoPreview = document.getElementById("logoPreview");
const logoPreviewPlaceholder = document.getElementById("logoPreviewPlaceholder");

if (logoSelect) {
  logoFiles.forEach(file => {
    const opt = document.createElement("option");
    opt.value = "jpg/" + file;
    opt.textContent = file;
    logoSelect.appendChild(opt);
  });

  logoSelect.addEventListener("change", (e) => {
    if (logoPreview && logoPreviewPlaceholder) {
      logoPreview.src = e.target.value;
      logoPreview.style.display = "block";
      logoPreviewPlaceholder.style.display = "none";
    }
  });
}

const addLogoBtn = document.getElementById("addLogoBtn");
if (addLogoBtn) {
  addLogoBtn.addEventListener("click", () => {
    const val = logoSelect.value;
    if (!val) {
      alert("로고를 먼저 선택해주세요.");
      return;
    }
    
    fabric.Image.fromURL(val, function(img) {
      // Scale down if logo is too large
      const maxLogoSize = 250;
      if (img.width > maxLogoSize || img.height > maxLogoSize) {
        const scale = Math.min(maxLogoSize / img.width, maxLogoSize / img.height);
        img.scale(scale);
      }
      
      img.set({
        left: 40,
        top: 40,
        originX: "left",
        originY: "top"
      });
      
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  });
}

