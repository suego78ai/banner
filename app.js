// Initialize Fabric Canvas
const canvas = new fabric.Canvas('mainCanvas', {
  backgroundColor: '#ffffff',
  preserveObjectStacking: true // Keep selected object on top without messing up z-index permanently
});
canvas.logicalWidth = 1920;
canvas.logicalHeight = 1080;

// Scale the visual container to fit in the panel while keeping internal resolution high
function resizeCanvasVisual() {
  const wrapper = document.querySelector('.canvas-wrapper');
  const container = document.querySelector('.canvas-container');
  
  if (!wrapper || !container) return;
  
  const logicalWidth = canvas.logicalWidth || 1920;
  const logicalHeight = canvas.logicalHeight || 1080;

  const wrapperWidth = wrapper.clientWidth - 40; // 40px padding
  const wrapperHeight = wrapper.clientHeight - 40;
  
  if (wrapperWidth <= 0 || wrapperHeight <= 0) return;
  
  const scaleX = wrapperWidth / logicalWidth;
  const scaleY = wrapperHeight / logicalHeight;
  const scale = Math.min(scaleX, scaleY); 
  
  canvas.setZoom(scale);
  canvas.setDimensions({
    width: logicalWidth * scale,
    height: logicalHeight * scale
  });
}

window.addEventListener('resize', resizeCanvasVisual);
setTimeout(resizeCanvasVisual, 100);

// ==========================================
// Right Panel: Size Configuration
// ==========================================
const categorySelect = document.getElementById('categorySelect');
const presetSizeSelect = document.getElementById('presetSize');

const sizeData = {
  banner: [
    { label: "8100*1100mm - 정문(풋살)", value: "8100x1100" },
    { label: "7900*1100mm - 정문(기숙사)", value: "7900x1100" },
    { label: "7000*900mm - 3~5호관", value: "7000x900" },
    { label: "5000*600mm - 8호관", value: "5000x600" },
    { label: "5000*700mm - 세미나실", value: "5000x700" },
    { label: "4000*600mm - 강의실", value: "4000x600" },
    { label: "입시면접용 실내외", value: "custom" }
  ],
  xbanner: [
    { label: "600*1800mm - 실내외", value: "600x1800" }
  ],
  notice: [
    { label: "A1 (610*914mm) - 실내외", value: "610x914" },
    { label: "A2 (420*594mm) - 실내외", value: "420x594" }
  ],
  poster: [
    { label: "A1 (610*914mm) - 실내외", value: "610x914" },
    { label: "A2 (420*594mm) - 실내외", value: "420x594" }
  ],
  signboard: [
    { label: "A1 (610*914mm) - 실내외", value: "610x914" },
    { label: "A2 (420*594mm) - 실내외", value: "420x594" }
  ],
  prize: [
    { label: "A1 (610*914mm) - 실내외", value: "610x914" },
    { label: "A2 (420*594mm) - 실내외", value: "420x594" }
  ]
};

if (categorySelect) {
  categorySelect.addEventListener('change', (e) => {
    const category = e.target.value;
    presetSizeSelect.innerHTML = '<option value="" disabled selected>상세 사이즈를 선택하세요</option>';
    
    if (sizeData[category]) {
      presetSizeSelect.disabled = false;
      sizeData[category].forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.value;
        opt.textContent = item.label;
        presetSizeSelect.appendChild(opt);
      });

    } else {
      presetSizeSelect.disabled = true;
    }
  });
}

if (presetSizeSelect) {
  presetSizeSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val && val !== 'custom') {
      const [w, h] = val.split('x');
      canvas.logicalWidth = parseInt(w, 10);
      canvas.logicalHeight = parseInt(h, 10);
      resizeCanvasVisual();
      canvas.renderAll();
    }
  });
}

// ==========================================
// Text Controls
// ==========================================
const fontFamilySelect = document.getElementById('fontFamilySelect');
const textColorPicker = document.getElementById('textColorPicker');

document.getElementById('addTextBtn').addEventListener('click', () => {
  const logicalWidth = canvas.logicalWidth || 1920;
  const logicalHeight = canvas.logicalHeight || 1080;
  
  const font = fontFamilySelect ? fontFamilySelect.value : 'Inter';
  const color = textColorPicker ? textColorPicker.value : '#ffffff';

  const text = new fabric.IText('새로운 텍스트', {
    left: logicalWidth / 2,
    top: logicalHeight / 2,
    originX: 'center',
    originY: 'center',
    fontFamily: font,
    fontSize: 100,
    fill: color,
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

// ==========================================
// Event Info Controls (Left Panel)
// ==========================================
document.getElementById('addTitleBtn').addEventListener('click', () => {
  const logicalWidth = canvas.logicalWidth || 1920;
  const logicalHeight = canvas.logicalHeight || 1080;
  
  let textValue = document.getElementById('eventTitleInput').value || '행사 제목을 입력하세요';
  const font = document.getElementById('titleFontSelect').value;
  const color = document.getElementById('titleColorPicker').value;
  
  const directionSelect = document.getElementById('titleDirectionSelect');
  const isVertical = directionSelect && directionSelect.value === 'vertical';
  
  if (isVertical) {
    textValue = textValue.replace(/\n/g, ' ').split('').join('\n');
  }

  const text = new fabric.IText(textValue, {
    left: logicalWidth / 2,
    top: logicalHeight * 0.35,
    originX: 'center',
    originY: 'center',
    fontFamily: font,
    fontSize: 160,
    fontWeight: 'bold',
    fill: color,
    shadow: new fabric.Shadow({
      color: 'rgba(0,0,0,0.6)',
      blur: 15,
      offsetX: 4,
      offsetY: 4
    })
  });
  canvas.add(text);
  canvas.setActiveObject(text);
});

document.getElementById('addDateBtn').addEventListener('click', () => {
  const logicalWidth = canvas.logicalWidth || 1920;
  const logicalHeight = canvas.logicalHeight || 1080;
  
  let textValue = document.getElementById('eventDateInput').value || '행사 일자 및 장소';
  const font = document.getElementById('dateFontSelect').value;
  const color = document.getElementById('dateColorPicker').value;

  const directionSelect = document.getElementById('dateDirectionSelect');
  const isVertical = directionSelect && directionSelect.value === 'vertical';
  
  if (isVertical) {
    textValue = textValue.replace(/\n/g, ' ').split('').join('\n');
  }

  const text = new fabric.IText(textValue, {
    left: logicalWidth / 2,
    top: logicalHeight * 0.6,
    originX: 'center',
    originY: 'center',
    fontFamily: font,
    fontSize: 90,
    fill: color,
    shadow: new fabric.Shadow({
      color: 'rgba(0,0,0,0.6)',
      blur: 10,
      offsetX: 2,
      offsetY: 2
    })
  });
  canvas.add(text);
  canvas.setActiveObject(text);
});

const fontSelects = [
  document.getElementById('fontFamilySelect'),
  document.getElementById('titleFontSelect'),
  document.getElementById('dateFontSelect')
];

fontSelects.forEach(select => {
  if (select) {
    select.addEventListener('change', (e) => {
      const activeObj = canvas.getActiveObject();
      if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
        activeObj.set('fontFamily', e.target.value);
        canvas.renderAll();
      }
    });
  }
});

const colorPickers = [
  document.getElementById('textColorPicker'),
  document.getElementById('titleColorPicker'),
  document.getElementById('dateColorPicker')
];

colorPickers.forEach(picker => {
  if (picker) {
    picker.addEventListener('input', (e) => {
      const activeObj = canvas.getActiveObject();
      if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
        activeObj.set('fill', e.target.value);
        canvas.renderAll();
      }
    });
  }
});

canvas.on('selection:created', updateTextControls);
canvas.on('selection:updated', updateTextControls);

function updateTextControls() {
  const activeObj = canvas.getActiveObject();
  if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
    if (activeObj.fontFamily) {
      fontSelects.forEach(select => {
        if (select) select.value = activeObj.fontFamily;
      });
    }
    if (activeObj.fill && typeof activeObj.fill === 'string' && activeObj.fill.startsWith('#')) {
      const hex = activeObj.fill.substring(0, 7);
      colorPickers.forEach(picker => {
        if (picker) picker.value = hex;
      });
    }
  }
}

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
    canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
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
// Left Panel: AI Generation (Stability AI Image-to-Image)
// ==========================================
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const designGallery = document.getElementById('designGallery');

const apiKeyInput = document.getElementById('apiKeyInput');
if (apiKeyInput) {
  apiKeyInput.value = localStorage.getItem('stability_api_key') || '';
  apiKeyInput.addEventListener('input', (e) => {
    localStorage.setItem('stability_api_key', e.target.value);
  });
}

const strengthRange = document.getElementById('imageStrengthRange');
const strengthVal = document.getElementById('imageStrengthVal');
if (strengthRange && strengthVal) {
  strengthRange.addEventListener('input', (e) => {
    strengthVal.textContent = e.target.value;
  });
}

generateBtn.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert("원하는 느낌이나 테마를 입력해주세요!");
    return;
  }

  const apiKey = document.getElementById('apiKeyInput') ? document.getElementById('apiKeyInput').value.trim() : '';
  if (!apiKey) {
    alert("Stability AI API Key를 입력해주세요.");
    return;
  }

  const dsiSelect = document.getElementById('dsiImageSelect');
  const referenceUrl = dsiSelect ? dsiSelect.value : '';
  if (!referenceUrl) {
    alert("참고할 DSI 이미지를 선택해주세요.");
    return;
  }

  const imageStrength = parseFloat(document.getElementById('imageStrengthRange').value) || 0.35;

  // Show loading
  designGallery.innerHTML = '';
  loadingIndicator.classList.remove('hidden');
  generateBtn.disabled = true;

  try {
    // 1. Fetch the selected DSI image as Blob
    const imgResponse = await fetch(referenceUrl);
    if (!imgResponse.ok) throw new Error("이미지를 불러올 수 없습니다.");
    let imageBlob = await imgResponse.blob();
    
    // 2. Resize to standard dimensions for Stability v1-5 (multiples of 64, max ~768px for fast/stable generation)
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    
    const resizedBlob = await new Promise((resolve, reject) => {
      tempImg.onload = () => {
        let width = tempImg.width;
        let height = tempImg.height;
        const maxDim = 768; 
        
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        // Ensure multiples of 64
        width = Math.round(width / 64) * 64;
        height = Math.round(height / 64) * 64;
        width = Math.max(64, width);
        height = Math.max(64, height);
        
        tempCanvas.width = width;
        tempCanvas.height = height;
        tempCtx.drawImage(tempImg, 0, 0, width, height);
        
        tempCanvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      };
      tempImg.onerror = reject;
      tempImg.src = URL.createObjectURL(imageBlob);
    });

    const formData = new FormData();
    formData.append('init_image', resizedBlob);
    formData.append('init_image_mode', 'IMAGE_STRENGTH');
    formData.append('image_strength', imageStrength);
    formData.append('text_prompts[0][text]', prompt);
    formData.append('samples', 1);

    const apiResponse = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-v1-5/image-to-image', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`API 오류: ${apiResponse.status} ${errorText}`);
    }

    const resultData = await apiResponse.json();
    
    // Display result
    resultData.artifacts.forEach((artifact) => {
      const item = document.createElement('div');
      item.className = 'design-item';
      
      const img = new Image();
      img.src = `data:image/png;base64,${artifact.base64}`;
      
      item.appendChild(img);
      designGallery.appendChild(item);

      // Click event to set as CANVAS BACKGROUND
      item.addEventListener('click', () => {
        fabric.Image.fromURL(img.src, (fabricImg) => {
          const logicalWidth = canvas.logicalWidth || 1920;
          const logicalHeight = canvas.logicalHeight || 1080;
          
          const scaleX = logicalWidth / fabricImg.width;
          const scaleY = logicalHeight / fabricImg.height;
          const scale = Math.max(scaleX, scaleY);
          
          fabricImg.set({
            originX: 'center',
            originY: 'center',
            left: logicalWidth / 2,
            top: logicalHeight / 2,
            scaleX: scale,
            scaleY: scale
          });
          
          canvas.setBackgroundImage(fabricImg, canvas.renderAll.bind(canvas));
        });
      });
    });

  } catch (error) {
    console.error(error);
    alert("이미지 생성 중 오류가 발생했습니다.\n" + error.message);
  } finally {
    loadingIndicator.classList.add('hidden');
    generateBtn.disabled = false;
  }
});

// ==========================================
// Export
// ==========================================
document.getElementById('exportBtn').addEventListener('click', () => {
  // Deselect active object so controls (borders, handles) are not in the image
  canvas.discardActiveObject();
  canvas.renderAll();

  // Make canvas output exactly match the logical size (which represents the physical mm size)
  const logicalWidth = canvas.logicalWidth || 1920;
  const exportTargetWidth = logicalWidth; 
  const multiplier = exportTargetWidth / canvas.getWidth();

  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier: multiplier 
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
      const encodedUrl = encodeURI(e.target.value);
      logoPreview.src = encodedUrl;
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
    
    const encodedUrl = encodeURI(val);
    fabric.Image.fromURL(encodedUrl, function(img) {
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

