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
const canvasSizeSelect = document.getElementById('canvasSizeSelect');

if (canvasSizeSelect) {
  canvasSizeSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val) {
      const [w, h] = val.split('x');
      canvas.logicalWidth = parseInt(w, 10);
      canvas.logicalHeight = parseInt(h, 10);
      resizeCanvasVisual();

      const baseDimension = Math.min(canvas.logicalWidth, canvas.logicalHeight);
      
      canvas.getObjects().forEach(obj => {
        if (obj.customType === 'eventTitle') {
          const defaultSize = Math.min(160, Math.round(baseDimension * 0.15));
          obj.set({ left: canvas.logicalWidth / 2, top: canvas.logicalHeight * 0.35 });
          autoFitTextWidth(obj, canvas.logicalWidth, defaultSize);
          obj.setCoords();
        } else if (obj.customType === 'eventDate') {
          const defaultSize = Math.min(90, Math.round(baseDimension * 0.08));
          obj.set({ left: canvas.logicalWidth / 2, top: canvas.logicalHeight * 0.6 });
          autoFitTextWidth(obj, canvas.logicalWidth, defaultSize);
          obj.setCoords();
        } else if (obj.customType === 'backgroundImage') {
          const scaleX = canvas.logicalWidth / obj.width;
          const scaleY = canvas.logicalHeight / obj.height;
          const scale = Math.max(scaleX, scaleY);
          
          obj.set({
            left: canvas.logicalWidth / 2,
            top: canvas.logicalHeight / 2,
            scaleX: scale,
            scaleY: scale
          });
          obj.setCoords();
        }
      });
      
      canvas.renderAll();
      if (typeof updateTextControls === 'function') updateTextControls();
    }
  });
}

// Helper to shrink text to fit canvas width
function autoFitTextWidth(textObj, logicalWidth, defaultFontSize) {
  textObj.set('fontSize', defaultFontSize);
  textObj.initDimensions();
  const maxWidth = logicalWidth * 0.9;
  if (textObj.width > maxWidth) {
    const scaleRatio = maxWidth / textObj.width;
    textObj.set('fontSize', Math.floor(defaultFontSize * scaleRatio));
    textObj.initDimensions();
  }
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

  let existingText = null;
  canvas.getObjects().forEach(obj => {
    if (obj.customType === 'eventTitle') {
      existingText = obj;
    }
  });

  const baseDimension = Math.min(logicalWidth, logicalHeight);
  const defaultSize = Math.min(160, Math.round(baseDimension * 0.15));

  if (existingText) {
    existingText.set({
      text: textValue,
      fontFamily: font,
      fill: color
    });
    autoFitTextWidth(existingText, logicalWidth, defaultSize);
    canvas.renderAll();
    canvas.setActiveObject(existingText);
  } else {
    const text = new fabric.IText(textValue, {
      left: logicalWidth / 2,
      top: logicalHeight * 0.35,
      originX: 'center',
      originY: 'center',
      fontFamily: font,
      fontSize: defaultSize,
      fontWeight: 'bold',
      fill: color,
      customType: 'eventTitle',
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.6)',
        blur: 15,
        offsetX: 4,
        offsetY: 4
      })
    });
    autoFitTextWidth(text, logicalWidth, defaultSize);
    canvas.add(text);
    canvas.setActiveObject(text);
  }
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

  let existingText = null;
  canvas.getObjects().forEach(obj => {
    if (obj.customType === 'eventDate') {
      existingText = obj;
    }
  });

  const baseDimension = Math.min(logicalWidth, logicalHeight);
  const defaultSize = Math.min(90, Math.round(baseDimension * 0.08));

  if (existingText) {
    existingText.set({
      text: textValue,
      fontFamily: font,
      fill: color
    });
    autoFitTextWidth(existingText, logicalWidth, defaultSize);
    canvas.renderAll();
    canvas.setActiveObject(existingText);
  } else {
    const text = new fabric.IText(textValue, {
      left: logicalWidth / 2,
      top: logicalHeight * 0.6,
      originX: 'center',
      originY: 'center',
      fontFamily: font,
      fontSize: defaultSize,
      fill: color,
      customType: 'eventDate',
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.6)',
        blur: 10,
        offsetX: 2,
        offsetY: 2
      })
    });
    autoFitTextWidth(text, logicalWidth, defaultSize);
    canvas.add(text);
    canvas.setActiveObject(text);
  }
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

const fontSizeInput = document.getElementById('fontSizeInput');
if (fontSizeInput) {
  fontSizeInput.addEventListener('input', (e) => {
    const activeObj = canvas.getActiveObject();
    if (activeObj && (activeObj.type === 'i-text' || activeObj.type === 'text')) {
      const val = parseInt(e.target.value, 10);
      if (val > 0) {
        activeObj.set('fontSize', val);
        canvas.renderAll();
      }
    }
  });
}

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
    if (activeObj.fontSize && fontSizeInput) {
      fontSizeInput.value = Math.round(activeObj.fontSize);
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
});// ==========================================
// Right Panel: AI Auto Design & Encrypted API Key
// ==========================================
const apiKeyInput = document.getElementById('geminiApiKey');
const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
const resetApiKeyBtn = document.getElementById('resetApiKeyBtn');
const apiKeySuccess = document.getElementById('apiKeySuccess');
const apiKeyInputBox = document.getElementById('apiKeyInputBox');
const apiKeyDesc = document.getElementById('apiKeyDesc');
const generateAutoDesignBtn = document.getElementById('generateAutoDesignBtn');

// Simple Obfuscation to prevent plain-text API key in LocalStorage
const OBFUSCATION_KEY = "BannerMakerAI2026Sec!";

function encryptKey(text) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length));
  }
  return btoa(encodeURIComponent(result));
}

function decryptKey(encoded) {
  try {
    let text = decodeURIComponent(atob(encoded));
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ OBFUSCATION_KEY.charCodeAt(i % OBFUSCATION_KEY.length));
    }
    return result;
  } catch (e) {
    return "";
  }
}

function updateApiKeyUI() {
  const savedEncrypted = localStorage.getItem('encGeminiApiKey');
  if (savedEncrypted) {
    apiKeyInputBox.style.display = 'none';
    apiKeyDesc.style.display = 'none';
    apiKeySuccess.style.display = 'flex';
  } else {
    apiKeyInputBox.style.display = 'flex';
    apiKeyDesc.style.display = 'block';
    apiKeySuccess.style.display = 'none';
    apiKeyInput.value = '';
  }
}

if (apiKeyInput && saveApiKeyBtn && resetApiKeyBtn) {
  // Clear old unencrypted key if exists
  localStorage.removeItem('geminiApiKey');
  updateApiKeyUI();

  saveApiKeyBtn.addEventListener('click', () => {
    const val = apiKeyInput.value.trim();
    if (val) {
      const encrypted = encryptKey(val);
      localStorage.setItem('encGeminiApiKey', encrypted);
      updateApiKeyUI();
    } else {
      alert("API 키를 입력해주세요.");
    }
  });

  resetApiKeyBtn.addEventListener('click', () => {
    localStorage.removeItem('encGeminiApiKey');
    updateApiKeyUI();
  });
}

function applyBackgroundToCanvas(bgUrl, callback) {
  fabric.Image.fromURL(bgUrl, (fabricImg) => {
    const logicalWidth = canvas.logicalWidth || 1920;
    const logicalHeight = canvas.logicalHeight || 1080;
    
    // Clear any previously locked background
    canvas.setBackgroundImage(null, () => {});
    
    // Remove any previously added background object
    canvas.getObjects().forEach(obj => {
      if (obj.customType === 'backgroundImage') {
        canvas.remove(obj);
      }
    });

    const scaleX = logicalWidth / fabricImg.width;
    const scaleY = logicalHeight / fabricImg.height;
    const scale = Math.max(scaleX, scaleY);
    
    fabricImg.set({
      originX: 'center',
      originY: 'center',
      left: logicalWidth / 2,
      top: logicalHeight / 2,
      scaleX: scale,
      scaleY: scale,
      customType: 'backgroundImage'
    });
    
    canvas.add(fabricImg);
    canvas.sendToBack(fabricImg);
    canvas.setActiveObject(fabricImg);
    canvas.renderAll();
    
    if (callback) callback();
  });
}

function extractDepartment(title) {
  const match = title.match(/([가-힣A-Za-z0-9]+(?:학과|학부|과|전공|대학))/);
  return match ? match[1] : null;
}

async function generateAIBackground(apiKey, title) {
  // 1. 무료 Gemini 1.5 Flash 모델을 호출하여 영문 디자인 프롬프트 생성
  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const dept = extractDepartment(title) || "Event";
  
  // 프롬프트 엔지니어링: 무료 AI가 완벽한 프롬프트를 짜도록 명령
  const promptRequest = `Write a single, highly detailed English prompt for an AI image generator to create a professional banner background for a ${dept}. The design must be modern, high-quality, elegant, and visually stunning. CRITICAL: Keep the central area clean and somewhat dark so overlay text will be highly legible. Output ONLY the English prompt string, nothing else.`;

  const payload = {
    contents: [{ parts: [{ text: promptRequest }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 150
    }
  };

  let imagePrompt = "";
  try {
    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "텍스트 프롬프트 생성 실패");
    }
    imagePrompt = data.candidates[0].content.parts[0].text.trim();
  } catch (e) {
    console.error("Gemini Flash Error:", e);
    // API 통신 실패 시 사용할 기본 프롬프트(Fallback)
    imagePrompt = `A modern, abstract, and high-quality background for a ${dept} banner. Dark and clean center for text placement. Beautiful lighting and professional textures.`;
  }

  // 2. 캔버스 비율에 맞춘 해상도 계산 (무료 렌더러용)
  let w = 1920, h = 1080;
  const ratio = canvas.logicalWidth / canvas.logicalHeight;
  
  if (ratio < 0.6) { w = 600; h = 1800; } // X배너 (1:3 비율 근사치, 고화질 렌더링을 위해 해상도 최적화)
  else if (ratio < 0.9) { w = 1024; h = 1280; } // 세로형 포스터
  else if (ratio < 1.1) { w = 1024; h = 1024; } // 정방형
  else if (ratio < 1.5) { w = 1280; h = 1024; } // 4:3
  else { w = 1920; h = 1080; } // 가로형 웹 현수막
  
  // X배너(600x1800)의 경우 Pollinations가 과하게 길면 크롭할 수 있으므로 최대 렌더링 해상도를 720x2160 비율로 요청
  if (ratio < 0.6) { w = 720; h = 2160; }

  // 3. 무료 이미지 렌더링 서버(Pollinations.ai)에 요청하여 이미지 가져오기
  // nologo=true로 워터마크 제거, 랜덤 시드를 줘서 매번 다른 이미지가 나오도록 설정
  const randomSeed = Math.floor(Math.random() * 1000000);
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=${w}&height=${h}&seed=${randomSeed}&nologo=true`;

  try {
    const imgRes = await fetch(pollinationsUrl);
    if (!imgRes.ok) throw new Error("이미지 렌더링 서버 에러");
    const blob = await imgRes.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
    throw new Error("이미지 다운로드 실패: " + e.message);
  }
}

if (generateAutoDesignBtn) {
  generateAutoDesignBtn.addEventListener('click', async () => {
    const titleInput = document.getElementById('eventTitleInput');
    const titleText = titleInput ? titleInput.value.trim() : '';
    const loadingOverlay = document.getElementById('aiLoadingOverlay');
    
    const savedEncrypted = localStorage.getItem('encGeminiApiKey');
    if (!savedEncrypted) {
      alert("오른쪽 상단에 Google Gemini API 키를 먼저 등록(저장)해주세요!");
      return;
    }
    
    const apiKey = decryptKey(savedEncrypted);
    if (!apiKey) {
      alert("저장된 API 키가 손상되었습니다. 초기화 후 다시 입력해주세요.");
      return;
    }

    if (!titleText) {
      alert("행사 제목을 입력해야 AI가 학과명 등 맥락에 맞는 배경을 자동 생성할 수 있습니다!");
      return;
    }

    let bgUrlToApply = null;
    try {
      if (loadingOverlay) loadingOverlay.style.display = 'flex';
      bgUrlToApply = await generateAIBackground(apiKey, titleText);
    } catch (err) {
      console.error(err);
      alert("AI 이미지 생성 실패: " + err.message);
      return;
    } finally {
      if (loadingOverlay) loadingOverlay.style.display = 'none';
    }

    if (!bgUrlToApply) return;
    
    applyBackgroundToCanvas(bgUrlToApply, () => {
      const addTitleBtn = document.getElementById('addTitleBtn');
      if (addTitleBtn && titleText !== '') {
        addTitleBtn.click();
      }

      const addDateBtn = document.getElementById('addDateBtn');
      const eventDateInput = document.getElementById('eventDateInput');
      if (addDateBtn && eventDateInput && eventDateInput.value.trim() !== '') {
        setTimeout(() => {
          addDateBtn.click();
        }, 100);
      }
    });
  });
}

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

// ==========================================
// Excel Data Integration
// ==========================================
const excelUploadBtn = document.getElementById('excelUploadBtn');
const excelUpload = document.getElementById('excelUpload');
const excelDataSelect = document.getElementById('excelDataSelect');

let parsedExcelData = [];

if (excelUploadBtn && excelUpload && excelDataSelect) {
  excelUploadBtn.addEventListener('click', () => {
    excelUpload.click();
  });

  excelUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Use raw: true (default) since cellDates is true, dates will be parsed as JS Date objects
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      
      if (jsonData.length > 0) {
        parsedExcelData = jsonData;
        
        excelDataSelect.innerHTML = '<option value="" disabled selected>원하는 행사를 선택하세요...</option>';
        
        jsonData.forEach((row, index) => {
          const programName = row['프로그램명'] || row['프로그램'] || `행사 ${index + 1}`;
          
          const option = document.createElement('option');
          option.value = index;
          option.textContent = programName;
          excelDataSelect.appendChild(option);
        });
        
        excelDataSelect.style.display = 'block';
        const bulkBtn = document.getElementById('bulkGenerateBtn');
        if (bulkBtn) bulkBtn.style.display = 'block';
        alert(`총 ${jsonData.length}개의 행사 데이터를 성공적으로 불러왔습니다! 드롭다운에서 행사를 선택해보세요.`);
      } else {
        alert("업로드한 엑셀 파일에 데이터가 없거나 형식이 맞지 않습니다.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; // Reset input
  });

  excelDataSelect.addEventListener('change', (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex === "") return;
    
    const rowData = parsedExcelData[selectedIndex];
    
    function formatKoreanDate(val) {
      if (!val) return '';
      let d = val;
      if (typeof val === 'string' && !isNaN(Date.parse(val))) {
        // If it looks like a valid date string (e.g. "2026-05-30T14:00")
        d = new Date(val);
      }
      
      if (d instanceof Date && !isNaN(d)) {
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();
        let hours = d.getHours();
        const minutes = d.getMinutes();
        
        // If hours and minutes are both 0, it might be a date-only field, but the user requested AM/PM format explicitly.
        // Assuming user always wants AM/PM format if it's a valid date.
        const ampm = hours >= 12 ? '오후' : '오전';
        hours = hours % 12;
        hours = hours ? hours : 12; // convert 0 to 12
        const minStr = minutes < 10 ? '0' + minutes : minutes;
        
        return `${year}년 ${month}월 ${day}일 ${ampm} ${hours}:${minStr}`;
      }
      return val;
    }
    
    // 1. Update Title Input
    const titleInput = document.getElementById('eventTitleInput');
    const titleVal = rowData['프로그램명'] || rowData['프로그램'] || '';
    if (titleInput && titleVal) {
      titleInput.value = titleVal;
    }

    // 2. Update Date Input (combining Date and Location)
    const dateInput = document.getElementById('eventDateInput');
    const rawSchedule = rowData['일정'] || rowData['날짜'] || '';
    const schedule = formatKoreanDate(rawSchedule);
    const location = rowData['교육장소'] || rowData['장소'] || '';
    
    let combinedDateText = schedule;
    if (location) {
      combinedDateText += (combinedDateText ? '\n' : '') + location;
    }
    
    if (dateInput && combinedDateText) {
      dateInput.value = combinedDateText;
    }

    // 3. Automatically trigger button clicks to update canvas
    const addTitleBtn = document.getElementById('addTitleBtn');
    const addDateBtn = document.getElementById('addDateBtn');
    
    if (addTitleBtn && titleVal) addTitleBtn.click();
    if (addDateBtn && combinedDateText) addDateBtn.click();
  });
}

// ==========================================
// Bulk Generation & ZIP Download
// ==========================================
const bulkGenerateBtn = document.getElementById('bulkGenerateBtn');
const galleryContainer = document.getElementById('galleryContainer');
const galleryList = document.getElementById('galleryList');
const downloadZipBtn = document.getElementById('downloadZipBtn');
let generatedBanners = [];

if (bulkGenerateBtn) {
  bulkGenerateBtn.addEventListener('click', async () => {
    if (parsedExcelData.length === 0) return;
    
    // Disable UI during generation
    bulkGenerateBtn.disabled = true;
    bulkGenerateBtn.textContent = '생성 중...';
    galleryContainer.style.display = 'block';
    galleryList.innerHTML = '<p style="color: var(--text-secondary);">현수막을 생성하고 있습니다. 잠시만 기다려주세요...</p>';
    generatedBanners = [];

    // Helper to delay for rendering
    const delay = ms => new Promise(res => setTimeout(res, ms));

    for (let i = 0; i < parsedExcelData.length; i++) {
      // Temporarily select the item to trigger the change event
      excelDataSelect.value = i;
      excelDataSelect.dispatchEvent(new Event('change'));
      
      // Wait a moment for fabric.js to render
      await delay(150); 
      
      // Export to data URL
      const dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.9 });
      
      // Create a filename based on the title or index
      const rowData = parsedExcelData[i];
      const title = rowData['프로그램명'] || rowData['프로그램'] || `행사_${i+1}`;
      const safeTitle = title.replace(/[^a-zA-Z0-9가-힣]/g, '_').substring(0, 30);
      const filename = `${safeTitle}_현수막.jpg`;
      
      generatedBanners.push({ filename, dataUrl, index: i });
    }

    // Select the first one to show only one on canvas
    if (parsedExcelData.length > 0) {
      excelDataSelect.value = 0;
      excelDataSelect.dispatchEvent(new Event('change'));
    }

    // Render Gallery as File List
    galleryList.style.flexDirection = 'column';
    galleryList.style.gap = '0';
    galleryList.style.maxHeight = '200px';
    galleryList.style.overflowY = 'auto';
    galleryList.style.padding = '0.5rem';
    galleryList.innerHTML = '';
    
    generatedBanners.forEach((banner, idx) => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.padding = '0.5rem 0';
      item.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
      
      const nameSpan = document.createElement('span');
      // Ensure unique filename string
      const displayFilename = `${String(idx + 1).padStart(2, '0')}_${banner.filename}`;
      nameSpan.textContent = `📄 ${displayFilename}`;
      nameSpan.style.cursor = 'pointer';
      nameSpan.style.color = '#60a5fa'; // Light blue for links
      nameSpan.style.fontSize = '0.9rem';
      nameSpan.style.textDecoration = 'underline';
      nameSpan.title = "클릭하여 캔버스에 불러오기";
      nameSpan.addEventListener('click', () => {
        excelDataSelect.value = banner.index;
        excelDataSelect.dispatchEvent(new Event('change'));
      });
      
      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = '다운로드';
      downloadBtn.className = 'secondary-btn';
      downloadBtn.style.padding = '0.25rem 0.75rem';
      downloadBtn.style.fontSize = '0.75rem';
      downloadBtn.style.width = 'auto';
      downloadBtn.style.background = 'rgba(255,255,255,0.1)';
      downloadBtn.addEventListener('click', () => {
        saveAs(banner.dataUrl, displayFilename);
      });
      
      item.appendChild(nameSpan);
      item.appendChild(downloadBtn);
      galleryList.appendChild(item);
    });

    bulkGenerateBtn.textContent = '엑셀 데이터 모두 자동 생성';
    bulkGenerateBtn.disabled = false;
    alert(`총 ${generatedBanners.length}개의 현수막 생성이 완료되었습니다. 갤러리에서 확인하세요.`);
  });
}

if (downloadZipBtn) {
  downloadZipBtn.addEventListener('click', () => {
    if (generatedBanners.length === 0) {
      alert("먼저 현수막을 생성해주세요.");
      return;
    }
    
    downloadZipBtn.disabled = true;
    downloadZipBtn.textContent = '압축 중...';
    
    const zip = new JSZip();
    const folder = zip.folder("현수막_자동생성");
    
    generatedBanners.forEach((banner, idx) => {
      // Remove data:image/jpeg;base64, from string
      const base64Data = banner.dataUrl.split(',')[1];
      // Ensure unique filename if duplicates exist
      const name = `${String(idx + 1).padStart(2, '0')}_${banner.filename}`;
      folder.file(name, base64Data, { base64: true });
    });
    
    zip.generateAsync({ type: "blob" }).then(function(content) {
      saveAs(content, "현수막_모음.zip");
      downloadZipBtn.disabled = false;
      downloadZipBtn.textContent = '전체 ZIP 다운로드';
    }).catch(err => {
      console.error(err);
      alert("ZIP 생성 중 오류가 발생했습니다.");
      downloadZipBtn.disabled = false;
      downloadZipBtn.textContent = '전체 ZIP 다운로드';
    });
  });
}
