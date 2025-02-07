document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("[data-section]")
  const content = document.getElementById("content")

  const dashboard = {
    render(section) {
      const sections = {
        home: `
          <div class="divc sec1">
            <div class="adress"><span id="adress" onclick="showQRCodeAndCopy();"></span>🧷</div>
            <!-- نافذة منبثقة (Popup) -->
            <div id="popup" class="popup">
              <div class="popup-content">
                <span class="close-btn">&times;</span>
                <div id="qrCodeContainer"></div>
                <p id="popup-address"></p>
                <button id="copyBtn">Copy🧷</button>
              </div>
            </div>
            <div class="buttons ">
              <button onclick="openSendDocumentPopup()"><i class="fa-solid fa-arrow-up"></i>إرسال</button>
              <!-- نافذة الإرسال مخفية -->
              <div id="sendDocumentPopup" class="popup-window">
                <div class="popup-content">
                  <span class="close-popup-btn" id="closeSendDocumentPopup">&times;</span>
                  <!-- إدخال عنوان المحفظة -->
                  <label> Send to :</label>
                  <div class="input-container">
                    <input type="text" id="recipientWalletAddress" placeholder="Wallet Adress  ">
                    <button id="scanQrCodeBtn"><i class="fa-solid fa-qrcode"></i></button>
                  </div>
                  <!-- اختيار الوثيقة -->
                  <label> Choose :</label>
                  <select id="selectDocumentToSend">
                    <!-- سيتم ملء الوثائق ديناميكيًا -->
                  </select>
                  <!-- زر إرسال -->
                  <button id="confirmSendDocumentBtn">إرسال</button>
                </div>
              </div>
              <button id="requestDocsBtn" onclick="openRequestPopup();"><i class="fa-solid fa-arrow-down"></i> طلب وثائق</button>
              <!-- النافذة المنبثقة لاختيار نوع الوثيقة -->
              <div id="requestPopup" style="display: none;">
                <div id="popup-content">
                  <select id="documentType">
                    <option value="birthCertificate">شهادة ميلاد</option>
                    <option value="residenceCertificate">شهادة إقامة</option>
                    <option value="honorStatement">تصريح شرفي</option>
                    <option value="workCertificate">شهادة عمل</option>
                  </select>
                  <button id="submitRequest">Send</button>
                  <button class="close-btn">Cancel</button>
                </div>
              </div>
            </div>
          </div>
          <div class="divc">
            <div class="title1"><h3>Transactions</h3></div>
            <div class="transactions">
              <div class="operation recieve"><i class="fa-solid fa-turn-down"></i>  recieve </div>
              <div class="operation send"><i class="fa-solid fa-turn-up"></i>  send  </div>
              <div class="operation send"><i class="fa-solid fa-turn-up"></i>  send </div>
              <div class="operation recieve"><i class="fa-solid fa-turn-down"></i>  recieve </div>
              <div class="operation send"><i class="fa-solid fa-turn-up"></i> send </div>
              <div class="operation recieve"><i class="fa-solid fa-turn-down"></i>  recieve </div>
              <div class="operation send"><i class="fa-solid fa-turn-up"></i>  send </div>
              <div class="operation recieve"><i class="fa-solid fa-turn-down"></i>  recieve </div>
              <div class="operation send"><i class="fa-solid fa-turn-up"></i>  send </div>
              <div class="operation recieve"><i class="fa-solid fa-turn-down"></i>  recieve </div>
              <div class="operation recieve"><i class="fa-solid fa-turn-down"></i>  recieve </div>
            </div>
          </div>
        `,
        documents: `
          <h3 class="text-2xl font-bold mb-4">الوثائق</h3>
          <div class="documents-list">
          </div>
        `,
        trackdocuments: `
          <h3 class="text-2xl font-bold mb-4">تتبع الوثائق</h3>
          <div class="tracking-section">
            <!-- Add document tracking content here -->
          </div>
        `,
        settings: `
          <h3 class="text-2xl font-bold mb-4">الإعدادات</h3>
          <div class="settings-form">
            <!-- Add settings form here -->
          </div>
        `,
      }

      if (sections[section]) {
        content.innerHTML = sections[section];
        if (section === "home") {
          this.initializeHome();
        } else if (section === "documents") {
          this.initializeDocuments();
        } else if (section === "trackdocuments") {
          this.initializeTrackDocuments();
        } else if (section === "settings") {
          this.initializeSettings();
        }
      } else {
        content.innerHTML = `<p>القسم غير موجود</p>`;
      }
    },

    initializeHome() {
      const addressContainer = document.querySelector("#adress");
      const citizenId = localStorage.getItem("userId");

      async function fetchCitizenData() {
        try {
          if (!citizenId) {
            console.error("لا يوجد ID للمواطن في LocalStorage");
            return;
          }

          const response = await fetch(
            `http://localhost:5000/api/auth/citizens/${citizenId}`
          );
          const data = await response.json();

          if (response.ok) {
            addressContainer.textContent = data.walletAddress;
            window.adre = addressContainer.textContent;
          } else {
            console.error("خطأ في جلب بيانات المواطن", data.message);
          }
        } catch (error) {
          console.error("حدث خطأ أثناء جلب بيانات المواطن", error);
        }
      }

      fetchCitizenData();

      // إعداد مستمعي الأحداث
      document
        .getElementById("closeSendDocumentPopup")
        .addEventListener("click", closeSendDocumentPopup);
      document
        .getElementById("scanQrCodeBtn")
        .addEventListener("click", scanRecipientQRCode);
      document
        .getElementById("confirmSendDocumentBtn")
        .addEventListener("click", sendSelectedDocument);
    },

    // باقي الدوال كما هي...
  };

  // باقي الكود...

});

// ============== تحسينات ماسح QR ============== //
async function openQrScanner() {
  try {
    // إيقاف أي ماسح نشط
    if (activeQrScanner && activeQrScanner.isScanning) {
      await activeQrScanner.stop();
    }

    // طلب إذن الكاميرا
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });
    stream.getTracks().forEach(track => track.stop());

    // عرض نافذة الماسح
    const qrScannerPopup = document.getElementById("qrScannerPopup");
    qrScannerPopup.style.display = "block";
    
    // تهيئة الماسح
    activeQrScanner = new Html5Qrcode("qrScanner");
    const cameras = await Html5Qrcode.getCameras();
    
    if (cameras.length === 0) throw new Error("لا توجد كاميرا متاحة");
    
    // اختيار الكاميرا الخلفية
    const backCamera = cameras.find(cam => cam.label.includes("back")) || cameras[0];
    
    // بدء المسح
    await activeQrScanner.start(
      backCamera.id,
      {
        fps: 10,
        qrbox: 250,
        aspectRatio: 1.0
      },
      decodedText => {
        document.getElementById("recipientWalletAddress").value = decodedText;
        closeQrScannerPopup();
        alert("تم المسح بنجاح!");
      },
      errorMessage => {}
    );

    // إضافة عناصر واجهة المستخدم
    document.getElementById("qrScanner").innerHTML = `
      <div class="scanner-overlay">
        <div class="scan-line"></div>
        <p style="color: white; text-align: center;">وجّه الكاميرا نحو رمز QR</p>
      </div>
    `;

  } catch (error) {
    console.error('خطأ في الماسح:', error);
    
    if (error.name === 'NotAllowedError') {
      alert('يجب السماح باستخدام الكاميرا');
      document.getElementById('cameraPermissionInstructions').style.display = 'block';
    } else {
      alert(`خطأ تقني: ${error.message}`);
    }
    
    closeQrScannerPopup();
  }
}

async function closeQrScannerPopup() {
  try {
    if (activeQrScanner && activeQrScanner.isScanning) {
      await activeQrScanner.stop();
    }
    document.getElementById("qrScannerPopup").style.display = "none";
    document.getElementById('cameraPermissionInstructions').style.display = 'none';
  } catch (err) {
    console.error('خطأ في الإغلاق:', err);
  }
}

function scanRecipientQRCode() {
  const confirmation = confirm(
    'لبدء المسح:\n1. السماح باستخدام الكاميرا\n2. توجيه نحو رمز QR\nموافق للمتابعة؟'
  );
  if (confirmation) openQrScanner();
}

// ============== باقي الدوال الأصلية ============== //
function showQRCodeAndCopy() { /* ... */ }
function setupRequestDocsButton() { /* ... */ }
function openRequestPopup() { /* ... */ }
function hidePopup() { /* ... */ }
function handleSubmitRequest() { /* ... */ }
async function submitRequest(requestType) { /* ... */ }
function openSendDocumentPopup() { /* ... */ }
function closeSendDocumentPopup() { /* ... */ }
function loadUserDocuments() { /* ... */ }
function sendSelectedDocument(event) { /* ... */ }
// ... باقي الدوال كما هي بدون تغيير ...
