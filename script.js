let qrScannerInstance = null; // Global scanner instance

document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll("[data-section]");
  const content = document.getElementById("content");

  const dashboard = {
    render(section) {
      const sections = {
        home: `
          <div class="divc sec1">
            <div class="adress"><span id="adress" onclick="showQRCodeAndCopy();"></span>🧷</div>
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
              <div id="sendDocumentPopup" class="popup-window">
                <div class="popup-content">
                  <span class="close-popup-btn" id="closeSendDocumentPopup">&times;</span>
                  <label> Send to :</label>
                  <div class="input-container">
                    <input type="text" id="recipientWalletAddress" placeholder="Wallet Address">
                    <button id="scanQrCodeBtn"><i class="fa-solid fa-qrcode"></i></button>
                  </div>
                  <label> Choose :</label>
                  <select id="selectDocumentToSend"></select>
                  <button id="confirmSendDocumentBtn">إرسال</button>
                </div>
              </div>
              <button id="requestDocsBtn" onclick="openRequestPopup();"><i class="fa-solid fa-arrow-down"></i> طلب وثائق</button>
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
              ${Array.from({length: 11}, (_, i) => `
                <div class="operation ${i%2 ? 'send' : 'recieve'}">
                  <i class="fa-solid fa-turn-${i%2 ? 'up' : 'down'}"></i>
                  ${i%2 ? 'send' : 'recieve'}
                </div>
              `).join('')}
            </div>
          </div>
        `,
        documents: `
          <h3 class="text-2xl font-bold mb-4">الوثائق</h3>
          <div class="documents-list"></div>
        `,
        trackdocuments: `
          <h3 class="text-2xl font-bold mb-4">تتبع الوثائق</h3>
          <div class="tracking-section"></div>
        `,
        settings: `
          <h3 class="text-2xl font-bold mb-4">الإعدادات</h3>
          <div class="settings-form"></div>
        `,
      };

      if (sections[section]) {
        content.innerHTML = sections[section];
        if (section === "home") this.initializeHome();
        else if (section === "documents") this.initializeDocuments();
        else if (section === "trackdocuments") this.initializeTrackDocuments();
        else if (section === "settings") this.initializeSettings();
      } else {
        content.innerHTML = `<p>القسم غير موجود</p>`;
      }
    },

    initializeHome() {
      const addressContainer = document.querySelector("#adress");
      const citizenId = localStorage.getItem("userId");

      const fetchCitizenData = async () => {
        try {
          if (!citizenId) return console.error("لا يوجد ID للمواطن في LocalStorage");
          
          const response = await fetch(`http://localhost:5000/api/auth/citizens/${citizenId}`);
          const data = await response.json();
          
          if (response.ok) {
            addressContainer.textContent = data.walletAddress;
            window.adre = data.walletAddress;
          }
        } catch (error) {
          console.error("حدث خطأ أثناء جلب بيانات المواطن", error);
        }
      };

      fetchCitizenData();

      // Event listeners setup
      document.getElementById("closeSendDocumentPopup").addEventListener("click", closeSendDocumentPopup);
      document.getElementById("scanQrCodeBtn").addEventListener("click", scanRecipientQRCode);
      document.getElementById("confirmSendDocumentBtn").addEventListener("click", sendSelectedDocument);
      
      if (document.getElementById("closeQrScanner")) {
        document.getElementById("closeQrScanner").addEventListener("click", closeQrScannerPopup);
      }
    },

    initializeDocuments() {
      console.log("Initializing documents section");
    },

    initializeTrackDocuments() {
      console.log("Initializing track documents section");
    },

    initializeSettings() {
      console.log("Initializing settings section");
    }
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = e.target.closest("[data-section]").dataset.section;
      dashboard.render(section);
    });
  });

  dashboard.render("home");
});

// ==================== Helper Functions ====================
function showQRCodeAndCopy() {
  const popup = document.querySelector("#popup");
  const qrCodeContainer = document.querySelector("#qrCodeContainer");
  
  new QRCode(qrCodeContainer, {
    text: window.adre,
    width: 128,
    height: 128,
  });

  popup.style.display = "block";
  document.querySelector("#popup-address").textContent = window.adre;

  document.querySelector("#copyBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(window.adre);
    alert("تم نسخ العنوان إلى الحافظة!");
  });

  document.querySelector("#popup .close-btn").addEventListener("click", () => {
    popup.style.display = "none";
    qrCodeContainer.innerHTML = "";
  });
}

async function openQrScanner() {
  try {
    // Cleanup previous scanner instance
    if (qrScannerInstance?.isScanning) await qrScannerInstance.stop();
    
    const qrScannerPopup = document.getElementById("qrScannerPopup");
    qrScannerPopup.style.display = "block";
    
    qrScannerInstance = new Html5Qrcode("qrScanner");
    const cameras = await Html5Qrcode.getCameras();
    
    if (cameras.length > 0) {
      await qrScannerInstance.start(
        cameras[cameras.length - 1].id,
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        decodedText => {
          document.getElementById("recipientWalletAddress").value = decodedText;
          closeQrScannerPopup();
        },
        error => {
          // Handle specific error messages
          if (error?.message !== "NotFoundException: No MultiFormat Readers were able to detect the code.") {
            console.log('QR Scanner error:', error);
          }
        }
      );
    }
  } catch (error) {
    console.error('Scanner error:', error);
    closeQrScannerPopup();
    alert(`خطأ في الماسح: ${error.message}`);
  }
}

async function closeQrScannerPopup() {
  try {
    if (qrScannerInstance?.isScanning) {
      await qrScannerInstance.stop();
      qrScannerInstance = null;
    }
    document.getElementById("qrScannerPopup").style.display = "none";
    document.getElementById("qrScanner").innerHTML = "";
  } catch (err) {
    console.error('Error stopping scanner:', err);
  }
}

function scanRecipientQRCode() {
  const message = `
    لإجراء مسح ناجح:
    1. تأكد من وجود إضاءة كافية
    2. ضع رمز QR داخل الإطار
    3. حافظ على مسافة مناسبة (20-50 سم)
    4. تجنب الزوايا المائلة
  `;
  
  if (confirm(message)) {
    openQrScanner().catch(error => {
      alert("تعذر فتح الماسح: " + error.message);
    });
  }
}

function sendSelectedDocument(event) {
  event.preventDefault();
  const addressInput = document.getElementById("recipientWalletAddress");
  const docSelect = document.getElementById("selectDocumentToSend");
  
  if (!addressInput.value || !docSelect.value) {
    alert("يرجى إدخال عنوان المحفظة واختيار وثيقة!");
    return;
  }
  
  alert(`تم إرسال "${docSelect.value}" إلى العنوان: ${addressInput.value}`);
  addressInput.value = "";
  docSelect.selectedIndex = 0;
  closeSendDocumentPopup();
}

// Document Request Handling
document.getElementById("requestDocsBtn")?.addEventListener("click", () => {
  document.getElementById("requestPopup").style.display = "block";
});

document.querySelector("#requestPopup .close-btn")?.addEventListener("click", () => {
  document.getElementById("requestPopup").style.display = "none";
});

document.getElementById("submitRequest")?.addEventListener("click", async () => {
  const requestType = document.getElementById("documentType").value;
  try {
    const response = await fetch("http://localhost:5000/api/requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ requestType })
    });
    
    const data = await response.json();
    alert(response.ok ? "تم إرسال الطلب بنجاح!" : "حدث خطأ: " + data.message);
    document.getElementById("requestPopup").style.display = "none";
  } catch (error) {
    console.error("خطأ في إرسال الطلب:", error);
    alert("حدث خطأ أثناء الإرسال");
  }
});

// General Functions
function openSendDocumentPopup() {
  document.getElementById("sendDocumentPopup").style.display = "block";
  loadUserDocuments();
}

function closeSendDocumentPopup() {
  document.getElementById("sendDocumentPopup").style.display = "none";
}

function loadUserDocuments() {
  const select = document.getElementById("selectDocumentToSend");
  select.innerHTML = '<option value="">اختر وثيقة</option>';
  ["شهادة ميلاد", "شهادة إقامة", "تصريح شرفي", "شهادة عمل"].forEach(doc => {
    select.innerHTML += `<option value="${doc}">${doc}</option>`;
  });
}
