document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("[data-section]");
  const content = document.getElementById("content");
  let activeQrScanner = null; // إضافة متغير لإدارة حالة الماسح

  const dashboard = {
    render(section) {
      const sections = {
        home: `
          <!-- نفس محتوى قسم الرئيسية كما في الكود الأصلي -->
        `,
        documents: `
          <!-- محتوى قسم الوثائق -->
        `,
        trackdocuments: `
          <!-- محتوى قسم التتبع -->
        `,
        settings: `
          <!-- محتوى قسم الإعدادات -->
        `,
      };

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
